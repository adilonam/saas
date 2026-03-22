"use client";

import AiTextToolPage from "components/AiTextToolPage";

export default function KeywordGeneratorPage() {
  return (
    <AiTextToolPage
      title="Keyword Generator"
      description="Basic SEO-style keyword clusters from a topic: core terms, long-tail phrases, and question-style queries."
      apiPath="/api/keyword-generator"
      inputLabel="Topic or seed phrase"
      placeholder="e.g. sustainable running shoes for beginners"
      submitLabel="Generate keywords"
      buildBody={(t) => ({ topic: t })}
    />
  );
}
