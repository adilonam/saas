"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";
import { useSubscribedToolAccess } from "@/hooks/useSubscribedToolAccess";
import { SM2_INITIAL, addDays, sm2Schedule, type Sm2State } from "@/lib/sm2-lite";

const STORAGE_KEY = "eprod:interview-srs";

export type IQCard = {
  id: string;
  q: string;
  a: string;
  sm2: Sm2State;
  nextReview: string; // ISO date (yyyy-mm-dd)
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function load(): IQCard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw) as IQCard[];
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

function save(cards: IQCard[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

export default function InterviewQuestionBankPage() {
  const { assertAccess } = useSubscribedToolAccess("/interview-question-bank");
  const [unlocked, setUnlocked] = useState(false);
  const [cards, setCards] = useState<IQCard[]>([]);
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const due = useMemo(() => {
    const t = todayStr();
    return cards.filter((c) => c.nextReview <= t);
  }, [cards]);

  const active = activeId ? cards.find((c) => c.id === activeId) : null;

  const handleOpen = () => {
    if (!assertAccess()) return;
    setCards(load());
    setUnlocked(true);
  };

  const persist = (next: IQCard[]) => {
    setCards(next);
    save(next);
  };

  const addCard = () => {
    if (!assertAccess()) return;
    const qq = q.trim();
    const aa = a.trim();
    if (!qq || !aa) return;
    const card: IQCard = {
      id: crypto.randomUUID(),
      q: qq,
      a: aa,
      sm2: { ...SM2_INITIAL },
      nextReview: todayStr(),
    };
    setCards((prev) => {
      const next = [...prev, card];
      save(next);
      return next;
    });
    setQ("");
    setA("");
  };

  const startSession = () => {
    if (!assertAccess()) return;
    if (due.length === 0) return;
    setActiveId(due[0].id);
    setShowAnswer(false);
  };

  const rate = (quality: number) => {
    if (!assertAccess() || !active) return;
    const id = active.id;
    const sm2 = sm2Schedule(quality, active.sm2);
    const nextReview = addDays(new Date(), sm2.interval).toISOString().slice(0, 10);
    const nextCards = cards.map((c) =>
      c.id === id ? { ...c, sm2, nextReview } : c,
    );
    persist(nextCards);
    setShowAnswer(false);
    const t = todayStr();
    const nextDue = nextCards.filter((c) => c.nextReview <= t && c.id !== id);
    setActiveId(nextDue[0]?.id ?? null);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Interview question bank (SM-2 lite)</h1>
          <p className="mt-1 text-muted-foreground">
            Save Q/A pairs and review due cards with spaced repetition (0–5 quality).
          </p>
        </div>

        {!unlocked ? (
          <Button type="button" onClick={handleOpen} className="gap-2">
            <ChatBubbleBottomCenterTextIcon className="h-4 w-4" />
            Open question bank
          </Button>
        ) : (
          <>
            <div className="rounded-lg border border-input p-4 space-y-3">
              <p className="text-sm font-medium">Add question</p>
              <div className="space-y-2">
                <Label htmlFor="iq-q">Question</Label>
                <textarea
                  id="iq-q"
                  className="w-full min-h-[72px] rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="iq-a">Answer / talking points</Label>
                <textarea
                  id="iq-a"
                  className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  value={a}
                  onChange={(e) => setA(e.target.value)}
                />
              </div>
              <Button type="button" onClick={addCard}>
                Save card
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-muted-foreground">
                {cards.length} cards · {due.length} due today
              </p>
              <Button type="button" variant="secondary" onClick={startSession} disabled={due.length === 0}>
                Start review
              </Button>
            </div>

            {active && (
              <div className="rounded-xl border border-input bg-muted/30 p-6 space-y-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Active card</p>
                <p className="text-base font-medium">{active.q}</p>
                {!showAnswer ? (
                  <Button type="button" onClick={() => setShowAnswer(true)}>
                    Show answer
                  </Button>
                ) : (
                  <>
                    <div className="text-sm whitespace-pre-wrap border-t border-input pt-4">{active.a}</div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">How well did you recall? (SM-2 quality)</p>
                      <div className="flex flex-wrap gap-2">
                        {[0, 1, 2, 3, 4, 5].map((n) => (
                          <Button key={n} type="button" size="sm" variant="outline" onClick={() => rate(n)}>
                            {n}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {cards.length > 0 && (
              <div className="text-sm space-y-2">
                <p className="font-medium">All cards (next review)</p>
                <ul className="divide-y divide-border rounded-lg border border-input max-h-56 overflow-y-auto">
                  {cards.map((c) => (
                    <li key={c.id} className="px-3 py-2 flex justify-between gap-2">
                      <span className="truncate">{c.q}</span>
                      <span className="text-muted-foreground shrink-0 text-xs">{c.nextReview}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
