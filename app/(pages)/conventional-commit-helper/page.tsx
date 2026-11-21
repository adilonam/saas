"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { CONVENTIONAL_TYPES } from "@/lib/conventional-commits";

export default function ConventionalCommitHelperPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [type, setType] = useState<string>("feat");
  const [scope, setScope] = useState("");
  const [breaking, setBreaking] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [footer, setFooter] = useState("");

  const message = useMemo(() => {
    const sc = scope.trim() ? `(${scope.trim()})` : "";
    const bang = breaking ? "!" : "";
    const sub = subject.trim();
    if (!sub) return "";
    const head = `${type}${sc}${bang}: ${sub}`;
    const parts = [head];
    const b = body.trim();
    if (b) parts.push("", b);
    const f = footer.trim();
    if (f) parts.push("", f);
    return parts.join("\n");
  }, [type, scope, breaking, subject, body, footer]);

  const ensureAuth = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/conventional-commit-helper")}`);
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

  const handleCopy = () => {
    if (!ensureAuth() || !message) return;
    void navigator.clipboard.writeText(message);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600">
            <ClipboardDocumentIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Conventional commit helper</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Type, scope, breaking change, body, and footers — formatted for Conventional Commits.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
              >
                {CONVENTIONAL_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Scope (optional)</label>
              <Input value={scope} onChange={(e) => setScope(e.target.value)} placeholder="api, auth, docs…" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" checked={breaking} onChange={(e) => setBreaking(e.target.checked)} className="rounded" />
            Breaking change (!)
          </label>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Subject</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="short imperative description (max ~72 chars)"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Body (optional)</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full min-h-[100px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 font-mono text-sm"
              placeholder="Explain motivation, contrast with previous behavior…"
              spellCheck
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Footer (optional)</label>
            <textarea
              value={footer}
              onChange={(e) => setFooter(e.target.value)}
              className="w-full min-h-[72px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 font-mono text-sm"
              placeholder={"BREAKING CHANGE: ...\nCloses #123"}
              spellCheck={false}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={handleCopy} disabled={!message} className="gap-2">
              <ClipboardDocumentIcon className="size-4" />
              Copy message
            </Button>
          </div>
          {message && (
            <pre className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 font-mono text-sm whitespace-pre-wrap">
              {message}
            </pre>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
