# MURANIQ — Website-audit en Codex-herbouwplan

**Auditdatum:** 9 november 2026  
**Bestaande site:** https://muraniq.nl/  
**Doel:** hoogwaardige, internationale Engelstalige private gallery + evidence-based reference archive, met incidentele verkoop op aanvraag.  
**Status:** onderbouwde *openbare inhouds- en informatiearchitectuuraudit* plus uitvoerbare herbouwspecificatie. Dit is **geen** voltooide browser-, broncode-, Lighthouse- of penetratietest.

## 0. Samenvatting en scope

**Advies:** herbouw MURANIQ niet als een verzameling handmatig gemaakte pagina’s, maar als een compacte **collectie- en onderzoeksdatabase met mooie, automatisch gegenereerde publicatiepagina’s**. De kernentiteiten zijn: `Object`, `Maker`, `Glasshouse`, `Technique`, `Signature/Label`, `Source` en `ResearchRecord`. Publieke pagina’s tonen alleen goedgekeurde gegevens. De site is géén webshop: `Collection` en `Glass Guide` staan centraal; bij een select aantal objecten kan `Enquire` worden getoond.

**Sterkste onderscheidende vermogen:** eigen, fysieke objecten gecombineerd met controleerbaar onderzoek. Kunstenaars, labels, signaturen, glassoorten en historische catalogusverwijzingen verbinden de collectie met de kennisbank.

**Bewijsstatus:** [G] = geobserveerd in publieke HTML-tekstweergave; [A] = afgeleid/advies; [T] = technisch nog te testen met browser, hosting of broncode. De openbare pagina’s zijn benaderd met een webtool op 9 november 2026. Deze omgeving kon geen volledige browserconsole, netwerkmetrieken, serverheaders, robots.txt of sitemap betrouwbaar uitlezen; claims over implementatie, snelheid, indexering of security worden daarom niet als feiten gepresenteerd.

## 1. Gecontroleerde bestaande pagina’s

| Bestaande URL | Wat kon worden vastgesteld | Advies / prioriteit |
|---|---|---|
| `/` | [G] Engelstalige introductie, ingangen naar collection, glass guide, research & provenance, private collection en selected pieces. | P0: laat direct echte topobjecten zien; duidelijke CTA’s Browse Collection / Explore Glass Guide. |
| `/collection/` | [G] Vier categorieën; label `STUDIO GLAS` in verder Engelstalige structuur. | P0: consistent Engels; aantallen en objectkaarten per categorie; filters. |
| `/collection/murano-glass/` | [G] Introductie en uitgelichte secties voor Zanella en Rosin met beeldlinks. | P0: kaartgrid per object; filters op maker, type, techniek, periode, attributiestatus. |
| `/collection/studio-glass/` | [G] Enkel `Work in progress`. | P1: echte inhoud of tijdelijk uit primaire navigatie; niet leeg publiceren. |
| `/collection/fine-art/` | [G] Enkel `Work in progress`. | P1: idem. |
| `/collection/collectible-objects/` | [G] Enkel `Work in progress`. | P1: idem. |
| `/glass-guide/` | [G] De opgehaalde HTML-tekst bevat geen informatieve hoofdinhoud. | P0: uitgewerkt startpunt met Makers, Techniques, Signatures & Labels, Attribution Guide. [T] Visueel testen of inhoud dynamisch wegvalt. |
| `/arnaldo-zanella/` | [G] Uitvoerige bio met carrière en ateliers; verwijst naar collectiestukken. | P0: behoud tekst/URL; bronnotities, makerrelaties, signatuurbeelden en daadwerkelijke objecten toevoegen. |
| `/loredano-rosin/` | [G] Uitvoerige bio; verwijst naar calcedonia en figuratieve sculptuur. | P0: idem; onderscheid Loredano vs Dino in linkstructuur. |
| `/about/` | [G] Bevat primair contactformulier, Engelstalige toestemming, Nederlandstalige validatiemeldingen en zichtbare `info@muraniq.com`. | P1: splits About en Contact; controleer contactformuliervelden en echte verzending. |

