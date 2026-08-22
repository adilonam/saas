"use client";

import TradingRiskToolPage from "components/TradingRiskToolPage";

export default function KellyCriterionCalculatorPage() {
  return (
    <TradingRiskToolPage
      title="Kelly Criterion Calculator"
      description="Estimate optimal bankroll fraction from edge"
      formulaNote="Kelly fraction = W - (1 - W) / R, where W is win rate and R is reward:risk."
      fields={[
        { key: "winRate", label: "Win rate (%)", placeholder: "e.g. 55", min: "0.01", step: "0.01" },
        { key: "rewardRisk", label: "Reward:Risk ratio", placeholder: "e.g. 1.5", min: "0.01", step: "0.01" },
      ]}
      compute={(values) => {
        const winRate = values.winRate as number;
        const rewardRisk = values.rewardRisk as number;
        if (winRate <= 0 || winRate >= 100 || rewardRisk <= 0) return null;
        const w = winRate / 100;
        const kelly = w - (1 - w) / rewardRisk;
        const halfKelly = Math.max(0, kelly / 2) * 100;
        return [
          { label: "Kelly fraction", value: `${(kelly * 100).toFixed(2)}%`, tone: kelly > 0 ? "positive" : "danger" },
          { label: "Half-Kelly (conservative)", value: `${halfKelly.toFixed(2)}%` },
        ];
      }}
    />
  );
}
