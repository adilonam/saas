"use client";

import AdsToolPage from "components/AdsToolPage";

export default function AgencyClientReportingGeneratorPage() {
  return (
    <AdsToolPage
      title="Agency Client Reporting Generator"
      description="Generate key PPC client reporting metrics from campaign totals."
      formulaNote="Derived metrics: CTR = clicks/impressions, CPC = spend/clicks, CPL = spend/leads, CVR = conversions/clicks, CPA = spend/conversions, ROAS = revenue/spend."
      fields={[
        { key: "spend", label: "Ad spend ($)", placeholder: "e.g. 15000", type: "number", min: "0", step: "100" },
        { key: "impressions", label: "Impressions", placeholder: "e.g. 1200000", type: "number", min: "0", step: "1" },
        { key: "clicks", label: "Clicks", placeholder: "e.g. 18500", type: "number", min: "0", step: "1" },
        { key: "leads", label: "Leads", placeholder: "e.g. 620", type: "number", min: "0", step: "1" },
        { key: "conversions", label: "Conversions / deals", placeholder: "e.g. 115", type: "number", min: "0", step: "1" },
        { key: "revenue", label: "Attributed revenue ($)", placeholder: "e.g. 78000", type: "number", min: "0", step: "100" },
      ]}
      compute={(values) => {
        const spend = values.spend as number;
        const impressions = values.impressions as number;
        const clicks = values.clicks as number;
        const leads = values.leads as number;
        const conversions = values.conversions as number;
        const revenue = values.revenue as number;
        if (spend <= 0 || impressions <= 0 || clicks <= 0) return null;

        const ctr = (clicks / impressions) * 100;
        const cpc = spend / clicks;
        const cpl = leads > 0 ? spend / leads : 0;
        const cvr = conversions > 0 ? (conversions / clicks) * 100 : 0;
        const cpa = conversions > 0 ? spend / conversions : 0;
        const roas = revenue > 0 ? revenue / spend : 0;

        return [
          { label: "CTR", value: `${ctr.toFixed(2)}%` },
          { label: "CPC", value: `$${cpc.toFixed(2)}` },
          { label: "CPL", value: leads > 0 ? `$${cpl.toFixed(2)}` : "N/A" },
          { label: "CVR", value: conversions > 0 ? `${cvr.toFixed(2)}%` : "N/A" },
          { label: "CPA", value: conversions > 0 ? `$${cpa.toFixed(2)}` : "N/A" },
          { label: "ROAS", value: `${roas.toFixed(2)}x`, tone: roas >= 3 ? "positive" : "default" },
        ];
      }}
    />
  );
}
