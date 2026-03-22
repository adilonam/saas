import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Picker Wheel – eProd",
  description:
    "Spin a weighted picker wheel. Add choices with weights (default 1), then spin to pick randomly.",
};

export default function PickerWheelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
