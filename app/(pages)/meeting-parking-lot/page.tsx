"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ClipboardDocumentListIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

type Item = { id: string; text: string };

export default function MeetingParkingLotPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [draft, setDraft] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [unlocked, setUnlocked] = useState(false);

  const gate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/meeting-parking-lot")}`);
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

  const add = () => {
    if (!gate()) return;
    const t = draft.trim();
    if (!t) return;
    setItems((list) => [...list, { id: crypto.randomUUID(), text: t }]);
    setDraft("");
    setUnlocked(true);
  };

  const remove = (id: string) => setItems((list) => list.filter((x) => x.id !== id));

  const exportText = items.map((x, i) => `${i + 1}. ${x.text}`).join("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
    } catch {
      /* ignore */
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600">
            <ClipboardDocumentListIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Meeting parking lot</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Capture off-topic items to revisit later
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap gap-2">
            <div className="flex-1 min-w-[200px] space-y-2">
              <Label htmlFor="mpl-new">Add item</Label>
              <Input
                id="mpl-new"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
                placeholder="Topic to park…"
                className="rounded-xl h-11"
              />
            </div>
            <Button type="button" className="mt-7 gap-1" onClick={add}>
              <PlusIcon className="size-4" />
              Add
            </Button>
          </div>

          {unlocked && items.length > 0 && (
            <ul className="space-y-2">
              {items.map((row) => (
                <li
                  key={row.id}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 px-4 py-3"
                >
                  <span className="flex-1 text-sm text-slate-800 dark:text-slate-100">{row.text}</span>
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(row.id)} aria-label="Remove">
                    <TrashIcon className="size-5 text-slate-400" />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          {unlocked && items.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Export</p>
              <pre className="text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 p-4 whitespace-pre-wrap">
                {exportText}
              </pre>
              <Button type="button" variant="outline" size="sm" onClick={copy}>
                Copy list
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
