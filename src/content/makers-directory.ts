/**
 * Makers & Workshops directory: a public projection of the research dataset in
 * `src/content/research/makers/` (see ORIGIN.md there).
 *
 * Publication rules, enforced here and covered by tests:
 * - An entity, relationship or work is public only with status VERIFIED,
 *   PARTIALLY_VERIFIED, ATTRIBUTED or DISPUTED. UNVERIFIED records stay out.
 * - Every public record carries its status, shown on the page.
 * - Fields the research marks "Not verified" are left out, never filled in.
 * - Images: only PUBLIC DOMAIN ones, served from a local copy. Everything else
 *   is a link to the museum record.
 * - Research notes are internal and are not published.
 */
import makersJson from "./research/makers/makers.json";
import workshopsJson from "./research/makers/workshops.json";
import relationshipsJson from "./research/makers/relationships.json";
import sourcesJson from "./research/makers/sources.json";
import imagesJson from "./research/makers/images.json";
import worksJson from "./research/makers/works.json";
import techniquesJson from "./research/makers/techniques.json";
import signaturesJson from "./research/makers/signatures.json";
import verificationJson from "./research/makers/verification.json";

export type ResearchStatus = "VERIFIED" | "PARTIALLY_VERIFIED" | "ATTRIBUTED" | "DISPUTED" | "UNVERIFIED";
export const PUBLIC_STATUSES: readonly ResearchStatus[] = ["VERIFIED", "PARTIALLY_VERIFIED", "ATTRIBUTED", "DISPUTED"];
const isPublic = (s: string) => (PUBLIC_STATUSES as readonly string[]).includes(s);

export const STATUS_LABEL: Record<ResearchStatus, string> = {
  VERIFIED: "Verified",
  PARTIALLY_VERIFIED: "Partly verified",
  ATTRIBUTED: "Attributed",
  DISPUTED: "Sources disagree",
  UNVERIFIED: "Not yet verified",
};
export const STATUS_EXPLANATION: Record<ResearchStatus, string> = {
  VERIFIED: "Confirmed by at least two independent sources, including a museum or scholarly source that was read in full.",
  PARTIALLY_VERIFIED: "Supported by a reliable source, but not yet confirmed independently on every point.",
  ATTRIBUTED: "A source attributes this, without documentary proof.",
  DISPUTED: "Reliable sources contradict each other. The open questions are listed below.",
  UNVERIFIED: "Not yet checked against reliable sources.",
};

export type DirectoryGroup =
  | "master_artist"
  | "historical_glasshouse"
  | "family"
  | "contemporary"
  | "contemporary_studio"
  | "distributor";

export const GROUPS: { key: DirectoryGroup; title: string; accent: string; intro: string }[] = [
  {
    key: "historical_glasshouse",
    title: "Glasshouses",
    accent: "and firms",
    intro: "The furnaces and companies of Murano and Venice, with their founders, successors and name changes.",
  },
  {
    key: "master_artist",
    title: "Masters",
    accent: "and designers",
    intro: "Glassmakers, maestri and designers, from the fifteenth century to the late twentieth.",
  },
  { key: "family", title: "Families", accent: "of Murano", intro: "Dynasties whose names recur across centuries of firms." },
  {
    key: "contemporary",
    title: "Contemporary",
    accent: "makers",
    intro: "Artists and maestri working today or in recent decades.",
  },
  {
    key: "contemporary_studio",
    title: "Contemporary",
    accent: "studios",
    intro: "Studios and firms active today.",
  },
  { key: "distributor", title: "Distributors", accent: "and agents", intro: "Firms that sold rather than made." },
];

type RawEntity = {
  id: string;
  name: string;
  alternative_names: string[];
  entity_type: string;
  ia_category: string;
  verification_status: string;
  main_association: string;
  periods: string[];
  source_ids: string[];
  born?: string;
  died?: string;
  origin?: string;
  roles?: string[];
  founded?: string;
  ended?: string;
  location?: string;
  operating_status?: string;
  checked: string;
};
type RawRelationship = {
  id: string;
  subject_id: string;
  predicate: string;
  object_id: string;
  start: string | null;
  end: string | null;
  verification_status: string;
  source_ids: string[];
};
type RawSource = {
  id: string;
  tier: string;
  type: string;
  title: string;
  url: string | null;
  publisher: string | null;
  date: string | null;
  access: string;
  checked: string;
};
type RawWork = {
  id: string;
  title: string;
  date: string | null;
  medium: string | null;
  institution: string;
  accession_number: string | null;
  object_url: string;
  credit_line_maker: string | null;
  designer_ids: string[];
  maker_ids: string[];
  workshop_ids: string[];
  candidate_workshop_ids: string[];
  attribution_status: string;
  technique_ids: string[];
};
type RawImage = {
  id: string;
  work_id: string;
  rights_label: string;
  credit: string;
  link_url: string;
};
type RawTechnique = { id: string; name: string };
type RawSignature = {
  id: string;
  entity_id: string;
  kind: string;
  mark_text: string;
  period: string | null;
  frequency: string | null;
  verification_status: string;
  source_ids: string[];
};
type RawClaim = { id: string; entity_id: string; field: string; value: string; source_id: string; conflict_group: string | null };
type RawConflict = { id: string; description: string; claim_ids: string[]; resolution_status: string };

