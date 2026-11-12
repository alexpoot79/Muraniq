/**
 * The collection data sheet: one row per object, filled in by the owner.
 *
 * The column list is shared by the template generator and the importer, so the
 * sheet Alex fills in and the sheet the importer reads can never drift apart.
 * Headers are Dutch (the owner's language); every value that reaches the public
 * site (title, colours, description, condition, period) is written in English.
 *
 * Pure functions only — no file or image access — so all of it is unit-tested.
 */
import type { Availability, CategorySlug, Certainty, ViewType } from "../../src/content/schemas/index.ts";

export type ColumnKey =
  | "id"
  | "publish"
  | "highlight"
  | "category"
  | "objectType"
  | "title"
  | "techniques"
  | "colours"
  | "materials"
  | "heightCm"
  | "widthCm"
  | "depthCm"
  | "diameterCm"
  | "weightG"
  | "maker"
  | "basis"
  | "sourceText"
  | "period"
  | "country"
  | "signature"
  | "signatureText"
  | "signatureLocation"
  | "label"
  | "labelText"
  | "labelLocation"
  | "condition"
  | "description"
  | "availability"
  | "photoOrder"
  | "internalNote";

export type ColumnGroup = "basis" | "maten" | "toeschrijving" | "merken" | "tekst" | "intern";

export type Column = {
  key: ColumnKey;
  header: string;
  /** Short hint shown in the second row of the template. */
  hint: string;
  /** Longer explanation for the "Uitleg" sheet. */
  help: string;
  group: ColumnGroup;
  width: number;
  /** Dropdown values; "techniques" is filled from the site's technique list. */
  list?: readonly string[] | "techniques";
  /** Whether the dropdown may be overruled by typing another value. */
  listIsStrict?: boolean;
};

export const YES_NO = ["ja", "nee"] as const;

export const CATEGORY_CHOICES: Record<CategorySlug, string> = {
  "murano-glass": "Murano Glass",
  "other-glass": "Other Glass",
  "collectible-objects": "Collectible Objects",
};

export const AVAILABILITY_CHOICES: Record<Availability, string> = {
  private_collection: "Private collection",
  enquiries_welcome: "Enquiries welcome",
  reserved: "Reserved",
  sold: "Sold",
};

/** How the owner knows who made it. Each maps to one certainty, explained on the site. */
export const BASIS_CHOICES = ["Onbekend", "Signatuur", "Etiket", "Documentatie", "Stijl en vergelijking"] as const;
export type Basis = "unknown" | "signature" | "label" | "documented" | "style";

export const OBJECT_TYPES = [
  "Vase",
  "Bowl",
  "Dish",
  "Plate",
  "Sculpture",
  "Figure",
  "Animal figure",
  "Paperweight",
  "Ashtray",
  "Bottle",
  "Decanter",
  "Drinking glass",
  "Goblet",
  "Jug",
  "Candlestick",
  "Lamp",
  "Centrepiece",
  "Box",
  "Beads",
  "Jewellery",
  "Mirror",
  "Other",
] as const;

/** Open forms: the second photograph looks into the object from above instead of at its back. */
const OPEN_FORMS = new Set(["bowl", "dish", "plate", "ashtray", "centrepiece", "tray", "coupe", "paperweight"]);

