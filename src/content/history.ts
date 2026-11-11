/**
 * History of Venetian and Murano glass. Sections without body text are not
 * rendered, so the page can be filled section by section as reviewed text
 * arrives. Every claim needs a source in `sources`.
 */
export type HistorySection = {
  id: string;
  period: string;
  title: string;
  body: string[];
  sources: Array<{ label: string; url: string }>;
};

export const HISTORY_INTRO = "How glassmaking grew in Venice and on the island of Murano, period by period.";

export const HISTORY_SECTIONS: HistorySection[] = [
  { id: "origins", period: "Before 1291", title: "Origins in Venice", body: [], sources: [] },
  { id: "murano", period: "1291 – 15th century", title: "The move to Murano and the guild", body: [], sources: [] },
  { id: "renaissance", period: "15th – 16th century", title: "Cristallo and the Renaissance", body: [], sources: [] },
  { id: "baroque", period: "17th – 18th century", title: "Competition, decline and the eighteenth century", body: [], sources: [] },
  { id: "revival", period: "19th century", title: "The nineteenth-century revival", body: [], sources: [] },
  { id: "modern", period: "20th century", title: "Designers and glassworks of the twentieth century", body: [], sources: [] },
  { id: "today", period: "Today", title: "Murano today", body: [], sources: [] },
];
