"use client";

import TradingRiskToolPage from "components/TradingRiskToolPage";

export default function MaxDailyLossGuardrailCalculatorPage() {
  return (
    <TradingRiskToolPage
      title="Max Daily Loss Guardrail Calculator"
      description="Set a daily risk cap and estimate max losing trades"
      formulaNote="Max losses before stop = floor(Daily loss limit / Risk per trade)."
      fields={[
        { key: "accountSize", label: "Account size", placeholder: "e.g. 15000", type: "text" },
        { key: "dailyLossPercent", label: "Max daily loss (%)", placeholder: "e.g. 3", min: "0.01", step: "0.01" },
        { key: "riskPerTradePercent", label: "Risk per trade (%)", placeholder: "e.g. 0.5", min: "0.01", step: "0.01" },
      ]}
      compute={(values) => {
        const account = values.accountSize as number;
        const dailyLossPercent = values.dailyLossPercent as number;
        const riskPerTradePercent = values.riskPerTradePercent as number;
        if (account <= 0 || dailyLossPercent <= 0 || riskPerTradePercent <= 0) return null;
        const dailyLimitAmount = (account * dailyLossPercent) / 100;
        const riskAmount = (account * riskPerTradePercent) / 100;
        const maxLosses = Math.floor(dailyLimitAmount / riskAmount);
        return [
          { label: "Daily loss limit", value: `$${dailyLimitAmount.toFixed(2)}`, tone: "danger" },
          { label: "Risk per trade", value: `$${riskAmount.toFixed(2)}` },
          { label: "Max full-R losses before stop", value: `${maxLosses} trades`, tone: "positive" },
        ];
      }}
    />
  );
}
