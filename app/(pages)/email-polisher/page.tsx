"use client";

import AiTextToolPage from "components/AiTextToolPage";

export default function EmailPolisherPage() {
  return (
    <AiTextToolPage
      title="Email Polisher"
      description="Improve grammar, clarity, and tone while keeping your message intact."
      apiPath="/api/email-polisher"
      inputLabel="Email draft"
      placeholder="Paste your email body…"
      submitLabel="Polish email"
      buildBody={(t) => ({ text: t })}
      textareaMinHeightClass="min-h-[180px]"
    />
  );
}
