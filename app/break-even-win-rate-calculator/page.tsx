"use client";

import TradingRiskToolPage from "components/TradingRiskToolPage";

export default function BreakEvenWinRateCalculatorPage() {
  return (
    <TradingRiskToolPage
      title="Break-Even Win Rate Calculator"
      description="Find minimum win rate needed for zero expectancy"
      formulaNote="Break-even win rate (%) = 100 / (1 + Reward:Risk)."
      fields={[
        { key: "rewardRisk", label: "Reward:Risk ratio", placeholder: "e.g. 2 for 1:2", min: "0.01", step: "0.01" },
      ]}
      compute={(values) => {
        const rr = values.rewardRisk as number;
        if (rr <= 0) return null;
        const breakEven = 100 / (1 + rr);
        return [
          { label: "Break-even win rate", value: `${breakEven.toFixed(2)}%` },
          { label: "Target win rate for edge (+5%)", value: `${Math.min(100, breakEven + 5).toFixed(2)}%`, tone: "positive" },
        ];
      }}
    />
  );
}
