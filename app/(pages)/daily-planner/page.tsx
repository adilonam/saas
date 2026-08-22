"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DailyPlannerPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const [wake, setWake] = useState("07:00");
  const [sleep, setSleep] = useState("23:00");
  const [tasks, setTasks] = useState("Deep work\nMeetings\nExercise\nReview & planning");
  const [generated, setGenerated] = useState(false);

  const plan = useMemo(() => {
    const taskList = tasks.split("\n").map((t) => t.trim()).filter(Boolean);
    return taskList.map((task, i) => ({ time: i < 3 ? `${8 + i * 2}:00` : `${14 + i}:00`, task }));
  }, [tasks]);

  const handleGenerate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/daily-planner")}`);
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

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Daily Planner Generator</h1>
          <p className="mt-1 text-muted-foreground">Create a simple day plan from your priorities.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-sm mb-2">Wake time</p><Input type="time" value={wake} onChange={(e) => setWake(e.target.value)} /></div>
          <div><p className="text-sm mb-2">Sleep time</p><Input type="time" value={sleep} onChange={(e) => setSleep(e.target.value)} /></div>
        </div>
        <textarea className="w-full min-h-[180px] rounded-xl border border-input bg-background p-3 text-sm" value={tasks} onChange={(e) => setTasks(e.target.value)} />
        <Button onClick={handleGenerate}>Generate Plan</Button>
        {generated && (
          <div className="rounded-xl border border-input bg-muted/30 p-6">
            <p className="font-medium">Day Window: {wake} - {sleep}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {plan.map((item, idx) => <li key={idx}><span className="font-medium">{item.time}</span> - {item.task}</li>)}
            </ul>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
