import { CATEGORIES } from "@/content/categories";
import { routes } from "@/lib/routes";

export const NAV_LEFT = [
  { label: "Collection", href: routes.collection() },
  { label: "Exhibition", href: routes.exhibition() },
  { label: "History", href: routes.history() },
  { label: "Glass Guide", href: routes.guide() },
];

export const NAV_RIGHT = [
  { label: "History", href: routes.history() },
  { label: "About", href: routes.about() },
  { label: "Contact", href: routes.contact() },
];

export const MENU_SECTIONS = [
  { label: "Home", href: routes.home() },
  { label: "Collection", href: routes.collection(), children: CATEGORIES.map((c) => ({ label: c.title, href: routes.category(c.slug) })) },
  { label: "Exhibition", href: routes.exhibition() },
  { label: "History", href: routes.history() },
  {
    label: "Glass Guide",
    href: routes.guide(),
    children: [
      { label: "Makers & Workshops", href: routes.directory() },
      { label: "Makers in the collection", href: routes.makers() },
      { label: "Techniques", href: routes.techniques() },
      { label: "Attribution & method", href: routes.attribution() },
    ],
  },
  { label: "About", href: routes.about() },
  { label: "Contact", href: routes.contact() },
];
