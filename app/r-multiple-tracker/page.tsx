"use client";

import TradingRiskToolPage from "components/TradingRiskToolPage";

export default function RMultipleTrackerPage() {
  return (
    <TradingRiskToolPage
      title="R-Multiple Tracker"
      description="Track trade performance in R units"
      formulaNote="R-Multiple = Net P/L / Initial risk amount."
      fields={[
        { key: "riskAmount", label: "Initial risk amount ($)", placeholder: "e.g. 100", min: "0.01", step: "0.01" },
        { key: "netPnl", label: "Net P/L ($)", placeholder: "e.g. 250 or -75", step: "0.01" },
      ]}
      compute={(values) => {
        const risk = values.riskAmount as number;
        const pnl = values.netPnl as number;
        if (risk <= 0) return null;
        const rMultiple = pnl / risk;
        return [
          { label: "R-Multiple", value: `${rMultiple >= 0 ? "+" : ""}${rMultiple.toFixed(2)}R`, tone: rMultiple >= 0 ? "positive" : "danger" },
          { label: "Net P/L", value: `$${pnl.toFixed(2)}`, tone: pnl >= 0 ? "positive" : "danger" },
        ];
      }}
    />
  );
}
