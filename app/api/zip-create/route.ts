import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionExpiresAt: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hasActiveSubscription =
      user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      return NextResponse.json(
        { error: "Active subscription required" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "At least one file is required" }, { status: 400 });
    }

    const fastApiUrl = process.env.FAST_API_URL;
    if (!fastApiUrl) {
      return NextResponse.json(
        { error: "FAST_API_URL is not configured" },
        { status: 500 }
      );
    }

    const forwardFormData = new FormData();
    files.forEach((file) => forwardFormData.append("files", file));

    const upstreamResponse = await fetch(
      `${fastApiUrl}/fast-api/v1/zip-create`,
      {
        method: "POST",
        body: forwardFormData,
      }
    );

    if (!upstreamResponse.ok) {
      const contentType = upstreamResponse.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const errorData = await upstreamResponse.json();
        return NextResponse.json(
          {
            error:
              (errorData as { detail?: string }).detail ||
              (errorData as { error?: string }).error ||
              "Failed to create ZIP on backend",
          },
          { status: upstreamResponse.status }
        );
      }

      const errorText = await upstreamResponse.text();
      return NextResponse.json(
        { error: errorText || "Failed to create ZIP on backend" },
        { status: upstreamResponse.status }
      );
    }

    const zipArrayBuffer = await upstreamResponse.arrayBuffer();
    const zipBuffer = Buffer.from(zipArrayBuffer);

    const upstreamContentType =
      upstreamResponse.headers.get("content-type") || "application/zip";

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": upstreamContentType,
        "Content-Disposition": 'attachment; filename="archive.zip"',
      },
    });
  } catch (error) {
    console.error("zip-create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

