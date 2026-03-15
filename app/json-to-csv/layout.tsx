import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON to CSV Converter – Anycode",
  description:
    "Convert JSON (array of objects) to CSV for export or spreadsheets. Paste and convert instantly.",
};

export default function JsonToCsvLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
