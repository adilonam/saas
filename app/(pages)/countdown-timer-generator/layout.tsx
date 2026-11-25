import { generateToolMetadata, generateJsonLd } from "@/lib/metadata-utils";
import { Metadata } from "next";

const toolName = "Countdown Timer Generator – Online Countdown Maker (Free)";
const toolDescription =
  "Free online countdown timer generator and countdown maker. Set any date and time, get a live countdown, shareable link, and simple embed snippet for websites—no signup.";
const toolPath = "/countdown-timer-generator";

export const metadata: Metadata = generateToolMetadata({
  title: toolName,
  description: toolDescription,
  path: toolPath,
  keywords: [
    "countdown timer generator",
    "online countdown generator",
    "countdown maker",
    "countdown generator",
    "countdown clock generator",
    "countdown creator",
    "countdown generator for website",
    "countdown builder",
    "countdown generator for facebook",
    "free countdown timer",
  ],
  category: "Time Tools",
});

export default function CountdownTimerGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = generateJsonLd({
    name: toolName,
    description: toolDescription,
    url: `https://www.eprod.io${toolPath}`,
    applicationCategory: "UtilitiesApplication",
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
