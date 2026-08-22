import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { buildIqReportLatex } from "@/lib/iq-test/report-latex";
import type { CognitiveDimension, IqTestResult } from "@/lib/iq-test/types";

function parseDimension(raw: unknown): CognitiveDimension | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const label = typeof row.label === "string" ? row.label.trim() : "";
  const description =
    typeof row.description === "string" ? row.description.trim() : "";
  const score = Number(row.score);
  if (!label || !description || !Number.isFinite(score)) return null;
  return { label, score, description };
}

function parseResult(body: unknown): IqTestResult | null {
  if (!body || typeof body !== "object") return null;
  const raw = body as Record<string, unknown>;
  const resultSource =
    raw.result && typeof raw.result === "object"
      ? (raw.result as Record<string, unknown>)
      : raw;

  const iq = Number(resultSource.iq);
  const percentile = Number(resultSource.percentile);
  const accuracy = Number(resultSource.accuracy);
  const elapsedSeconds = Number(resultSource.elapsedSeconds);

  if (
    !Number.isFinite(iq) ||
    !Number.isFinite(percentile) ||
    !Number.isFinite(accuracy) ||
    !Number.isFinite(elapsedSeconds) ||
    elapsedSeconds < 0
  ) {
    return null;
  }

  if (!Array.isArray(resultSource.dimensions)) return null;
  const dimensions: CognitiveDimension[] = [];
  for (const item of resultSource.dimensions) {
    const dim = parseDimension(item);
    if (!dim) return null;
    dimensions.push(dim);
  }
  if (dimensions.length === 0) return null;

  const result: IqTestResult = {
    iq: Math.round(iq),
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
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        subscriptionExpiresAt: true,
      },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hasActiveSubscription =
      user.subscriptionExpiresAt &&
      new Date(user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      return NextResponse.json(
        {
          error: "Active subscription required",
          code: "subscription_required",
        },
        { status: 403 },
      );
    }

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
            "Invalid result. Expected iq, percentile, accuracy, elapsedSeconds, and dimensions[].",
        },
        { status: 400 },
      );
    }

    const latex = buildIqReportLatex(result, {
      name: user.name ?? session.user.name,
      email: user.email ?? session.user.email,
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
              "Failed to compile IQ report PDF",
          },
          { status: upstreamResponse.status },
        );
      }
      const errorText = await upstreamResponse.text();
      return NextResponse.json(
        { error: errorText || "Failed to compile IQ report PDF" },
        { status: upstreamResponse.status },
      );
    }

    const arrayBuffer = await upstreamResponse.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="iq-score-report.pdf"',
      },
    });
  } catch (error) {
    console.error("iq-test/pdf error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
