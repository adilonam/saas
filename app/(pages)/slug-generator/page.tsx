"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LinkIcon } from "@heroicons/react/24/outline";
import { slugify } from "@/lib/seo-tools";
import { useToolAccess } from "@/lib/use-tool-access";

export default function SlugGeneratorPage() {
  const { ensureAccess } = useToolAccess();
  const [source, setSource] = useState("");
  const [slug, setSlug] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!ensureAccess()) return;
    if (!source.trim()) return;
    setSlug(slugify(source));
    setUnlocked(true);
  };

  const copySlug = async () => {
    if (!slug) return;
    await navigator.clipboard.writeText(slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
            <LinkIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Slug Generator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Turn a title or phrase into a URL-friendly slug
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="slug-source">Title or text</Label>
            <textarea
              id="slug-source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="My Amazing Blog Post Title!"
              className="w-full min-h-[100px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm"
            />
          </div>

          <Button onClick={handleGenerate} className="gap-2">
            <LinkIcon className="size-4" />
            Generate slug
          </Button>

          {unlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
              <Label>Slug</Label>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  readOnly
                  value={slug}
                  className="rounded-xl h-11 font-mono text-sm flex-1"
                />
                <Button type="button" variant="outline" onClick={copySlug} disabled={!slug}>
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              {!slug && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  No slug produced — try text with letters or numbers.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
