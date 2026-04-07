"use client";

import AdsToolPage from "components/AdsToolPage";

function delta(current: number, previous: number) {
  if (previous <= 0) return 0;
  return ((current - previous) / previous) * 100;
}

export default function WeeklyPerformanceNarrativeAiPage() {
  return (
    <AdsToolPage
      title="Weekly Performance Narrative AI"
      description="Create a weekly performance narrative from spend, conversions, and revenue."
      formulaNote="Narrative is built from week-over-week percentage changes in core KPIs."
      fields={[
        { key: "spendCurrent", label: "Current week spend ($)", placeholder: "e.g. 8000", type: "number", min: "0", step: "100" },
        { key: "spendPrevious", label: "Previous week spend ($)", placeholder: "e.g. 7600", type: "number", min: "0", step: "100" },
        { key: "conversionsCurrent", label: "Current week conversions", placeholder: "e.g. 134", type: "number", min: "0", step: "1" },
        { key: "conversionsPrevious", label: "Previous week conversions", placeholder: "e.g. 121", type: "number", min: "0", step: "1" },
        { key: "revenueCurrent", label: "Current week revenue ($)", placeholder: "e.g. 32200", type: "number", min: "0", step: "100" },
        { key: "revenuePrevious", label: "Previous week revenue ($)", placeholder: "e.g. 28750", type: "number", min: "0", step: "100" },
      ]}
      compute={(values) => {
        const spendCurrent = values.spendCurrent as number;
        const spendPrevious = values.spendPrevious as number;
        const conversionsCurrent = values.conversionsCurrent as number;
        const conversionsPrevious = values.conversionsPrevious as number;
        const revenueCurrent = values.revenueCurrent as number;
        const revenuePrevious = values.revenuePrevious as number;
        if (spendCurrent <= 0 || spendPrevious <= 0) return null;

        const spendDelta = delta(spendCurrent, spendPrevious);
        const conversionDelta = delta(conversionsCurrent, conversionsPrevious);
        const revenueDelta = delta(revenueCurrent, revenuePrevious);
        const roasCurrent = revenueCurrent / spendCurrent;
        const roasPrevious = revenuePrevious / spendPrevious;
        const roasDelta = delta(roasCurrent, roasPrevious);

        const story =
          `This week spend moved ${spendDelta >= 0 ? "up" : "down"} by ${Math.abs(spendDelta).toFixed(1)}% while conversions moved ${conversionDelta >= 0 ? "up" : "down"} by ${Math.abs(conversionDelta).toFixed(1)}%.\n` +
          `Revenue changed ${revenueDelta >= 0 ? "up" : "down"} by ${Math.abs(revenueDelta).toFixed(1)}% and ROAS ${roasDelta >= 0 ? "improved" : "declined"} to ${roasCurrent.toFixed(2)}x.\n` +
          `Recommended focus: ${roasDelta >= 0 ? "scale winning campaigns and protect CPA guardrails." : "trim low-efficiency segments and reallocate toward high-converting audiences."}`;

        return [
          { label: "Current week ROAS", value: `${roasCurrent.toFixed(2)}x`, tone: roasCurrent >= 3 ? "positive" : "default" },
          { label: "Week-over-week ROAS change", value: `${roasDelta.toFixed(1)}%`, tone: roasDelta >= 0 ? "positive" : "danger" },
          { label: "Generated narrative", value: story },
        ];
      }}
    />
  );
}
