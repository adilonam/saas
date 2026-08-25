import type { DnaOrigin } from "@/lib/dna-test/normalize-origins";

export type DnaTestPhase = "chooser" | "form" | "analyzing" | "results";

export type DnaTestResult = {
  origins: DnaOrigin[];
};
