/**
 * Reference photography — open-access images from museum collections.
 *
 * Every image here shows an object or artwork held by the named museum, not by
 * MURANIQ. Each is released by that museum as CC0 (no rights reserved; see
 * docs/IMAGE-SOURCES.md for the record URL and licence of every file). They are
 * resized, converted to sRGB and stripped of metadata; otherwise unaltered.
 */
import type { MediaAsset } from "@/content/schemas";

type Spec = {
  id: string;
  artworkId: string;
  file: string;
  w: number;
  h: number;
  view: MediaAsset["viewType"];
  alt: string;
  caption?: string;
  credit: string;
  hotspots?: MediaAsset["hotspots"];
};

const CMA = (acc: string) => `The Cleveland Museum of Art, ${acc} · CC0`;
const AIC = (acc: string) => `The Art Institute of Chicago, ${acc} · CC0`;
const MET = (acc: string) => `The Metropolitan Museum of Art, ${acc} · CC0`;

const SPECS: Spec[] = [
  // R001 — Ewer, chalcedony glass, Venice, c. 1500 (CMA 1985.141)
  {
    id: "IMG-R001-FRONT", artworkId: "MUR-R001", file: "r001-chalcedony-ewer-front", w: 1711, h: 2200, view: "front",
    alt: "Ewer of marbled chalcedony glass in green, brown and blue, with a slender spout, a looped handle and a flared foot",
    credit: CMA("1985.141"),
    hotspots: [
      { x: 0.3, y: 0.36, label: "Spout mount", description: "A metal sleeve sheathes the spout. The museum record lists a silver mount." },
      { x: 0.52, y: 0.64, label: "Chalcedony veining", description: "Swirling bands of green, brown and blue run through the body. The pattern forms in the furnace, so no two pieces are alike." },
    ],
  },
  { id: "IMG-R001-SIDE", artworkId: "MUR-R001", file: "r001-chalcedony-ewer-side", w: 1771, h: 2200, view: "side", alt: "The chalcedony ewer turned to show the spout in profile", credit: CMA("1985.141") },
  { id: "IMG-R001-REVERSE", artworkId: "MUR-R001", file: "r001-chalcedony-ewer-reverse", w: 1678, h: 2200, view: "reverse", alt: "Reverse of the chalcedony ewer with the handle on the left", credit: CMA("1985.141") },
  { id: "IMG-R001-HANDLE", artworkId: "MUR-R001", file: "r001-chalcedony-ewer-handle", w: 1592, h: 2200, view: "detail", alt: "The chalcedony ewer seen from the handle side, showing the veining on the body", caption: "Handle side", credit: CMA("1985.141") },

  // R002 — Ewer, enamelled lapis-blue glass, Venice, c. 1480 (CMA 1944.257)
  {
    id: "IMG-R002-FRONT", artworkId: "MUR-R002", file: "r002-enamelled-ewer-front", w: 1600, h: 2200, view: "front",
    alt: "Dark blue glass ewer decorated with white enamel dots, gilding and a painted roundel on the body",
    credit: CMA("1944.257"),
    hotspots: [
      { x: 0.53, y: 0.55, label: "Painted roundel", description: "A roundel framed by rings of gilding and white enamel dots, painted on the dark blue body." },
      { x: 0.5, y: 0.19, label: "Neck", description: "Bands of gilding and enamel continue up the narrow neck to the rim." },
    ],
  },
  { id: "IMG-R002-REVERSE", artworkId: "MUR-R002", file: "r002-enamelled-ewer-reverse", w: 1653, h: 2200, view: "reverse", alt: "Reverse of the blue ewer with a second painted roundel", credit: CMA("1944.257") },
  { id: "IMG-R002-SIDE", artworkId: "MUR-R002", file: "r002-enamelled-ewer-side", w: 1433, h: 2200, view: "side", alt: "Side view of the blue ewer showing enamelled birds below the spout", credit: CMA("1944.257") },
  { id: "IMG-R002-HANDLE", artworkId: "MUR-R002", file: "r002-enamelled-ewer-handle", w: 1468, h: 2200, view: "detail", alt: "The blue ewer seen from the handle side", caption: "Handle side", credit: CMA("1944.257") },

  // R003 — The Peddler Goblet, Venice (Murano), 19th century (CMA 1953.364)
  { id: "IMG-R003-FRONT", artworkId: "MUR-R003", file: "r003-peddler-goblet-front", w: 1774, h: 2200, view: "front", alt: "Tall goblet with a flared bowl painted in enamel with figures in a landscape, on a ribbed dark blue foot", credit: CMA("1953.364") },
  { id: "IMG-R003-SIDE", artworkId: "MUR-R003", file: "r003-peddler-goblet-side", w: 1774, h: 2200, view: "side", alt: "The goblet turned to show further enamelled scenes on the bowl", credit: CMA("1953.364") },
  { id: "IMG-R003-REVERSE", artworkId: "MUR-R003", file: "r003-peddler-goblet-reverse", w: 1774, h: 2200, view: "reverse", alt: "Reverse of the goblet with the enamelled landscape continuing around the bowl", credit: CMA("1953.364") },
  { id: "IMG-R003-SIDE-2", artworkId: "MUR-R003", file: "r003-peddler-goblet-side-2", w: 1774, h: 2200, view: "detail", alt: "A further view of the goblet's enamelled bowl and gilded knop", caption: "Further view of the bowl", credit: CMA("1953.364") },

  // R004 — Tazza with a Frieze of Putti (CMA 1960.38)
  { id: "IMG-R004-FRONT", artworkId: "MUR-R004", file: "r004-putti-tazza-front", w: 2200, h: 1616, view: "front", alt: "Wide footed bowl of bright blue glass with a frieze of white enamelled putti around the bowl", credit: CMA("1960.38") },
  { id: "IMG-R004-REVERSE", artworkId: "MUR-R004", file: "r004-putti-tazza-reverse", w: 2200, h: 1616, view: "reverse", alt: "Reverse of the blue tazza showing more of the frieze of putti", credit: CMA("1960.38") },

  // R005 — Footed Bowl, Venice, 1850–99 (CMA 1962.423)
  { id: "IMG-R005-FRONT", artworkId: "MUR-R005", file: "r005-footed-bowl-front", w: 2200, h: 1948, view: "front", alt: "Footed bowl of blue glass painted in polychrome enamel with riders in a landscape, the foot decorated with gilt scrolls", credit: CMA("1962.423") },
  { id: "IMG-R005-SIDE", artworkId: "MUR-R005", file: "r005-footed-bowl-side", w: 2200, h: 1920, view: "side", alt: "The footed bowl turned to show a procession scene", credit: CMA("1962.423") },
  {
    id: "IMG-R005-MEDALLION", artworkId: "MUR-R005", file: "r005-footed-bowl-medallion", w: 2200, h: 1818, view: "detail",
    alt: "The footed bowl turned to show a profile portrait framed by concentric rings", caption: "Portrait roundel", credit: CMA("1962.423"),
    hotspots: [{ x: 0.5, y: 0.4, label: "Portrait roundel", description: "A profile portrait framed by concentric rings of enamel, set between the landscape scenes." }],
  },

  // R006 — Covered Beaker, Venice, c. 1490–1500 (CMA 1950.573)
  { id: "IMG-R006-FRONT", artworkId: "MUR-R006", file: "r006-covered-beaker-front", w: 1757, h: 2200, view: "front", alt: "Tall conical beaker of colourless glass with enamelled dots, a gilt crown-shaped rim mount, a cover and a gilt foot", credit: CMA("1950.573") },
  { id: "IMG-R006-SIDE", artworkId: "MUR-R006", file: "r006-covered-beaker-side", w: 1761, h: 2200, view: "side", alt: "Side view of the covered beaker", credit: CMA("1950.573") },
  { id: "IMG-R006-REVERSE", artworkId: "MUR-R006", file: "r006-covered-beaker-reverse", w: 1754, h: 2200, view: "reverse", alt: "Reverse of the covered beaker", credit: CMA("1950.573") },

  // R007 — Marriage Beaker, lattimo, Venice, late 1400s (CMA 1955.70)
  { id: "IMG-R007-FRONT", artworkId: "MUR-R007", file: "r007-marriage-beaker-front", w: 2077, h: 2200, view: "front", alt: "Small opaque white glass beaker with an enamelled portrait of a young woman in a blue roundel, surrounded by coloured dots", credit: CMA("1955.70") },
  { id: "IMG-R007-REVERSE", artworkId: "MUR-R007", file: "r007-marriage-beaker-reverse", w: 1982, h: 2200, view: "reverse", alt: "Reverse of the white beaker with an enamelled portrait of a young man", credit: CMA("1955.70") },

  // R008 — Bottle, chalcedony, probably Miotti Glasshouse, c. 1730 (AIC 2024.67)
  { id: "IMG-R008-FRONT", artworkId: "MUR-R008", file: "r008-chalcedony-bottle-front", w: 1650, h: 2200, view: "front", alt: "Bottle with a round body and long neck in dark chalcedony glass streaked with blue, green and red", credit: AIC("2024.67") },

  // R009 — Paperweight, Pietro Bigaglia, 1847 (AIC 1979.904)
  { id: "IMG-R009-TOP", artworkId: "MUR-R009", file: "r009-millefiori-paperweight-top", w: 1686, h: 1686, view: "front", alt: "Glass paperweight seen from above, filled with tightly packed millefiori canes and twisted ribbons in many colours", credit: AIC("1979.904") },

  // R010 — Bernardo Bellotto, Piazza San Marco, Venice, c. 1740 (CMA 1962.169)
  { id: "IMG-R010-FRONT", artworkId: "MUR-R010", file: "r010-bellotto-piazza-san-marco", w: 2600, h: 1484, view: "front", alt: "Painting of the Piazza San Marco in Venice under a pale sky, with the basilica on the left, the campanile in the centre and small figures across the square", credit: CMA("1962.169") },

  // R011 — Francesco Guardi, Pontifical Ceremony, c. 1783 (CMA 1949.187.2)
  { id: "IMG-R011-FRONT", artworkId: "MUR-R011", file: "r011-guardi-pontifical-ceremony", w: 2600, h: 1929, view: "front", alt: "Painting of a vast church interior with tall red columns and a crowded ceremony before the altar", credit: CMA("1949.187.2") },

  // R012 — Millefiori Bowl, Roman, 1–100 CE (CMA 1919.10)
  { id: "IMG-R012-FRONT", artworkId: "MUR-R012", file: "r012-millefiori-bowl-front", w: 2200, h: 1571, view: "front", alt: "Small shallow bowl made of fused mosaic glass discs in purple, white and yellow", credit: CMA("1919.10") },
  { id: "IMG-R012-INTERIOR", artworkId: "MUR-R012", file: "r012-millefiori-bowl-interior", w: 2200, h: 2108, view: "detail", alt: "The millefiori bowl seen from above, showing the pattern of fused glass discs inside", caption: "Interior seen from above", credit: CMA("1919.10") },
  { id: "IMG-R012-BASE", artworkId: "MUR-R012", file: "r012-millefiori-bowl-base", w: 2200, h: 2071, view: "base", alt: "Underside of the millefiori bowl with its foot ring", credit: CMA("1919.10") },

  // R013 — Beaker, chalcedony and aventurine glass, c. 1730 (AIC 2024.68)
  { id: "IMG-R013-FRONT", artworkId: "MUR-R013", file: "r013-chalcedony-aventurine-beaker-front", w: 1650, h: 2200, view: "front", alt: "Small flared beaker of chalcedony glass with swirling brown, green and gold veins on a low foot", credit: AIC("2024.68") },

  // R014 — Glass chevron bead, Venetian, 18th century (Met 17.194.1070)
  { id: "IMG-R014-FRONT", artworkId: "MUR-R014", file: "r014-chevron-bead-front", w: 1996, h: 2088, view: "front", alt: "Faceted oval glass bead in black and dark red, with a yellow zigzag band running around its middle", credit: MET("17.194.1070") },

  // R015 — Goblet, vetro a retorti, Venice, late 16th century (Met 1975.1.1147)
  { id: "IMG-R015-FRONT", artworkId: "MUR-R015", file: "r015-filigree-goblet-front", w: 1291, h: 2000, view: "front", alt: "Tall goblet with a trumpet-shaped bowl, a small knop and a wide foot, made entirely of clear glass with fine spiralling white threads", credit: MET("1975.1.1147") },
  { id: "IMG-R015-SIDE", artworkId: "MUR-R015", file: "r015-filigree-goblet-side", w: 1736, h: 2200, view: "side", alt: "The filigree goblet photographed against a grey background, showing the white threads crossing the bowl in diagonal lines", credit: MET("1975.1.1147") },

  // R016 — Vase, vetro a retorti and reticello, Venice, early 17th century (Met 1975.1.1199)
  { id: "IMG-R016-FRONT", artworkId: "MUR-R016", file: "r016-reticello-vase-front", w: 1475, h: 2000, view: "front", alt: "Black-and-white photograph of a vase with a flattened, ribbed body of white filigree glass, a narrow neck and two scrolled handles", credit: MET("1975.1.1199") },
  { id: "IMG-R016-HANDLE", artworkId: "MUR-R016", file: "r016-reticello-vase-handle", w: 1485, h: 2000, view: "detail", alt: "Close view of a scrolled handle striped with white threads, against the diagonal threads of the vase body", caption: "Scrolled handle", credit: MET("1975.1.1199") },

  // R017 — Pilgrim flask, enamelled and gilt, Venice, c. 1500–1525 (Met 1975.1.1167)
  { id: "IMG-R017-FRONT", artworkId: "MUR-R017", file: "r017-enamelled-pilgrim-flask-front", w: 1743, h: 2200, view: "front", alt: "Flat round flask of clear glass with a narrow neck, decorated with a large enamelled rosette in blue, white and gold", credit: MET("1975.1.1167") },
  { id: "IMG-R017-NECK", artworkId: "MUR-R017", file: "r017-enamelled-pilgrim-flask-neck", w: 1201, h: 2000, view: "detail", alt: "Black-and-white detail of the flask's neck with a band of enamelled dots and pendant drops", caption: "Neck", credit: MET("1975.1.1167") },

  // R018 — Large murrine bowl, Venezia-Murano Company, c. 1880 (Met 81.8.246)
  { id: "IMG-R018-FRONT", artworkId: "MUR-R018", file: "r018-murrine-bowl-front", w: 1961, h: 1691, view: "front", alt: "Wide shallow bowl of mosaic glass in blue, amber and white swirls, with a dark brown rim", credit: MET("81.8.246") },
  { id: "IMG-R018-DETAIL", artworkId: "MUR-R018", file: "r018-murrine-bowl-detail", w: 1949, h: 1826, view: "detail", alt: "Close view of the bowl's surface: fused slices of glass in blue and white spirals, with one translucent ring", caption: "Fused murrine slices", credit: MET("81.8.246") },

  // R019 — Dessert glass(?), opalescent, Venice, probably late 17th century (Met 1975.1.1155)
  { id: "IMG-R019-FRONT", artworkId: "MUR-R019", file: "r019-opalescent-dessert-glass-front", w: 1335, h: 2000, view: "front", alt: "Black-and-white photograph of a stemmed glass with a ribbed, flaring bowl, a crimped collar and a knopped stem", credit: MET("1975.1.1155") },

  // R020 — Liqueur glass, vetro a retorti with aventurine, Venice, late 19th century (Met 1975.1.1152)
  { id: "IMG-R020-FRONT", artworkId: "MUR-R020", file: "r020-filigree-liqueur-glass-front", w: 1491, h: 2000, view: "front", alt: "Black-and-white photograph of a small stemmed glass with a rounded bowl striped by spiralling white threads, on a twisted stem", credit: MET("1975.1.1152") },

  // R021 — Standing cup, enamelled and gilded, Venice, late 1400s (CMA 1949.176)
  { id: "IMG-R021-FRONT", artworkId: "MUR-R021", file: "r021-enamelled-standing-cup-front", w: 1662, h: 2200, view: "front", alt: "Standing cup of clear glass with a deep bowl banded in gilding and coloured enamel dots, on a ribbed knop and a wide foot", credit: CMA("1949.176") },
  { id: "IMG-R021-SIDE", artworkId: "MUR-R021", file: "r021-enamelled-standing-cup-side", w: 1666, h: 2200, view: "side", alt: "The standing cup turned slightly, showing the gilt decoration on the lower bowl", credit: CMA("1949.176") },

  // R022 — Devotional badge with Saint James, Venice, c. 1200–1250 (CMA 1985.146)
  { id: "IMG-R022-FRONT", artworkId: "MUR-R022", file: "r022-devotional-badge-front", w: 2181, h: 2200, view: "front", alt: "Small oval badge of moulded green glass showing a standing saint between two smaller kneeling figures", credit: CMA("1985.146") },
  { id: "IMG-R022-REVERSE", artworkId: "MUR-R022", file: "r022-devotional-badge-reverse", w: 2124, h: 2136, view: "reverse", alt: "Back of the green glass badge, with the museum's accession number painted in red", credit: CMA("1985.146") },

  // R023 — John Singer Sargent, Venetian Glass Workers, 1880–82 (AIC 1933.1217)
  { id: "IMG-R023-FRONT", artworkId: "MUR-R023", file: "r023-sargent-venetian-glass-workers", w: 1686, h: 1083, view: "front", alt: "Painting of a dim workshop where several women sit working with bundles of long, pale glass rods, light falling from a window at the upper left", credit: AIC("1933.1217") },

  // R024 — Robert Frederick Blum, Bead Stringers, Venice, 1886 (AIC 1906.104)
  { id: "IMG-R024-FRONT", artworkId: "MUR-R024", file: "r024-blum-bead-stringers", w: 1686, h: 2458, view: "front", alt: "Etching of two young women seated side by side at work, one raising her arms above her head, a bottle on a shelf behind them", credit: AIC("1906.104") },

  // R025 — Footed bowl, chalcedony glass, Venice, c. 1500 (Met 1975.1.1196)
  { id: "IMG-R025-FRONT", artworkId: "MUR-R025", file: "r028-chalcedony-footed-bowl-front", w: 2200, h: 1722, view: "front", alt: "Wide footed bowl of deep red glass swirled with blue, purple and white marbling on a short stem", credit: MET("1975.1.1196") },

  // Draft fixture (must never be public)
  { id: "IMG-D007-FRONT", artworkId: "MUR-D007", file: "d001-beaker-draft", w: 1113, h: 1400, view: "front", alt: "Conical beaker of colourless glass with enamelled dots and a gilt foot", credit: CMA("1950.573.a") },
];

export const referenceMedia: MediaAsset[] = SPECS.map((s) => ({
  id: s.id,
  artworkId: s.artworkId,
  viewType: s.view,
  src: `/images/reference/${s.file}.jpg`,
  width: s.w,
  height: s.h,
  alt: s.alt,
  caption: s.caption,
  credit: s.credit,
  rights: "public_domain",
  rightsCleared: true,
  hotspots: s.hotspots ?? [],
}));
