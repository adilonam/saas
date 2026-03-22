"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

const TITLE_SOFT = 60;
const DESC_SOFT = 155;

export default function MetaTagPreviewPage() {
  const { ensureAccess } = useToolAccess();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("https://example.com/page");
  const [unlocked, setUnlocked] = useState(false);

  const handlePreview = () => {
    if (!ensureAccess()) return;
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
            <EyeIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Meta Tag Preview</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              See how your title and description may look in Google search results
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="meta-title">Title</Label>
            <Input
              id="meta-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Page title"
              className="rounded-xl h-11"
            />
            <p className="text-xs text-slate-500">
              {title.length} characters
              {title.length > TITLE_SOFT ? (
                <span className="text-amber-600 dark:text-amber-400">
                  {" "}
                  — often truncated around {TITLE_SOFT} characters
                </span>
              ) : null}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="meta-desc">Meta description</Label>
            <textarea
              id="meta-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short summary for search results"
              className="w-full min-h-[100px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm"
            />
            <p className="text-xs text-slate-500">
              {description.length} characters
              {description.length > DESC_SOFT ? (
                <span className="text-amber-600 dark:text-amber-400">
                  {" "}
                  — may be shortened around {DESC_SOFT} characters
                </span>
              ) : null}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="meta-url">Display URL (for preview)</Label>
            <Input
              id="meta-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="rounded-xl h-11 font-mono text-sm"
            />
          </div>

          <Button onClick={handlePreview} className="gap-2">
            <EyeIcon className="size-4" />
            Preview in search snippet
          </Button>

          {unlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Approximate Google-style snippet
              </p>
              <div className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-950 p-4 max-w-[600px] shadow-sm">
                <p className="text-sm text-emerald-700 dark:text-emerald-400 truncate">
                  {url.replace(/^https?:\/\//, "") || "example.com"}
                </p>
                <h2 className="text-xl text-[#1a0dab] dark:text-[#8ab4f8] font-normal mt-1 line-clamp-2">
                  {title.trim() || "(no title)"}
                </h2>
                <p className="text-sm text-[#4d5156] dark:text-slate-400 mt-1 line-clamp-3">
                  {description.trim() || "(no description)"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
