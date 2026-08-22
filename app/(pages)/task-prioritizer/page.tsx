"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";

type Item = { task: string; urgency: number; importance: number };

export default function TaskPrioritizerPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const [rawTasks, setRawTasks] = useState("Plan launch,5,5\nReply inbox,5,2\nWorkout,2,4\nClean desk,1,1");
  const [ran, setRan] = useState(false);

  const parsed = useMemo<Item[]>(() => {
    return rawTasks
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [task = "", urg = "0", imp = "0"] = line.split(",");
        return { task: task.trim(), urgency: Number(urg) || 0, importance: Number(imp) || 0 };
      });
  }, [rawTasks]);

  const matrix = useMemo(() => {
    return {
      doNow: parsed.filter((i) => i.urgency >= 4 && i.importance >= 4),
      schedule: parsed.filter((i) => i.urgency < 4 && i.importance >= 4),
      delegate: parsed.filter((i) => i.urgency >= 4 && i.importance < 4),
      eliminate: parsed.filter((i) => i.urgency < 4 && i.importance < 4),
    };
  }, [parsed]);

  const handlePrioritize = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/task-prioritizer")}`);
      return;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }
    setRan(true);
  };

  const renderList = (title: string, items: Item[]) => (
    <div className="rounded-xl border border-input bg-background p-4">
      <p className="text-sm font-medium">{title}</p>
      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
        {items.length ? items.map((i, idx) => <li key={`${title}-${idx}`}>- {i.task}</li>) : <li>- No tasks</li>}
      </ul>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Smart Task Prioritizer (Eisenhower Matrix)</h1>
          <p className="mt-1 text-muted-foreground">Format: `task,urgency(1-5),importance(1-5)` one per line.</p>
        </div>
        <textarea className="w-full min-h-[220px] rounded-xl border border-input bg-background p-3 text-sm" value={rawTasks} onChange={(e) => setRawTasks(e.target.value)} />
        <Button onClick={handlePrioritize}>Prioritize Tasks</Button>
        {ran && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderList("Do now", matrix.doNow)}
            {renderList("Schedule", matrix.schedule)}
            {renderList("Delegate", matrix.delegate)}
            {renderList("Eliminate", matrix.eliminate)}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