**Overkoepelende observaties:** [G] Hoofdnavigatie bevat Home, Collection, Glass Guide, About én directe links naar twee kunstenaars. [G] De tekstweergave toont herhaalde navigatieblokken; dit kan door verborgen mobiele/off-canvas markup komen en bewijst niet dat de navigatie visueel dubbel staat. [G] Vertaaltoestemmingsdialoog verschijnt in Nederlands. [A] Dwing één consistente Engelse publieke interface af, zonder onnodige externe vertaallaag.

## 2. Kritische problemen en kansen

### P0 — direct meenemen in eerste bouwrelease
1. **Geen uniform objectmodel.** [A] De huidige gepubliceerde inhoud heeft geen volwaardige individuele objectcatalogus. Bouw `ObjectDetail` als hart van de site: galerij, feiten, attributie, observaties, bewijs, gerelateerde kunstenaars/technieken en interesseformulier.
2. **Glass Guide inhoudelijk niet ontsloten.** [G] In tekstweergave is de landingspagina leeg. Een zinvolle kennisbank heeft indexpagina’s en artikeltemplates nodig.
3. **Object ↔ maker ↔ bewijsmateriaal ontbreekt als zichtbare relationele ervaring.** [A] Biografieën linken nu niet direct naar een complete reeks individuele collectiedossiers.
4. **Vertrouwen en bewijslast.** [A] Gebruik attributielabels (`Documented`, `Attributed`, `Possibly attributed`, `Unidentified`) met onderbouwing, in plaats van onbewezen makerclaims.
5. **Migratierisico.** [A] Oude URL’s en alle originele afbeeldingen moeten intact blijven totdat een volledige export en redirectmapping getest zijn.

### P1 — belangrijk vóór publiekslancering
6. Drie lege categorieën vervangen door echte inhoud of bewust tijdelijk verborgen houden.
7. Consistente Engelstalige interface, inclusief foutmeldingen en cookie-/privacycommunicatie.
8. Fotografiestructuur: hoofdfoto, zijaanzichten, onderzijde, signatuur, label, detail, beschadiging, archiefmateriaal.
9. Zoekfunctie en relevante filters met begrijpelijke lege-resultaatstatus.
10. About, Contact, Research Policy, Privacy, beeldrechten/copyright toevoegen.
11. Mobiele navigatie, touch-doelen, toetsenbordnavigatie, focusvolgorde en toegankelijkheid testen.

### P2 — latere uitbreiding
12. Publieke tijdlijn van makers en ateliers.
13. Vergelijkingsweergave van 2–3 objecten.
14. Geavanceerde archiefzoekfunctie voor labels, signaturen en catalogusnummers.
15. Meertaligheid alleen wanneer inhoud en onderhoud dat rechtvaardigen; begin Engels-only.
16. Redactionele verhalen, recent research, research updates en curated exhibitions.

## 3. Gewenste doelgroep en positionering

**Primair:** verzamelaars, internationale geïnteresseerden in Murano, galerieën, veilingexperts, glasresearchers. **Secundair:** kunstenaars, designliefhebbers, incidentele potentiële kopers. **Boodschap:** “A private collection of Murano glass, studio glass and collectible art — documented through research, signatures, techniques and provenance.”

**Niet:** bulkwebshop, fictieve beschikbaarheid, kunstmatige waarderingen, anonieme AI-beschrijvingen zonder verificatie, generieke zoekmachinecontent.  
**Wel:** sober, museumachtig, visueel overtuigend, objectcentrisch, gedocumenteerd, begrijpelijk over onzekerheden.

## 4. Nieuwe informatiearchitectuur en URL-plan

