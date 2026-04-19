"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BellAlertIcon } from "@heroicons/react/24/outline";
import { guardToolAccess } from "@/lib/guard-tool-access";

export default function OnCallHandoffPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [service, setService] = useState("");
  const [shiftWindow, setShiftWindow] = useState("");
  const [severity, setSeverity] = useState("");
  const [openIncidents, setOpenIncidents] = useState("");
  const [changes, setChanges] = useState("");
  const [knownIssues, setKnownIssues] = useState("");
  const [alerts, setAlerts] = useState("");
  const [links, setLinks] = useState("");
  const [notes, setNotes] = useState("");
  const [out, setOut] = useState("");

  const submit = () => {
    if (!guardToolAccess(status, session, pathname, "/on-call-handoff", router)) return;
    const blocks = [
      "# On-call handoff",
      "",
      `**Service / scope:** ${service.trim() || "—"}`,
      `**Shift window (UTC):** ${shiftWindow.trim() || "—"}`,
      `**Highest active severity:** ${severity.trim() || "—"}`,
      "",
      "## Open incidents",
      openIncidents.trim() || "—",
      "",
      "## Deploys / changes this window",
      changes.trim() || "—",
      "",
      "## Known issues / flaky areas",
      knownIssues.trim() || "—",
      "",
      "## Alerts tuned / noisy",
      alerts.trim() || "—",
      "",
      "## Links (runbooks, dashboards)",
      links.trim() || "—",
      "",
      "## Free-form notes for next shift",
      notes.trim() || "—",
      "",
      `_Generated ${new Date().toISOString()}_`,
    ];
    setOut(blocks.join("\n"));
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-700 dark:text-amber-400">
            <BellAlertIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">On-call handoff notes</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Fill the template and copy structured markdown for the next engineer.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-4">
          {(
            [
              ["service", "Service / scope", service, setService],
              ["shift", "Shift window (UTC)", shiftWindow, setShiftWindow],
              ["sev", "Highest active severity", severity, setSeverity],
            ] as const
          ).map(([id, lab, val, set]) => (
            <div key={id} className="space-y-2">
              <Label htmlFor={id}>{lab}</Label>
              <textarea
                id={id}
                className="w-full min-h-[72px] rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={val}
                onChange={(e) => set(e.target.value)}
              />
            </div>
          ))}
          {(
            [
              ["inc", "Open incidents", openIncidents, setOpenIncidents],
              ["chg", "Deploys / changes", changes, setChanges],
              ["iss", "Known issues", knownIssues, setKnownIssues],
              ["al", "Alerts", alerts, setAlerts],
              ["ln", "Links", links, setLinks],
              ["no", "Notes for next shift", notes, setNotes],
            ] as const
          ).map(([id, lab, val, set]) => (
            <div key={id} className="space-y-2">
              <Label htmlFor={id}>{lab}</Label>
              <textarea
                id={id}
                className="w-full min-h-[100px] rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={val}
                onChange={(e) => set(e.target.value)}
              />
            </div>
          ))}

          <Button type="button" onClick={submit} className="gap-2">
            <BellAlertIcon className="size-4" />
            Build handoff
          </Button>

          {out && (
            <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Label>Markdown</Label>
              <pre className="rounded-xl bg-slate-900 text-slate-100 p-4 text-xs overflow-auto max-h-[min(400px,50vh)] font-mono whitespace-pre-wrap">
                {out}
              </pre>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigator.clipboard.writeText(out)}
              >
                Copy markdown
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
