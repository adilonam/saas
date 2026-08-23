"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TableCellsIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { guardToolAccess } from "@/lib/guard-tool-access";
import { jsonSchemaToFormMockup } from "@/lib/dev-tools/json-schema-form";

const ta =
  "w-full min-h-[220px] rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export default function JsonSchemaFormMockupPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [raw, setRaw] = useState("");
  const [out, setOut] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!guardToolAccess(status, session, pathname, "/json-schema-form-mockup", router)) return;
    setError(null);
    try {
      const schema = JSON.parse(raw.trim());
      setOut(jsonSchemaToFormMockup(schema));
    } catch {
      setOut("");
      setError("Invalid JSON. Paste a single JSON Schema object.");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-700 dark:text-cyan-400">
            <TableCellsIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">JSON Schema → form mockup</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Turn a schema into a plain-language description of fields and controls.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="schema">JSON Schema</Label>
            <textarea
              id="schema"
              className={ta}
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder='{ "type": "object", "properties": { ... }, "required": [] }'
            />
          </div>

          <Button type="button" onClick={submit} disabled={!raw.trim()} className="gap-2">
            <TableCellsIcon className="size-4" />
            Describe form
          </Button>

          {error && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
              <ExclamationTriangleIcon className="size-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {out && (
            <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Label>Mockup description</Label>
              <pre className="rounded-xl bg-slate-900 text-slate-100 p-4 text-xs overflow-auto max-h-[min(420px,55vh)] font-mono whitespace-pre-wrap">
                {out}
              </pre>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
