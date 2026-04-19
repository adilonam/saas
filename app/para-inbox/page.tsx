"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useSubscribedToolAccess } from "@/hooks/useSubscribedToolAccess";

const STORAGE_KEY = "eprod:para-inbox";

type Bucket = "projects" | "areas" | "resources" | "archive";

type Item = { id: string; text: string; bucket: Bucket };

const BUCKETS: { id: Bucket; title: string; hint: string }[] = [
  { id: "projects", title: "Projects", hint: "Defined outcomes with deadlines" },
  { id: "areas", title: "Areas", hint: "Ongoing standards to maintain" },
  { id: "resources", title: "Resources", hint: "Reference material for later" },
  { id: "archive", title: "Archive", hint: "Inactive but kept" },
];

function loadItems(): Item[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw) as Item[];
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

function saveItems(items: Item[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 300)));
}

export default function ParaInboxPage() {
  const { assertAccess } = useSubscribedToolAccess("/para-inbox");
  const [unlocked, setUnlocked] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [draft, setDraft] = useState("");
  const [draftBucket, setDraftBucket] = useState<Bucket>("projects");

  useEffect(() => {
    if (unlocked) setItems(loadItems());
  }, [unlocked]);

  const persist = (next: Item[]) => {
    setItems(next);
    saveItems(next);
  };

  const handleOpen = () => {
    if (!assertAccess()) return;
    setUnlocked(true);
  };

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    persist([...items, { id: crypto.randomUUID(), text, bucket: draftBucket }]);
    setDraft("");
  };

  const move = (id: string, bucket: Bucket) => {
    persist(items.map((it) => (it.id === id ? { ...it, bucket } : it)));
  };

  const remove = (id: string) => {
    persist(items.filter((it) => it.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">PARA inbox</h1>
          <p className="mt-1 text-muted-foreground">
            Capture into Projects, Areas, Resources, or Archive. Local only.
          </p>
        </div>

        {!unlocked ? (
          <div className="rounded-xl border border-input bg-card p-6">
            <Button onClick={handleOpen} className="gap-2">
              <FolderIcon className="h-4 w-4" />
              Open inbox
            </Button>
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-input bg-card p-4 space-y-3">
              <Label htmlFor="capture">Capture</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="capture"
                  placeholder="Drop a thought, link, or task…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
                  className="flex-1"
                />
                <select
                  value={draftBucket}
                  onChange={(e) => setDraftBucket(e.target.value as Bucket)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {BUCKETS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title}
                    </option>
                  ))}
                </select>
                <Button type="button" onClick={add} className="gap-1 shrink-0">
                  <PlusIcon className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BUCKETS.map((b) => (
                <div
                  key={b.id}
                  className="rounded-xl border border-input bg-card p-4 space-y-2 min-h-[220px]"
                >
                  <div className="mb-2">
                    <h2 className="font-semibold">{b.title}</h2>
                    <p className="text-xs text-muted-foreground">{b.hint}</p>
                  </div>
                  <ul className="space-y-2">
                    {items
                      .filter((it) => it.bucket === b.id)
                      .map((it) => (
                        <li
                          key={it.id}
                          className="rounded-lg border border-border/80 bg-muted/30 p-2 text-sm space-y-2"
                        >
                          <p className="whitespace-pre-wrap break-words">{it.text}</p>
                          <div className="flex flex-wrap gap-1 items-center">
                            <select
                              value={it.bucket}
                              onChange={(e) => move(it.id, e.target.value as Bucket)}
                              className="h-8 flex-1 min-w-[100px] rounded-md border border-input bg-background px-2 text-xs"
                            >
                              {BUCKETS.map((opt) => (
                                <option key={opt.id} value={opt.id}>
                                  {opt.title}
                                </option>
                              ))}
                            </select>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => remove(it.id)}
                              aria-label="Remove"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