export const COLUMNS: readonly Column[] = [
  { key: "id", header: "Object-ID", hint: "zoals op het kaartje", help: "Het nummer van het ID-kaartje dat u bij dit object fotografeert (M007, M008 …). Staat al ingevuld.", group: "basis", width: 11 },
  { key: "publish", header: "Publiceren", hint: "ja / nee", help: "ja = zichtbaar op de site na goedkeuring van de preview. nee (of leeg) = alleen als concept, niet openbaar.", group: "basis", width: 11, list: YES_NO, listIsStrict: true },
  { key: "highlight", header: "Uitgelicht", hint: "ja / nee", help: "ja = hoort bij de selectie hoogtepunten (startpagina, bovenaan de collectie).", group: "basis", width: 11, list: YES_NO, listIsStrict: true },
  { key: "category", header: "Collectiegebied", hint: "kies", help: "Murano Glass, Other Glass of Collectible Objects.", group: "basis", width: 19, list: Object.values(CATEGORY_CHOICES), listIsStrict: true },
  { key: "objectType", header: "Objectsoort", hint: "kies of typ (Engels)", help: "Vase, Bowl, Sculpture … Een andere soort mag u zelf typen, in het Engels.", group: "basis", width: 16, list: OBJECT_TYPES },
  { key: "title", header: "Titel", hint: "Engels; leeg = automatisch", help: "Leeg laten mag: dan wordt de titel gemaakt uit techniek, soort en kleur, bijv. 'Sommerso vase in green'. De webadres van het object blijft daarna vast, ook als u de titel later wijzigt.", group: "basis", width: 30 },
  { key: "techniques", header: "Techniek", hint: "kies; meer: komma's", help: "De techniek(en) zoals in de Glass Guide. Meerdere technieken scheiden met een komma, bijv. 'Sommerso, Facet-cut glass'. Een techniek die nog geen pagina heeft wordt gemeld en (nog) niet getoond.", group: "basis", width: 22, list: "techniques" },
  { key: "colours", header: "Kleuren", hint: "Engels, komma's", help: "Bijv. 'green, yellow, colourless'. Hoofdkleur eerst.", group: "basis", width: 22 },
  { key: "materials", header: "Materiaal", hint: "leeg = Glass", help: "Leeg = 'Glass' bij glas. Anders in het Engels, bijv. 'Glass, gold leaf'.", group: "basis", width: 16 },
  { key: "heightCm", header: "Hoogte (cm)", hint: "bijv. 24,5", help: "In centimeters; komma of punt mag. Leeg = niet gemeten (er wordt nooit 0 getoond).", group: "maten", width: 11 },
  { key: "widthCm", header: "Breedte (cm)", hint: "", help: "In centimeters.", group: "maten", width: 11 },
  { key: "depthCm", header: "Diepte (cm)", hint: "", help: "In centimeters.", group: "maten", width: 11 },
  { key: "diameterCm", header: "Diameter (cm)", hint: "", help: "In centimeters, bij ronde vormen in plaats van breedte/diepte.", group: "maten", width: 12 },
  { key: "weightG", header: "Gewicht (g)", hint: "optioneel", help: "In grammen.", group: "maten", width: 11 },
  { key: "maker", header: "Maker / glasblazerij", hint: "leeg = onbekend", help: "Naam van de ontwerper, glasblazer of glasblazerij. Leeg laten als het niet bekend is: dan staat er 'Maker not documented'.", group: "toeschrijving", width: 24 },
  { key: "basis", header: "Basis toeschrijving", hint: "kies", help: "Waarop de maker berust. Signatuur of Etiket = 'Probable'; Documentatie (met bron) = 'Documented attribution'; Stijl en vergelijking = 'Hypothesis'. Een signatuur alleen is geen bewijs; de site legt dat uit.", group: "toeschrijving", width: 20, list: BASIS_CHOICES, listIsStrict: true },
  { key: "sourceText", header: "Bron", hint: "bij Documentatie; openbaar", help: "Alleen bij Documentatie: welke bron, in het Engels, bijv. 'Seguso Vetri d'Arte catalogue 1958, plate 12'. Dit wordt gepubliceerd: geen prijzen of persoonsgegevens.", group: "toeschrijving", width: 26 },
  { key: "period", header: "Periode", hint: "bijv. c. 1960, 1950s", help: "Bijv. '1962', 'c. 1960', '1950s', '1955-1965', '20th century'. 'ca.' en 'jaren 50' worden omgezet. Leeg = 'Not documented'.", group: "toeschrijving", width: 14 },
  { key: "country", header: "Land", hint: "leeg = Italy bij Murano", help: "Leeg = Italy bij Murano Glass. Anders in het Engels.", group: "toeschrijving", width: 12 },
  { key: "signature", header: "Signatuur", hint: "ja / nee", help: "ja = er is een signatuur; maak dan foto 4 van de signatuur.", group: "merken", width: 10, list: YES_NO, listIsStrict: true },
  { key: "signatureText", header: "Signatuur: tekst", hint: "zoals gelezen", help: "Letterlijk wat er staat, '/' voor een nieuwe regel, […] voor een onleesbaar deel. Bijv. 'Seguso / Murano'.", group: "merken", width: 20 },
  { key: "signatureLocation", header: "Signatuur: plaats", hint: "leeg = base", help: "Waar de signatuur staat, in het Engels. Leeg = 'base' (onderkant).", group: "merken", width: 14 },
  { key: "label", header: "Etiket", hint: "ja / nee", help: "ja = er zit een (papier- of folie)etiket op; maak dan een foto van het etiket na de signatuur.", group: "merken", width: 9, list: YES_NO, listIsStrict: true },
  { key: "labelText", header: "Etiket: tekst", hint: "zoals gelezen", help: "Letterlijk wat er op het etiket staat.", group: "merken", width: 20 },
  { key: "labelLocation", header: "Etiket: plaats", hint: "leeg = base", help: "Waar het etiket zit, in het Engels. Leeg = 'base'.", group: "merken", width: 14 },
  { key: "condition", header: "Conditie", hint: "Engels, optioneel", help: "Bijv. 'Small chip to the foot rim; light wear to the base.'", group: "tekst", width: 26 },
  { key: "description", header: "Beschrijving", hint: "Engels, optioneel", help: "Eén of meer alinea's (Alt+Enter voor een nieuwe alinea). Leeg = een korte feitelijke tekst uit de andere kolommen. Mag ook in het Nederlands: Claude vertaalt het bij de import en u controleert het in de preview.", group: "tekst", width: 40 },
  { key: "availability", header: "Beschikbaarheid", hint: "leeg = Private collection", help: "Private collection, Enquiries welcome, Reserved of Sold.", group: "tekst", width: 19, list: Object.values(AVAILABILITY_CHOICES), listIsStrict: true },
  { key: "photoOrder", header: "Afwijkende fotovolgorde", hint: "alleen als nodig", help: "Alleen invullen als u van de vaste volgorde bent afgeweken, bijv. 'front, base, detail, signature'. Woorden: front, reverse, top, side, base, signature, label, detail.", group: "intern", width: 22 },
  { key: "internalNote", header: "Interne notitie", hint: "wordt NIET geïmporteerd", help: "Voor uzelf. Wordt nooit gepubliceerd of geïmporteerd. Zet hier geen prijzen of verzekeringswaarden; die horen in een apart, privé bestand.", group: "intern", width: 26 },
];

