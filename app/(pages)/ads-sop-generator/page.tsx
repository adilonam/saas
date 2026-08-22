"use client";

import AdsToolPage from "components/AdsToolPage";

export default function AdsSopGeneratorPage() {
  return (
    <AdsToolPage
      title="Ads SOP Generator"
      description="Generate a practical SOP template for recurring ad operations."
      formulaNote="This SOP is auto-structured from your process owner, cadence, SLA, and tool stack."
      fields={[
        { key: "processName", label: "Process name", type: "text", placeholder: "e.g. Weekly creative refresh" },
        { key: "owner", label: "Owner", type: "text", placeholder: "e.g. Paid Media Manager" },
        {
          key: "cadence",
          label: "Cadence",
          type: "select",
          defaultValue: "Weekly",
          options: [
            { value: "Daily", label: "Daily" },
            { value: "Weekly", label: "Weekly" },
            { value: "Bi-weekly", label: "Bi-weekly" },
            { value: "Monthly", label: "Monthly" },
          ],
        },
        { key: "slaHours", label: "SLA (hours)", type: "number", placeholder: "e.g. 24", min: "1", step: "1" },
        { key: "tools", label: "Primary tools", type: "text", placeholder: "e.g. Meta Ads, GA4, Looker Studio" },
      ]}
      compute={(values) => {
        const processName = (values.processName as string).trim();
        const owner = (values.owner as string).trim();
        const cadence = (values.cadence as string).trim();
        const slaHours = values.slaHours as number;
        const tools = (values.tools as string).trim();
        if (!processName || !owner || !cadence || slaHours <= 0 || !tools) return null;

        const sop = `1) Objective\n- Standardize ${processName.toLowerCase()} and reduce execution variance.\n\n2) Owner\n- ${owner}\n\n3) Cadence\n- ${cadence}\n\n4) Inputs Required\n- Latest campaign performance export\n- Approved budget guardrails\n- Creative inventory status\n\n5) Steps\n- Pull last-period performance data.\n- Identify outliers vs KPI targets.\n- Apply optimization actions and document changes.\n- QA tracking and naming conventions.\n- Publish summary to stakeholders.\n\n6) SLA\n- Complete within ${slaHours} hours from trigger.\n\n7) Tools\n- ${tools}\n\n8) QA Checklist\n- Naming conventions correct\n- Budget pacing verified\n- Conversion tracking healthy\n- Notes logged in changelog`;

        return [
          { label: "Generated SOP", value: sop },
        ];
      }}
    />
  );
}
