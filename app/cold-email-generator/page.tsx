"use client";

import AiTextToolPage from "components/AiTextToolPage";

export default function ColdEmailGeneratorPage() {
  return (
    <AiTextToolPage
      title="Cold Email Generator"
      description="Describe your offer, who you are reaching, and the ask — get a concise draft with subject line."
      apiPath="/api/cold-email-generator"
      inputLabel="Context"
      placeholder="Who you are, what you offer, recipient type, desired CTA…"
      submitLabel="Generate email"
      buildBody={(t) => ({ prompt: t })}
      textareaMinHeightClass="min-h-[180px]"
    />
  );
}
