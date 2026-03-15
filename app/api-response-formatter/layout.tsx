import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Response Formatter – Anycode",
  description:
    "Format or minify JSON. Pretty-print or compact API responses for readability.",
};

export default function ApiResponseFormatterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
