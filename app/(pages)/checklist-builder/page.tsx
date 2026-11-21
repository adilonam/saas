"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ChecklistBuilderPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const [title, setTitle] = useState("SOP: Launch New Campaign");
  const [steps, setSteps] = useState("Define objective\nPrepare assets\nQA tracking links\nLaunch and monitor");
  const [created, setCreated] = useState(false);

  const items = useMemo(() => steps.split("\n").map((s) => s.trim()).filter(Boolean), [steps]);

  const handleCreate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/checklist-builder")}`);
      return;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }
    setCreated(true);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-semibold">SOP / Checklist Builder</h1>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Checklist title" />
        <textarea className="w-full min-h-[180px] rounded-xl border border-input bg-background p-3 text-sm" value={steps} onChange={(e) => setSteps(e.target.value)} />
        <Button onClick={handleCreate}>Create Checklist</Button>

        {created && (
          <div className="rounded-xl border border-input bg-muted/30 p-6">
            <h2 className="font-semibold">{title}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {items.map((item, idx) => <li key={idx}>[ ] {item}</li>)}
            </ul>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
