"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GiftIcon, PlusIcon, XMarkIcon, SparklesIcon, ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Secret Santa Generator - Random Gift Exchange Pairs | Eprod.io",
  description: "Generate random Secret Santa pairs with optional exclusions and budget settings. Perfect for holiday gift exchanges. No server storage - completely private.",
  alternates: {
    canonical: "https://www.eprod.io/secret-santa-generator",
  },
  openGraph: {
    title: "Secret Santa Generator - Random Gift Exchange Pairs",
    description: "Generate random Secret Santa pairs for your holiday gift exchange. Add exclusions and set budgets.",
    url: "https://www.eprod.io/secret-santa-generator",
    type: "website",
  },
};

interface Participant {
  id: string;
  name: string;
  exclusions: string[];
}

interface Assignment {
  giver: string;
  receiver: string;
  revealed: boolean;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateSecretSanta(participants: Participant[]): Assignment[] | null {
  const maxAttempts = 1000;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const givers = [...participants];
    const receivers = shuffleArray([...participants]);
    const assignments: Assignment[] = [];
    let valid = true;

    for (let i = 0; i < givers.length; i++) {
      const giver = givers[i];
      const receiver = receivers[i];

      // Check if giver is receiver (can't give to self)
      if (giver.id === receiver.id) {
        valid = false;
        break;
      }

      // Check exclusions
      if (giver.exclusions.includes(receiver.id)) {
        valid = false;
        break;
      }

      assignments.push({
        giver: giver.name,
        receiver: receiver.name,
        revealed: false,
      });
    }

    if (valid) {
      return assignments;
    }
  }

  return null; // Could not find valid arrangement
}

