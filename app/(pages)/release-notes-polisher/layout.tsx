import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Release notes polisher – eProd",
  description:
    "Polish draft release notes with optional AI: clearer tone and structure while keeping facts accurate.",
};

export default function ReleaseNotesPolisherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
