import { NextResponse } from "next/server";

export const dynamic = "force-static";

type RouteContext = {
  params: Promise<{
    indexnowKey: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const configuredKey = process.env.INDEXNOW_KEY;

  if (!configuredKey) {
    return new NextResponse("INDEXNOW_KEY is not configured.", {
      status: 500,
      headers: {
        "content-type": "text/plain; charset=utf-8",
      },
    });
  }

  const { indexnowKey } = await context.params;
  if (indexnowKey !== configuredKey) {
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
