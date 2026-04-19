import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

function parseRange(rangeRaw: string): number[] {
  const pages = new Set<number>();
  const parts = rangeRaw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  for (const part of parts) {
    if (part.includes("-")) {
      const [startRaw, endRaw] = part.split("-").map((s) => s.trim());
      const start = Number.parseInt(startRaw, 10);
      const end = Number.parseInt(endRaw, 10);
      if (!Number.isFinite(start) || !Number.isFinite(end) || start <= 0 || end <= 0) {
        throw new Error("Invalid range segment");
      }
      const from = Math.min(start, end);
      const to = Math.max(start, end);
      for (let i = from; i <= to; i += 1) pages.add(i);
    } else {
      const page = Number.parseInt(part, 10);
      if (!Number.isFinite(page) || page <= 0) throw new Error("Invalid page number");
      pages.add(page);
    }
  }

  return [...pages].sort((a, b) => a - b);
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionExpiresAt: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hasActiveSubscription =
      user.subscriptionExpiresAt &&
      new Date(user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      return NextResponse.json(
        { error: "Active subscription required" },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const rangeRaw = String(formData.get("range") || "").trim();

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json({ error: "Valid PDF file is required" }, { status: 400 });
    }
    if (!rangeRaw) {
      return NextResponse.json(
        { error: "Page range is required (e.g. 1-3,5)" },
        { status: 400 },
      );
    }

    let requestedPages: number[];
    try {
      requestedPages = parseRange(rangeRaw);
    } catch {
      return NextResponse.json({ error: "Invalid range format" }, { status: 400 });
    }

    const inputBytes = new Uint8Array(await file.arrayBuffer());
    const sourceDoc = await PDFDocument.load(inputBytes);
    const totalPages = sourceDoc.getPageCount();

    const outOfRange = requestedPages.find((p) => p > totalPages);
    if (outOfRange) {
      return NextResponse.json(
        { error: `Page ${outOfRange} is out of range. Document has ${totalPages} pages.` },
        { status: 400 },
      );
    }

    const newDoc = await PDFDocument.create();
    const pageIndices = requestedPages.map((p) => p - 1);
    const copiedPages = await newDoc.copyPages(sourceDoc, pageIndices);
    copiedPages.forEach((page) => newDoc.addPage(page));
    const output = await newDoc.save();

    return new NextResponse(Buffer.from(output), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="range-split.pdf"',
      },
    });
  } catch (error) {
    console.error("pdf-range-splitter error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