export const COLUMN_BY_KEY = new Map(COLUMNS.map((c) => [c.key, c]));

/* ------------------------------------------------------------------ */
/* Cell parsing                                                        */
/* ------------------------------------------------------------------ */

export type Problem = { level: "error" | "warning"; id?: string; row?: number; message: string };

const normaliseHeader = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9]/g, "");

/** Maps header cells to column keys; unknown headers are ignored, so extra columns of the owner's own do no harm. */
export function mapHeaders(cells: readonly string[]): Map<number, ColumnKey> {
  const byHeader = new Map<string, ColumnKey>();
  for (const c of COLUMNS) {
    byHeader.set(normaliseHeader(c.header), c.key);
    byHeader.set(normaliseHeader(c.key), c.key);
  }
  const out = new Map<number, ColumnKey>();
  cells.forEach((cell, i) => {
    const key = byHeader.get(normaliseHeader(cell ?? ""));
    if (key) out.set(i, key);
  });
  return out;
}

/** "M7", "m007", "MUR-M007" → "MUR-M007". Null when the cell is not an object id. */
export function normaliseId(raw: string): string | null {
  const m = /^(?:mur-)?m-?0*(\d{1,4})$/i.exec(raw.trim());
  if (!m) return null;
  return `MUR-M${m[1]!.padStart(3, "0")}`;
}

