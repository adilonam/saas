import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    // Validate that all files are PDFs
    for (const file of files) {
      if (file.type !== "application/pdf") {
        return NextResponse.json(
          { error: `File ${file.name} is not a PDF` },
          { status: 400 }
        );
      }
    }

    // Get the FastAPI URL from environment
    const fastApiUrl = process.env.FAST_API_URL;
    if (!fastApiUrl) {
      return NextResponse.json(
        { error: "FastAPI URL not configured" },
        { status: 500 }
      );
    }

    // Create a new FormData to forward to the FastAPI
    const forwardFormData = new FormData();
    files.forEach((file) => {
      forwardFormData.append("files", file);
    });

    // Forward the request to the FastAPI endpoint
    const response = await fetch(`${fastApiUrl}/fast-api/v1/merge-pdfs`, {
      method: "POST",
      body: forwardFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to merge PDFs" },
        { status: response.status }
      );
    }

    // Get the merged PDF as a blob
    const mergedPdfBlob = await response.blob();

    // Return the merged PDF
    return new NextResponse(mergedPdfBlob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="merged.pdf"',
      },
    });
  } catch (error) {
    console.error("Merge PDFs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
