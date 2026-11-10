# E — Data-architectuur

Onderzoeksdatum: 2026-11-10 · Status: voorstel, Phase 1 · Websitecode is **niet** aangepast.

Dit document beschrijft hoe de onderzoeksresultaten zijn opgeslagen, hoe ID's werken, hoe bronnen op claimniveau worden vastgelegd, hoe de data wordt gevalideerd, en hoe ze later op het bestaande Sanity-schema van muraniq.nl kunnen aansluiten. Alle bestanden staan in `research/makers/` op de branch `claude/project-thread-d9abh3`.

## 1. Bestanden en formaten

| Bestand | Inhoud | Formaat |
|---|---|---|
| `data/makers.json` | personen en families (`PER-`, `FAM-`) | JSON (canoniek) |
| `data/workshops.json` | glasblazerijen, werkplaatsen, merken, distributeurs (`ORG-`) | JSON (canoniek) |
| `data/relationships.json` | relaties tussen alle entiteiten (`REL-`) | JSON (canoniek) |
| `data/works.json` | referentiewerken uit museumcollecties (`WRK-`) | JSON (canoniek) |
| `data/images.json` | beeldkandidaten met rechtenstatus (`IMG-`) | JSON (canoniek) |
| `data/techniques.json` | technieken met gedocumenteerde toepassingen (`TEC-`) | JSON (canoniek) |
| `data/signatures.json` | alleen in bronnen gedocumenteerde signaturen/merken (`SIG-`) | JSON (canoniek) |
| `data/sources.json` | bronregister (`SRC-`) | JSON (canoniek) |
| `data/verification.json` | claims op veldniveau (`CLM-`) en conflictgroepen (`CF-`) | JSON (canoniek) |
| `data/shortlist.json` | de 30 prioriteitsdossiers (`DOS-`) | JSON (canoniek) |
| `data/csv/*.csv` | dezelfde data plat, voor spreadsheets; lijsten gescheiden door ` \| ` | CSV (afgeleid) |
| `data/csv/url-checks.csv` | log van opgehaalde URL's met HTTP-status en datum (onvolledig: API-zoekvragen staan per werk in `works.json`) | CSV |
| `A-…md`, `B-…md`, `C-…md`, `D-relationship-table.md`, `F-conflict-register.md` | gegenereerde tabellen | Markdown (afgeleid) |
| `D-historical-relationships.md`, `E-…md`, `F-research-quality-report.md`, `README.md` | handgeschreven toelichting | Markdown |
| `schema/*.schema.json` | JSON Schema (draft 2020-12) per dataset | JSON Schema |
| `scripts/validate.py` | controles (zie §6) | Python 3, geen extra pakketten nodig |
| `scripts/export.py` | JSON → CSV en gegenereerde Markdown | Python 3 |
| `build/*.py` | de seed-bestanden waarmee versie 0.1 is opgebouwd (eenmalig; `build_data.py` weigert te overschrijven) | Python 3 |

**Canoniek is JSON.** Werkwijze bij elke wijziging: `data/*.json` aanpassen → `python3 scripts/validate.py` (moet 0 errors geven) → `python3 scripts/export.py` → committen. De CSV- en gegenereerde Markdown-bestanden worden nooit met de hand bewerkt.

## 2. ID-schema

