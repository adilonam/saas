"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import {
  parseConventionalBlock,
  groupCommitsForChangelog,
  formatChangelogMarkdown,
} from "@/lib/conventional-commits";

export default function ChangelogFromCommitsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [input, setInput] = useState(
    "feat(auth): add OAuth login\nfix: handle null profile\nfeat(dashboard): export CSV\ndocs: update README",
  );
  const [version, setVersion] = useState("Unreleased");
  const [date, setDate] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [parsedCount, setParsedCount] = useState<number | null>(null);

  const ensureAuth = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/changelog-from-commits")}`);
      return false;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return false;
    }
    return true;
  };

  const handleGenerate = () => {
    if (!ensureAuth()) return;
    setError(null);
    const commits = parseConventionalBlock(input);
    if (commits.length === 0) {
      setError("No conventional commit lines found. Use format: type(scope): subject");
      setOutput("");
      setParsedCount(0);
      return;
    }
    setParsedCount(commits.length);
    const groups = groupCommitsForChangelog(commits);
    setOutput(
      formatChangelogMarkdown(groups, {
        version: version.trim() || "Unreleased",
        date: date.trim() || undefined,
      }),
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600">
            <DocumentTextIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Changelog from commits</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Paste one commit header per line; output is grouped by type for CHANGELOG.md.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Version title</label>
              <Input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="1.2.0 or Unreleased" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Date (optional)</label>
              <Input value={date} onChange={(e) => setDate(e.target.value)} placeholder="2026-04-19" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Commit lines</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full min-h-[200px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 font-mono text-sm"
              spellCheck={false}
            />
          </div>
          <Button type="button" onClick={handleGenerate}>
            Generate changelog
          </Button>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          {parsedCount !== null && !error && (
            <p className="text-sm text-slate-500">Parsed {parsedCount} conventional commit(s).</p>
          )}
          {output && (
            <div>
              <div className="flex justify-end mb-2">
                <Button type="button" variant="outline" size="sm" onClick={() => void navigator.clipboard.writeText(output)}>
                  Copy
                </Button>
              </div>
              <pre className="w-full min-h-[160px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 font-mono text-sm whitespace-pre-wrap">
                {output}
              </pre>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
