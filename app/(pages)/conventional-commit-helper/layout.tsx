import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conventional commit helper – eProd",
  description:
    "Build Conventional Commits messages: type, scope, breaking flag, body, and footers. Copy-ready for git.",
};

export default function ConventionalCommitHelperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
