"use client";

import TradingRiskToolPage from "components/TradingRiskToolPage";

export default function AtrPositionSizingToolPage() {
  return (
    <TradingRiskToolPage
      title="ATR Position Sizing Tool"
      description="Size trades based on ATR-derived stop distance"
      formulaNote="Stop distance = ATR x Multiple. Units = (Account x Risk%) / Stop distance."
      fields={[
        { key: "accountSize", label: "Account size", placeholder: "e.g. 10000", type: "text" },
        { key: "riskPercent", label: "Risk per trade (%)", placeholder: "e.g. 1", min: "0.01", step: "0.01" },
        { key: "atr", label: "ATR value", placeholder: "e.g. 1.25", min: "0.0001", step: "0.0001" },
        { key: "atrMultiple", label: "ATR stop multiple", placeholder: "e.g. 2", min: "0.1", step: "0.1" },
      ]}
      compute={(values) => {
        const account = values.accountSize as number;
        const riskPercent = values.riskPercent as number;
        const atr = values.atr as number;
        const multiple = values.atrMultiple as number;
        if (account <= 0 || riskPercent <= 0 || atr <= 0 || multiple <= 0) return null;
        const stopDistance = atr * multiple;
        const riskAmount = (account * riskPercent) / 100;
        const units = riskAmount / stopDistance;
        return [
          { label: "ATR-based stop distance", value: stopDistance.toFixed(4) },
          { label: "Risk amount", value: `$${riskAmount.toFixed(2)}` },
          { label: "Estimated position size", value: `${units.toFixed(2)} units`, tone: "positive" },
        ];
      }}
    />
  );
}
