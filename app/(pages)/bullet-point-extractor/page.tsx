"use client";

import AiTextToolPage from "components/AiTextToolPage";

export default function BulletPointExtractorPage() {
  return (
    <AiTextToolPage
      title="Bullet Point Extractor"
      description="Turn paragraphs into a clean bullet list without adding new claims."
      apiPath="/api/bullet-point-extractor"
      inputLabel="Source text"
      placeholder="Paste the text you want broken into bullets…"
      submitLabel="Extract bullets"
      buildBody={(t) => ({ text: t })}
      textareaMinHeightClass="min-h-[200px]"
    />
  );
}
