"use client";

import TradingRiskToolPage from "components/TradingRiskToolPage";

export default function DrawdownRecoveryCalculatorPage() {
  return (
    <TradingRiskToolPage
      title="Drawdown Recovery Calculator"
      description="Estimate gain required to recover from drawdown"
      formulaNote="Recovery gain (%) = Drawdown% / (1 - Drawdown%)."
      fields={[
        { key: "drawdown", label: "Drawdown (%)", placeholder: "e.g. 20", min: "0.01", step: "0.01" },
      ]}
      compute={(values) => {
        const drawdown = values.drawdown as number;
        if (drawdown <= 0 || drawdown >= 100) return null;
        const recovery = (drawdown / (100 - drawdown)) * 100;
        return [
          { label: "Required recovery gain", value: `${recovery.toFixed(2)}%`, tone: recovery > 50 ? "danger" : "default" },
          { label: "Remaining equity after drawdown", value: `${(100 - drawdown).toFixed(2)}%` },
        ];
      }}
    />
  );
}