const NOT_VERIFIED = /^not verified$/i;
const clean = (v: string | null | undefined) => (v && !NOT_VERIFIED.test(v.trim()) ? v.trim() : null);

/** Drop the researchers' own source shorthand, e.g. "(OS)" or "(DBI Martinuzzi)": sources are listed in full. */
const readable = (s: string) => s.replace(/\s*\((?:OS|DBI(?: [^)]*)?)\)/g, "").trim();

const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Local copies of the public-domain photographs (see docs/IMAGE-SOURCES.md). */
const LOCAL_IMAGE: Record<string, { width: number; height: number }> = {
  "IMG-MET-186001": { width: 1076, height: 1800 },
  "IMG-MET-186074": { width: 1440, height: 1800 },
  "IMG-MET-186123": { width: 1309, height: 1800 },
  "IMG-MET-186155": { width: 1800, height: 1620 },
  "IMG-MET-186161": { width: 1440, height: 1800 },
  "IMG-MET-186188": { width: 1350, height: 1800 },
  "IMG-MET-186194": { width: 1800, height: 1552 },
  "IMG-MET-210183": { width: 1308, height: 1800 },
  "IMG-MET-344736": { width: 1800, height: 1429 },
};

/** How a relationship reads from each side. */
const PREDICATE: Record<string, { out: string; in: string }> = {
  DESIGNED_FOR: { out: "Designed for", in: "Designers" },
  ARTISTIC_DIRECTOR_OF: { out: "Artistic director of", in: "Artistic directors" },
  CO_FOUNDED: { out: "Co-founded", in: "Co-founders" },
  FOUNDED: { out: "Founded", in: "Founded by" },
  CHILD_OF: { out: "Child of", in: "Children" },
  PARTNER_IN: { out: "Partner in", in: "Partners" },
  MAESTRO_AT: { out: "Maestro at", in: "Maestri" },
  SUCCEEDED_BY: { out: "Succeeded by", in: "Succeeded" },
  WORKED_AT: { out: "Worked at", in: "Worked here" },
  MANAGED: { out: "Managed", in: "Managed by" },
  MEMBER_OF_FAMILY: { out: "Member of", in: "Family members" },
  NOT_SAME_AS: { out: "Not the same as", in: "Not the same as" },
  OWNER_OF: { out: "Owner of", in: "Owned by" },
  IDENTITY_UNRESOLVED: { out: "Possibly the same as", in: "Possibly the same as" },
  SIBLING_OF: { out: "Sibling of", in: "Sibling of" },
  MERGED_INTO: { out: "Merged into", in: "Merged from" },
  RENAMED_TO: { out: "Renamed", in: "Formerly" },
  SON_IN_LAW_OF: { out: "Son-in-law of", in: "Son-in-law" },
};

const KIND_LABEL: Record<string, string> = {
  Person: "Person",
  Family: "Family",
  Manufacturer: "Glasshouse",
  Workshop: "Workshop",
  Brand: "Brand",
  Distributor: "Distributor",
};

export type DirectorySource = {
  id: string;
  title: string;
  publisher: string | null;
  url: string | null;
  date: string | null;
  kind: string;
  /** Whether the source was read in full for this research round. */
  consulted: boolean;
  checked: string;
};

export type DirectoryWork = {
  id: string;
  title: string;
  date: string | null;
  medium: string | null;
  institution: string;
  accessionNumber: string | null;
  url: string;
  creditLineMaker: string | null;
  status: ResearchStatus;
  /** Whether this entity is named as maker/designer, or only as a candidate workshop. */
  candidate: boolean;
  image: { src: string; width: number; height: number; alt: string; credit: string } | null;
};

export type DirectoryLink = {
  label: string;
  name: string;
  slug: string | null;
  when: string | null;
  status: ResearchStatus;
};

export type DirectoryEntry = {
  id: string;
  slug: string;
  name: string;
  alternativeNames: string[];
  kind: string;
  isPerson: boolean;
  group: DirectoryGroup;
  status: ResearchStatus;
  summary: string;
  periods: string[];
  facts: { k: string; v: string }[];
  /** Short dates for lists, e.g. "1895–1959" or "1921–". */
  dates: string | null;
  checked: string;
};

