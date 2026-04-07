"use client";

import TradingRiskToolPage from "components/TradingRiskToolPage";

export default function FixedFractionalSizingToolPage() {
  return (
    <TradingRiskToolPage
      title="Fixed Fractional Sizing Tool"
      description="Position sizing using fixed equity risk percentage"
      formulaNote="Position units = (Equity x Risk%) / Stop distance."
      fields={[
        { key: "equity", label: "Account equity", placeholder: "e.g. 20000", type: "text" },
        { key: "riskPercent", label: "Fixed risk (%)", placeholder: "e.g. 1", min: "0.01", step: "0.01" },
        { key: "stopDistance", label: "Stop distance (price units)", placeholder: "e.g. 0.50", min: "0.0001", step: "0.0001" },
      ]}
      compute={(values) => {
        const equity = values.equity as number;
        const riskPercent = values.riskPercent as number;
        const stopDistance = values.stopDistance as number;
        if (equity <= 0 || riskPercent <= 0 || stopDistance <= 0) return null;
        const riskAmount = (equity * riskPercent) / 100;
        const units = riskAmount / stopDistance;
        return [
          { label: "Risk amount", value: `$${riskAmount.toFixed(2)}` },
          { label: "Suggested position size", value: `${units.toFixed(2)} units`, tone: "positive" },
        ];
      }}
    />
  );
}
