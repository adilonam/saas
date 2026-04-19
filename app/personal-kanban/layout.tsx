import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personal Kanban – eProd",
  description:
    "Simple To do, Doing, and Done board with local persistence.",
};

export default function PersonalKanbanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
