import "@ungap/with-resolvers";
import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;

  try {
    // Import the worker before using pdf-to-img
    // pdf-to-img uses pdfjs-dist internally which needs the worker
    await import("pdfjs-dist/build/pdf.worker.min.mjs");

    // Import pdf-to-img after importing the worker
    const { pdf } = await import("pdf-to-img");

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF file." },
        { status: 400 }
      );
    }

    // pdf-to-img requires a file path, so we need to save the file temporarily
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a temporary file
    tempFilePath = join(
      tmpdir(),
      `pdf-${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`
    );
    writeFileSync(tempFilePath, buffer);

    // Convert PDF to images using pdf-to-img
    const document = await pdf(tempFilePath, { scale: 3 });

    const images: string[] = [];
    let counter = 1;

    // Iterate through all pages
    for await (const image of document) {
      // Convert image buffer to base64
      const imageBuffer = Buffer.isBuffer(image) ? image : Buffer.from(image);
      const base64Image = imageBuffer.toString("base64");
      const dataUrl = `data:image/png;base64,${base64Image}`;
      images.push(dataUrl);
      counter++;
    }

    // Clean up temporary file
    if (tempFilePath) {
      try {
        unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.warn("Failed to delete temporary file:", cleanupError);
      }
    }

    return NextResponse.json({
      success: true,
      images,
      numPages: counter - 1,
    });
  } catch (error) {
    // Clean up temporary file on error
    if (tempFilePath) {
      try {
        unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.warn("Failed to delete temporary file:", cleanupError);
      }
    }

    console.error("Error converting PDF to images:", error);
    return NextResponse.json(
      { error: "Failed to convert PDF to images. Please try again." },
      { status: 500 }
    );
  }
}
