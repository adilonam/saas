"use client";

import AiTextToolPage from "components/AiTextToolPage";

export default function ProductDescriptionGeneratorPage() {
  return (
    <AiTextToolPage
      title="Product Description Generator"
      description="Describe your product and audience; get store-ready copy with benefits and structure."
      apiPath="/api/product-description-generator"
      inputLabel="Product details"
      placeholder="Name, features, differentiators, target customer…"
      submitLabel="Generate description"
      buildBody={(t) => ({ prompt: t })}
      textareaMinHeightClass="min-h-[160px]"
    />
  );
}
