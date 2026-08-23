"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

type Bios = { a: string; b: string; c: string };

function buildBios(fields: {
  name: string;
  role: string;
  value: string;
  cta: string;
  link: string;
}): Bios {
  const { name, role, value, cta, link } = fields;
  const n = name || "Your name";
  const r = role || "what you do";
  const v = value || "how you help";
  const c = cta || "DM me";
  const l = link || "link in bio";

  return {
    a: `${n} · ${r} · ${v} · ${c} → ${l}`,
    b: `${r} for people who want ${v}. ${c}: ${l} | ${n}`,
    c: `Hey, I'm ${n} 👋 ${r}. ${v}. ${c} (${l}).`,
  };
}

export default function TemplateBioGeneratorPage() {
  const { ensureAccess } = useToolAccess();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [value, setValue] = useState("");
  const [cta, setCta] = useState("");
  const [link, setLink] = useState("");
  const [bios, setBios] = useState<Bios | null>(null);

  const handleGenerate = () => {
    if (!ensureAccess()) return;
    setBios(buildBios({ name, role, value, cta, link }));
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-pink-100 text-pink-600 dark:bg-pink-900/30">
            <UserCircleIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Template bio generator</h1>
            <p className="mt-1 text-muted-foreground text-sm">
              Fill the fields once; get three ready-to-paste bios (no AI). Plugs in defaults for
              empty slots.
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-input bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="bio-name">Name or brand</Label>
              <Input
                id="bio-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Kim"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio-role">Role</Label>
              <Input
                id="bio-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Product designer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio-value">Value / audience</Label>
              <Input
                id="bio-value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="clearer UX for SaaS teams"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio-cta">Call to action</Label>
              <Input
                id="bio-cta"
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                placeholder="Newsletter weekly"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio-link">Link label</Label>
              <Input
                id="bio-link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="eprod.io/tools"
              />
            </div>
          </div>
          <Button type="button" onClick={handleGenerate} className="gap-2">
            Generate bios
          </Button>
        </div>

        {bios && (
          <div className="space-y-4">
            {(
              [
                ["Short line", bios.a],
                ["Keyword-heavy", bios.b],
                ["Friendly", bios.c],
              ] as const
            ).map(([label, text]) => (
              <div
                key={label}
                className="space-y-2 rounded-xl border border-input bg-muted/20 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(text)}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
