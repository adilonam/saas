"use client";

import DashboardLayout from "components/DashboardLayout";
import DnaTestForm from "@/components/dna-test/DnaTestForm";
import { BeakerIcon } from "@heroicons/react/24/outline";

export default function DnaTestPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400">
            <BeakerIcon className="size-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            DNA Test
          </h1>
        </div>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          Upload a selfie or take a photo for a fun ancestry-style estimate by
          country — for entertainment only, not real DNA.
        </p>
      </div>

      <DnaTestForm />
    </DashboardLayout>
  );
}
