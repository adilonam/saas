import { ADS_TOOLS_BY_SLUG } from "components/tools/adsToolsConfig";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: Request, { params }: Params) {
  const { slug } = await params;
  const tool = ADS_TOOLS_BY_SLUG[slug];

  if (!tool) {
    return Response.json({ error: "Tool not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const numericValues = Object.fromEntries(
    tool.inputs.map((input) => {
      const raw = body[input.key];
      const parsed = typeof raw === "number" ? raw : parseFloat(String(raw ?? ""));
      return [input.key, Number.isFinite(parsed) ? parsed : 0];
    }),
  ) as Record<string, number>;

  return Response.json({ results: tool.calculate(numericValues) });
}
