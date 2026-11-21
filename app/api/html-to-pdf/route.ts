import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Auth removed - API is now public for all users

    const body = (await request.json()) as { html?: unknown };
    const html = typeof body.html === "string" ? body.html.trim() : "";
    if (!html) {
      return NextResponse.json(
        { error: "HTML content is required" },
        { status: 400 },
      );
    }

    const fastApiUrl = process.env.FAST_API_URL;
    if (!fastApiUrl) {
      return NextResponse.json(
        { error: "FAST_API_URL is not configured" },
        { status: 500 },
      );
    }

    const upstreamResponse = await fetch(
      `${fastApiUrl}/fast-api/v1/html-to-pdf`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html }),
      },
    );

    if (!upstreamResponse.ok) {
      const contentType = upstreamResponse.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const errorData = await upstreamResponse.json();
        return NextResponse.json(
          {
            error:
              (errorData as { detail?: string; error?: string }).detail ||
              (errorData as { detail?: string; error?: string }).error ||
              "Failed to render HTML PDF",
          },
          { status: upstreamResponse.status },
        );
      }
      const errorText = await upstreamResponse.text();
      return NextResponse.json(
        { error: errorText || "Failed to render HTML PDF" },
        { status: upstreamResponse.status },
      );
    }

    const arrayBuffer = await upstreamResponse.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="document.pdf"',
      },
    });
  } catch (error) {
    console.error("html-to-pdf error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

