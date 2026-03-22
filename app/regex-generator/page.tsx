"use client";

import AiTextToolPage from "components/AiTextToolPage";

export default function RegexGeneratorPage() {
  return (
    <AiTextToolPage
      title="Regex Generator"
      description="Describe what you need to match in plain English and get a pattern plus a short explanation."
      apiPath="/api/regex-generator"
      inputLabel="What should the regex match?"
      placeholder="e.g. US phone numbers with optional country code…"
      submitLabel="Generate regex"
      buildBody={(t) => ({ text: t })}
    />
  );
}
