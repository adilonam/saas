"use client";

import TradingRiskToolPage from "components/TradingRiskToolPage";

export default function VolatilityBasedStopLossCalculatorPage() {
  return (
    <TradingRiskToolPage
      title="Volatility-Based Stop Loss Calculator"
      description="Build stop levels from ATR and direction"
      formulaNote="Long stop = Entry - (ATR x Multiple). Short stop = Entry + (ATR x Multiple)."
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
        { key: "entry", label: "Entry price", placeholder: "e.g. 250", min: "0", step: "0.0001" },
        { key: "atr", label: "ATR value", placeholder: "e.g. 3.5", min: "0.0001", step: "0.0001" },
        { key: "multiple", label: "ATR multiple", placeholder: "e.g. 1.5", min: "0.1", step: "0.1" },
      ]}
      compute={(values) => {
        const direction = values.direction as string;
        const entry = values.entry as number;
        const atr = values.atr as number;
        const multiple = values.multiple as number;
        if (entry <= 0 || atr <= 0 || multiple <= 0) return null;
        const offset = atr * multiple;
        const stop = direction === "long" ? entry - offset : entry + offset;
        return [
          { label: "ATR offset", value: offset.toFixed(4) },
          { label: "Suggested stop loss", value: stop.toFixed(4), tone: "danger" },
        ];
      }}
    />
  );
}
