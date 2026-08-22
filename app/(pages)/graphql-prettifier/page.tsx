"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ShareIcon } from "@heroicons/react/24/outline";
import { guardToolAccess } from "@/lib/guard-tool-access";
import { heuristicGraphqlComplexity, prettifyGraphQL } from "@/lib/dev-tools/graphql-prettify";

const ta =
  "w-full min-h-[200px] rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export default function GraphqlPrettifierPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [raw, setRaw] = useState("");
  const [pretty, setPretty] = useState("");
  const [hintBlock, setHintBlock] = useState("");

  const submit = () => {
    if (!guardToolAccess(status, session, pathname, "/graphql-prettifier", router)) return;
    const p = prettifyGraphQL(raw);
    setPretty(p);
    const { selectionLike, maxDepth, hint } = heuristicGraphqlComplexity(raw);
    setHintBlock(
      [
        `Heuristic selection-like tokens: **${selectionLike}**`,
        `Max brace depth: **${maxDepth}**`,
        "",
        hint,
        "",
        "_Educational only — not a substitute for server-side complexity limits._",
      ].join("\n"),
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-fuchsia-100 dark:bg-fuchsia-900/30 flex items-center justify-center text-fuchsia-600">
            <ShareIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">GraphQL prettifier</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Best-effort formatting plus shallow complexity hints for pasted queries.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="gql">GraphQL</Label>
            <textarea id="gql" className={ta} value={raw} onChange={(e) => setRaw(e.target.value)} />
          </div>

          <Button type="button" onClick={submit} disabled={!raw.trim()} className="gap-2">
            <ShareIcon className="size-4" />
            Prettify + hints
          </Button>

          {pretty && (
            <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Label>Prettified</Label>
              <pre className="rounded-xl bg-slate-900 text-slate-100 p-4 text-xs overflow-auto max-h-[min(360px,45vh)] font-mono whitespace-pre-wrap">
                {pretty}
              </pre>
            </div>
          )}

          {hintBlock && (
            <div className="space-y-2">
              <Label>Complexity hints</Label>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-background p-4 text-sm whitespace-pre-wrap">
                {hintBlock}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