export type DirectoryDossier = DirectoryEntry & {
  connections: { label: string; links: DirectoryLink[] }[];
  works: DirectoryWork[];
  techniques: string[];
  marks: { kind: string; text: string; period: string | null; frequency: string | null; status: ResearchStatus }[];
  openQuestions: { description: string; positions: { value: string; source: string }[] }[];
  sources: DirectorySource[];
};

function lifeDates(e: RawEntity): string | null {
  const year = (v: string | null) => v?.match(/\b(1\d{3}|20\d{2})\b/)?.[0] ?? null;
  if (e.entity_type === "Person") {
    const b = year(clean(e.born));
    const d = year(clean(e.died));
    if (b && d) return `${b}–${d}`;
    if (b) return `born ${b}`;
    if (d) return `died ${d}`;
    return null;
  }
  const f = year(clean(e.founded));
  const t = year(clean(e.ended));
  if (f && t) return `${f}–${t}`;
  if (f) return `founded ${f}`;
  return null;
}

function factsOf(e: RawEntity): { k: string; v: string }[] {
  const rows: [string, string | null | undefined][] = [
    ["Born", e.born],
    ["Died", e.died],
    ["Founded", e.founded],
    ["Closed", e.ended],
    ["Origin", e.origin],
    ["Location", e.location],
    ["Roles", e.roles?.length ? e.roles.join(", ") : null],
    ["Periods", e.periods.length ? e.periods.join(", ") : null],
    ["Today", e.operating_status && e.operating_status !== "unknown" ? e.operating_status : null],
  ];
  return rows.flatMap(([k, v]) => {
    const c = clean(v ?? null);
    return c ? [{ k, v: c }] : [];
  });
}

