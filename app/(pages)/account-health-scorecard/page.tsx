"use client";

import AdsToolPage from "components/AdsToolPage";

export default function AccountHealthScorecardPage() {
  return (
    <AdsToolPage
      title="Account Health Scorecard"
      description="Score account health from delivery, efficiency, and auction pressure signals."
      formulaNote="Weighted score blends CTR, CVR, ROAS, frequency control, and impression share loss metrics."
      fields={[
        { key: "ctr", label: "CTR (%)", placeholder: "e.g. 2.8", type: "number", min: "0", step: "0.1" },
        { key: "cvr", label: "CVR (%)", placeholder: "e.g. 4.5", type: "number", min: "0", step: "0.1" },
        { key: "roas", label: "ROAS (x)", placeholder: "e.g. 3.1", type: "number", min: "0", step: "0.1" },
        { key: "frequency", label: "Average frequency", placeholder: "e.g. 2.3", type: "number", min: "0", step: "0.1" },
        { key: "lostBudget", label: "Lost IS (budget) %", placeholder: "e.g. 14", type: "number", min: "0", step: "0.1" },
        { key: "lostRank", label: "Lost IS (rank) %", placeholder: "e.g. 18", type: "number", min: "0", step: "0.1" },
      ]}
      compute={(values) => {
        const ctr = values.ctr as number;
        const cvr = values.cvr as number;
        const roas = values.roas as number;
        const frequency = values.frequency as number;
        const lostBudget = values.lostBudget as number;
        const lostRank = values.lostRank as number;
        if (ctr < 0 || cvr < 0 || roas < 0 || frequency < 0 || lostBudget < 0 || lostRank < 0) return null;

        const ctrScore = Math.min(100, (ctr / 4) * 100);
        const cvrScore = Math.min(100, (cvr / 8) * 100);
        const roasScore = Math.min(100, (roas / 4) * 100);
        const frequencyScore = Math.max(0, 100 - Math.max(0, frequency - 2) * 20);
        const budgetLossScore = Math.max(0, 100 - lostBudget * 2);
        const rankLossScore = Math.max(0, 100 - lostRank * 2);

        const total =
          ctrScore * 0.18 +
          cvrScore * 0.2 +
          roasScore * 0.3 +
          frequencyScore * 0.12 +
          budgetLossScore * 0.1 +
          rankLossScore * 0.1;

        const health =
          total >= 80 ? "Excellent" : total >= 65 ? "Good" : total >= 50 ? "Needs Attention" : "Critical";

        return [
          { label: "Overall health score", value: `${total.toFixed(1)} / 100`, tone: total >= 65 ? "positive" : total < 50 ? "danger" : "default" },
          { label: "Health status", value: health, tone: total >= 65 ? "positive" : total < 50 ? "danger" : "default" },
          { label: "Priority action", value: total >= 65 ? "Scale stable campaigns and keep testing new creatives weekly." : "Reduce impression share loss and improve CTR/CVR via audience and creative refresh." },
        ];
      }}
    />
  );
}
