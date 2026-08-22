import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Password Generator – eProd",
  description:
    "Generate strong random passwords with length and character options.",
};

export default function PasswordGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
