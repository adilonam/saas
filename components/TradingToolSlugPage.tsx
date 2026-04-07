"use client";

import TradingRiskToolPage from "components/TradingRiskToolPage";
import {
  computeTradingToolResults,
  getTradingToolDefinition,
} from "components/tradingToolsConfig";

type TradingToolSlugPageProps = {
  slug: string;
};

export default function TradingToolSlugPage({ slug }: TradingToolSlugPageProps) {
  const tool = getTradingToolDefinition(slug);

  if (!tool) return null;

  return (
    <TradingRiskToolPage
      title={tool.title}
      description={tool.description}
      formulaNote={tool.formulaNote}
      fields={tool.fields}
      compute={(values) => computeTradingToolResults(slug, values)}
    />
  );
}
