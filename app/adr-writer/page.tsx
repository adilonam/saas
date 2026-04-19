"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { guardToolAccess } from "@/lib/guard-tool-access";

const ta =
  "w-full min-h-[120px] rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export default function AdrWriterPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [num, setNum] = useState("0001");
  const [title, setTitle] = useState("");
  const [statusAdr, setStatusAdr] = useState("Proposed");
  const [context, setContext] = useState("");
  const [decision, setDecision] = useState("");
  const [consequences, setConsequences] = useState("");
  const [alternatives, setAlternatives] = useState("");
  const [out, setOut] = useState("");

  const submit = () => {
    if (!guardToolAccess(status, session, pathname, "/adr-writer", router)) return;
    const body = [
      `# ADR ${num.trim() || "0001"}: ${title.trim() || "Untitled decision"}`,
      "",
      "## Status",
      statusAdr.trim() || "Proposed",
      "",
      "## Context",
      context.trim() || "_Describe the forces at play (problem, constraints, stakeholders)._",
      "",
      "## Decision",
      decision.trim() || "_State the decision clearly in the present tense._",
      "",
      "## Consequences",
      consequences.trim() || "_Positive, negative, and neutral outcomes._",
      "",
      "## Alternatives considered",
      alternatives.trim() || "_What else was evaluated and why it was rejected._",
      "",
      `---`,
      `_Last updated: ${new Date().toISOString()}_`,
    ].join("\n");
    setOut(body);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600">
            <BookOpenIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ADR writer</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Architecture Decision Record template you can drop into your repo.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adr-num">ADR number</Label>
              <input
                id="adr-num"
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm font-mono"
                value={num}
                onChange={(e) => setNum(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adr-status">Status</Label>
              <input
                id="adr-status"
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm"
                value={statusAdr}
                onChange={(e) => setStatusAdr(e.target.value)}
                placeholder="Proposed / Accepted / Deprecated"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="adr-title">Title</Label>
            <input
              id="adr-title"
              className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short imperative title"
            />
          </div>
          {(
            [
              ["ctx", "Context", context, setContext],
              ["dec", "Decision", decision, setDecision],
              ["cons", "Consequences", consequences, setConsequences],
              ["alt", "Alternatives considered", alternatives, setAlternatives],
            ] as const
          ).map(([id, lab, val, set]) => (
            <div key={id} className="space-y-2">
              <Label htmlFor={id}>{lab}</Label>
              <textarea id={id} className={ta} value={val} onChange={(e) => set(e.target.value)} />
            </div>
          ))}

          <Button type="button" onClick={submit} className="gap-2">
            <BookOpenIcon className="size-4" />
            Generate ADR
          </Button>

          {out && (
            <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Label>Markdown</Label>
              <pre className="rounded-xl bg-slate-900 text-slate-100 p-4 text-xs overflow-auto max-h-[min(420px,55vh)] font-mono whitespace-pre-wrap">
                {out}
              </pre>
              <Button type="button" variant="outline" onClick={() => navigator.clipboard.writeText(out)}>
                Copy markdown
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
