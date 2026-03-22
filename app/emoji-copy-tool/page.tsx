"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { FaceSmileIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

const EMOJI_GROUPS: { label: string; chars: string[] }[] = [
  {
    label: "Reactions",
    chars: ["🔥", "❤️", "👍", "😂", "😮", "🙏", "✨", "💯", "🎉", "👏"],
  },
  {
    label: "Pointers",
    chars: ["👉", "👆", "⬇️", "➡️", "☝️", "✅", "❌", "⚠️", "💡", "📌"],
  },
  {
    label: "Media & work",
    chars: ["📹", "🎬", "🎙️", "📷", "💻", "📎", "🔗", "📝", "📊", "🚀"],
  },
  {
    label: "Symbols",
    chars: ["⭐", "✔️", "▶️", "⏰", "📅", "🆕", "🔔", "💬", "🎯", "🌟"],
  },
];

export default function EmojiCopyToolPage() {
  const { ensureAccess } = useToolAccess();
  const [unlocked, setUnlocked] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleUnlock = () => {
    if (!ensureAccess()) return;
    setUnlocked(true);
  };

  const copy = async (emoji: string) => {
    try {
      await navigator.clipboard.writeText(emoji);
      setCopied(emoji);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/30">
            <FaceSmileIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Emoji copy tool</h1>
            <p className="mt-1 text-muted-foreground text-sm">
              Tap an emoji to copy it for titles, descriptions, and captions.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-input bg-card p-6">
          <Button type="button" onClick={handleUnlock} className="gap-2">
            Show emoji picker
          </Button>
          {copied && (
            <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400" role="status">
              Copied {copied}
            </p>
          )}
        </div>

        {unlocked && (
          <div className="space-y-8">
            {EMOJI_GROUPS.map((group) => (
              <div key={group.label}>
                <h2 className="mb-3 text-sm font-medium text-muted-foreground">{group.label}</h2>
                <div className="flex flex-wrap gap-2">
                  {group.chars.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => copy(emoji)}
                      className="flex size-14 items-center justify-center rounded-xl border border-input bg-background text-2xl transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      title={`Copy ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
