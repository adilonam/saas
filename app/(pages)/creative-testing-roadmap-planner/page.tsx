"use client";

import AdsToolPage from "components/AdsToolPage";

export default function CreativeTestingRoadmapPlannerPage() {
  return (
    <AdsToolPage
      title="Creative Testing Roadmap Planner"
      description="Plan weekly creative testing volume from budget, CPM, and testing depth."
      formulaNote="Estimated impressions = (Weekly budget / CPM) x 1000. Planned tests = concepts x variants per concept."
      fields={[
        { key: "weeklyBudget", label: "Weekly test budget ($)", placeholder: "e.g. 5000", type: "number", min: "0", step: "100" },
        { key: "cpm", label: "Estimated CPM ($)", placeholder: "e.g. 18", type: "number", min: "0.1", step: "0.1" },
        { key: "concepts", label: "New concepts this week", placeholder: "e.g. 4", type: "number", min: "1", step: "1" },
        { key: "variants", label: "Variants per concept", placeholder: "e.g. 3", type: "number", min: "1", step: "1" },
        { key: "baselineCtr", label: "Baseline CTR (%)", placeholder: "e.g. 1.8", type: "number", min: "0.1", step: "0.1" },
      ]}
      compute={(values) => {
        const weeklyBudget = values.weeklyBudget as number;
        const cpm = values.cpm as number;
        const concepts = values.concepts as number;
        const variants = values.variants as number;
        const baselineCtr = values.baselineCtr as number;
        if (weeklyBudget <= 0 || cpm <= 0 || concepts <= 0 || variants <= 0 || baselineCtr <= 0) return null;

        const impressions = (weeklyBudget / cpm) * 1000;
        const plannedTests = Math.round(concepts * variants);
        const impressionsPerTest = impressions / plannedTests;
        const expectedClicksPerTest = impressionsPerTest * (baselineCtr / 100);

        const recommendation =
          impressionsPerTest >= 5000
            ? "Coverage is healthy for directional test outcomes."
            : "Increase budget or reduce active variants to improve signal quality.";

        return [
          { label: "Planned creative tests", value: `${plannedTests} tests` },
          { label: "Estimated weekly impressions", value: `${Math.round(impressions).toLocaleString()} impressions` },
          { label: "Impressions per test", value: `${Math.round(impressionsPerTest).toLocaleString()}` },
          { label: "Expected clicks per test", value: `${Math.round(expectedClicksPerTest).toLocaleString()}` },
          { label: "Roadmap recommendation", value: recommendation, tone: impressionsPerTest >= 5000 ? "positive" : "danger" },
        ];
      }}
    />
  );
}
