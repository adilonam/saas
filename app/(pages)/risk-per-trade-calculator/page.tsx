"use client";

import TradingRiskToolPage from "components/TradingRiskToolPage";

export default function RiskPerTradeCalculatorPage() {
  return (
    <TradingRiskToolPage
      title="Risk per Trade Calculator"
      description="Convert risk percentage to actual dollar risk"
      formulaNote="Risk amount = Account size x Risk% / 100."
      fields={[
        { key: "accountSize", label: "Account size", placeholder: "e.g. 25000", type: "text" },
        { key: "riskPercent", label: "Risk per trade (%)", placeholder: "e.g. 1", min: "0.01", step: "0.01" },
      ]}
      compute={(values) => {
        const account = values.accountSize as number;
        const riskPercent = values.riskPercent as number;
        if (account <= 0 || riskPercent <= 0) return null;
        const riskAmount = (account * riskPercent) / 100;
        return [
          { label: "Risk amount per trade", value: `$${riskAmount.toFixed(2)}`, tone: "danger" },
          { label: "Remaining capital after one full-R loss", value: `$${(account - riskAmount).toFixed(2)}` },
        ];
      }}
    />
  );
}