**Hoofdnavigatie**: `Collection` | `Glass Guide` | `Research` | `About` | `Contact` (optioneel zoekicoon). Niet elke maker in hoofdmenu; makers worden vanuit Guide/zoekfunctie ontdekt. Mobiele navigatie met dezelfde hiërarchie.

```text
/
/collection/
/collection/murano-glass/                   [bestaande URL behouden]
/collection/studio-glass/                   [bestaande URL behouden]
/collection/fine-art/                       [bestaande URL behouden]
/collection/collectible-objects/            [bestaande URL behouden]
/collection/objects/[slug]/                 [nieuw: individueel dossier]
/glass-guide/                               [bestaande URL behouden]
/glass-guide/makers/                        [nieuw: maker-index]
/glass-guide/makers/[slug]/                 [nieuw: makerprofiel]
/glass-guide/glasshouses/                   [nieuw]
/glass-guide/glasshouses/[slug]/            [nieuw]
/glass-guide/techniques/                    [nieuw]
/glass-guide/techniques/[slug]/             [nieuw]
/glass-guide/signatures-labels/             [nieuw]
/glass-guide/signatures-labels/[slug]/      [nieuw]
/glass-guide/attribution/                   [nieuw: aanpak en beperkingen]
/research/                                  [nieuw]
/research/[slug]/                           [nieuw: redactioneel onderzoeksartikel]
/about/                                     [bestaande URL behouden; echte About]
/contact/                                   [nieuw]
/privacy/                                   [nieuw]
/arnaldo-zanella/                           [bestaande maker-URL behouden OF pas na migratie 301]
/loredano-rosin/                            [bestaande maker-URL behouden OF pas na migratie 301]
```

**Belangrijk besluit:** voor Zanella en Rosin oude URL’s voorlopig als canonieke makerpagina’s behouden, tenzij expliciet wordt gekozen voor één standaardpatroon `/glass-guide/makers/[slug]/`. Bij wijziging is een directe permanente redirect nodig. Vermijd twee indexeerbare kopieën van dezelfde bio.

## 5. Ontwerpconcept / visuele taal

**Stijl:** sophisticated editorial gallery / modern museum. Niet druk, geen glanzende e-commercekaartjes. 
- Achtergrond: diep charcoal of warm off-black (`#111214`); secundaire pagina's mogen warm ivoor (`#F4F1EA`) gebruiken voor lange leestekst.
- Accent: gedempt antiekgoud (`#BEA16B`) als kleine accentkleur, niet voor alle tekst; check contrast.
- Typografie: elegante serif voor titels + zeer leesbare sans-serif voor body, met eigen webfonts of fallback zonder CLS.
- Max contentbreedte ca. 1200–1440 px; leesbreedte voor bio’s ca. 65–80 tekens.
- Fotografie dominant, rustige marges; portret/landscape/aspect-ratio per object behouden.
- Geen automatische carrousels of parallax die informatie ontoegankelijk maken.
- Echte originele objectfoto’s als bewijs; eventuele artistieke/marketingbeelden expliciet scheiden.
- Fotokaart toont maker (of “Unidentified”), objectnaam, datering indien verantwoord, materiaal/techniek indien bekend; géén verzonnen prijzen.

**Homepage-blokken:** hero met echt eigen topstuk → Intro MURANIQ → Featured Works (4–8) → Collection Areas → Featured Makers → Glass Guide → Research & Provenance → Enquiries/About → Footer.

**Objectpagina:** primaire hero → thumbgalerij → feitenkolom → Description → Object Examination → Attribution & Evidence → Signature/Label → Provenance (alleen publiceerbare gegevens) → Condition (feitelijk en genuanceerd) → Related Works / Maker / Technique → Enquire (alleen indien beschikbaar of algemene vraag).

## 6. Contentmodel: voor de bouw het allerbelangrijkste

Gebruik stabiele unieke identifiers, los van URL-slugs. Voorbeeld:

