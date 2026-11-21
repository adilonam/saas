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
        { error: "Active subscription required" },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "PDF file is required" }, { status: 400 });
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
    }

    const fastApiUrl = process.env.FAST_API_URL;
    if (!fastApiUrl) {
      return NextResponse.json(
        { error: "FAST_API_URL is not configured" },
        { status: 500 },
      );
    }

    const forwardFormData = new FormData();
    forwardFormData.append("file", file);

    const upstreamResponse = await fetch(`${fastApiUrl}/fast-api/v1/pdf-to-text`, {
      method: "POST",
      body: forwardFormData,
    });

    if (!upstreamResponse.ok) {
      const contentType = upstreamResponse.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const errorData = (await upstreamResponse.json()) as {
          detail?: string;
          error?: string;
        };
        return NextResponse.json(
          { error: errorData.detail || errorData.error || "Failed to extract text" },
          { status: upstreamResponse.status },
        );
      }
      const errorText = await upstreamResponse.text();
      return NextResponse.json(
        { error: errorText || "Failed to extract text" },
        { status: upstreamResponse.status },
      );
    }

    const data = (await upstreamResponse.json()) as {
      filename: string | null;
      total_pages: number;
      text: string;
    };
    return NextResponse.json(data);
  } catch (error) {
    console.error("pdf-to-text error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
