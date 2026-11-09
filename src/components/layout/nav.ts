import { CATEGORIES } from "@/content/categories";
import { routes } from "@/lib/routes";

export const PRIMARY_NAV = [
  { label: "Collection", href: routes.collection() },
  { label: "Glass Guide", href: routes.guide() },
  { label: "About", href: routes.about() },
  { label: "Contact", href: routes.contact() },
];

export const MENU_SECTIONS = [
  { label: "Home", href: routes.home() },
  { label: "Collection", href: routes.collection(), children: CATEGORIES.map((c) => ({ label: c.title, href: routes.category(c.slug) })) },
  {
    label: "Glass Guide",
    href: routes.guide(),
    children: [
      { label: "Makers", href: routes.makers() },
      { label: "Techniques", href: routes.techniques() },
      { label: "Attribution & method", href: routes.attribution() },
    ],
  },
  { label: "About", href: routes.about() },
  { label: "Contact", href: routes.contact() },
];
