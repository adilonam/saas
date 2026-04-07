"use client";

import AdsToolPage from "components/AdsToolPage";

export default function B2BPipelineRoasCalculatorPage() {
  return (
    <AdsToolPage
      title="B2B Pipeline ROAS Calculator"
      description="Estimate pipeline efficiency from ad spend, win rate, and gross margin."
      formulaNote="Pipeline ROAS = Expected closed revenue / Ad spend. Profit ROAS uses gross profit after margin."
      fields={[
        { key: "adSpend", label: "Ad spend ($)", placeholder: "e.g. 12000", type: "number", min: "0", step: "100" },
        { key: "pipelineRevenue", label: "Attributed pipeline revenue ($)", placeholder: "e.g. 180000", type: "number", min: "0", step: "100" },
        { key: "winRate", label: "Pipeline win rate (%)", placeholder: "e.g. 22", type: "number", min: "0", step: "0.1" },
        { key: "grossMargin", label: "Gross margin (%)", placeholder: "e.g. 68", type: "number", min: "0", step: "0.1" },
      ]}
      compute={(values) => {
        const spend = values.adSpend as number;
        const pipeline = values.pipelineRevenue as number;
        const winRate = values.winRate as number;
        const margin = values.grossMargin as number;
        if (spend <= 0 || pipeline <= 0 || winRate < 0 || margin < 0) return null;

        const expectedClosedRevenue = pipeline * (winRate / 100);
        const expectedGrossProfit = expectedClosedRevenue * (margin / 100);
        const pipelineRoas = expectedClosedRevenue / spend;
        const profitRoas = expectedGrossProfit / spend;

        return [
          { label: "Expected closed revenue", value: `$${expectedClosedRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
          { label: "Expected gross profit", value: `$${expectedGrossProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
          { label: "Pipeline ROAS", value: `${pipelineRoas.toFixed(2)}x`, tone: pipelineRoas >= 3 ? "positive" : "default" },
          { label: "Profit ROAS", value: `${profitRoas.toFixed(2)}x`, tone: profitRoas >= 1.5 ? "positive" : "default" },
        ];
      }}
    />
  );
}
