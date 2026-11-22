import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { buildEqReportLatex } from "@/lib/eq-test/report-latex";
import type { EqDimension, EqTestResult } from "@/lib/eq-test/types";

function parseDimension(raw: unknown): EqDimension | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const label = typeof row.label === "string" ? row.label.trim() : "";
  const description =
    typeof row.description === "string" ? row.description.trim() : "";
  const domain = typeof row.domain === "string" ? row.domain.trim() : "";
  const score = Number(row.score);
  if (!label || !description || !domain || !Number.isFinite(score)) return null;
  return {
    label,
    score,
    description,
    domain: domain as EqDimension["domain"],
  };
}

function parseResult(body: unknown): EqTestResult | null {
  if (!body || typeof body !== "object") return null;
  const raw = body as Record<string, unknown>;
  const resultSource =
    raw.result && typeof raw.result === "object"
      ? (raw.result as Record<string, unknown>)
      : raw;

  const eq = Number(resultSource.eq);
  const percentile = Number(resultSource.percentile);
  const accuracy = Number(resultSource.accuracy);
  const elapsedSeconds = Number(resultSource.elapsedSeconds);

  if (
    !Number.isFinite(eq) ||
    !Number.isFinite(percentile) ||
    !Number.isFinite(accuracy) ||
    !Number.isFinite(elapsedSeconds) ||
    elapsedSeconds < 0
  ) {
    return null;
  }

  if (!Array.isArray(resultSource.dimensions)) return null;
  const dimensions: EqDimension[] = [];
  for (const item of resultSource.dimensions) {
    const dim = parseDimension(item);
    if (!dim) return null;
    dimensions.push(dim);
  }
  if (dimensions.length === 0) return null;

  const result: EqTestResult = {
    eq: Math.round(eq),
    percentile: Math.round(percentile),
    accuracy: Math.round(accuracy),
    elapsedSeconds: Math.round(elapsedSeconds),
    dimensions,
  };

  if (
    typeof resultSource.correctCount === "number" &&
    Number.isFinite(resultSource.correctCount)
  ) {
    result.correctCount = Math.round(resultSource.correctCount);
  }
  if (
    typeof resultSource.totalScored === "number" &&
    Number.isFinite(resultSource.totalScored)
  ) {
    result.totalScored = Math.round(resultSource.totalScored);
  }

  return result;
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    const user = session?.user?.id
      ? await prisma.user.findUnique({
          where: { id: session.user.id },
          select: {
            name: true,
            email: true,
          },
        })
      : null;

    const fastApiUrl = process.env.FAST_API_URL;
    if (!fastApiUrl) {
      return NextResponse.json(
        { error: "FAST_API_URL is not configured" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const result = parseResult(body);
    if (!result) {
      return NextResponse.json(
        {
          error:
            "Invalid result. Expected eq, percentile, accuracy, elapsedSeconds, and dimensions[].",
        },
        { status: 400 },
      );
    }

    const latex = buildEqReportLatex(result, {
      name: user?.name ?? session?.user?.name ?? "Guest",
      email: user?.email ?? session?.user?.email ?? "",
    });

    const upstreamResponse = await fetch(
      `${fastApiUrl}/fast-api/v1/latex-to-pdf`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latex }),
      },
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
              "Failed to compile EQ report PDF",
          },
          { status: upstreamResponse.status },
        );
      }
      const errorText = await upstreamResponse.text();
      return NextResponse.json(
        { error: errorText || "Failed to compile EQ report PDF" },
        { status: upstreamResponse.status },
      );
    }

    const arrayBuffer = await upstreamResponse.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="eq-score-report.pdf"',
      },
    });
  } catch (error) {
    console.error("eq-test/pdf error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