- Vorm: `PREFIX-HOOFDLETTERS-CIJFERS-EN-STREEPJES`, regex `^[A-Z]+-[A-Z0-9-]+$`. Dat past op de bestaande `idField`-regel in de Sanity-schema's (`^PREFIX-[A-Z0-9-]+$`).
- Personen: `PER-<ACHTERNAAM>-<VOORNAAM>[-<geboortejaar>]`, bijv. `PER-SCARPA-CARLO-1906`. Het geboortejaar (of `C1400` voor "circa") wordt toegevoegd zodra het bekend is of er homoniemen zijn: `PER-BAROVIER-ANGELO-C1400` vs `PER-BAROVIER-ANGELO-1927`. Zonder betrouwbaar jaar blijft het weg (`PER-SEGUSO-ANGELO`); dan vermeldt `notes` dat er homoniemen kunnen bestaan.
- Families: `FAM-<NAAM>`; organisaties: `ORG-<KORTE-NAAM>[-<jaar>]` (bijv. `ORG-SALVIATI-DOTT-ANTONIO-1859` vs `-1877`).
- Werken: `WRK-<INSTELLING>-<objectnummer van de instelling>` (bijv. `WRK-MET-484659`), zodat het ID direct naar de bron terugleidt. Beelden volgen het werk: `IMG-MET-484659`.
- Relaties, claims: volgnummer (`REL-0001`, `CLM-0001`); conflicten krijgen een beschrijvende naam (`CF-MVM-CLOSURE`); dossiers `DOS-01`…`DOS-30`.
- **ID's zijn stabiel.** Een ID wordt nooit hergebruikt of hernoemd, ook niet als een naam of jaartal later anders blijkt; dan wordt `name`/`born` aangepast en blijft het ID staan. Samenvoegen van dubbele records gebeurt via een `NOT_SAME_AS`/`IDENTITY_UNRESOLVED`-relatie of, na verificatie, door het ene record te laten verwijzen naar het andere (voorstel: veld `merged_into`, nog niet in gebruik).

## 3. Gecontroleerde woordenlijsten

| Veld | Waarden |
|---|---|
| `verification_status`, `attribution_status` | `VERIFIED`, `PARTIALLY_VERIFIED`, `ATTRIBUTED`, `DISPUTED`, `UNVERIFIED` (criteria in F §2) |
| ontbrekende waarde | de tekst `Not verified` (nooit leeg laten bij datumvelden) |
| `access` (bron) | `OK` (gelezen), `SEARCH_INDEX` (alleen als zoekresultaat gezien), `UNAVAILABLE` (niet bereikbaar, reden in `access_note`), `NOT_CONSULTED` (nog te raadplegen) |
| `tier` (bron) | `A` museum/instelling/archief/overheid · `B` wetenschappelijk naslagwerk, catalogue raisonné, gespecialiseerde collectie · `C` bedrijf, handel, marktplaats, algemeen web |
| `entity_type` | `Person`, `Family`, `Manufacturer`, `Workshop`, `Brand`, `Distributor` |
| `predicate` (relatie) | familie: `CHILD_OF`, `SIBLING_OF`, `SON_IN_LAW_OF`, `MEMBER_OF_FAMILY` · zakelijk: `FOUNDED`, `CO_FOUNDED`, `PARTNER_IN`, `OWNER_OF`, `MANAGED` · professioneel: `ARTISTIC_DIRECTOR_OF`, `DESIGNED_FOR`, `MAESTRO_AT`, `WORKED_AT` · organisatie: `SUCCEEDED_BY`, `MERGED_INTO`, `RENAMED_TO` · identiteit: `NOT_SAME_AS`, `IDENTITY_UNRESOLVED` |
| `rights_label` (beeld) | `LICENSED FOR USE`, `PUBLIC DOMAIN`, `PERMISSION REQUIRED`, `REFERENCE LINK ONLY`, `RIGHTS UNKNOWN` |
| `claim_type` | `SOURCE_STATES` (bron stelt het), `SOURCE_ATTRIBUTES` (bron schrijft voorzichtig toe), `COMPANY_CLAIM` (bedrijf over zichzelf) |
| `research_priority` | `P1` (in de 30 dossiers), `P2` (volgende ronde), `P3` (later / eerst identificeren) |

## 4. Bronnen op claimniveau