/** Short form used on the cards and in file names: MUR-M007 → M007. */
export const shortId = (id: string) => id.replace(/^MUR-/, "");

export function parseYesNo(raw: string): boolean | undefined {
  const v = raw.trim().toLowerCase();
  if (!v) return undefined;
  if (["ja", "j", "yes", "y", "x", "1", "true", "waar"].includes(v)) return true;
  if (["nee", "n", "no", "0", "false", "onwaar", "-"].includes(v)) return false;
  throw new Error(`'${raw}' is geen ja of nee`);
}

/** Centimetres with a decimal comma or point → millimetres. "24,5" → 245. */
export function parseCmToMm(raw: string): number | undefined {
  const v = raw.trim().replace(/\s*cm$/i, "").replace(",", ".");
  if (!v) return undefined;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`'${raw}' is geen maat in centimeters`);
  return Math.round(n * 10);
}

export function parseGrams(raw: string): number | undefined {
  const v = raw.trim().replace(/\s*g(ram)?$/i, "").replace(/\./g, "").replace(",", ".");
  if (!v) return undefined;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`'${raw}' is geen gewicht in grammen`);
  return Math.round(n);
}

export const splitList = (raw: string) =>
  raw
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

function matchChoice<T extends string>(raw: string, choices: Record<T, string>, extra: Record<string, T> = {}): T {
  const v = normaliseHeader(raw);
  for (const [key, label] of Object.entries(choices) as Array<[T, string]>) {
    if (normaliseHeader(label) === v || normaliseHeader(key) === v) return key;
  }
  if (extra[v]) return extra[v]!;
  throw new Error(`'${raw}' is geen keuze uit de lijst (${Object.values(choices).join(", ")})`);
}

export const parseCategory = (raw: string): CategorySlug =>
  matchChoice(raw, CATEGORY_CHOICES, { muranoglas: "murano-glass", ander: "other-glass", overigglas: "other-glass", anderglas: "other-glass", objecten: "collectible-objects" });

export const parseAvailability = (raw: string): Availability =>
  matchChoice(raw, AVAILABILITY_CHOICES, {
    privecollectie: "private_collection",
    prive: "private_collection",
    tekoop: "enquiries_welcome",
    opaanvraag: "enquiries_welcome",
    gereserveerd: "reserved",
    verkocht: "sold",
  });

export function parseBasis(raw: string): Basis {
  const v = normaliseHeader(raw);
  if (!v || v === "onbekend" || v === "unknown") return "unknown";
  if (v.startsWith("signatu") || v === "signed") return "signature";
  if (v.startsWith("etiket") || v === "label") return "label";
  if (v.startsWith("document")) return "documented";
  if (v.startsWith("stijl") || v.startsWith("style") || v.startsWith("vergelijk")) return "style";
  throw new Error(`'${raw}' is geen keuze uit de lijst (${BASIS_CHOICES.join(", ")})`);
}

export const BASIS_CERTAINTY: Record<Basis, Certainty> = {
  unknown: "unknown",
  signature: "probable",
  label: "probable",
  documented: "documented_attribution",
  style: "hypothesis",
};

export const BASIS_NOTE: Record<Basis, string> = {
  unknown: "No maker, glasshouse or date has been documented for this piece yet.",
  signature:
    "Based on the signature on the object. A signature supports an attribution but does not prove it on its own.",
  label:
    "Based on the label on the object. Labels can be moved or added later, so they support an attribution without proving it.",
  documented: "Based on the documentation cited below.",
  style: "Proposed on grounds of style and comparison with documented pieces. Not documented.",
};

