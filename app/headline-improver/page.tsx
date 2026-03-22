"use client";

import AiTextToolPage from "components/AiTextToolPage";

export default function HeadlineImproverPage() {
  return (
    <AiTextToolPage
      title="Headline Improver"
      description="Generate many headline options from a topic or a rough draft."
      apiPath="/api/headline-improver"
      inputLabel="Topic or draft headline"
      placeholder="e.g. Launching a budgeting app for freelancers…"
      submitLabel="Generate headlines"
      buildBody={(t) => ({ text: t })}
    />
  );
}