```ts
type Attribution = 'documented' | 'attributed' | 'possibly-attributed' | 'unidentified';
type Availability = 'private-collection' | 'enquire' | 'reserved' | 'sold';
type Visibility = 'draft' | 'published' | 'archived';

type CollectionObject = {
  id: string;                         // MUR-0001, stabiel
  slug: string;                       // arnaldo-zanella-rearing-horse
  title: string; category: 'murano-glass'|'studio-glass'|'fine-art'|'collectible-objects';
  makerIds: string[]; glasshouseIds?: string[];
  attribution: Attribution; attributionNote?: string;
  approximateDate?: string; country?: string; origin?: string;
  techniqueIds: string[]; material?: string[];
  dimensionsMm?: { height?: number; width?: number; depth?: number; diameter?: number };
  weightGrams?: number;
  signature?: { present: boolean|null; description?: string; imageIds?: string[] };
  labels?: { text?: string; imageIds?: string[] }[];
  description: string; conditionPublic?: string;
  provenancePublic?: string; sourceIds: string[];
  imageIds: string[]; heroImageId: string;
  availability: Availability; visibility: Visibility;
  featured?: boolean; seoTitle?: string; seoDescription?: string;
  createdAt: string; updatedAt: string;
};

type Source = {
  id: string; type: 'catalogue'|'book'|'museum'|'archive'|'auction'|'manufacturer'|'other';
  title: string; author?: string; publisher?: string; year?: string;
  url?: string; pageReference?: string; rightsNote?: string;
  reliabilityNote?: string; verifiedOn?: string;
};

type ImageAsset = {
  id: string; path: string; alt: string; caption?: string;
  rights: 'owned'|'licensed'|'permission'|'unknown';
  purpose: 'object'|'detail'|'signature'|'label'|'documentation'|'editorial';
  credit?: string; width: number; height: number;
};
```

Aanvullende tabellen/collections: `Maker` (naam, aliassen, biografie, periode, relaties), `Glasshouse` (locatie, actieve jaren, gelinkte makers), `Technique` (definitie, herkenning, relevante voorbeelden), `ResearchRecord` (claim, waarneming, bron, bewijskracht, datum, status), `Redirect` en `Inquiry`.

**Strikte scheiding privé/publiek:** inkoopprijs, verzekeringswaarde, persoonlijke adresgegevens, opslaglocatie, interne foto’s en niet-openbare provenance mogen niet in client-builds, publieke JSON, HTML, metadata, zoekindexen of image EXIF belanden. Maak aparte interne administratie in een toegangsbeschermde omgeving; niet enkel een `hidden: true` veld dat toch naar de browser wordt verzonden.

**Bewijsdiscipline:** maak per toeschrijving duidelijk onderscheid tussen `signed by`, `labelled as`, `documented in catalogue`, `attributed to`, `possibly` en `unknown`. Geen automatische conclusies op basis van alleen gelijkenis. Bewaar onderzoekslast en bronverwijzingen.

## 7. Aanbevolen technische architectuur voor Codex

**Start lean maar schaalbaar:** Next.js (App Router), TypeScript, Tailwind CSS, toegankelijke herbruikbare componenten, Zod-validatie, statisch gerenderde contentpagina's waar mogelijk, `next/image` voor beeldoptimalisatie, MDX voor artikelen en gestructureerde JSON/YAML/TypeScript-data voor objecten. Git is de bron van waarheid; elk object is als data te wijzigen zonder pagina-layout te herschrijven.

**Fase 1 (laagste operationele complexiteit):** objectgegevens in gestructureerde contentbestanden in repository; objectpagina’s worden automatisch gegenereerd. Dit is prima voor een collectie van 100–500+ objecten wanneer updates beheersbaar zijn. Git review voorkomt onbedoelde wijzigingen.