export type ParsedPeriod = { displayLabel: string; fromYear?: number; toYear?: number; recognised: boolean };

const ORDINAL = (n: number) => (n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] ?? "th");

/**
 * A period as the owner writes it → the label shown on the site plus the
 * years used for sorting and the period filter. Nothing is widened or guessed:
 * "c. 1960" sorts as 1960, "1950s" as 1950–1959.
 */
export function parsePeriod(raw: string): ParsedPeriod | undefined {
  let v = raw.trim().replace(/[‐-―]/g, "-").replace(/\s+/g, " ");
  if (!v) return undefined;
  const approx = /^(?:circa|ca\.?|c\.?|omstreeks|rond|about)\s*/i;
  const isApprox = approx.test(v);
  v = v.replace(approx, "");
  const prefix = isApprox ? "c. " : "";

  let m = /^(\d{4})$/.exec(v);
  if (m) {
    const y = Number(m[1]);
    return { displayLabel: `${prefix}${y}`, fromYear: y, toYear: y, recognised: true };
  }
  m = /^(\d{4}) ?- ?(\d{2}|\d{4})$/.exec(v);
  if (m) {
    const from = Number(m[1]);
    const to = m[2]!.length === 2 ? Math.floor(from / 100) * 100 + Number(m[2]) : Number(m[2]);
    if (to >= from) return { displayLabel: `${prefix}${from}–${to}`, fromYear: from, toYear: to, recognised: true };
  }
  m = /^(\d{3})0 ?'?s$/i.exec(v) ?? /^jaren ?'?(?:(\d{2})|(\d{3})0)$/i.exec(v);
  if (m) {
    const decade = m[1] && m[1].length === 3 ? Number(m[1]) * 10 : m[1] ? 1900 + Number(m[1]) : Number(m[2]) * 10;
    return { displayLabel: `${prefix}${decade}s`, fromYear: decade, toYear: decade + 9, recognised: true };
  }
  m = /^(\d{2}) ?(?:st|nd|rd|th|e|ste|de)? (?:century|eeuw)$/i.exec(v);
  if (m) {
    const c = Number(m[1]);
    return { displayLabel: `${prefix}${c}${ORDINAL(c)} century`, fromYear: (c - 1) * 100 + 1, toYear: c * 100, recognised: true };
  }
  return { displayLabel: raw.trim(), recognised: false };
}

/* ------------------------------------------------------------------ */
/* Rows                                                                */
/* ------------------------------------------------------------------ */

export type IntakeRow = {
  row: number;
  id: string;
  publish?: boolean;
  highlight?: boolean;
  category?: CategorySlug;
  objectType?: string;
  title?: string;
  techniques: string[];
  colours: string[];
  materials: string[];
  dimensions: { heightMm?: number; widthMm?: number; depthMm?: number; diameterMm?: number; weightG?: number };
  maker?: string;
  basis?: Basis;
  sourceText?: string;
  period?: ParsedPeriod;
  country?: string;
  signature?: boolean;
  signatureText?: string;
  signatureLocation?: string;
  label?: boolean;
  labelText?: string;
  labelLocation?: string;
  condition?: string;
  description?: string[];
  availability?: Availability;
  photoOrder?: ViewType[];
};

export const PHOTO_VIEWS: Record<string, ViewType> = {
  front: "front",
  voor: "front",
  voorkant: "front",
  reverse: "reverse",
  back: "reverse",
  achter: "reverse",
  achterkant: "reverse",
  top: "top",
  boven: "top",
  bovenkant: "top",
  side: "side",
  zij: "side",
  zijkant: "side",
  base: "base",
  onder: "base",
  onderkant: "base",
  bodem: "base",
  signature: "signature",
  signatuur: "signature",
  label: "label",
  etiket: "label",
  detail: "detail",
  context: "context",
};

