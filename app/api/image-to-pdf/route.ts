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
    const qualityRaw = formData.get("quality") as string | null;
    const stripMetadataRaw = formData.get("strip_metadata") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    // Prefer extension checks because some browsers can report generic types
    const lowerName = (file.name || "").toLowerCase();
    const allowedExts = [
      ".png",
      ".jpg",
      ".jpeg",
      ".webp",
      ".gif",
      ".bmp",
      ".tif",
      ".tiff",
    ];
    const hasAllowedExt = allowedExts.some((ext) => lowerName.endsWith(ext));

    if (!hasAllowedExt && !file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Unsupported image format. Upload a common image file (png/jpg/webp/gif/etc.)." },
        { status: 400 }
      );
    }

    let quality: number | null = null;
    if (typeof qualityRaw === "string" && qualityRaw.trim()) {
      const q = Number.parseInt(qualityRaw, 10);
      if (!Number.isFinite(q) || q < 1 || q > 100) {
        return NextResponse.json(
          { error: "Quality must be an integer between 1 and 100" },
          { status: 400 }
        );
      }
      quality = q;
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
    if (quality != null) {
      forwardFormData.append("quality", String(quality));
    }

    if (typeof stripMetadataRaw === "string" && stripMetadataRaw.trim()) {
      // FastAPI accepts "true"/"false" or "1"/"0" (best-effort strips metadata)
      forwardFormData.append("strip_metadata", stripMetadataRaw);
    }

    const upstreamResponse = await fetch(
      `${fastApiUrl}/fast-api/v1/image-to-pdf`,
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
              "Failed to convert image to PDF on backend",
          },
          { status: upstreamResponse.status }
        );
      }

      const errorText = await upstreamResponse.text();
      return NextResponse.json(
        { error: errorText || "Failed to convert image to PDF on backend" },
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
    console.error("image-to-pdf error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

