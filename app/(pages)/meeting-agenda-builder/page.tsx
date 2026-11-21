"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MeetingAgendaBuilderPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const [title, setTitle] = useState("Weekly Product Sync");
  const [duration, setDuration] = useState("45");
  const [topics, setTopics] = useState("Metrics review\nBlockers\nRoadmap updates\nAction items");
  const [built, setBuilt] = useState(false);

  const agenda = useMemo(() => {
    const topicList = topics.split("\n").map((t) => t.trim()).filter(Boolean);
    const perTopic = topicList.length > 0 ? Math.max(5, Math.floor((Number(duration) || 0) / topicList.length)) : 0;
    return topicList.map((topic, i) => ({ topic, minutes: i === topicList.length - 1 ? "Remaining" : String(perTopic) }));
  }, [topics, duration]);

  const handleBuild = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/meeting-agenda-builder")}`);
      return;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }
    setBuilt(true);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-semibold">Meeting Agenda Builder</h1>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Meeting title" />
        <Input type="number" min={15} value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Duration (minutes)" />
        <textarea className="w-full min-h-[170px] rounded-xl border border-input bg-background p-3 text-sm" value={topics} onChange={(e) => setTopics(e.target.value)} />
        <Button onClick={handleBuild}>Build Agenda</Button>

        {built && (
          <div className="rounded-xl border border-input bg-muted/30 p-6">
            <h2 className="font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground mt-1">Total duration: {duration} min</p>
            <ol className="mt-4 space-y-2 text-sm list-decimal pl-5">
              {agenda.map((a, idx) => <li key={idx}>{a.topic} ({a.minutes} min)</li>)}
            </ol>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