function build() {
  const raw: RawEntity[] = [...(makersJson as RawEntity[]), ...(workshopsJson as RawEntity[])];
  const byId = new Map(raw.map((e) => [e.id, e]));
  const published = raw.filter((e) => isPublic(e.verification_status));

  // Stable, readable slugs; a clash (a person and a firm with the same name) gets the kind appended.
  const slugCount = new Map<string, number>();
  for (const e of published) slugCount.set(slugify(e.name), (slugCount.get(slugify(e.name)) ?? 0) + 1);
  const slugOf = new Map<string, string>();
  for (const e of published) {
    const base = slugify(e.name);
    slugOf.set(e.id, (slugCount.get(base) ?? 0) > 1 ? `${base}-${slugify(KIND_LABEL[e.entity_type] ?? e.entity_type)}` : base);
  }

  const sources = new Map((sourcesJson as RawSource[]).map((s) => [s.id, s]));
  const techniques = new Map((techniquesJson as RawTechnique[]).map((t) => [t.id, t.name]));
  const images = new Map(
    (imagesJson as RawImage[])
      .filter((i) => i.rights_label === "PUBLIC DOMAIN" && LOCAL_IMAGE[i.id])
      .map((i) => [i.work_id, i]),
  );
  const relationships = (relationshipsJson as RawRelationship[]).filter((r) => isPublic(r.verification_status));
  const works = (worksJson as RawWork[]).filter((w) => isPublic(w.attribution_status));
  const signatures = (signaturesJson as RawSignature[]).filter((s) => isPublic(s.verification_status));
  const verification = verificationJson as { claims: RawClaim[]; conflicts: RawConflict[] };
  const claims = new Map(verification.claims.map((c) => [c.id, c]));

  const toSource = (id: string): DirectorySource | null => {
    const s = sources.get(id);
    if (!s) return null;
    return {
      id: s.id,
      title: s.title,
      publisher: s.publisher,
      url: s.url,
      date: s.date,
      kind: s.type.replace(/_/g, " "),
      consulted: s.access === "OK",
      checked: s.checked,
    };
  };

  const entries: DirectoryEntry[] = published.map((e) => ({
    id: e.id,
    slug: slugOf.get(e.id)!,
    name: e.name,
    alternativeNames: e.alternative_names,
    kind: KIND_LABEL[e.entity_type] ?? e.entity_type,
    isPerson: e.entity_type === "Person",
    group: e.ia_category as DirectoryGroup,
    status: e.verification_status as ResearchStatus,
    summary: readable(e.main_association),
    periods: e.periods,
    facts: factsOf(e),
    dates: lifeDates(e),
    checked: e.checked,
  }));

  const dossiers: Record<string, DirectoryDossier> = {};
  for (const entry of entries) {
    const e = byId.get(entry.id)!;
    const link = (otherId: string, label: string, r: RawRelationship): DirectoryLink | null => {
      const other = byId.get(otherId);
      if (!other) return null;
      const when = [r.start, r.end].filter((x): x is string => !!clean(x));
      return {
        label,
        name: other.name,
        slug: slugOf.get(otherId) ?? null,
        when: when.length === 2 ? `${when[0]} – ${when[1]}` : (when[0] ?? null),
        status: r.verification_status as ResearchStatus,
      };
    };
    const grouped = new Map<string, DirectoryLink[]>();
    const add = (l: DirectoryLink | null) => {
      if (!l) return;
      grouped.set(l.label, [...(grouped.get(l.label) ?? []), l]);
    };
    for (const r of relationships) {
      const p = PREDICATE[r.predicate] ?? { out: r.predicate, in: r.predicate };
      if (r.subject_id === e.id) add(link(r.object_id, p.out, r));
      if (r.object_id === e.id) add(link(r.subject_id, p.in, r));
    }

    const ownWorks: DirectoryWork[] = works
      .filter((w) => [...w.designer_ids, ...w.maker_ids, ...w.workshop_ids, ...w.candidate_workshop_ids].includes(e.id))
      .map((w) => {
        const img = images.get(w.id);
        const local = img ? LOCAL_IMAGE[img.id] : undefined;
        return {
          id: w.id,
          title: w.title,
          date: clean(w.date),
          medium: clean(w.medium),
          institution: w.institution,
          accessionNumber: w.accession_number,
          url: w.object_url,
          creditLineMaker: w.credit_line_maker,
          status: w.attribution_status as ResearchStatus,
          candidate: !([...w.designer_ids, ...w.maker_ids, ...w.workshop_ids].includes(e.id)),
          image:
            img && local
              ? {
                  src: `/images/makers/${img.id.toLowerCase()}.jpg`,
                  ...local,
                  alt: [w.title, clean(w.medium)?.toLowerCase(), clean(w.date)].filter(Boolean).join(", "),
                  credit: `${img.credit} · Public domain`,
                }
              : null,
        };
      })
      .sort((a, b) => Number(!!b.image) - Number(!!a.image));

    const techniqueNames = [
      ...new Set(
        (techniquesJson as (RawTechnique & { associated_entity_ids: string[] })[])
          .filter((t) => t.associated_entity_ids.includes(e.id))
          .map((t) => t.name),
      ),
      ...new Set(ownWorks.flatMap((w) => (worksJson as RawWork[]).find((x) => x.id === w.id)!.technique_ids.map((t) => techniques.get(t)!))),
    ].filter((v, i, all) => v && all.indexOf(v) === i);

    const openQuestions = verification.conflicts
      .filter((c) => c.resolution_status === "OPEN" && c.claim_ids.some((id) => claims.get(id)?.entity_id === e.id))
      .map((c) => ({
        description: c.description,
        positions: c.claim_ids.flatMap((id) => {
          const cl = claims.get(id);
          if (!cl) return [];
          const s = sources.get(cl.source_id);
          return [{ value: cl.value, source: s ? (s.publisher ?? s.title) : cl.source_id }];
        }),
      }));

    const sourceIds = new Set([
      ...e.source_ids,
      ...relationships.filter((r) => r.subject_id === e.id || r.object_id === e.id).flatMap((r) => r.source_ids),
    ]);

    dossiers[entry.slug] = {
      ...entry,
      connections: [...grouped.entries()].map(([label, links]) => ({ label, links })),
      works: ownWorks,
      techniques: techniqueNames,
      marks: signatures
        .filter((s) => s.entity_id === e.id)
        .map((s) => ({
          kind: s.kind,
          text: s.mark_text,
          period: clean(s.period),
          frequency: clean(s.frequency),
          status: s.verification_status as ResearchStatus,
        })),
      openQuestions,
      sources: [...sourceIds].map(toSource).filter((s): s is DirectorySource => !!s),
    };
  }

  const sortKey = (x: DirectoryEntry) => x.name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  entries.sort((a, b) => sortKey(a).localeCompare(sortKey(b)));

  return {
    entries,
    dossiers,
    withheld: raw.length - published.length,
    sourceCount: sources.size,
    checked: raw.reduce((m, e) => (e.checked > m ? e.checked : m), ""),
  };
}

const directory = build();

export const directoryEntries = (): DirectoryEntry[] => directory.entries;
export const directoryDossier = (slug: string): DirectoryDossier | undefined => directory.dossiers[slug];
export const directoryStats = () => ({
  published: directory.entries.length,
  withheld: directory.withheld,
  sources: directory.sourceCount,
  checked: directory.checked,
});
