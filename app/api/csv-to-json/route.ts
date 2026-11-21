import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Auth removed - API is now public for all users

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const delimiterRaw = formData.get("delimiter");
    const maxRowsRaw = formData.get("max_rows");

    if (!file) {
      return NextResponse.json({ error: "CSV file is required" }, { status: 400 });
    }

    const filename = file.name || "";
    if (!filename.toLowerCase().endsWith(".csv")) {
      return NextResponse.json(
        { error: "File must be a .csv" },
        { status: 400 },
      );
    }

    const delimiter =
      typeof delimiterRaw === "string" ? delimiterRaw.trim() : "";
    const delimiterValidated = delimiter.length > 0 ? delimiter : "";
    if (delimiterValidated && delimiterValidated.length !== 1) {
      return NextResponse.json(
        { error: "Delimiter must be a single character" },
        { status: 400 },
      );
    }

    const maxRows =
      typeof maxRowsRaw === "string" && maxRowsRaw.trim()
        ? maxRowsRaw.trim()
        : "";

    const fastApiUrl = process.env.FAST_API_URL;
    if (!fastApiUrl) {
      return NextResponse.json(
        { error: "FAST_API_URL is not configured" },
        { status: 500 },
      );
    }

    const forwardFormData = new FormData();
    forwardFormData.append("file", file);
    if (delimiterValidated) {
      forwardFormData.append("delimiter", delimiterValidated);
    }
    if (maxRows) {
      forwardFormData.append("max_rows", maxRows);
    }

    const upstreamResponse = await fetch(
      `${fastApiUrl}/fast-api/v1/csv-to-json`,
      {
        method: "POST",
        body: forwardFormData,
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
              "Failed to convert CSV to JSON",
          },
          { status: upstreamResponse.status },
        );
      }

      const errorText = await upstreamResponse.text();
      return NextResponse.json(
        { error: errorText || "Failed to convert CSV to JSON" },
        { status: upstreamResponse.status },
      );
    }

    const data = (await upstreamResponse.json()) as { rows?: unknown };
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("csv-to-json error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

