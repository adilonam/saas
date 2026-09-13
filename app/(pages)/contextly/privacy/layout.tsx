import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contextly Privacy Policy",
  description:
    "Privacy policy for the Contextly Chrome extension. Learn what data we handle, how we use it, and what we do not collect.",
  alternates: {
    canonical: "https://www.eprod.io/contextly/privacy",
  },
  openGraph: {
    title: "Contextly Privacy Policy",
    url: "https://www.eprod.io/contextly/privacy",
    description:
      "What Contextly collects, how selected text is processed, storage in the extension, and what we do not collect.",
  },
};

export default function ContextlyPrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
