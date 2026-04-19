"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClipboardDocumentListIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useSubscribedToolAccess } from "@/hooks/useSubscribedToolAccess";

const STORAGE_KEY = "eprod:job-application-tracker";

export type AppRow = {
  id: string;
  company: string;
  role: string;
  stage: string;
  applied: string;
  contact: string;
  notes: string;
};

function newRow(): AppRow {
  return {
    id: crypto.randomUUID(),
    company: "",
    role: "",
    stage: "Applied",
    applied: "",
    contact: "",
    notes: "",
  };
}

function loadRows(): AppRow[] {
  if (typeof window === "undefined") return [newRow()];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [newRow()];
    const p = JSON.parse(raw) as AppRow[];
    return Array.isArray(p) && p.length ? p : [newRow()];
  } catch {
    return [newRow()];
  }
}

const STAGES = ["Wishlist", "Applied", "Recruiter screen", "Interview", "Offer", "Rejected", "Withdrawn"];

export default function JobApplicationTrackerPage() {
  const { assertAccess } = useSubscribedToolAccess("/job-application-tracker");
  const [unlocked, setUnlocked] = useState(false);
  const [rows, setRows] = useState<AppRow[]>([newRow()]);

  const writeStorage = (next: AppRow[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const handleOpen = () => {
    if (!assertAccess()) return;
    setRows(loadRows());
    setUnlocked(true);
  };

  const handleSave = () => {
    if (!assertAccess()) return;
    writeStorage(rows);
  };

  const exportCsv = () => {
    if (!assertAccess()) return;
    const header = ["company", "role", "stage", "applied", "contact", "notes"];
    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [r.company, r.role, r.stage, r.applied, r.contact, r.notes]
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "job-applications.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const update = (id: string, field: keyof AppRow, value: string) => {
    setRows((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, [field]: value } : r));
      writeStorage(next);
      return next;
    });
  };

  const add = () => {
    setRows((prev) => {
      const next = [...prev, newRow()];
      writeStorage(next);
      return next;
    });
  };

  const remove = (id: string) => {
    setRows((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((r) => r.id !== id);
      writeStorage(next);
      return next;
    });
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Job application tracker</h1>
          <p className="mt-1 text-muted-foreground">
            Stages, dates, and contacts — stored in your browser. Export CSV anytime.
          </p>
        </div>

        {!unlocked ? (
          <Button type="button" onClick={handleOpen} className="gap-2">
            <ClipboardDocumentListIcon className="h-4 w-4" />
            Open tracker
          </Button>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={add} className="gap-2">
                <PlusIcon className="h-4 w-4" />
                Add row
              </Button>
              <Button type="button" onClick={handleSave}>
                Save to browser
              </Button>
              <Button type="button" variant="outline" onClick={exportCsv}>
                Export CSV
              </Button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-input">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-input bg-muted/40 text-left">
                    <th className="p-2 font-medium w-36">Company</th>
                    <th className="p-2 font-medium w-36">Role</th>
                    <th className="p-2 font-medium w-32">Stage</th>
                    <th className="p-2 font-medium w-28">Applied</th>
                    <th className="p-2 font-medium w-36">Contact</th>
                    <th className="p-2 font-medium min-w-[140px]">Notes</th>
                    <th className="p-2 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-input/80 align-top">
                      <td className="p-1">
                        <Input
                          className="h-8 text-xs"
                          value={r.company}
                          onChange={(e) => update(r.id, "company", e.target.value)}
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          className="h-8 text-xs"
                          value={r.role}
                          onChange={(e) => update(r.id, "role", e.target.value)}
                        />
                      </td>
                      <td className="p-1">
                        <select
                          className="h-8 w-full rounded-md border border-input bg-background px-1 text-xs"
                          value={r.stage}
                          onChange={(e) => update(r.id, "stage", e.target.value)}
                        >
                          {STAGES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-1">
                        <Input
                          type="date"
                          className="h-8 text-xs"
                          value={r.applied}
                          onChange={(e) => update(r.id, "applied", e.target.value)}
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          className="h-8 text-xs"
                          value={r.contact}
                          onChange={(e) => update(r.id, "contact", e.target.value)}
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          className="h-8 text-xs"
                          value={r.notes}
                          onChange={(e) => update(r.id, "notes", e.target.value)}
                        />
                      </td>
                      <td className="p-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => remove(r.id)}
                          aria-label="Remove row"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">
              Tip: use YYYY-MM-DD in Applied for sorting in spreadsheets.
            </p>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
