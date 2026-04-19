"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ClipboardDocumentListIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { guardToolAccess } from "@/lib/guard-tool-access";

type Step = { id: string; text: string; done: boolean; completedAt: string | null };

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ?
      crypto.randomUUID()
    : String(Date.now()) + Math.random().toString(16).slice(2);
}

export default function RunbookChecklistRunnerPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [steps, setSteps] = useState<Step[]>([
    { id: newId(), text: "Verify alert and scope", done: false, completedAt: null },
    { id: newId(), text: "Check dashboards / logs", done: false, completedAt: null },
    { id: newId(), text: "Mitigate or escalate", done: false, completedAt: null },
  ]);
  const [draft, setDraft] = useState("");
  const [logText, setLogText] = useState("");

  const tickStep = useCallback((id: string) => {
    if (!guardToolAccess(status, session, pathname, "/runbook-checklist-runner", router)) return;
    const now = new Date().toISOString();
    setSteps((prev) =>
      prev.map((s) =>
        s.id === id ?
          {
            ...s,
            done: !s.done,
            completedAt: !s.done ? now : null,
          }
        : s,
      ),
    );
  }, [pathname, router, session, status]);

  const addStep = () => {
    if (!guardToolAccess(status, session, pathname, "/runbook-checklist-runner", router)) return;
    const t = draft.trim();
    if (!t) return;
    setSteps((prev) => [...prev, { id: newId(), text: t, done: false, completedAt: null }]);
    setDraft("");
  };

  const removeStep = (id: string) => {
    if (!guardToolAccess(status, session, pathname, "/runbook-checklist-runner", router)) return;
    setSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const buildLog = () => {
    if (!guardToolAccess(status, session, pathname, "/runbook-checklist-runner", router)) return;
    const lines = steps.map((s, i) => {
      const mark = s.done ? "[x]" : "[ ]";
      const ts = s.completedAt ? ` @ ${s.completedAt}` : "";
      return `${mark} ${i + 1}. ${s.text}${ts}`;
    });
    setLogText([`Runbook log — ${new Date().toISOString()}`, "", ...lines].join("\n"));
  };

  const copyLog = async () => {
    if (!logText.trim()) return;
    await navigator.clipboard.writeText(logText);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
            <ClipboardDocumentListIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Runbook checklist runner</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Tick steps with UTC timestamps and export a short log.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <ul className="space-y-3">
            {steps.map((s, i) => (
              <li
                key={s.id}
                className="flex flex-wrap items-start gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-background p-4"
              >
                <label className="flex items-start gap-3 cursor-pointer flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={s.done}
                    onChange={() => tickStep(s.id)}
                    className="mt-1 size-4 rounded border-input"
                  />
                  <span className="text-sm">
                    <span className="font-mono text-slate-400 mr-2">{i + 1}.</span>
                    {s.text}
                    {s.completedAt && (
                      <span className="block text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                        Done: {s.completedAt}
                      </span>
                    )}
                  </span>
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-slate-500"
                  onClick={() => removeStep(s.id)}
                  aria-label="Remove step"
                >
                  <TrashIcon className="size-5" />
                </Button>
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
            <div className="space-y-2 flex-1">
              <Label htmlFor="new-step">Add step</Label>
              <Input
                id="new-step"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Describe the next checklist item…"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addStep())}
              />
            </div>
            <Button type="button" onClick={addStep} className="gap-2 shrink-0">
              <PlusIcon className="size-4" />
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={buildLog} className="gap-2">
              <ClipboardDocumentListIcon className="size-4" />
              Build log
            </Button>
            <Button type="button" variant="outline" onClick={copyLog} disabled={!logText.trim()}>
              Copy log
            </Button>
          </div>

          {logText && (
            <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Label>Exported log</Label>
              <pre className="rounded-xl bg-slate-900 text-slate-100 p-4 text-xs overflow-auto max-h-[min(320px,45vh)] font-mono whitespace-pre-wrap">
                {logText}
              </pre>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
