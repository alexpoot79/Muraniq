import type { CategorySlug } from "./schemas";

export type CategoryInfo = {
  slug: CategorySlug;
  title: string;
  /** Short line for cards and navigation. */
  kicker: string;
  intro: string;
};

/**
 * The four collection areas of the existing site (all four are preserved,
 * including Collectible Objects). Whether an area is presented as a full
 * gallery depends on published content, not on this list.
 */
export const CATEGORIES: CategoryInfo[] = [
  {
    slug: "murano-glass",
    title: "Murano Glass",
    kicker: "Glass from the island of Murano",
    intro:
      "Blown and sculpted glass from the workshops of Murano, presented with the techniques, marks and sources that place each piece.",
  },
  {
    slug: "other-glass",
    title: "Other Glass",
    kicker: "Glass beyond Murano",
    intro: "Glass from other makers, studios and places, documented with the same attention to evidence.",
  },
  {
    slug: "collectible-objects",
    title: "Collectible Objects",
    kicker: "Design and decorative objects",
    intro: "Objects collected for their design, making or history, from paperweights to decorative pieces.",
  },
];

export const categoryBySlug = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