Elk record heeft `source_ids` (welke bronnen het record ondersteunen). Daarnaast legt `data/verification.json` per **bewering** vast welke bron wat zegt, met een vindplaats (`locator`, meestal de exacte URL). Zo kan de website later per zin een bron tonen, en blijft zichtbaar dat twee bronnen iets anders zeggen. Tegenstrijdige claims delen een `conflict_group`; de groep heeft `resolution_status` `OPEN` tot iemand een onderbouwde keuze maakt (`RESOLVED`, met toelichting in `resolution`) of besluit beide waarden te tonen (`ACCEPTED_AS_UNCERTAIN`).

Regels die de validator afdwingt:
- `VERIFIED` (entiteit of relatie) vereist minstens twee bronnen, waarvan minstens één Tier A/B die echt gelezen is (`access = OK`).
- `PARTIALLY_VERIFIED`, `ATTRIBUTED` en `DISPUTED` vereisen minstens één bron.
- Een status mag nooit alleen op marktplaatsbronnen rusten.
- Een signatuur zonder bron wordt geweigerd.
- Een beeld mag alleen `downloaded`/`published = true` hebben bij `PUBLIC DOMAIN` of `LICENSED FOR USE`.

## 5. Voorbeeldrecords (uit de data van 2026-11-10)

Persoon met homoniemwaarschuwing:
```json
{
  "id": "PER-ZECCHIN-FRANCESCO",
  "name": "Francesco Zecchin",
  "alternative_names": [],
  "entity_type": "Person",
  "born": "Not verified",
  "died": "Not verified",
  "origin": "Not verified",
  "roles": [
    "engineer",
    "partner"
  ],
  "periods": [
    "1925–1938"
  ],
  "main_association": "Partner in V.S.M. Venini & C. (1925); co-founder of Zecchin-Martinuzzi Vetri Artistici e Mosaici (1932), closed it 1938",
  "ia_category": "historical_glasshouse",
  "verification_status": "VERIFIED",
  "research_priority": "P2",
  "source_ids": [
    "SRC-DBI-VENINI",
    "SRC-LSV-MARTINUZZI",
    "SRC-OS"
  ],
  "notes": "HOMONYM ALERT: not Vittorio Zecchin (painter, b. 1878). One OS page (V.S.M. Venini & C.) says 'Zecchin' left Venini in 1932 without a first name; the partner meant is Francesco.",
  "checked": "2026-11-10"
}
```

Glasblazerij met betwiste einddatum:
```json
{
  "id": "ORG-MVM-CAPPELLIN",
  "name": "M.V.M. Cappellin & C.",
  "alternative_names": [
    "Maestri Vetrai Muranesi Cappellin & C."
  ],
  "entity_type": "Manufacturer",
  "founded": "1925",
  "ended": "1931/January 1932 (closure date disputed)",
  "operating_status": "unknown",
  "location": "Murano",
  "periods": [
    "1925–1931/32"
  ],
  "main_association": "Giacomo Cappellin; Zecchin (to 1926); Carlo Scarpa",
  "ia_category": "historical_glasshouse",
  "verification_status": "VERIFIED",
  "research_priority": "P1",
  "source_ids": [
    "SRC-DBI-CAPPELLIN",
    "SRC-LSV-CAPPELLIN-SCARPA",
    "SRC-OS",
    "SRC-AIC-API",
    "SRC-MET-API"
  ],
  "notes": "",
  "checked": "2026-11-10"
}
```

Relatie (professioneel), met betwiste begindatum:
```json
{
  "id": "REL-0008",
  "subject_id": "PER-SCARPA-CARLO-1906",
  "predicate": "DESIGNED_FOR",
  "object_id": "ORG-MVM-CAPPELLIN",
  "relation_kind": "professional",
  "start": "1925/26 – 1927/28 (disputed)",
  "end": "1931",
  "verification_status": "VERIFIED",
  "source_ids": [
    "SRC-DBI-SCARPA",
    "SRC-LSV-CAPPELLIN-SCARPA",
    "SRC-DBI-CAPPELLIN",
    "SRC-OS",
    "SRC-AIC-API"
  ],
  "locators": [],
  "notes": "Relation verified; start date and the moment he became artistic director are disputed (see CLM conflicts CF-SCARPA-CAPPELLIN-START).",
  "checked": "2026-11-10"
}
```

