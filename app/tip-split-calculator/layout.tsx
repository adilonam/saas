import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tip Split Calculator – eProd",
  description:
    "Split a bill with tip: total per person and tip amount from bill, tip %, and party size.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
