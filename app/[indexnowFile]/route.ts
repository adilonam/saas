import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    indexnowFile?: string;
  }>;
};

export async function GET(_: NextRequest, context: RouteContext) {
  const configuredKeyRaw = process.env.INDEXNOW_KEY;

  if (!configuredKeyRaw) {
    return new NextResponse("INDEXNOW_KEY is not configured.", {
      status: 500,
      headers: {
        "content-type": "text/plain; charset=utf-8",
      },
    });
  }

  const normalizeKey = (value: string) =>
    value.trim().replace(/^['"]|['"]$/g, "").replace(/\.txt$/i, "");

  const configuredKey = normalizeKey(configuredKeyRaw);
  const params = await context.params;
  const requestedKey = normalizeKey(params?.indexnowFile ?? "");

  if (requestedKey !== configuredKey) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return new NextResponse(`${configuredKey}\n`, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=300",
    },
  });
}
