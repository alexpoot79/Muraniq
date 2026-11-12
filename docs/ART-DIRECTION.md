# Art direction

How the site should look and move, and why. Written for whoever builds the next page.

## Idea: the Private Viewing Room

Glass is about light. The site is three rooms, each with one job:

- **Viewing room** (home, object pages, exhibition): black, one object lit at a time, few words.
- **Collection room** (the three collection areas, Private Selection): black, ordered, the works above the fold,
  filters that stay out of the way.
- **Study room** (Glass Guide, History, About, Contact, Privacy): warm paper and ink, long reading, sources.

The rooms are token scopes, not separate components. `.room-study` (set in the section's `layout.tsx`) remaps
`stage`, `raised`, `on-dark`, `muted-dark`, `line-dark` and `accent` to paper, ink and bronze, so every utility
in that subtree flips with it. A component written for the dark room works on paper without a variant.
Luxury comes from restraint, space and accuracy, not from gold everywhere.

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

Gold is used sparingly: at most one gold word per heading and one gold rule per section. Surfaces are flat:
no glows, no metallic gradients, no heavy shadows.

Inside the study room the scope uses: stage `#E8DDCB`, raised `#EFE6D7`, text `#14110D`, muted text `#4A443B`
(7.2:1 on paper), lines `#C9BCA6`, accent `#735A2E` (bronze, 4.8:1 on paper).

## Type

- **Cormorant Garamond Light (300)** for large headings, **Medium (500)** for small headings, **Italic (400)** for
  one or two accent words. Only 300 and 500 are preloaded.
- **Inter** (variable) for body, labels and controls. Body text is 17px (18px in long reading, `.prose-study`,
  at about 65 characters a line). Labels and captions are 13px (`text-label`, `text-caption`); labels are small
  capitals spaced at 0.14em. Nothing smaller than 12px.
- Numerals (`01`, `c. 1480`) in Cormorant, so dates and counts read as part of the editorial voice.

## Photography

- Show the whole object. Crop only plain studio backdrop (`fit="cover"` only when the frame matches the photograph
  within about 12%); otherwise the photograph is contained at its own size (`intrinsic`) on a plate painted with
  its own edge tones, and its outer few percent fade into them (`feather`, width set with `--feather`). The tones
  are measured once with `npm run tones` (five stops down the left and right edges, stored in
  `src/content/image-tones.json`); run it again when photographs are added. The full-screen viewer never feathers.
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
- Mobile is designed as its own layout, not a squeezed desktop: hero image above the title (short enough that the
  main action is in reach), timeline with thumbnails, full-screen menu.
- Collection areas use the compact page opening so works start above the fold at 1440×900.
- Avoid runs of identical blocks: an index has one lead entry and a compact list, not six alternating halves.

## Benchmarks looked at (for principles, not copied)

Museum online collections for object pages and credits; luxury maison and auction-house sites for restraint, centred lockups and dark/paper alternation. No layout,
text, image or asset was taken from any of them.
