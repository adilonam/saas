"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShareIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

export default function OpenGraphPreviewPage() {
  const { ensureAccess } = useToolAccess();
  const [ogTitle, setOgTitle] = useState("");
  const [ogDescription, setOgDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [ogUrl, setOgUrl] = useState("");
  const [siteName, setSiteName] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const handlePreview = () => {
    if (!ensureAccess()) return;
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
            <ShareIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Open Graph Preview</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Preview how a link card might look when shared (title, description, image)
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="og-title">og:title</Label>
            <Input
              id="og-title"
              value={ogTitle}
              onChange={(e) => setOgTitle(e.target.value)}
              placeholder="Article or page title"
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="og-desc">og:description</Label>
            <textarea
              id="og-desc"
              value={ogDescription}
              onChange={(e) => setOgDescription(e.target.value)}
              placeholder="Summary shown under the title"
              className="w-full min-h-[88px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="og-image">og:image URL</Label>
            <Input
              id="og-image"
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
              placeholder="https://.../image.jpg"
              className="rounded-xl h-11 font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="og-url">og:url (optional)</Label>
            <Input
              id="og-url"
              value={ogUrl}
              onChange={(e) => setOgUrl(e.target.value)}
              placeholder="https://..."
              className="rounded-xl h-11 font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="og-site">og:site_name (optional)</Label>
            <Input
              id="og-site"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Your site name"
              className="rounded-xl h-11"
            />
          </div>

          <Button onClick={handlePreview} className="gap-2">
            <ShareIcon className="size-4" />
            Preview link card
          </Button>

          {unlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Approximate social share card
              </p>
              <div className="max-w-md rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden bg-[#f0f2f5] dark:bg-slate-800 shadow-md">
                <div className="aspect-[1.91/1] bg-slate-200 dark:bg-slate-700 relative">
                  {ogImage.trim() ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ogImage.trim()}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : null}
                  {!ogImage.trim() && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                      No image URL
                    </div>
                  )}
                </div>
                <div className="p-3 text-left bg-[#e4e6eb] dark:bg-slate-900/80">
                  {siteName.trim() && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      {siteName.trim()}
                    </p>
                  )}
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {ogUrl.trim().replace(/^https?:\/\//, "") || "domain.com"}
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white text-[17px] leading-snug line-clamp-2 mt-1">
                    {ogTitle.trim() || "(og:title)"}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                    {ogDescription.trim() || "(og:description)"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
