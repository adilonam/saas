"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CodeBracketSquareIcon } from "@heroicons/react/24/outline";
import { guardToolAccess } from "@/lib/guard-tool-access";

const VERBS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

const ta =
  "w-full min-h-[140px] rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export default function ApiDesignSketchPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [resources, setResources] = useState("/users\n/users/{id}\n/orders");
  const [verbs, setVerbs] = useState<Record<string, boolean>>({
    GET: true,
    POST: true,
    PUT: true,
    PATCH: true,
    DELETE: true,
  });
  const [errorModel, setErrorModel] = useState(
    "JSON problem object: { \"type\", \"title\", \"status\", \"detail\", \"instance\" }",
  );
  const [auth, setAuth] = useState("Bearer JWT in Authorization header");
  const [pagination, setPagination] = useState("cursor: ?cursor=&limit=");
  const [out, setOut] = useState("");

  const submit = () => {
    if (!guardToolAccess(status, session, pathname, "/api-design-sketch", router)) return;
    const enabled = VERBS.filter((v) => verbs[v]);
    const paths = resources
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const doc = [
      "# API design sketch",
      "",
      "## Resources (paths)",
      paths.length ? paths.map((p) => `- \`${p}\``).join("\n") : "- _(add paths)_",
      "",
      "## Verbs in scope",
      enabled.join(", ") || "—",
      "",
      "## Authentication",
      auth.trim() || "—",
      "",
      "## Pagination / filtering",
      pagination.trim() || "—",
      "",
      "## Error model",
      errorModel.trim() || "—",
      "",
      "## Notes",
      "- Idempotency: specify for `PUT`/`DELETE` and safe retries.",
      "- Versioning: URL prefix vs header — pick one per surface.",
      "",
      `_Sketch generated ${new Date().toISOString()}_`,
    ].join("\n");
    setOut(doc);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600">
            <CodeBracketSquareIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">API design sketch</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Outline resources, HTTP verbs, and a shared error envelope before you OpenAPI.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="res">Resources (one path per line)</Label>
            <textarea
              id="res"
              className={ta}
              value={resources}
              onChange={(e) => setResources(e.target.value)}
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Verbs</legend>
            <div className="flex flex-wrap gap-4 text-sm">
              {VERBS.map((v) => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verbs[v]}
                    onChange={() => setVerbs((prev) => ({ ...prev, [v]: !prev[v] }))}
                  />
                  {v}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="auth">Authentication</Label>
            <textarea id="auth" className={ta} value={auth} onChange={(e) => setAuth(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="page">Pagination / filters</Label>
            <textarea
              id="page"
              className={ta}
              value={pagination}
              onChange={(e) => setPagination(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="err">Error model</Label>
            <textarea id="err" className={ta} value={errorModel} onChange={(e) => setErrorModel(e.target.value)} />
          </div>

          <Button type="button" onClick={submit} className="gap-2">
            <CodeBracketSquareIcon className="size-4" />
            Build sketch
          </Button>

          {out && (
            <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Label>Markdown</Label>
              <pre className="rounded-xl bg-slate-900 text-slate-100 p-4 text-xs overflow-auto max-h-[min(400px,50vh)] font-mono whitespace-pre-wrap">
                {out}
              </pre>
              <Button type="button" variant="outline" onClick={() => navigator.clipboard.writeText(out)}>
                Copy markdown
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
