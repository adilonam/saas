"use client";

import { useRef, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { IdentificationIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

export default function NameTagPrintPage() {
  const { ensureAccess } = useToolAccess();
  const [org, setOrg] = useState("");
  const [names, setNames] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const lines = names
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const openPrint = () => {
    const el = printRef.current;
    if (!el) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(
      `<!DOCTYPE html><html><head><title>Name tags</title><style>
        @page { margin: 12mm; }
        body { font-family: system-ui, sans-serif; margin: 0; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10mm; }
        .card {
          border: 1px solid #ccc;
          border-radius: 8px;
          padding: 10mm 8mm;
          min-height: 42mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          page-break-inside: avoid;
        }
        .org { font-size: 11pt; color: #555; margin-bottom: 4mm; }
        .name { font-size: 22pt; font-weight: 700; line-height: 1.1; }
      </style></head><body>${el.innerHTML}</body></html>`,
    );
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  const run = () => {
    if (!ensureAccess()) return;
    if (lines.length === 0) return;
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-pink-100 text-pink-600 dark:bg-pink-900/30">
            <IdentificationIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Name tag print layout</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Simple two-column cards for table tents or badges — preview here, then print.
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-input bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="org">Organization / event (optional)</Label>
            <input
              id="org"
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              placeholder="Design Systems Summit"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="names">Names (one per line)</Label>
            <textarea
              id="names"
              value={names}
              onChange={(e) => setNames(e.target.value)}
              className="min-h-[180px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder={"Taylor Kim\nRiley Patel\n…"}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={run}>
              Build preview
            </Button>
            {unlocked && lines.length > 0 && (
              <Button type="button" variant="secondary" onClick={openPrint}>
                Open print view
              </Button>
            )}
          </div>
        </div>

        {unlocked && lines.length > 0 && (
          <div ref={printRef} className="rounded-xl border border-dashed border-input bg-card p-6 print:border-0">
            <p className="mb-4 text-xs text-muted-foreground print:hidden">
              Screen preview — use &quot;Open print view&quot; for a clean print layout.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {lines.map((name, idx) => (
                <div
                  key={`${idx}-${name}`}
                  className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-border bg-muted/40 p-6 text-center print:min-h-[42mm]"
                >
                  {org.trim() && <p className="text-xs font-medium text-muted-foreground">{org.trim()}</p>}
                  <p className="mt-1 text-2xl font-bold text-foreground">{name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