**Fase 2 (wanneer beheer belangrijker wordt):** optionele self-hosted Directus + PostgreSQL als redactieomgeving, plus mediaopslag met back-up. Deze keuze niet vooraf forceren: een CMS kost installatie, beveiliging, updatebeheer en opslag. Maak wel eerst een repository/adapters-laag zodat data later kan verhuizen zonder nieuwe frontend.

**Hosting:** bij eigen VPS kun je Next.js in Docker achter Caddy/Nginx met HTTPS deployen. Scheid staging en productie, bewaar secrets buiten Git, zorg voor herstelbare backups en uptime-monitoring. Documenteer DNS, HTTPS, redirects en rollback. Een statische hostingroute kan ook; kies pas na testen van alle benodigde Next.js-functies.

**Zoekfunctionaliteit:** begin client-side met gefilterde metadata voor gepubliceerde objecten; bij grotere aantallen of uitgebreide archiefzoekfunctie server-side index (bijv. Meilisearch) overwegen, niet nodig voor v1.

**Formulier:** server-side gevalideerd; CSRF/spam-bescherming, rate limiting, honeypot, duidelijke e-mailtransactie, zonder onnodige persoonsgegevens. Geen private mailsleutels in frontend; werk met een betrouwbare outbound provider/SMTP. Verifieer daadwerkelijk ontvangst.

**Dependencies:** versies vastzetten met lockfile, security scanning, lint, typecheck, tests, beeldrechtenregister; vermijd veel zware UI-packages.

## 8. SEO: technische, redactionele en migratie-eisen

1. Behoud stabiele bestaande URL’s tenzij betere structuur een wijziging rechtvaardigt. Nieuwe URL’s krijgen duidelijke, unieke Engelse slugs.
2. Elke inhoudspagina heeft één unieke `title`, meta description, h1, canonical, Open Graph-beeld en breadcrumbs waar logisch. Meta is niet de inhoud: voeg betekenisvolle zichtbare tekst toe.
3. Genereer `sitemap.xml`, `robots.txt`, een echte 404-pagina en correcte statuscodes. Concepten worden niet publiek of geïndexeerd.
4. Structured data: `Organization`/`WebSite` op site-niveau, `BreadcrumbList` op detailpagina’s, `VisualArtwork` waar semantisch toepasselijk, `Person`/`Organization` voor makers/ateliers, `Article` voor onderzoek. Geen onterechte `Product` of Offer wanneer het werk niet verkocht wordt.
5. Altteksten beschrijven het werk, niet keyword-stuffing; signatuurfoto’s krijgen specifieke beschrijving.
6. Interne links vormen een netwerk: object → maker → techniek → bronnen → gerelateerde objecten. Zorg voor browse- en breadcrumbnavigatie zodat pagina’s vindbaar zijn zonder alleen intern zoeken.
7. Behoud afbeeldings-URL’s of map ze met geldige redirects als dat mogelijk is; archiefdocumenten met rechtenproblematiek mogen niet automatisch worden gepubliceerd.
8. Voor domein: `.nl` is primaire canonical; `.com` alleen na aantoonbare controle als permanente redirect naar `.nl` met padbehoud. Ook `www` en http/https varianten controleren.
9. Maak redirectmapping vóór livegang en check 301/308, geen 302 of redirectketens.
10. Google Search Console en privacyvriendelijke statistieken na launch monitoren; geen rankingbeloftes doen.

**Voorbeeldtitels:** `Murano Glass Collection | MURANIQ`; `Arnaldo Zanella — Biography, Signatures & Works | MURANIQ`; `Loredano Rosin — Murano Glass Sculptor | MURANIQ`.

**Nog te verifiëren met echte crawl en GSC:** huidige canonicals, indexing, metadata, redirects, 404’s, sitemapinhoud, breadcrumbs, broken links, ALT-teksten, H1-structuur, server response headers, beeldgroottes en bestaande zoekprestaties.

## 9. Kwaliteitsdoelen, toegankelijkheid, privacy en security

