import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PARA Inbox – eProd",
  description:
    "Projects, Areas, Resources, and Archive lists for PARA-style capture.",
};

export default function ParaInboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