Werk met toeschrijving (museumtekst letterlijk in `credit_line_maker`):
```json
{
  "id": "WRK-MET-484659",
  "title": "Vase",
  "date": "1954–56",
  "medium": "Glass",
  "institution": "The Metropolitan Museum of Art",
  "accession_number": "1986.436.11",
  "object_url": "https://www.metmuseum.org/art/collection/search/484659",
  "credit_line_maker": "Artist: Attributed to Dino Martens; Manufacturer: Vetri Decorativi Rag. Aureliano Toso",
  "designer_ids": [
    "PER-MARTENS-DINO-1894"
  ],
  "maker_ids": [],
  "workshop_ids": [
    "ORG-AURELIANO-TOSO"
  ],
  "candidate_workshop_ids": [],
  "attribution_status": "ATTRIBUTED",
  "technique_ids": [],
  "source_ids": [
    "SRC-MET-API"
  ],
  "museum_public_domain_flag": false,
  "checked": "2026-11-10",
  "notes": "Museum: 'Attributed to Dino Martens'."
}
```

Beeld (public domain volgens de open-access-vlag van de Met):
```json
{
  "id": "IMG-MET-186155",
  "work_id": "WRK-MET-186155",
  "image_url": "https://images.metmuseum.org/CRDImages/es/web-large/DP100236.jpg",
  "link_url": "https://www.metmuseum.org/art/collection/search/186155",
  "rights_label": "PUBLIC DOMAIN",
  "rights_basis": "The Metropolitan Museum of Art open-access flag = true on 2026-11-10 (Met Open Access, CC0).",
  "credit": "The Metropolitan Museum of Art, Gift of James Jackson Jarves, 1881",
  "downloaded": false,
  "published": false,
  "checked": "2026-11-10",
  "notes": null
}
```

Techniek (definitie bewust nog leeg tot er een bron is):
```json
{
  "id": "TEC-PULEGOSO",
  "name": "Pulegoso",
  "alternative_names": [
    "pulegosi",
    "vetro pulegoso"
  ],
  "category": "technique",
  "associated_entity_ids": [
    "PER-MARTINUZZI-NAPOLEONE-1892",
    "PER-VENINI-PAOLO-1895",
    "ORG-VSM-VENINI"
  ],
  "example_work_ids": [],
  "documented_uses": [
    "Pulegosi shown at the 1928 Venice Biennale by V.S.M. Venini & C. (DBI Venini, DBI Martinuzzi)"
  ],
  "working_definition": null,
  "definition_status": "to be written from a cited glossary source (Phase 2)",
  "editorial_status": "draft",
  "verification_status": "VERIFIED",
  "source_ids": [
    "SRC-DBI-VENINI",
    "SRC-DBI-MARTINUZZI",
    "SRC-OS"
  ],
  "notes": "",
  "checked": "2026-11-10"
}
```

Signatuur (alleen uit een bron):
```json
{
  "id": "SIG-MVM-CAPPELLIN-ACID",
  "entity_id": "ORG-MVM-CAPPELLIN",
  "kind": "acid-etched stamp",
  "mark_text": "MVM Cappellin & C. Murano (as quoted by DBI; exact layout not verified)",
  "period": "1925–1931",
  "frequency": "on some pieces only",
  "verification_status": "PARTIALLY_VERIFIED",
  "source_ids": [
    "SRC-DBI-CAPPELLIN"
  ],
  "locators": [],
  "image_id": null,
  "notes": "Absence of a mark does not exclude M.V.M. Cappellin production.",
  "checked": "2026-11-10"
}
```

