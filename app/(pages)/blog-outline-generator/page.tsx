"use client";

import AiTextToolPage from "components/AiTextToolPage";

export default function BlogOutlineGeneratorPage() {
  return (
    <AiTextToolPage
      title="Blog Outline Generator"
      description="Turn a topic or rough idea into a structured outline with sections and subsections."
      apiPath="/api/blog-outline-generator"
      inputLabel="Topic or working title"
      placeholder="e.g. How remote teams run effective design reviews"
      submitLabel="Generate outline"
      buildBody={(t) => ({ topic: t })}
    />
  );
}
