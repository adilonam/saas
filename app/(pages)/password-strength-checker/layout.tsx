import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Password Strength Checker – eProd",
  description:
    "Score your password strength and get quick improvement tips.",
};

export default function PasswordStrengthCheckerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
