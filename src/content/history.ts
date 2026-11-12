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
  /** Open-access museum image (CC0), shown with its credit. Not a MURANIQ object. */
  image?: { src: string; w: number; h: number; alt: string; caption: string; credit: string };
};

/**
 * Periods whose reviewed text names a technique (by its term or an English
 * form of it), so technique pages can point to where the history discusses
 * it. A plain text match: nothing is linked that the text does not say.
 */
const TERM_FORMS: Record<string, string[]> = {
  calcedonia: ["calcedonia", "chalcedony"],
  "enamel-and-gilding": ["enamel"],
  avventurina: ["avventurina", "aventurine"],
  "facet-cut-glass": ["facet-cut", "faceted"],
};

export function periodsMentioning(slug: string, term: string) {
  const forms = TERM_FORMS[slug] ?? [term.toLowerCase()];
  return HISTORY_SECTIONS.filter((s) => s.body.length > 0 && forms.some((f) => s.body.join(" ").toLowerCase().includes(f)));
}

export const HISTORY_INTRO = "How glassmaking grew in Venice and on the island of Murano, period by period.";

export const HISTORY_SECTIONS: HistorySection[] = [
  {
    id: "origins",
    image: { src: "/images/reference/r022-devotional-badge-front.jpg", w: 2181, h: 2200, alt: "Small oval badge of moulded green glass showing a standing saint between two smaller kneeling figures", caption: "Devotional badge, Venice, c. 1200–1250", credit: "The Cleveland Museum of Art, 1985.146 · CC0" },
    period: "Before 1291",
    title: "Origins in Venice",
    body: [
      "The precise beginnings of Venetian glassmaking are uncertain. One of the earliest written references dates to 982, when a deed of gift to the Benedictine monastery of San Giorgio Maggiore names a Domenico as fiolario, a maker of glass bottles. It records an occupation that already existed, not the moment glassmaking began.",
      "Archaeology shows an earlier and wider background. A study published in 2025 of glass vessels, production waste and a crucible from early medieval San Pietro in Castello (Olivolo) found glass from Egypt and the Levant, and plant-ash glass as early as the eighth century. The authors suggest the site may have played a role in distributing and reworking imported raw materials.",
      "Later, analysis of sixty-one vessels of the twelfth to fifteenth centuries excavated on Murano showed a soda-rich plant ash probably from the Levant, and records show that Venice imported sand and raw glass from there as well. Venetian glass grew out of local work and constant contact with glassmaking cultures across the Mediterranean.",
    ],
    sources: [
      { label: "Gliozzo, Ferri & Braschi, Archaeological and Anthropological Sciences, 2025", url: "https://link.springer.com/article/10.1007/s12520-025-02317-0" },
      { label: "Occari, Freestone & Fenwick, Journal of Archaeological Science: Reports, 2021", url: "https://discovery.ucl.ac.uk/id/eprint/10126226/" },
      { label: "Museo del Vetro", url: "https://museovetro.visitmuve.it/approfondimenti/" },
    ],
  },
  {
    id: "murano",
    period: "1291 – c. 1450",
    title: "The move to Murano",
    body: [
      "In 1291 the Venetian authorities ordered glass furnaces out of the city centre to reduce the risk of fire, and Murano became the main centre of production. Workshops had already begun to settle there; the decree concentrated an industry that was already growing on the island.",
      "Glassmaking was a closely regulated craft. Statutes for the glassmakers existed in the thirteenth century, and in 1441 they were recast as the Mariegola dell’Arte dei verieri de Muran, which governed production, sales and the relations between owners, masters and workers. Membership of the guild was required to practise the craft.",
    ],
    sources: [
      { label: "Museo Correr: The adventure of glass", url: "https://archivio-correr.visitmuve.it/en/mostre-en/archivio-mostre-en/the-adventure-of-glass-a-millennium-of-venetian-art/2011/10/5801/dalle-origini-al-quattrocento-1/" },
      { label: "Museo del Vetro", url: "https://museovetro.visitmuve.it/approfondimenti/" },
    ],
  },
  {
    id: "renaissance",
    image: { src: "/images/reference/r002-enamelled-ewer-front.jpg", w: 1600, h: 2200, alt: "Blue glass ewer decorated with enamelled and gilded painting", caption: "Enamelled ewer, Venice, c. 1480", credit: "The Cleveland Museum of Art, 1944.257 · CC0" },
    period: "c. 1450 – 1700",
    title: "Cristallo and the Renaissance",
    body: [
      "Around the middle of the fifteenth century, Angelo Barovier became associated with cristallo: an exceptionally clear, nearly colourless glass named after rock crystal. It became a sought-after luxury among Europe’s elites.",
      "Renaissance glassmakers explored both clarity and decoration. Around 1500, enamel and gilding were painted onto vessels; in the sixteenth century filigrana set fine white or coloured threads into clear glass; and ever thinner blowing produced vessels of great lightness.",
      "Venetian influence travelled far beyond the lagoon. Glassmakers in France, England, the Low Countries and elsewhere made glass in the Venetian manner, façon de Venise, some of them emigrant Muranese. A historic piece in Venetian style was therefore not necessarily made in Venice.",
    ],
    sources: [
      { label: "Corning Museum of Glass: Venetian glass in the Renaissance", url: "https://renvenetian.cmog.org/chapter/period-pan-european-dominance" },
      { label: "National Gallery of Victoria: Liquid Light", url: "https://www.ngv.vic.gov.au/essay/liquid-light-500-years-of-venetian-glass/" },
    ],
  },
  {
    id: "eighteenth",
    image: { src: "/images/reference/r010-bellotto-piazza-san-marco.jpg", w: 2600, h: 1484, alt: "Painting of the Piazza San Marco in Venice, with the basilica on the left and the campanile in the centre", caption: "Bernardo Bellotto, Piazza San Marco, Venice", credit: "The Cleveland Museum of Art, 1962.169 · CC0" },
    period: "1700 – 1797",
    title: "The eighteenth century",
    body: [
      "New glass compositions from Bohemia and England, heavier and suited to cutting and engraving, challenged the light, elaborately worked glass of Murano. It was nevertheless a period of fine craftsmanship, including exceptionally intricate reticello.",
      "Giuseppe Briati received a privilege in 1737 and in 1739 permission to move his furnace from Murano to Venice; his workshop became known for multi-armed chandeliers. Others painted opaque white lattimo with enamel and gold in imitation of porcelain: the Miotti family were specialists, and in 1739 the Bertolini brothers received the exclusive right to decorate glass with gold.",
    ],
    sources: [
      { label: "Museo del Vetro: Glass of the 18th century", url: "https://museovetro.visitmuve.it/it/il-museo/percorsi-e-collezioni/vetro-xviii-secolo/" },
      { label: "Corning Museum of Glass: The eighteenth century", url: "https://renvenetian.cmog.org/chapter/18th-century-decline" },
    ],
  },
  {
    id: "revival",
    image: { src: "/images/reference/r023-sargent-venetian-glass-workers.jpg", w: 1686, h: 1083, alt: "Painting of a dim workshop where women sit working with bundles of long, pale glass rods", caption: "John Singer Sargent, Venetian Glass Workers, 1880–82", credit: "The Art Institute of Chicago, 1933.1217 · CC0" },
    period: "1797 – 1900",
    title: "The nineteenth-century revival",
    body: [
      "After the fall of the Republic in 1797 the industry was in deep crisis. Recovery came gradually: Domenico Bussolin revived filigrana in 1838, followed a few years later by Pietro Bigaglia, and Lorenzo Radi recovered chalcedony glass in 1856.",
      "Institutions mattered as much as workshops. Abbot Vincenzo Zanetti helped found the Murano Glass Museum in 1861 and a school for glassworkers in 1862. Fratelli Toso was founded in 1854; Antonio Salviati started a mosaic business in 1859 and, with English capital, a blown-glass company in 1866, whose work reached collectors abroad through international exhibitions.",
      "Archaeological finds also stimulated interest in ancient glass: Vincenzo Moretti produced some of the most important mosaic-glass (murrine) vessels of the revival.",
    ],
    sources: [
      { label: "Museo del Vetro: The nineteenth century", url: "https://museovetro.visitmuve.it/en/il-museo/layout-and-collections/glass-19th-century/" },
      { label: "The Wallace Collection: Venetian glass in context", url: "https://www.wallacecollection.org/explore/explore-in-depth/latest-films/venetian-glass-in-the-wallace-collection-in-context/" },
    ],
  },
  {
    id: "modern",
    period: "1900 – 2000",
    title: "The twentieth century",
    body: [
      "In the twentieth century Murano became a meeting place for glassmakers, artists and designers. In 1921 Giacomo Cappellin and Paolo Venini founded Cappellin Venini, with Vittorio Zecchin as artistic director. After the partners separated in 1925, Napoleone Martinuzzi brought a more sculptural approach to Venini, including the bubbled pulegoso glass.",
      "Elsewhere on the island Ercole Barovier created the crackled white Primavera glass of 1929–30. Carlo Scarpa’s work with Venini from 1932 to 1947 became a major chapter of modern glass design, shown at the Venice Biennale and the Milan Triennale.",
      "After the war, Flavio Poli’s thick-walled sommerso for Seguso Vetri d’Arte won a Compasso d’Oro in 1954 for the blue–ruby vase 9822. In 1979 the Murano master Lino Tagliapietra first taught at Pilchuck Glass School in the United States, helping to carry Venetian techniques into the international studio glass movement.",
    ],
    sources: [
      { label: "The Met: Venetian Glass by Carlo Scarpa, 1932–1947", url: "https://www.metmuseum.org/exhibitions/listings/2013/carlo-scarpa" },
      { label: "ADI Design Museum: Flavio Poli, vase 9822", url: "https://www.adidesignmuseum.org/en/collection/grande-vaso-in-vetro-blu-rubino-9822/" },
      { label: "Corning Museum of Glass: Lino Tagliapietra", url: "https://info.cmog.org/rakow-commission/lino-tagliapietra" },
    ],
  },
  {
    id: "today",
    period: "2000 – present",
    title: "Murano today",
    body: [
      "Murano remains a working centre of glassmaking within an international network of artists, designers, museums and collectors. The Venice Glass Week, first held in 2017, brings exhibitions, demonstrations and open furnaces together across Venice, Murano and Mestre; its tenth edition took place in September 2026.",
      "In 2020 UNESCO inscribed The art of glass beads, a joint nomination of Italy and France, on its Representative List of the Intangible Cultural Heritage of Humanity. In Italy the practice is centred on Venice and the lagoon islands.",
      "New materials continue to test old skills. The exhibition Murano: Upcycling Glass at the Museo del Vetro in 2023–24 asked fifteen Murano masters to work with recycled industrial glass, a material very different from their usual compositions.",
    ],
    sources: [
      { label: "The Venice Glass Week", url: "https://theveniceglassweek.com/en/about/" },
      { label: "UNESCO: The art of glass beads", url: "https://ich.unesco.org/en/RL/the-art-of-glass-beads-01591" },
      { label: "Museo del Vetro: Murano: Upcycling Glass", url: "https://museovetro.visitmuve.it/?p=20128" },
    ],
  },
];
