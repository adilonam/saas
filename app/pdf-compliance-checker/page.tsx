"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { guardToolAccess } from "@/lib/guard-tool-access";

type CheckItem = { rule: string; passed: boolean; details: string };

export default function PdfComplianceCheckerPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [checks, setChecks] = useState<CheckItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runChecks = (pageCount: number, metadata: Record<string, string | null>) => {
    const list: CheckItem[] = [
      {
        rule: "Has title metadata",
        passed: Boolean(metadata.Title),
        details: metadata.Title ? `Title: ${metadata.Title}` : "Title is missing",
      },
      {
        rule: "Has author metadata",
        passed: Boolean(metadata.Author),
        details: metadata.Author ? `Author: ${metadata.Author}` : "Author is missing",
      },
      {
        rule: "Has producer metadata",
        passed: Boolean(metadata.Producer),
        details: metadata.Producer ? `Producer: ${metadata.Producer}` : "Producer is missing",
      },
      {
        rule: "Page count limit (<= 200)",
        passed: pageCount <= 200,
        details: `Detected pages: ${pageCount}`,
      },
    ];
    setChecks(list);
  };

  const handleCheck = async () => {
    if (!guardToolAccess(status, session, pathname, "/pdf-compliance-checker", router)) return;
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setChecks([]);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/pdf-metadata", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to read metadata.");
        return;
      }
      runChecks(Number(data.page_count || 0), (data.metadata || {}) as Record<string, string | null>);
    } catch (e) {
      console.error(e);
      setError("Compliance check failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">PDF Compliance Checker</h1>
          <p className="mt-1 text-muted-foreground">
            Validate basic PDF metadata and policy checks before sharing.
          </p>
        </div>

        <div className="rounded-xl border border-input bg-card p-6 space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <Button variant="outline" className="gap-2" onClick={() => inputRef.current?.click()}>
            <ArrowUpTrayIcon className="h-4 w-4" />
            Select PDF
          </Button>
          {file && <p className="text-sm text-muted-foreground">{file.name}</p>}
          <Button onClick={handleCheck} disabled={!file || isLoading} className="gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Run compliance checks
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {checks.length > 0 && (
          <div className="space-y-3">
            {checks.map((check) => (
              <div key={check.rule} className="rounded-xl border border-input bg-card p-4">
                <p className="font-medium">{check.rule}</p>
                <p className={`text-sm mt-1 ${check.passed ? "text-emerald-600" : "text-amber-600"}`}>
                  {check.passed ? "Passed" : "Needs attention"} - {check.details}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