**Targets, geen gemeten score van huidige site:** op echte gebruikersmetingen bij p75 LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1; daarnaast sterke Lighthouse-audits op geselecteerde routes. WCAG 2.2 AA als ontwerp-/acceptatienorm (toepasselijke wettelijke vereisten afzonderlijk juridisch beoordelen).

**Accessibility-checklist:** semantische landmarks, logische heading-volgorde, skip-link, echte knoppen/links, zichtbare focus, 200%/400% zoom, bruikbare menu’s op toetsenbord en schermlezer, `prefers-reduced-motion`, voldoende contrast, label/feedback bij formulieren, dialog focus trap/return focus, onderscheidbare tekstlinks, alt-teksten, geen belangrijke tekst alleen in foto's.

**Privacy/security:** alleen noodzakelijke cookies zonder overbodige tracking, duidelijke privacytekst en bewaartermijn voor contactaanvragen, TLS, security headers incl. CSP na testen, dependency updates, server-side inputvalidatie, robuuste logs zonder persoonsgegevens te lekken, EXIF/geolocatie strippen bij publicatie, toestemming/rechten bij catalogusscans en derdenfoto's.

## 10. Stapsgewijze uitvoering (met concrete acceptatiecriteria)

### Fase 0 — Veiligstellen (geen frontend bouwen)
- Maak volledige backup van huidige website, media, inhoud en redirects. Vraag toegang tot repo/CMS, hosting en eventuele analytics.
- Maak complete URL-inventaris en download export van alle originele beeldbestanden met bronbestandsnamen en rechtenstatus.
- Noteer identieke tekst en paginatitels; verzamel contactformulierwerking, `.com` doorsturing, DNS- en SMTP-configuratie.
- **Klaar wanneer:** backups restore-testbaar zijn en alle bestaande pagina’s/afbeeldingen zijn geïnventariseerd.

### Fase 1 — Foundations
- Nieuw Git-project Next.js, TypeScript, Tailwind, ESLint, formatter, tests, CI; route- en contenttypes, Zod-validatie.
- Design tokens en responsive layout; navigation + footer + metadata + branded 404.
- **Klaar wanneer:** build, lint, typecheck en basis playwright/smoke tests slagen, lokaal en op staging.

### Fase 2 — Data en collectie
- `CollectionObject`, `Maker`, `Technique`, `Source` en `ImageAsset` daadwerkelijk implementeren.
- Ten minste 6 **echt geverifieerde** objecten met unieke dossiers (niet verzinnen), bijvoorbeeld Zanella en Rosin zodra foto’s/documentatie beschikbaar zijn.
- Collection-overzicht, categoriepagina’s, filters, zoekfunctie, objectdetail.
- **Klaar wanneer:** elk object kan worden toegevoegd via data zonder een nieuwe React-pagina te schrijven; filters en relaties werken.

### Fase 3 — Glass Guide en research
- Makers-index, makerprofielen, technieken, signatures & labels, attributierichtlijn, researchartikelen, gerelateerde objecten.
- Bestaande Zanella- en Rosin-teksten verhuizen met bronverificatie zonder stilzwijgende inhoudsverandering.
- **Klaar wanneer:** bron en toeschrijvingsniveau zichtbaar zijn en geen onbewezen feiten als zeker worden gepresenteerd.

### Fase 4 — Afwerking
- Contact/About, inquiry-status, formuliertest, privacy, beeldrechtencontrole, OG metadata, structured data, sitemaps, redirects.
- Accessibility- en responsive-test op 320, 375, 768, 1024, 1440 px plus schermlezers waar mogelijk.
- **Klaar wanneer:** hoofdgebruikspaden met toetsenbord en touch werken en metadata/redirects automatisch worden getest.

