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
      user.subscriptionExpiresAt &&
      new Date(user.subscriptionExpiresAt) > new Date();

    if (!hasActiveSubscription) {
      return NextResponse.json(
        { error: "Active subscription required", subscriptionExpiresAt: user.subscriptionExpiresAt },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const rotationRaw = formData.get("rotation") as string | null;
    const pages = formData.get("pages") as string | null;

    if (!file) {
      return NextResponse.json({ error: "PDF file is required" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: `File ${file.name} is not a PDF` }, { status: 400 });
    }

    const rotation =
      typeof rotationRaw === "string" && rotationRaw.trim()
        ? Number.parseInt(rotationRaw, 10)
        : NaN;

    if (!Number.isFinite(rotation) || rotation % 90 !== 0) {
      return NextResponse.json(
        { error: "Rotation must be a multiple of 90 degrees" },
        { status: 400 }
      );
    }

    const fastApiUrl = process.env.FAST_API_URL;
    if (!fastApiUrl) {
      return NextResponse.json(
        { error: "FAST_API_URL is not configured" },
        { status: 500 }
      );
    }

    const forwardFormData = new FormData();
    forwardFormData.append("file", file);
    forwardFormData.append("rotation", String(rotation));
    if (typeof pages === "string" && pages.trim()) {
      forwardFormData.append("pages", pages);
    }

    const upstreamResponse = await fetch(
      `${fastApiUrl}/fast-api/v1/rotate-pdf`,
      { method: "POST", body: forwardFormData }
    );

    if (!upstreamResponse.ok) {
      const contentType = upstreamResponse.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const errorData = (await upstreamResponse.json()) as {
          detail?: string;
          error?: string;
        };
        return NextResponse.json(
          {
            error:
              errorData.detail ||
              errorData.error ||
              "Failed to rotate PDF on backend",
          },
          { status: upstreamResponse.status }
        );
      }

      const errorText = await upstreamResponse.text();
      return NextResponse.json(
        { error: errorText || "Failed to rotate PDF on backend" },
        { status: upstreamResponse.status }
      );
    }

    const arrayBuffer = await upstreamResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const contentType =
      upstreamResponse.headers.get("content-type") || "application/pdf";
    const contentDisposition =
      upstreamResponse.headers.get("content-disposition") || undefined;

    return new NextResponse(buffer, {
      status: upstreamResponse.status,
      headers: {
        "Content-Type": contentType,
        ...(contentDisposition ? { "Content-Disposition": contentDisposition } : {}),
      },
    });
  } catch (error) {
    console.error("rotate-pdf error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

