"use client";

import AiTextToolPage from "components/AiTextToolPage";

export default function CodeExplainerPage() {
  return (
    <AiTextToolPage
      title="Code Explainer"
      description="Paste a snippet and get a clear explanation of what it does and how it fits together."
      apiPath="/api/code-explainer"
      inputLabel="Code"
      placeholder="Paste code in any common language…"
      submitLabel="Explain code"
      buildBody={(t) => ({ text: t })}
      textareaMinHeightClass="min-h-[240px]"
    />
  );
}
