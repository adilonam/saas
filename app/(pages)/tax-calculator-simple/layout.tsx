import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Simple Tax Calculator – eProd",
  description:
    "Add a tax rate to a subtotal, or split a tax-included total into subtotal and tax.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
