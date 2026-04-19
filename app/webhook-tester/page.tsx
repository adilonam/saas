"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSubscribedToolAccess } from "@/hooks/useSubscribedToolAccess";
import type { WebhookStoredEvent } from "@/lib/webhook-receiver-types";
import { SignalIcon } from "@heroicons/react/24/outline";

export default function WebhookTesterPage() {
  const { assertAccess } = useSubscribedToolAccess("/webhook-tester");
  const [bucket] = useState(() => crypto.randomUUID());
  const [active, setActive] = useState(false);
  const [events, setEvents] = useState<WebhookStoredEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const base =
    typeof window !== "undefined" ? window.location.origin : "";
  const hookUrl = `${base}/api/webhook-receiver/${bucket}`;

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(`/api/webhook-receiver/${bucket}`);
      if (!res.ok) throw new Error("Failed to load events");
      const data = (await res.json()) as { events: WebhookStoredEvent[] };
      setEvents(data.events ?? []);
      setError(null);
    } catch {
      setError("Could not poll the receiver. Try again.");
    }
  }, [bucket]);

  useEffect(() => {
    if (!active) return;
    void fetchEvents();
    timerRef.current = setInterval(() => void fetchEvents(), 2500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [active, fetchEvents]);

  const handleStart = () => {
    if (!assertAccess()) return;
    setActive(true);
  };

  const handleClear = async () => {
    await fetch(`/api/webhook-receiver/${bucket}`, { method: "DELETE" });
    setEvents([]);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600">
            <SignalIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Webhook tester</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Unique URL that records the last 50 inbound requests (in-memory on
              this server — fine for local tests; production may vary by host).
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <Button type="button" onClick={handleStart} disabled={active}>
            <SignalIcon className="size-4 mr-2" />
            {active ? "Receiver active" : "Enable receiver"}
          </Button>

          {active && (
            <>
              <div className="space-y-2">
                <Label>Your webhook URL</Label>
                <div className="rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono break-all">
                  {hookUrl}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  POST, PUT, or PATCH JSON or text to this URL from another tool
                  or provider. Use GET from this page to refresh the list (also
                  auto-refreshes every few seconds).
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => void fetchEvents()}>
                  Refresh now
                </Button>
                <Button type="button" variant="outline" onClick={() => void handleClear()}>
                  Clear history
                </Button>
              </div>

              {error && (
                <p className="text-sm text-amber-600 dark:text-amber-400">{error}</p>
              )}

              <div className="space-y-3">
                <Label>Last payloads ({events.length})</Label>
                {events.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Nothing received yet.
                  </p>
                ) : (
                  <ul className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                    {events.map((ev, idx) => (
                      <li
                        key={`${ev.receivedAt}-${idx}`}
                        className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-950/40 p-4 text-sm"
                      >
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mb-2">
                          <span className="font-mono text-slate-800 dark:text-slate-200">
                            {ev.method}
                          </span>
                          <span>{ev.receivedAt}</span>
                          {ev.search ? (
                            <span className="font-mono break-all">{ev.search}</span>
                          ) : null}
                        </div>
                        <pre className="text-xs font-mono whitespace-pre-wrap max-h-40 overflow-auto bg-slate-900 text-slate-100 rounded-lg p-3">
                          {ev.bodyPreview || "(empty body)"}
                        </pre>
                        {ev.bodyTruncated && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                            Body truncated at 128 KB preview.
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
