import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "PDF file is required" },
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

    const upstreamResponse = await fetch(
      `${fastApiUrl}/fast-api/v1/pdf-to-image`,
      {
        method: "POST",
        body: forwardFormData,
      }
    );

    const contentType = upstreamResponse.headers.get("content-type") || "";

    if (!upstreamResponse.ok) {
      if (contentType.includes("application/json")) {
        const errorData = await upstreamResponse.json();
        return NextResponse.json(
          {
            error:
              errorData.detail ||
              errorData.error ||
              "Failed to convert PDF on backend",
          },
          { status: upstreamResponse.status }
        );
      }

      const errorText = await upstreamResponse.text();
      return NextResponse.json(
        {
          error: errorText || "Failed to convert PDF on backend",
        },
        { status: upstreamResponse.status }
      );
    }

    // Successful response – assume JSON with pages/total_pages
    if (contentType.includes("application/json")) {
      const data = await upstreamResponse.json();
      return NextResponse.json(data, { status: 200 });
    }

    // Fallback: unexpected content type
    const text = await upstreamResponse.text();
    return NextResponse.json(
      {
        error: "Unexpected response from PDF service",
        raw: text,
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("pdf-to-image error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

