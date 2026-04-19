import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Semantic version bump suggester – eProd",
  description:
    "Given a current semver and conventional commits, suggest the next major, minor, or patch version.",
};

export default function SemverBumpSuggesterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
