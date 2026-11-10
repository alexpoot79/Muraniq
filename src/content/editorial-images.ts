/**
 * Editorial (non-catalogue) imagery: historic views of Venice used as
 * atmosphere. All are open-access CC0 images from The Cleveland Museum of Art;
 * see docs/IMAGE-SOURCES.md. Captions always name the work and the museum.
 */
export type EditorialImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  credit: string;
  href: string;
};

export const EDITORIAL_IMAGES = {
  deBarbari: {
    src: "/images/heritage/de-barbari-view-of-venice-1500.jpg",
    width: 3000,
    height: 1444,
    alt: "Woodcut bird’s-eye view of Venice and its lagoon, crowded with buildings, canals and ships, with wind heads blowing from the clouds",
    caption: "Jacopo de’ Barbari, View of Venice, 1500. Woodcut from six blocks.",
    credit: "The Cleveland Museum of Art, 1949.565 · CC0",
    href: "https://clevelandart.org/art/1949.565",
  },
  ponti: {
    src: "/images/heritage/ponti-view-of-venice-1860.jpg",
    width: 2400,
    height: 1794,
    alt: "Sepia photograph of a quiet Venetian canal with a stone footbridge, moored boats and church domes in the distance",
    caption: "Carlo Ponti, View of Venice, c. 1860. Albumen print.",
    credit: "The Cleveland Museum of Art, 1988.214 · CC0",
    href: "https://clevelandart.org/art/1988.214",
  },
  fays: {
    src: "/images/heritage/fays-santa-maria-della-salute-1854.jpg",
    width: 2400,
    height: 1864,
    alt: "Pale early photograph of the Grand Canal with the domes of Santa Maria della Salute rising above the water",
    caption: "Baron A. Faÿs, Santa Maria della Salute, View of the Grand Canal, Venice, 1854 or earlier. Salted paper print.",
    credit: "The Cleveland Museum of Art, 1997.40 · CC0",
    href: "https://clevelandart.org/art/1997.40",
  },
} satisfies Record<string, EditorialImage>;
