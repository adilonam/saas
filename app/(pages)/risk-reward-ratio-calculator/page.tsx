"use client";

import TradingRiskToolPage from "components/TradingRiskToolPage";

export default function RiskRewardRatioCalculatorPage() {
  return (
    <TradingRiskToolPage
      title="Risk-Reward Ratio Calculator"
      description="Measure potential reward against risk"
      formulaNote="R:R = |Target - Entry| / |Entry - Stop|."
      fields={[
        {
          key: "direction",
          label: "Direction",
          type: "select",
          defaultValue: "long",
          options: [
            { value: "long", label: "Long" },
            { value: "short", label: "Short" },
          ],
        },
        { key: "entry", label: "Entry price", placeholder: "e.g. 100", min: "0", step: "0.0001" },
        { key: "stop", label: "Stop loss price", placeholder: "e.g. 98", min: "0", step: "0.0001" },
        { key: "target", label: "Take profit price", placeholder: "e.g. 106", min: "0", step: "0.0001" },
      ]}
      compute={(values) => {
        const direction = values.direction as string;
        const entry = values.entry as number;
        const stop = values.stop as number;
        const target = values.target as number;
        const risk = Math.abs(entry - stop);
        const reward = Math.abs(target - entry);
        if (entry <= 0 || stop <= 0 || target <= 0 || risk <= 0 || reward <= 0) return null;
        const validStructure = direction === "long" ? stop < entry && target > entry : stop > entry && target < entry;
        if (!validStructure) return null;
        const rr = reward / risk;
        return [
          { label: "Risk-Reward ratio", value: `1:${rr.toFixed(2)}`, tone: rr >= 2 ? "positive" : "default" },
          { label: "Risk distance", value: risk.toFixed(4) },
          { label: "Reward distance", value: reward.toFixed(4) },
        ];
      }}
    />
  );
}