Claim (onderdeel van conflictgroep):
```json
{
  "id": "CLM-0017",
  "entity_id": "PER-SCARPA-CARLO-1906",
  "field": "relation:MVM_start",
  "value": "from 1926",
  "source_id": "SRC-LSV-CAPPELLIN-SCARPA",
  "locator": "https://lestanzedelvetro.org/en/exhibition/the-m-v-m-cappellin-glassworks-and-the-young-carlo-scarpa-1925-1931/",
  "claim_type": "SOURCE_STATES",
  "conflict_group": "CF-SCARPA-CAPPELLIN-START",
  "checked": "2026-11-10",
  "notes": null
}
```

Bron:
```json
{
  "id": "SRC-DBI-CAPPELLIN",
  "tier": "B",
  "type": "encyclopedia",
  "title": "CAPPELLIN, Giacomo – Dizionario Biografico degli Italiani, vol. 34",
  "url": "https://www.treccani.it/enciclopedia/giacomo-cappellin_(Dizionario-Biografico)/",
  "author": "Rosa Barovier Mentasti",
  "publisher": "Istituto della Enciclopedia Italiana",
  "date": "1988",
  "language": "it",
  "access": "OK",
  "access_note": null,
  "checked": "2026-11-10"
}
```

## 6. Validatie

`python3 scripts/validate.py` controleert: unieke ID's over alle datasets heen en het juiste prefix per dataset; alle verwijzingen (bronnen, entiteiten, werken, technieken, claims) bestaan; alle gecontroleerde woordenlijsten; de bewijsregels uit §4; de shortlist (precies 30 dossiers, alle entiteiten P1); en, als het pakket `jsonschema` aanwezig is, de JSON Schemas in `schema/`. Uitkomst bij oplevering: **0 errors, 0 warnings**.

## 7. Aansluiting op het bestaande Sanity-schema (voorstel, niet uitgevoerd)

Het websiteproject heeft in `studio/schemas` o.a. de types `creator` (CRE-), `glasshouse` (GLH-), `technique` (TEC-), `source` (SRC-), `mediaAsset` (IMG-) en de zekerheidswaarden `verified`, `documented_attribution`, `probable`, `hypothesis`, `unknown`. Een mogelijke koppeling:

| Onderzoeksdata | Sanity | Opmerking / beslissing nodig |
|---|---|---|
| `makers` (Person) | `creator`, kind `person` | ID: `PER-…` → `CRE-…` (zelfde staart), onderzoeks-ID bewaren in een extra veld |
| `makers` (Family) | geen goede tegenhanger | voorstel: kind `family` toevoegen aan `creator` |
| `workshops` (Manufacturer/Workshop) | `glasshouse` | `ORG-…` → `GLH-…` |
| `workshops` (Brand/Distributor) | `creator` kind `organisation` of nieuw type | Oggetti e.d. horen niet tussen de glasblazerijen |
| `techniques` | `technique` | alles blijft `draft_unsourced` tot een definitie met bron is geschreven en nagelezen |
| `sources` | `source` | type-mapping: exhibition/museum → `museum`; encyclopedia/book → `book`; catalogue(_raisonne) → `catalogue`; official_site → `manufacturer`; marketplace → `auction`/`other` |
| `images` | `mediaAsset` | `PUBLIC DOMAIN` heeft geen eigen waarde in `rights` → voorstel: waarde toevoegen; `REFERENCE LINK ONLY` wordt geen asset maar een link |
| `verification_status` | zekerheidswaarden | VERIFIED → `verified`; ATTRIBUTED → `documented_attribution`; PARTIALLY_VERIFIED → `probable`; DISPUTED → `hypothesis` (verliest informatie; voorstel: `disputed` toevoegen); UNVERIFIED → `unknown` |
| `relationships`, `verification`, `works`, `signatures` | geen tegenhanger in de vijf bekeken types | voorstel voor Phase 4: types `relationship`, `claim`, `referenceWork`, `mark`, of velden op `creator`/`glasshouse` |

Er is niets geïmporteerd en geen schema gewijzigd. Dat gebeurt pas na expliciete goedkeuring.
