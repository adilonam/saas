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
      `${fastApiUrl}/fast-api/v1/pdf-to-docx`,
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
              errorData.detail ||
              errorData.error ||
              "Failed to convert PDF to Word on backend",
          },
          { status: upstreamResponse.status }
        );
      }

      const errorText = await upstreamResponse.text();
      return NextResponse.json(
        {
          error: errorText || "Failed to convert PDF to Word on backend",
        },
        { status: upstreamResponse.status }
      );
    }

    // Forward the DOCX file back to the client
    const arrayBuffer = await upstreamResponse.arrayBuffer();
    const docxBuffer = Buffer.from(arrayBuffer);

    return new NextResponse(docxBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="converted.docx"',
      },
    });
  } catch (error) {
    console.error("pdf-to-docx error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

