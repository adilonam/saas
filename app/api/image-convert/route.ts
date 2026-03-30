import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

function parseOptionalPositiveInt(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const n = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return n;
}

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
    const file = formData.get("file") as File | null;
    const outputFormatRaw = formData.get("output_format");

    if (!file) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    const outputFormat =
      typeof outputFormatRaw === "string" ? outputFormatRaw.trim() : "";
    if (!["png", "jpeg", "webp"].includes(outputFormat)) {
      return NextResponse.json(
        { error: "Invalid output_format. Use png, jpeg, or webp." },
        { status: 400 }
      );
    }

    const maxWidth = parseOptionalPositiveInt(formData.get("max_width"));
    const maxHeight = parseOptionalPositiveInt(formData.get("max_height"));
    const quality = parseOptionalPositiveInt(formData.get("quality"));
    const stripMetadataRaw = formData.get("strip_metadata");
    const strip_metadata =
      typeof stripMetadataRaw === "string" && stripMetadataRaw.trim() ? stripMetadataRaw.trim() : undefined;

    const fastApiUrl = process.env.FAST_API_URL;
    if (!fastApiUrl) {
      return NextResponse.json(
        { error: "FAST_API_URL is not configured" },
        { status: 500 }
      );
    }

    const forwardFormData = new FormData();
    forwardFormData.append("file", file);
    forwardFormData.append("output_format", outputFormat);
    if (maxWidth != null) forwardFormData.append("max_width", String(maxWidth));
    if (maxHeight != null) forwardFormData.append("max_height", String(maxHeight));
    if (quality != null) forwardFormData.append("quality", String(quality));
    if (strip_metadata != null) forwardFormData.append("strip_metadata", strip_metadata);

    const upstreamResponse = await fetch(
      `${fastApiUrl}/fast-api/v1/image-convert`,
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
              "Failed to convert image on backend",
          },
          { status: upstreamResponse.status }
        );
      }
      const errorText = await upstreamResponse.text();
      return NextResponse.json(
        { error: errorText || "Failed to convert image on backend" },
        { status: upstreamResponse.status }
      );
    }

    const imageArrayBuffer = await upstreamResponse.arrayBuffer();
    const imageBuffer = Buffer.from(imageArrayBuffer);

    const upstreamContentType =
      upstreamResponse.headers.get("content-type") || "application/octet-stream";
    const ext = outputFormat === "jpeg" ? "jpg" : outputFormat;

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": upstreamContentType,
        "Content-Disposition": `attachment; filename="converted.${ext}"`,
      },
    });
  } catch (error) {
    console.error("image-convert error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

