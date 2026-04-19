"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowsRightLeftIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

const LANGS = ["TypeScript", "JavaScript", "Python", "Go", "Rust", "Java", "Ruby", "PHP", "C#"];

export default function VariableRenamerPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [language, setLanguage] = useState("TypeScript");
  const [name, setName] = useState("data2");
  const [context, setContext] = useState("Holds the paginated list of invoices for the table.");
  const [suggestions, setSuggestions] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ensureAuth = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/variable-renamer")}`);
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

  const handleSuggest = async () => {
    if (!ensureAuth()) return;
    const n = name.trim();
    if (!n) {
      setError("Enter an identifier.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/variable-renamer-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n, language, context: context.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Request failed");
        return;
      }
      setSuggestions(String(data.text || ""));
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600">
            <ArrowsRightLeftIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Variable renamer suggestions</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Optional AI proposes names that fit your language and optional context.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
              >
                {LANGS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Identifier</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="font-mono text-sm" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Context (optional)</label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full min-h-[100px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm"
              placeholder="Snippet or plain-language description of what it represents…"
            />
          </div>
          <Button type="button" onClick={handleSuggest} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <SparklesIcon className="size-4" />}
            Suggest names (AI)
          </Button>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          {suggestions && (
            <div>
              <div className="flex justify-end mb-2">
                <Button type="button" variant="outline" size="sm" onClick={() => void navigator.clipboard.writeText(suggestions)}>
                  Copy
                </Button>
              </div>
              <pre className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 font-mono text-sm whitespace-pre-wrap">
                {suggestions}
              </pre>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
