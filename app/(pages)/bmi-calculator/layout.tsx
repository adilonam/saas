import { generateToolMetadata, generateJsonLd } from '@/lib/metadata-utils';
import { Metadata } from 'next';

const toolName = "BMI Calculator – Body Mass Index Check (Free)";
const toolDescription = "Calculate your Body Mass Index (BMI) from weight and height. See your category and healthy weight range. Free BMI calculator with instant results.";
const toolPath = "/bmi-calculator";

export const metadata: Metadata = generateToolMetadata({
  title: toolName,
  description: toolDescription,
  path: toolPath,
  keywords: [
    "bmi calculator",
    "body mass index",
    "bmi check",
    "weight calculator",
    "height weight calculator",
  ],
  category: "Health Calculators",
});

export default function BMICalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = generateJsonLd({
    name: toolName,
    description: toolDescription,
    url: `https://www.eprod.io${toolPath}`,
    applicationCategory: "HealthApplication",
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
