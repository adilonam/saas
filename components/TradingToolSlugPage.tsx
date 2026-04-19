"use client";

import TradingRiskToolPage from "components/TradingRiskToolPage";
import {
  computeTradingToolResults,
  getTradingToolDefinition,
} from "components/tradingToolsConfig";

type TradingToolSlugPageProps = {
  definitionKey: string;
};

export default function TradingToolSlugPage({ definitionKey }: TradingToolSlugPageProps) {
  const tool = getTradingToolDefinition(definitionKey);

  if (!tool) return null;

  return (
    <TradingRiskToolPage
      title={tool.title}
      description={tool.description}
      formulaNote={tool.formulaNote}
      fields={tool.fields}
      compute={(values) => computeTradingToolResults(definitionKey, values)}
    />
  );
}
