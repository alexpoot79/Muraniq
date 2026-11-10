# MURANIQ — Bronaudit en migratie

Datum: 9 november 2026. Status: beperkte audit van de openbare website, uitgevoerd via browserinspectie. Dit document beschrijft waargenomen inhoud en een migratieplan; het is geen volledige technische, historische of SEO-audit.

## 1. Uitgangssituatie en methode

De projectworkspace bevatte bij aanvang geen websitebestanden, repository of collectie-assets. De aangeleverde masterprompt vormt de functionele en creatieve opdracht. Tien openbare URL’s zijn geopend. De homepage is daarnaast in de browser-DOM onderzocht; screenshots ondersteunen de visuele waarnemingen van de homepage en Glass Guide.

De webreader kon de website niet uitlezen en een lokale aanvraag mislukte door DNS-resolutie. De browser kon de website wel openen. Deze verschillen leveren **geen bewijs dat de website offline is**.

## 2. URL-inventaris en voorgestelde bestemming

| Bestaande URL | Waargenomen inhoud | Migratiebesluit |
| --- | --- | --- |
| [Homepage](https://muraniq.nl/) | Private collectie, onafhankelijk onderzoek en incidentele mogelijkheid tot acquisitie | `/` behouden; merkintro en toegang tot kunst opnieuw vormgeven |
| [Collection](https://muraniq.nl/collection/) | Vier categorieën | `/collection/` behouden als collectie-ingang |
| [Murano Glass](https://muraniq.nl/collection/murano-glass/) | H1 en ingangen naar Arnaldo Zanella en Loredano Rosin | Bestaand pad behouden; verrijken met gepubliceerde objecten |
| [Studio Glass](https://muraniq.nl/collection/studio-glass/) | “Work in progress” | Bestaand pad behouden; alleen met goedgekeurde inhoud als volwaardige categorie lanceren |
| [Fine Art](https://muraniq.nl/collection/fine-art/) | “Work in progress” | Bestaand pad behouden; inhoudelijke publicatievoorwaarde hanteren |
| [Collectible Objects](https://muraniq.nl/collection/collectible-objects/) | “Work in progress” | Categorie en pad meenemen in het model; inhoud eerst inventariseren |
| [Glass Guide](https://muraniq.nl/glass-guide/) | In de toegankelijkheidsweergave geen inhoud in `main`; screenshot toont grote lege zwarte ruimte | Pad behouden; bruikbare gidsinhoud en bronverwijzingen voorbereiden |
| [About](https://muraniq.nl/about/) | Feitelijk contactpagina met formulier | `/about/` behouden voor echte achtergrondinformatie; nieuwe `/contact/` toevoegen en duidelijk linken |
| [Arnaldo Zanella](https://muraniq.nl/arnaldo-zanella/) | Lange biografie, collectieclaim en galerij | Bij daadwerkelijke migratie permanent doorverwijzen naar `/glass-guide/makers/arnaldo-zanella/` |
| [Loredano Rosin](https://muraniq.nl/loredano-rosin/) | Lange biografie, collectieclaim en galerij | Bij daadwerkelijke migratie permanent doorverwijzen naar `/glass-guide/makers/loredano-rosin/` |

Dit is een inventaris van bezochte pagina’s, geen complete crawl. Niet-bezochte routes en eventuele objectdetailpagina’s kunnen bestaan. Definitieve padnormalisatie en redirects moeten eerst op botsingen, redirectketens en bestaande verwijzingen worden gecontroleerd. `/about/` wordt niet naar contact doorgestuurd: het krijgt eigen inhoud en een expliciete contactlink.

## 3. Bevindingen met ontwerpgevolgen

### Identiteit en eerste indruk

De homepage gebruikt een zwart-gouden identiteit met monogram en een groot merkintrobeeld waarin tekst is verwerkt. In de bekeken smalle browserweergave krijgt kunst weinig ruimte boven de vouw. Behoud de merkherkenning en geef een echt collectieobject de hoofdrol. Plaats de introductietekst in leesbare HTML. [Homepage](https://muraniq.nl/).

De homepage positioneert MURANIQ als private collectie met onafhankelijk onderzoek; geselecteerde werken kunnen incidenteel beschikbaar zijn voor acquisitie. Dit onderbouwt een galerij met objectgebonden contactmogelijkheden. Het bewijst geen volledig verkoopproces of actuele beschikbaarheid per werk.

### Metadata, taal en structuur

De bekeken homepage heeft de titel **“MURANIQ | Murano Glass, Fine Art & Collectible Objects”**, een metabeschrijving en canonical `https://muraniq.nl/`. Het document gebruikt `nl-NL`, terwijl de bekeken inhoud Engels is. De nieuwe Engelse pagina’s moeten een bijpassende taalinstelling krijgen. In de onderzochte homepage-DOM zijn alleen H2- en H3-koppen aangetroffen; ontwerp de nieuwe pagina met een duidelijke hoofdheading en logische hiërarchie. [Bron: homepage](https://muraniq.nl/).

Het generatorveld vermeldt **“MyWebsite NOW”**. Een aangetroffen `wp-content`-pad bewijst op zichzelf niet dat de huidige site WordPress gebruikt. Zonder broncode of beheeromgeving wordt geen platformmigratie verondersteld.

De logoafbeelding heeft lege alttekst, maar de omvattende link draagt het label “Site-logo”. Dit is geen vastgesteld toegankelijkheidsdefect zonder verdere context; een herkenbare toegankelijke linknaam zoals “MURANIQ — Home” is wel een concrete verbetering. Footerlinks verwijzen naar de algemene roots van Facebook en Instagram. Vervang deze alleen door geverifieerde profieladressen of laat ze weg. Het contactadres in de footer is `info@muraniq.com`. [Bron: homepage](https://muraniq.nl/).

### Collectie en onderzoeksinhoud

De [collectie-ingang](https://muraniq.nl/collection/) toont vier categorieën, inclusief Collectible Objects. Deze vierde categorie moet bij de migratie behouden blijven, ook al legt de masterprompt vooral nadruk op glas en fine art. Het label “STUDIO GLAS” vraagt taalredactie naar de gekozen Engelse terminologie.

De [Zanella-pagina](https://muraniq.nl/arnaldo-zanella/) bevat zes medialinks; de zes onderzochte galerieafbeeldingen hebben lege alttekst. De [Rosin-pagina](https://muraniq.nl/loredano-rosin/) bevat vier medialinks. **Een aantal foto’s is geen aantal kunstwerken.** Afbeeldingen mogen pas aan objectrecords worden gekoppeld nadat identiteit en samenhang zijn vastgesteld.

Op objectniveau zijn geen stabiele ID’s, afmetingen of provenance vastgesteld. In deze inspectie zijn geen afzonderlijke objectdetailroutes gezien. De biografische beweringen zijn niet onafhankelijk historisch geverifieerd. Publiceer ze daarom niet automatisch als gecontroleerde collectiefeiten.

### Contact en ontbrekende inhoud

De [About-pagina](https://muraniq.nl/about/) heeft de browsertitel “Contacteer Muraniq - Exclusieve Kunst en Service” en toont een contactformulier. In de toegankelijkheidsweergave zijn Name, Message en toestemming zichtbaar; daar is geen e-mailveld vastgesteld. Het formulier is niet verstuurd of functioneel getest. De nieuwe contactflow moet een bruikbare antwoordmogelijkheid, echte foutafhandeling en gecontroleerde bezorging hebben.

De drie “Work in progress”-categorieën en de lege [Glass Guide](https://muraniq.nl/glass-guide/) tonen een redactionele achterstand. Ontwerpstructuur alleen vult deze niet: de release heeft goedgekeurde teksten en authentieke beelden nodig.

## 4. Redactionele migratieprocedure

1. **Leg de bron vast.** Maak een volledige URL- en mediainventaris met paginatitel, bron-URL, datum, bestaande inhoud en voorgestelde bestemming. Controleer aanvullend sitemaps, interne links en beschikbare zoekprestatiegegevens.
2. **Identificeer werken.** Laat een collectiebeheerder vaststellen welke beelden hetzelfde object tonen. Ken daarna stabiele object-ID’s toe; bestandsnamen of galerijvolgorde zijn onvoldoende identificatie.
3. **Verifieer feiten en rechten.** Controleer makers, dateringen, materiaal, techniek, afmetingen, beeldrechten en bronvermeldingen. Leg onbekende waarden expliciet vast. Gebruik labels voor bewezen feiten, gedocumenteerde of waarschijnlijke toeschrijvingen en hypotheses.
4. **Scheid intern en openbaar.** Publiceer uitsluitend vrijgegeven gegevens. Houd eigenaarsgegevens, waarden, opslaglocaties, facturen en vertrouwelijke correspondentie buiten de webpublicatie. Controleer ook EXIF en bestandsnamen.
5. **Maak een mediaregister.** Koppel ieder goedgekeurd beeld aan een object, zichttype, alttekst, caption, credit en rechtenstatus. Bewaar originelen; genereer gecontroleerde webafgeleiden.
6. **Controleer de mapping.** Vergelijk oud en nieuw per URL en object. Bewaar waardevolle tekst; corrigeer onzekere informatie met een zichtbare en onderbouwde redactionele keuze.
7. **Valideer vóór omschakeling.** Test redirects, interne links, canonical, metadata, media, formulieren en afwezigheid van interne gegevens. Leg terugvalmogelijkheden vast. Productieomschakeling blijft een afzonderlijke geautoriseerde stap.

## 5. Grenzen en open verificaties

Er zijn geen analytics, indexeringsgegevens, responseheaders, Core Web Vitals, volledige sitemap, robotsbestand, broncode of beheersystemen onderzocht. Er is geen volledige toegankelijkheidsaudit uitgevoerd. De formulieren en socialprofielen zijn niet functioneel geverifieerd. Er zijn geen objectrecords, provenanceketens of ontbrekende historische feiten gereconstrueerd.

De bevindingen onderbouwen de informatiearchitectuur en migratieaanpak. Ze bewijzen geen huidige bezoekersaantallen, SEO-prestaties, hostingconfiguratie, beveiligingsniveau of volledigheid van de collectie.