export function parsePhotoOrder(raw: string): ViewType[] | undefined {
  const parts = splitList(raw);
  if (!parts.length) return undefined;
  return parts.map((p) => {
    const v = PHOTO_VIEWS[p.toLowerCase()];
    if (!v) throw new Error(`'${p}' is geen bekende foto (front, reverse, top, side, base, signature, label, detail)`);
    return v;
  });
}

const text = (v: string) => (v.trim() ? v.trim() : undefined);

/**
 * Turns one sheet row (cell text by column key) into an IntakeRow. Every cell
 * problem is reported, not just the first, so the owner can fix a row in one go.
 */
export function parseRow(cells: Partial<Record<ColumnKey, string>>, row: number): { value?: IntakeRow; problems: Problem[] } {
  const problems: Problem[] = [];
  const get = (k: ColumnKey) => (cells[k] ?? "").toString();
  const id = normaliseId(get("id"));
  if (!id) return { problems: [] };
  const sid = shortId(id);
  const attempt = <T>(k: ColumnKey, fn: (raw: string) => T): T | undefined => {
    try {
      return fn(get(k));
    } catch (e) {
      problems.push({ level: "error", id: sid, row, message: `${COLUMN_BY_KEY.get(k)!.header}: ${(e as Error).message}` });
      return undefined;
    }
  };
  const dims = {
    heightMm: attempt("heightCm", parseCmToMm),
    widthMm: attempt("widthCm", parseCmToMm),
    depthMm: attempt("depthCm", parseCmToMm),
    diameterMm: attempt("diameterCm", parseCmToMm),
    weightG: attempt("weightG", parseGrams),
  };
  const period = parsePeriod(get("period"));
  if (period && !period.recognised)
    problems.push({ level: "warning", id: sid, row, message: `Periode '${period.displayLabel}' wordt letterlijk getoond (niet herkend als jaartal); controleer of het Engels is.` });

  const value: IntakeRow = {
    row,
    id,
    publish: attempt("publish", parseYesNo),
    highlight: attempt("highlight", parseYesNo),
    category: text(get("category")) ? attempt("category", parseCategory) : undefined,
    objectType: text(get("objectType")),
    title: text(get("title")),
    techniques: splitList(get("techniques")),
    colours: splitList(get("colours")).map((c) => c.toLowerCase()),
    materials: splitList(get("materials")),
    dimensions: Object.fromEntries(Object.entries(dims).filter(([, v]) => v !== undefined)) as IntakeRow["dimensions"],
    maker: text(get("maker")),
    basis: text(get("basis")) ? attempt("basis", parseBasis) : undefined,
    sourceText: text(get("sourceText")),
    period,
    country: text(get("country")),
    signature: attempt("signature", parseYesNo),
    signatureText: text(get("signatureText")),
    signatureLocation: text(get("signatureLocation")),
    label: attempt("label", parseYesNo),
    labelText: text(get("labelText")),
    labelLocation: text(get("labelLocation")),
    condition: text(get("condition")),
    description: text(get("description"))
      ?.split(/\r?\n+/)
      .map((p) => p.trim())
      .filter(Boolean),
    availability: text(get("availability")) ? attempt("availability", parseAvailability) : undefined,
    photoOrder: attempt("photoOrder", parsePhotoOrder),
  };
  if (value.signatureText && value.signature === undefined) value.signature = true;
  if (value.labelText && value.label === undefined) value.label = true;
  if (value.basis === "documented" && !value.sourceText)
    problems.push({ level: "error", id: sid, row, message: "Basis 'Documentatie' heeft een Bron nodig." });
  if (value.basis && value.basis !== "unknown" && !value.maker)
    problems.push({ level: "error", id: sid, row, message: `Basis '${get("basis")}' ingevuld, maar geen maker.` });
  if (value.maker && (!value.basis || value.basis === "unknown"))
    problems.push({ level: "error", id: sid, row, message: "Maker ingevuld: kies ook de basis van de toeschrijving (Signatuur, Etiket, Documentatie of Stijl en vergelijking)." });
  if (value.basis === "signature" && value.signature === false)
    problems.push({ level: "warning", id: sid, row, message: "Basis is 'Signatuur', maar Signatuur staat op nee." });
  if (value.basis === "label" && value.label === false)
    problems.push({ level: "warning", id: sid, row, message: "Basis is 'Etiket', maar Etiket staat op nee." });
  return { value, problems };
}

