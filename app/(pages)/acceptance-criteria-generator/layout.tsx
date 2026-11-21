import { generateToolMetadata, generateJsonLd } from '@/lib/metadata-utils';
import { Metadata } from 'next';

const toolName = "Acceptance Criteria Generator – User Stories (Free)";
const toolDescription = "Free acceptance criteria generator for user stories. Create Given/When/Then scenarios and engineering checklists. Generate quality acceptance criteria for agile development and software requirements.";
const toolPath = "/acceptance-criteria-generator";

export const metadata: Metadata = generateToolMetadata({
  title: toolName,
  description: toolDescription,
  path: toolPath,
  keywords: [
    "acceptance criteria",
    "user story",
    "agile",
    "given when then",
    "acceptance criteria generator",
    "software requirements",
    "test cases",
    "bdd",
  ],
  category: "Development Tools",
});

export default function AcceptanceCriteriaGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = generateJsonLd({
    name: toolName,
    description: toolDescription,
    url: `https://www.eprod.io${toolPath}`,
    applicationCategory: "DeveloperApplication",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
