"use client";

import TradingRiskToolPage from "components/TradingRiskToolPage";

export default function PositionSizeCalculatorPage() {
  return (
    <TradingRiskToolPage
      title="Position Size Calculator"
      description="Size your position from account risk and stop distance"
      formulaNote="Units = (Account size x Risk%) / |Entry - Stop|. This is an estimate only."
      fields={[
        { key: "accountSize", label: "Account size", placeholder: "e.g. 10000", type: "text" },
        { key: "riskPercent", label: "Risk per trade (%)", placeholder: "e.g. 1", min: "0.01", step: "0.01" },
        { key: "entryPrice", label: "Entry price", placeholder: "e.g. 1.1050", min: "0", step: "0.0001" },
        { key: "stopPrice", label: "Stop loss price", placeholder: "e.g. 1.1000", min: "0", step: "0.0001" },
      ]}
      compute={(values) => {
        const account = values.accountSize as number;
        const riskPercent = values.riskPercent as number;
        const entry = values.entryPrice as number;
        const stop = values.stopPrice as number;
        const stopDistance = Math.abs(entry - stop);
        if (account <= 0 || riskPercent <= 0 || stopDistance <= 0) return null;
        const riskAmount = (account * riskPercent) / 100;
        const units = riskAmount / stopDistance;
        return [
          { label: "Risk amount", value: `$${riskAmount.toFixed(2)}` },
          { label: "Stop distance", value: stopDistance.toFixed(5) },
          { label: "Estimated position size", value: `${units.toFixed(2)} units`, tone: "positive" },
        ];
      }}
    />
  );
}