export default function SecretSantaGeneratorPage() {
  const [participants, setParticipants] = useState<Participant[]>([
    { id: "1", name: "", exclusions: [] }
  ]);
  const [budget, setBudget] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<{[key: string]: boolean}>({});

  const addParticipant = () => {
    setParticipants([...participants, { id: Date.now().toString(), name: "", exclusions: [] }]);
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const updateName = (id: string, name: string) => {
    setParticipants(participants.map(p => p.id === id ? { ...p, name } : p));
  };

  const toggleExclusion = (giverId: string, receiverId: string) => {
    setParticipants(participants.map(p => {
      if (p.id === giverId) {
        const exclusions = p.exclusions.includes(receiverId)
          ? p.exclusions.filter(e => e !== receiverId)
          : [...p.exclusions, receiverId];
        return { ...p, exclusions };
      }
      return p;
    }));
  };

  const generate = () => {
    setError("");
    setAssignments([]);

    const validParticipants = participants.filter(p => p.name.trim() !== "");
    
    if (validParticipants.length < 3) {
      setError("Need at least 3 participants");
      return;
    }

    const result = generateSecretSanta(validParticipants);
    
    if (!result) {
      setError("Could not generate valid pairs with current exclusions. Try removing some exclusions.");
      return;
    }

    setAssignments(result);
  };

  const revealAssignment = (index: number) => {
    setAssignments(assignments.map((a, i) => i === index ? { ...a, revealed: true } : a));
  };

  const copyAssignment = async (index: number) => {
    const assignment = assignments[index];
    const text = budget 
      ? `🎁 Secret Santa: You're giving to ${assignment.receiver}! Budget: ${budget}`
      : `🎁 Secret Santa: You're giving to ${assignment.receiver}!`;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied({ ...copied, [index]: true });
      setTimeout(() => setCopied({ ...copied, [index]: false }), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const reset = () => {
    setAssignments([]);
    setError("");
  };

  return (
    <DashboardLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Secret Santa Generator",
            "description": "Generate random Secret Santa pairs with exclusions and budget settings",
            "url": "https://www.eprod.io/secret-santa-generator",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How does the Secret Santa generator work?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Add participant names and optional exclusions (like couples who shouldn't pick each other). Click Generate to randomly assign gift recipients. Each person can reveal only their assignment privately."
                }
              },
              {
                "@type": "Question",
                "name": "Is my Secret Santa data stored anywhere?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No! All Secret Santa pairings happen client-side in your browser. Nothing is sent to or stored on any server. Completely private."
                }
              },
              {
                "@type": "Question",
                "name": "Can I set exclusions for Secret Santa?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! Check the boxes to exclude certain pairings, perfect for couples or family members who shouldn't pick each other."
                }
              },
              {
                "@type": "Question",
                "name": "What's the minimum number of participants?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "You need at least 3 participants for Secret Santa to work."
                }
              }
            ]
          })
        }}
      />

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400">
            <GiftIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Secret Santa Generator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Random gift exchange pairs with optional exclusions - completely private
            </p>
          </div>
        </div>

        {assignments.length === 0 ? (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="budget">Gift Budget (Optional)</Label>
                <Input
                  id="budget"
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. $25, £20, €30"
                  className="rounded-xl h-11"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Participants ({participants.filter(p => p.name.trim()).length})</Label>
                  <Button onClick={addParticipant} size="sm" variant="outline" className="gap-1">
                    <PlusIcon className="h-4 w-4" />
                    Add
                  </Button>
                </div>

                {participants.map((participant, index) => (
                  <div key={participant.id} className="space-y-3 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="flex gap-2">
                      <Input
                        value={participant.name}
                        onChange={(e) => updateName(participant.id, e.target.value)}
                        placeholder={`Participant ${index + 1} name`}
                        className="rounded-xl h-10"
                      />
                      {participants.length > 1 && (
                        <Button
                          onClick={() => removeParticipant(participant.id)}
                          size="sm"
                          variant="ghost"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {participant.name.trim() && participants.filter(p => p.name.trim() && p.id !== participant.id).length > 0 && (
                      <div className="pl-4 space-y-2">
                        <p className="text-sm text-slate-600 dark:text-slate-400">Cannot give to:</p>
                        <div className="flex flex-wrap gap-2">
                          {participants
                            .filter(p => p.name.trim() && p.id !== participant.id)
                            .map((other) => (
                              <label
                                key={other.id}
                                className="flex items-center gap-2 text-sm cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={participant.exclusions.includes(other.id)}
                                  onChange={() => toggleExclusion(participant.id, other.id)}
                                  className="rounded border-slate-300 dark:border-slate-600"
                                />
                                <span className="text-slate-600 dark:text-slate-300">{other.name}</span>
                              </label>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <Button 
                onClick={generate}
                disabled={participants.filter(p => p.name.trim()).length < 3}
                className="w-full gap-2"
              >
                <SparklesIcon className="h-4 w-4" />
                Generate Secret Santa Pairs
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 p-6 sm:p-8 space-y-6">
              <div className="text-center">
                <p className="text-lg font-semibold">🎁 Secret Santa Assignments Generated!</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                  Each person should reveal only their own assignment
                </p>
                {budget && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    Budget: <span className="font-medium">{budget}</span>
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {assignments.map((assignment, index) => (
                  <div key={index} className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{assignment.giver}</p>
                      <div className="flex gap-2">
                        {!assignment.revealed ? (
                          <Button
                            onClick={() => revealAssignment(index)}
                            size="sm"
                            variant="outline"
                          >
                            Reveal
                          </Button>
                        ) : (
                          <>
                            <p className="text-slate-600 dark:text-slate-300">
                              → <span className="font-medium text-pink-600 dark:text-pink-400">{assignment.receiver}</span>
                            </p>
                            <Button
                              onClick={() => copyAssignment(index)}
                              size="sm"
                              variant="ghost"
                            >
                              {copied[index] ? (
                                <ClipboardDocumentCheckIcon className="h-4 w-4" />
                              ) : (
                                <ClipboardDocumentCheckIcon className="h-4 w-4" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={reset} variant="outline" className="w-full">
                Start Over
              </Button>
            </div>
          </div>
        )}

        {/* Holiday Tools Section */}
        <div className="mt-12 p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold mb-4">More Holiday Tools</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link
              href="/christmas-countdown"
              className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              <p className="font-medium">🎄 Christmas Countdown</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Count down to Christmas 2026
              </p>
            </Link>
            <Link
              href="/new-year-countdown"
              className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              <p className="font-medium">🎉 New Year Countdown</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Count down to 2027
              </p>
            </Link>
            <Link
              href="/black-friday-discount-calculator"
              className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              <p className="font-medium">🛍️ Black Friday Calculator</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Stack & compare discounts
              </p>
            </Link>
            <Link
              href="/2027-calendar"
              className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              <p className="font-medium">📅 2027 Calendar</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Printable year & month views
              </p>
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold mb-2">How does the Secret Santa generator work?</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Add participant names and optional exclusions (like couples who shouldn't pick each other). Click Generate to randomly assign gift recipients. Each person can reveal only their assignment privately by clicking their name.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold mb-2">Is my Secret Santa data stored anywhere?</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                No! All Secret Santa pairings happen client-side in your browser. Nothing is sent to or stored on any server. Completely private and secure.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold mb-2">Can I set exclusions for Secret Santa?</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Yes! Check the boxes under each participant to exclude certain pairings. This is perfect for couples or family members who shouldn't pick each other.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold mb-2">What's the minimum number of participants?</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                You need at least 3 participants for Secret Santa to work. The generator will try up to 1000 times to find a valid arrangement that respects all exclusions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
