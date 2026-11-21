"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UserCircleIcon,
  SparklesIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

const PLATFORMS = [
  { id: "any", label: "Any" },
  { id: "instagram", label: "Instagram" },
  { id: "twitter", label: "Twitter / X" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "tiktok", label: "TikTok" },
];

export default function SocialMediaBioPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState("any");
  const [bios, setBios] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/social-media-bio")}`,
      );
      return;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }
    if (!name.trim() && !niche.trim()) {
      setError("Enter your name or niche.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setBios([]);

    try {
      const res = await fetch("/api/social-bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), niche: niche.trim(), platform }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.code === "subscription_required" || data.error === "Active subscription required") {
          router.push("/pricing");
          return;
        }
        setError(data.error || "Failed to generate bios");
        return;
      }
      setBios(data.bios ?? []);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyBio = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Social Media Bio Generator
          </h1>
          <p className="mt-1 text-muted-foreground">
            Get 3 short, engaging bios for your profile. Name and niche help personalize.
          </p>
        </div>

        <div className="space-y-4 rounded-xl border border-input bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name or brand</Label>
            <Input
              id="name"
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="niche">Niche or topic</Label>
            <Input
              id="niche"
              placeholder="e.g. fitness, tech, travel"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label>Platform</Label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlatform(p.id)}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                    platform === p.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input hover:bg-muted"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isGenerating}
            className="gap-2 w-full sm:w-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4" />
                Generate bios
              </>
            )}
          </Button>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {bios.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-medium flex items-center gap-2">
              <UserCircleIcon className="h-5 w-5" />
              Your bios
            </h2>
            <ul className="space-y-3">
              {bios.map((bio, i) => (
                <li
                  key={i}
                  className="flex items-start justify-between gap-3 rounded-lg border border-input bg-muted/30 p-4"
                >
                  <p className="text-sm text-foreground flex-1">{bio}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyBio(bio)}
                    className="shrink-0 gap-1.5"
                  >
                    <ClipboardDocumentIcon className="h-4 w-4" />
                    Copy
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
