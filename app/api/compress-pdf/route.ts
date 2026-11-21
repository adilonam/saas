import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Auth removed - API is now public for all users

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const pdfSettings = formData.get("pdf_settings");

    if (!file) {
      return NextResponse.json({ error: "PDF file is required" }, { status: 400 });
    }
    if (
      file.type !== "application/pdf" ||
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      return NextResponse.json(
        { error: "File must be a PDF" },
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

    if (typeof pdfSettings === "string" && pdfSettings.trim()) {
      forwardFormData.append("pdf_settings", pdfSettings.trim());
    }

    const upstreamResponse = await fetch(
      `${fastApiUrl}/fast-api/v1/compress-pdf`,
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
              "Failed to compress PDF on backend",
          },
          { status: upstreamResponse.status }
        );
      }

      const errorText = await upstreamResponse.text();
      return NextResponse.json(
        { error: errorText || "Failed to compress PDF on backend" },
        { status: upstreamResponse.status }
      );
    }

    const pdfArrayBuffer = await upstreamResponse.arrayBuffer();
    const pdfBuffer = Buffer.from(pdfArrayBuffer);
    const contentType = upstreamResponse.headers.get("content-type") || "application/pdf";

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": 'attachment; filename="compressed.pdf"',
      },
    });
  } catch (error) {
    console.error("compress-pdf error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

