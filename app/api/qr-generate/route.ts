import { NextResponse } from "next/server";
import QRCode from "qrcode";

function parseOptionalInt(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number") return undefined;
  const n = typeof value === "string" ? Number.parseInt(value, 10) : value;
  if (!Number.isFinite(n)) return undefined;
  return n;
}

export async function POST(request: Request) {
  try {
    // Auth removed - API is now public for all users

    const body = await request.json().catch(() => ({}));
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const boxSize = parseOptionalInt(body.box_size);
    const border = parseOptionalInt(body.border);

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const fastApiUrl = process.env.FAST_API_URL;
    if (!fastApiUrl) {
      return NextResponse.json(
        { error: "FAST_API_URL is not configured" },
        { status: 500 }
      );
    }

    const upstreamResponse = await fetch(
      `${fastApiUrl}/fast-api/v1/qr-generate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          ...(typeof boxSize === "number" ? { box_size: boxSize } : {}),
          ...(typeof border === "number" ? { border } : {}),
        }),
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
              "Failed to generate QR on backend",
          },
          { status: upstreamResponse.status }
        );
      }
      const errorText = await upstreamResponse.text();
      return NextResponse.json(
        { error: errorText || "Failed to generate QR on backend" },
        { status: upstreamResponse.status }
      );
    }

    const imageArrayBuffer = await upstreamResponse.arrayBuffer();
    const imageBuffer = Buffer.from(imageArrayBuffer);
    const upstreamContentType =
      upstreamResponse.headers.get("content-type") || "image/png";

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": upstreamContentType,
        "Content-Disposition": 'attachment; filename="qrcode.png"',
      },
    });
  } catch (error) {
    console.error("qr-generate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

