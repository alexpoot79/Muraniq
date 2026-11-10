# Art direction

How the site should look and move, and why. Written for whoever builds the next page.

## Idea: a palazzo at night

Glass is about light. The site is a dark room with objects lit one at a time, and quieter
reading rooms in warm paper between them. Every page alternates between those two moods: **stage** (black,
objects, few words) and **study** (paper, text, evidence). Luxury comes from restraint, space and accuracy, not from
gold everywhere.

## Palette

| Token | Hex | Use |
| --- | --- | --- |
| `stage` | #080808 | Main background; objects sit on it |
| `raised` | #11100E | Footer, plates, raised panels |
| `accent` | #C5A46D | Champagne gold: hairlines, focus ring, the italic accent word in a heading, numerals on dark. Never body text, never on paper |
| `accent-deco` | #A88A54 | Antique gold: rules and ornaments only (fails contrast as text) |
| `accent-ink` | #735A2E | Bronze: gold-toned text on paper and ivory (≥ 4.8:1) |
| `paper` | #E8DDCB | Study sections |
| `ivory` | #F5F0E7 | Text on dark; primary button; form fields |

Gold is used sparingly: at most one gold word per heading and one gold rule per section.

## Type

- **Cormorant Garamond Light (300)** for large headings, **Medium (500)** for small headings, **Italic (400)** for
  one or two accent words. Only 300 and 500 are preloaded.
- **Inter** (variable) for body, labels and controls. Labels are small capitals spaced at 0.2em.
- Numerals (`01`, `c. 1480`) in Cormorant, so dates and counts read as part of the editorial voice.

## Photography

- Show the whole object. Crop only plain studio backdrop (`fit="cover"` only when the frame matches the photograph
  within about 12%); otherwise the object is contained on a plate with a blurred copy of its own backdrop behind it.
- One object per view. No collages, no mock-ups, no AI imagery.
- Every image has a credit and a source record (`docs/IMAGE-SOURCES.md`).

## Motion

- Hero text settles in once (opacity and 18px rise, 1.1 s). The hero photograph pushes in slightly (transform only,
  so it never delays LCP).
- Sections and images reveal on scroll with CSS scroll-driven animations: no JavaScript, and nothing at all when
  the browser lacks support or the visitor prefers reduced motion. Content is always readable without motion.
- Selected works drift a little against the scroll on large screens only.
- No autoplay, no carousels that move on their own, no scroll-jacking.

## Layout

- Wide margins (`container-gallery`, up to 96rem), generous vertical rhythm (`section-y`).
- Asymmetric 12-column grids for editorial sections; a centred header with the logo between two navigation groups.
- Mobile is designed as its own layout, not a squeezed desktop: hero image above the title, timeline with
  thumbnails, full-screen menu.

## Benchmarks looked at (for principles, not copied)

Museum online collections for object pages and credits; luxury maison and auction-house sites for restraint, centred lockups and dark/paper alternation. No layout,
text, image or asset was taken from any of them.
