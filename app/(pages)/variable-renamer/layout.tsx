import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Variable renamer suggestions – eProd",
  description:
    "Optional AI suggests clearer names for a variable or function using language conventions.",
};

export default function VariableRenamerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
