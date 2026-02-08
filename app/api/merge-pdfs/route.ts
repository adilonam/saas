import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionExpiresAt: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const hasActiveSubscription =
      user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      return NextResponse.json(
        { error: "Active subscription required", subscriptionExpiresAt: user.subscriptionExpiresAt },
        { status: 403 }
      );
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
      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const errorData = await response.json();
        return NextResponse.json(
          {
            error:
              errorData.detail ||
              errorData.error ||
              "Failed to merge PDFs on backend",
          },
          { status: response.status }
        );
      }

      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to merge PDFs on backend" },
        { status: response.status }
      );
    }

    // Get the merged PDF as a binary response
    const mergedPdfArrayBuffer = await response.arrayBuffer();
    const mergedPdfBuffer = Buffer.from(mergedPdfArrayBuffer);

    // Return the merged PDF
    return new NextResponse(mergedPdfBuffer, {
      status: 200,
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