/** True when a row holds nothing but its (pre-filled) id. */
export function isBlankRow(cells: Partial<Record<ColumnKey, string>>): boolean {
  return Object.entries(cells).every(([k, v]) => k === "id" || k === "internalNote" || !String(v ?? "").trim());
}

/* ------------------------------------------------------------------ */
/* Photograph order                                                    */
/* ------------------------------------------------------------------ */

export const isOpenForm = (objectType: string | undefined) =>
  !!objectType && OPEN_FORMS.has(objectType.trim().toLowerCase());

/**
 * The fixed shooting order after the ID card:
 *   1 front · 2 reverse (or top, for open forms) · 3 base ·
 *   4 signature (if any) · 5 label (if any) · then details.
 * An explicit order in the sheet wins; extra photographs become details.
 */
export function viewsForSequence(
  count: number,
  opts: { objectType?: string; signature?: boolean; label?: boolean; photoOrder?: ViewType[] },
): ViewType[] {
  const planned: ViewType[] = opts.photoOrder?.length
    ? [...opts.photoOrder]
    : [
        "front",
        isOpenForm(opts.objectType) ? "top" : "reverse",
        "base",
        ...(opts.signature ? (["signature"] as const) : []),
        ...(opts.label ? (["label"] as const) : []),
      ];
  return Array.from({ length: count }, (_, i) => planned[i] ?? "detail");
}

/* ------------------------------------------------------------------ */
/* Public wording                                                      */
/* ------------------------------------------------------------------ */

const NEUTRAL_COLOURS = new Set(["colourless", "clear", "colorless", "transparent", "kleurloos"]);

export function joinAnd(items: readonly string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** "Sommerso vase in green and yellow" — only from the owner's own data. */
export function autoTitle(row: Pick<IntakeRow, "objectType" | "colours">, techniqueTerm?: string): string {
  const type = (row.objectType ?? "Object").trim();
  const base = techniqueTerm ? `${techniqueTerm} ${type.toLowerCase()}` : type;
  const colours = row.colours.filter((c) => !NEUTRAL_COLOURS.has(c)).slice(0, 2);
  const title = colours.length ? `${base} in ${joinAnd(colours)}` : base;
  return title.charAt(0).toUpperCase() + title.slice(1);
}

export function autoSummary(row: Pick<IntakeRow, "objectType" | "colours">, techniqueTerm?: string): string {
  const type = (row.objectType ?? "object").trim().toLowerCase();
  const article = /^[aeiou]/.test(type) ? "An" : "A";
  const colours = row.colours.filter((c) => !NEUTRAL_COLOURS.has(c));
  const tech = techniqueTerm ? ` in ${techniqueTerm.toLowerCase()} glass` : "";
  const col = colours.length ? `, in ${joinAnd(colours)}` : "";
  return `${article} ${type}${tech} from the MURANIQ collection${col}.`;
}

const VIEW_PHRASE: Record<ViewType, string> = {
  front: "seen from the front",
  reverse: "seen from the back",
  top: "seen from above",
  side: "seen from the side",
  base: "the underside",
  signature: "close-up of the signature",
  label: "close-up of the label",
  detail: "detail",
  context: "in context",
};

export const altText = (title: string, view: ViewType, n?: number) =>
  `${title}, ${VIEW_PHRASE[view]}${view === "detail" && n && n > 1 ? ` ${n}` : ""}`;

export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}
