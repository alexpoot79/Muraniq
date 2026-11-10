import type { Certainty, CreatorRole } from "@/content/schemas";

/**
 * One place for attribution wording, so titles, cards, filters, metadata and
 * structured data always say the same thing about the same certainty.
 */
export const CERTAINTY_LABEL: Record<Certainty, string> = {
  verified: "Verified",
  documented_attribution: "Documented attribution",
  probable: "Probable",
  hypothesis: "Hypothesis",
  unknown: "Not documented",
};

export const CERTAINTY_EXPLANATION: Record<Certainty, string> = {
  verified: "Confirmed by named evidence and reviewed by the collection.",
  documented_attribution: "Recorded in a cited source; not independently confirmed by MURANIQ.",
  probable: "Supported by several consistent indications, without conclusive documentation.",
  hypothesis: "A working proposal under research. Treat it as an open question.",
  unknown: "No reliable information is available at present.",
};

const PREFIX: Record<Certainty, string> = {
  verified: "",
  documented_attribution: "Attributed to ",
  probable: "Probably by ",
  hypothesis: "Possibly by ",
  unknown: "",
};

export function attributionPhrase(name: string, certainty: Certainty): string {
  if (certainty === "unknown") return "Maker not documented";
  return `${PREFIX[certainty]}${name}`;
}

export const ROLE_LABEL: Record<CreatorRole, string> = {
  designer: "Design",
  maker: "Execution",
  glasshouse: "Glasshouse",
  decorator: "Decoration",
  artist: "Artist",
  publisher: "Edition",
};

/** Whether structured data may name the creator without qualification. */
export function mayAssertCreatorInStructuredData(certainty: Certainty): boolean {
  return certainty === "verified";
}
