"use client";

import TradingRiskToolPage from "components/TradingRiskToolPage";

export default function TrailingStopPlannerPage() {
  return (
    <TradingRiskToolPage
      title="Trailing Stop Planner"
      description="Plan dynamic stop levels based on current price"
      formulaNote="Long trailing stop = Current price x (1 - trail%). Short trailing stop = Current price x (1 + trail%)."
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
        { key: "entry", label: "Entry price", placeholder: "e.g. 100", min: "0", step: "0.0001" },
        { key: "current", label: "Current price", placeholder: "e.g. 108", min: "0", step: "0.0001" },
        { key: "trailPercent", label: "Trailing distance (%)", placeholder: "e.g. 2", min: "0.01", step: "0.01" },
      ]}
      compute={(values) => {
        const direction = values.direction as string;
        const entry = values.entry as number;
        const current = values.current as number;
        const trailPercent = values.trailPercent as number;
        if (entry <= 0 || current <= 0 || trailPercent <= 0) return null;
        const trail = trailPercent / 100;
        const stop = direction === "long" ? current * (1 - trail) : current * (1 + trail);
        const lockedPnl = direction === "long" ? stop - entry : entry - stop;
        return [
          { label: "Suggested trailing stop", value: stop.toFixed(4), tone: "danger" },
          { label: "Locked-in P/L per unit", value: `${lockedPnl >= 0 ? "+" : ""}${lockedPnl.toFixed(4)}`, tone: lockedPnl >= 0 ? "positive" : "danger" },
        ];
      }}
    />
  );
}
