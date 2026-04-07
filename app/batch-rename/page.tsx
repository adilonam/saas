"use client";

import { useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BatchRenamePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [prefix, setPrefix] = useState("file");
  const [startAt, setStartAt] = useState("1");
  const [generated, setGenerated] = useState(false);

  const preview = useMemo(() => {
    const start = Math.max(1, Number(startAt) || 1);
    return files.map((file, idx) => {
      const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
      const nextName = `${prefix}-${String(start + idx).padStart(3, "0")}${ext}`;
      return { oldName: file.name, newName: nextName };
    });
  }, [files, prefix, startAt]);

  const handleGenerate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/batch-rename")}`);
      return;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }
    setGenerated(true);
  };

  const downloadCsv = () => {
    if (!preview.length) return;
    const rows = ["old_name,new_name", ...preview.map((p) => `"${p.oldName.replace(/"/g, '""')}","${p.newName.replace(/"/g, '""')}"`)];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "batch-rename-map.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-2xl font-semibold">Batch Rename Utility</h1>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
        <div className="rounded-xl border border-input bg-card p-6 space-y-4">
          <Button variant="outline" type="button" onClick={() => inputRef.current?.click()}>Choose Files</Button>
          <p className="text-sm text-muted-foreground">{files.length} file(s) selected</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="Prefix" />
            <Input type="number" min={1} value={startAt} onChange={(e) => setStartAt(e.target.value)} placeholder="Start number" />
          </div>
          <Button onClick={handleGenerate} disabled={!files.length}>Generate Rename Map</Button>
        </div>
        {generated && preview.length > 0 && (
          <div className="rounded-xl border border-input bg-muted/30 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Rename preview</p>
              <Button variant="outline" size="sm" onClick={downloadCsv}>Download CSV map</Button>
            </div>
            <div className="max-h-[360px] overflow-auto rounded-lg border border-input bg-background p-3 text-sm">
              {preview.map((p, idx) => <p key={idx}>{p.oldName} {"->"} {p.newName}</p>)}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
