"use client";

import AdsToolPage from "components/AdsToolPage";

function normalizeSegment(input: string) {
  return input
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
}

export default function CampaignNamingConventionGeneratorPage() {
  return (
    <AdsToolPage
      title="Campaign Naming Convention Generator"
      description="Generate a clean and consistent campaign name from your core metadata."
      formulaNote="Format: CHANNEL_OBJECTIVE_GEO_AUDIENCE_OFFER_CREATIVE_DATE."
      fields={[
        {
          key: "channel",
          label: "Channel",
          type: "select",
          defaultValue: "META",
          options: [
            { value: "META", label: "Meta" },
            { value: "GOOGLE", label: "Google Ads" },
            { value: "TIKTOK", label: "TikTok" },
            { value: "LINKEDIN", label: "LinkedIn" },
          ],
        },
        {
          key: "objective",
          label: "Objective",
          type: "select",
          defaultValue: "CONV",
          options: [
            { value: "CONV", label: "Conversions" },
            { value: "LEAD", label: "Lead Gen" },
            { value: "AWARE", label: "Awareness" },
            { value: "RETARGET", label: "Retargeting" },
          ],
        },
        { key: "geo", label: "Geo", type: "text", placeholder: "e.g. US, GCC, UK" },
        { key: "audience", label: "Audience", type: "text", placeholder: "e.g. SaaS Founders" },
        { key: "offer", label: "Offer", type: "text", placeholder: "e.g. Demo Trial" },
        { key: "creative", label: "Creative angle", type: "text", placeholder: "e.g. UGC Hook 1" },
        { key: "dateTag", label: "Date tag", type: "text", placeholder: "e.g. 2026Q2" },
      ]}
      compute={(values) => {
        const channel = values.channel as string;
        const objective = values.objective as string;
        const geo = normalizeSegment(values.geo as string);
        const audience = normalizeSegment(values.audience as string);
        const offer = normalizeSegment(values.offer as string);
        const creative = normalizeSegment(values.creative as string);
        const dateTag = normalizeSegment(values.dateTag as string);
        if (!geo || !audience || !offer || !creative || !dateTag) return null;

        const campaignName = [channel, objective, geo, audience, offer, creative, dateTag].join("_");
        return [
          { label: "Campaign name", value: campaignName, tone: "positive" },
          { label: "Short version", value: `${channel}_${objective}_${geo}_${offer}_${dateTag}` },
        ];
      }}
    />
  );
}