### Fase 5 — Migratie en productie
- Vergelijk oude/nieuwe URL-export, redirect test, crawl op staging, backup, deploy, DNS/certificaat, end-to-end monitoring, Search Console.
- **Klaar wanneer:** alle belangrijke oude URL’s 200 of correcte éénstapspermanente redirect geven; formulieren e-mails afleveren; content en foto’s behouden zijn; rollbackprocedure gedocumenteerd is.

### Fase 6 — Inhoudelijke groei
- Publiceer daarna in vaste cadans nieuwe objecten, makers, technieken en originele onderzoeksartikelen. Liever 20 grondig gedocumenteerde objecten dan 100 generieke placeholders.

## 11. Risicoregister

| Risico | Impact | Mitigatie |
|---|---|---|
| Originele foto’s of bronbestanden verloren bij migratie | Hoog | Backup, hash, bestandsmanifest, restore-test |
| SEO-verlies door slugs en redirects | Hoog | Oude URL’s behouden, een-op-een redirects, GSC-monitoring |
| Onjuiste toeschrijvingen worden als bewezen gepubliceerd | Hoog | Attributiestatus, bronnen, reviewflow |
| Privé aankoop-/verzekeringsgegevens lekken | Zeer hoog | Strikte fysieke scheiding private/public datasets |
| Catalogusscans/foto’s zonder hergebruikrecht online | Hoog | Rechtenregister en publicatieblokkade |
| CMS onnodig complex | Middel | Begin repo-driven, CMS later |
| Formulier werkt niet na VPS-migratie | Middel | Geautomatiseerde SMTP/inquiry-test |
| Dark design is onleesbaar | Middel | Contrast- en toegankelijkheidstest |
| Veel lege categorieën ondermijnen kwaliteit | Middel | Hide until real content, of beperkte inhoudspagina |

## 12. Beoordeling: wat is wél en niet echt vastgesteld?

**Publiek vastgesteld**: 10 onderzochte routes, tekstuele hoofdstructuur, drie `Work in progress`-pagina’s, ontbreken van uitleesbare Glass Guide-inhoud, bio’s Zanella/Rosin, gemengde taal/contactpagina, zichtbare collectie-intro. Zie live links hieronder.

**Nog niet vastgesteld**: CMS of gebruikte frontend-stack; sitewerkelijke rendering op mobiel; Lighthouse-scores; server responstijden; canonical/robots/sitemap; cookies in netwerk; correcte werking formulier; alle afbeeldingen op origineel formaat; volledige sitemap en achterliggende verborgen pagina’s; rankingpositie, zoekverkeer, redirects van `.com`; broncodekwaliteit en security. Hiervoor zijn echte browser-, server- en accounttests nodig.

**Bewuste keuze:** geen arbitraire rapportcijfers (zoals “SEO 4/10”) of verzonnen meetresultaten. Deze audit geeft een gecontroleerde inhoudsanalyse en een uitvoerbare productspecificatie, niet een gefingeerd technisch onderzoek.

## 13. Bronnen (publieke pagina’s en technische standaarden)

- https://muraniq.nl/
- https://muraniq.nl/collection/
- https://muraniq.nl/collection/murano-glass/
- https://muraniq.nl/collection/studio-glass/
- https://muraniq.nl/collection/fine-art/
- https://muraniq.nl/collection/collectible-objects/
- https://muraniq.nl/glass-guide/
- https://muraniq.nl/arnaldo-zanella/
- https://muraniq.nl/loredano-rosin/
- https://muraniq.nl/about/
- https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
- https://developers.google.com/search/docs/appearance/core-web-vitals
- https://www.w3.org/WAI/standards-guidelines/wcag/
- https://nextjs.org/docs/app/getting-started/metadata-and-og-images

**Eindconclusie:** investeer de eerste bouwtijd in contentmodellering, gegevensveiligheid, objectdetails, makerrelaties en zorgvuldige migratie. De nieuwe esthetiek is belangrijk, maar de duurzame waarde van MURANIQ zit in de schaalbare en verifieerbare catalogus.
