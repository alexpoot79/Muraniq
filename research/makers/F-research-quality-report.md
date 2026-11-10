# F — Research Quality Report

Onderzoeksdatum: 2026-11-10 · Phase 1, eerste levering · Bijlage: [F-conflict-register.md](F-conflict-register.md) (30 conflictgroepen, gegenereerd)

## 1. Samenvatting

| Onderdeel | Aantal | Verdeling |
|---|---|---|
| Entiteiten (A) | 155 | 90 personen, 9 families, 49 producenten, 4 werkplaatsen, 2 merken, 1 distributeur |
| — status | | 47 VERIFIED · 52 PARTIALLY_VERIFIED · 4 DISPUTED · 52 UNVERIFIED |
| Relaties (D) | 140 | 57 VERIFIED · 70 PARTIALLY_VERIFIED · 1 ATTRIBUTED · 4 DISPUTED · 8 UNVERIFIED |
| Bronnen (C) | 78 | 42 gelezen · 13 alleen zoekindex · 7 onbereikbaar · 16 nog te raadplegen (vooral boeken) |
| Claims op veldniveau | 125 | waarvan 30 conflictgroepen, alle nog OPEN |
| Referentiewerken | 38 | 33 Met, 3 Art Institute of Chicago, 2 Cleveland; 4 ATTRIBUTED, 1 DISPUTED |
| Beeldkandidaten | 38 | 9 PUBLIC DOMAIN (Met Open Access), 29 REFERENCE LINK ONLY; **niets gedownload of gepubliceerd** |
| Technieken / signaturen | 18 / 3 | technieken zonder definitie (eerst bron); alleen signaturen die in een bron staan |
| Prioriteitsdossiers (B) | 30 | 15 glasblazerijen (met voorgangers), 15 personen |

Kern: de 20e-eeuwse hoofdlijn (Cappellin–Venini, Barovier, Seguso, Toso, A.VE.M., Martens, Poli, Scarpa) is goed te onderbouwen met Tier A/B-bronnen. De 19e-eeuwse Salviati-lijn, de kleinere naoorlogse ovens en vrijwel alle hedendaagse namen zijn nog dun gedocumenteerd. Een flink deel van de lijst (52 records) is nog niet geverifieerd en hoort niet op de website voordat er bronnen zijn.

## 2. Werkwijze en statuscriteria

**Bronnen.** Gelezen in deze ronde: de tentoonstellingspagina's van Le Stanze del Vetro (Fondazione Giorgio Cini, via de WordPress-API), de pagina's van het Museo del Vetro (Fondazione Musei Civici di Venezia), dertien lemma's uit het *Dizionario Biografico degli Italiani* (Treccani), de open-access-API's van The Met, het Art Institute of Chicago en het Cleveland Museum of Art, zestig profielen van de Olnick Spanu-collectie, en de geschiedenispagina's van Seguso, Archimede Seguso, Barovier & Toso, Salviati en Oggetti. Zoekmachineresultaten zijn alleen gebruikt om bronnen te vinden en conflicten te signaleren; ze zijn nergens doorslaggevend.

**Bronniveaus.** A = museum, tentoonstellingsinstelling, archief, overheid. B = wetenschappelijk naslagwerk (DBI), catalogue raisonné, tekst van een gespecialiseerde collectie (Olnick Spanu). C = bedrijfssites (zelfgepubliceerd), handelaren, marktplaatsen, Wikipedia. Officiële bedrijfssites zijn bewust Tier C: ze zijn nuttig voor wat het bedrijf over zichzelf zegt (`COMPANY_CLAIM`), niet voor onafhankelijke verificatie.

**Statuscriteria** (afgedwongen door `scripts/validate.py` waar mogelijk):

| Status | Criterium |
|---|---|
| VERIFIED | Minstens twee onafhankelijke bronnen direct gelezen, waarvan minstens één Tier A of B, en eensgezind over identiteit en kerngegevens (rol, kernjaren). Een datumconflict over een detail staat apart als conflictclaim; de relatie zelf kan dan VERIFIED blijven. |
| PARTIALLY_VERIFIED | Identiteit bevestigd door één direct gelezen A/B-bron, óf meerdere bronnen met onvolledige of tegenstrijdige kerngegevens. |
| ATTRIBUTED | Een bron schrijft het werk of de relatie voorzichtig toe ("attributed to", "possibly"). Wordt zo overgenomen. |
| DISPUTED | Identiteit, oprichting of lijn wordt door bronnen verschillend weergegeven en dat raakt de kern van het record. |
| UNVERIFIED | Alleen Tier C/marktplaats of zoekfragmenten, of nog niet onderzocht. |

Elke bron heeft een toegangscode (`OK`, `SEARCH_INDEX`, `UNAVAILABLE`, `NOT_CONSULTED`) en een controledatum. Alles is gecontroleerd op 2026-11-10.

## 3. Wat is geverifieerd (selectie)

- **Cappellin–Venini-lijn**: oprichting V.S.M. Cappellin Venini & C. eind 1921 met Zecchin als AD; splitsing 1925 in M.V.M. Cappellin & C. en V.S.M. Venini & C. (1 juni 1925); liquidatie V.S.M. Venini & C. op 28 januari 1932; Scarpa bij Venini 1932–1947 (DBI Venini, DBI Cappellin, DBI Zecchin, DBI Scarpa, Le Stanze del Vetro, Olnick Spanu).
- **Levensdata** uit het DBI (Tier B, direct gelezen), waarbij een tweede bron de jaartallen bevestigt: Paolo Venini (12-01-1895 – 22-07-1959), Giacomo Cappellin (29-05-1887 – 14-11-1968), Napoleone Martinuzzi (31-05-1892 – 15-05-1977), Ercole Barovier (16-06-1889 – 19-05-1974), Vittorio Zecchin († 15-04-1947). Alleen uit het DBI (nog geen tweede bron voor de exacte data): Angelo Barovier († februari 1461), Giuseppe Briati (08-01-1686 – 18-01-1772), Guido Balsamo Stella (11-05-1882 – 12-08-1941).
- **Barovier-lijn**: Artisti Barovier → Vetreria Artistica Barovier & C. (1919) → fusie met S.A.I.A.R. Ferro Toso (1936) → Barovier & Toso (naam 1942); Ercole AD tot 1972.
- **Seguso Vetri d'Arte**: Poli AD 1934–1963; Archimede Seguso primo maestro en medeoprichter; eigen Vetreria Archimede Seguso vanaf 1946.
- **Fratelli Toso** gesticht in 1854 door zes broers Toso (Museo del Vetro); **A.VE.M.** opgericht 1932, Radi AD 1939–1952, Giorgio Ferro 1952–1955.
- **Carlo Moretti** opgericht 30 oktober 1958 door Carlo en Giovanni Moretti (Museo del Vetro).
- **Homoniemen** gescheiden: Angelo Barovier (15e eeuw / geb. 1927); Vittorio / Francesco Zecchin; Vincenzo Moretti (glasmaker / kardinaal in het DBI); Salviati 1859 / 1877.

## 4. Onzeker of gedeeltelijk geverifieerd

- **Salviati-complex** (DOS-07, DOS-08): drie bedrijven met bijna dezelfde naam; de bedrijfsgeschiedenis van het huidige Salviati laat de breuk van de jaren 1870 weg. Status DISPUTED/PARTIALLY_VERIFIED tot een A/B-bron (Barovier Mentasti 1982/1992, Met- of V&A-catalogi) is geraadpleegd.
- **Barovier Seguso & Ferro**: oprichtingsjaar (1932/1933), oprichters, en het jaar van de naam Seguso Vetri d'Arte (1933/1937).
- **Gino Cenedese & C., Antonio Da Ros**: alleen Olnick Spanu voor de oprichting en Tier C voor Da Ros; één museumtoeschrijving.
- **S.A.L.I.R., Vistosi, Aureliano Toso**: elk met één A/B-bron of interne tegenstrijdigheden.
- **Olnick Spanu als bron**: specifiek en meestal consistent met DBI en Le Stanze del Vetro, maar het zijn ongesigneerde collectieteksten met aantoonbare fouten (kop- vs. tekstdatums; de pagina van Ludovico Diaz de Santillana bevat de tekst van Laura). Daarom nooit als enige bron voor VERIFIED.
- **Bedrijfsclaims** die nog gecontroleerd moeten worden: Barovier "since 1295" en het privilege van 1455; Seguso "since 1397, 23 generaties"; Compasso d'Oro 1954 (Poli) en 1962 (Asti/Salviati).
- **Hedendaagse makers** (Zanella, Rosin, Signoretto, Bubacco, Toffolo, Schiavon, Celotto, Furlan, Badioli, Zanetti e.a.): bijna uitsluitend handels- en zoekbronnen. De bestaande MURANIQ-biografieën van o.a. Arnaldo Zanella en Loredano Rosin moeten opnieuw tegen primaire bronnen worden gecontroleerd voordat ze blijven staan.

## 5. Conflicten

Er zijn 30 conflictgroepen vastgelegd; geen enkele is "opgelost" door een keuze te maken. De belangrijkste voor de website:

1. **CF-SCARPA-CAPPELLIN-START** — Scarpa's begin bij M.V.M. Cappellin: 1925–26 / 1926 / eind 1926 / 1927–28.
2. **CF-MVM-CLOSURE** — sluiting M.V.M. Cappellin: 1931 of januari 1932.
3. **CF-MARTINUZZI-VENINI-END** en **CF-MARTINUZZI-MUSEUM** — 1931/1932; museumdirectie vanaf 1921 of 1922.
4. **CF-BAROVIER-TAKEOVER** en **CF-ARTISTI-BAROVIER-NAME** — 1883/1884 en 1890/1896.
5. **CF-BSF-FOUNDING** en **CF-BSF-RENAME** — Barovier Seguso & Ferro en Seguso Vetri d'Arte.
6. **CF-SALVIATI-C-FOUNDING** en **CF-SALVIATI-1877-NAME** — welke "Salviati" wanneer.
7. **CF-ZECCHIN-HOMONYM** — Vittorio of Francesco Zecchin bij Venini in 1932.
8. **CF-NICOLO-BAROVIER-DATES** — 1886–1953 (DBI) of 1895–1947 (OS).
9. **CF-MET-VENINI-NAMES** — de Met gebruikt bedrijfsnamen die niet bij de datering passen ("Venini S.p.a." voor ca. 1948; "Vetri Soffiati Muranesi e C." voor 1949–56). De Met noemt Venini bovendien "established 1921". Dit laat zien dat ook Tier A-bronnen niet blind overgenomen kunnen worden voor bedrijfsnamen.
10. **CF-PAULY-FOUNDING** — de Met schrijft een kan van ca. 1860–70 "possibly" toe aan Pauly & C., dat pas in 1902/03 werd opgericht.

Volledige lijst met alle concurrerende claims, bronnen en vindplaatsen: [F-conflict-register.md](F-conflict-register.md).

**Advies voor de website:** waar een conflict open is, beide waarden tonen met bron ("1931 volgens Le Stanze del Vetro; januari 1932 volgens Olnick Spanu") of een neutrale formulering kiezen ("begin jaren dertig"), en geen jaartal als feit presenteren.

## 6. Mogelijk ontbrekende namen

Namen die in de gelezen bronnen voorkomen maar nog geen eigen record hebben (kandidaten voor Phase 2):

- **Ovens/bedrijven**: Cirillo Maschio, Ulderico Moretti, I.V.A.M., Giviemme, Vinicio Vianello & C. (1957), Domus Vetri d'Arte, I.V.R. Mazzega, Vetreria de Majo, Cristalleria Franchetti, Francesconi, Compagnia Vetreria Muranese (opvolger Toso Vetri d'Arte, 1990), Memphis Milano (retailer).
- **Ontwerpers/maestri**: Luigi Scarpa Croce, Ermenegildo Ripa, Luciano Ferro, Egidio Ferro, Licio Zuffi, Vittorio Ferro, Renato Toso, Hans Stoltenberg Lerche, Tyra Lundgren, Franz (Peter) Pelzel, Enrico Potz, Gino Poli, Ezio Rizzetto, Ruggero Maroni, Alberto Francini, Luigi Ceresa, Emilio Ochs, Andrea Rioda, Giovanni Seguso "Patare", Diego Barovier, Raffaele Ferro, Attilio Moratto, Malvino Pavanello, Leopoldo Bearzotti, Antonio Camozzo, Benedetto en Giovanni Barovier, Maurizio Camerino, Gaetano Ceschina, Emilio Pauly, Luciano Barbon, Maurizio Albarelli, Oreste/Gino/Luciano Vistosi, Ernesto/Bruno/Isidoro Seguso, Livio Serena, Checco Ongaro.
- **Hedendaags (nog te beoordelen)**: Massimo Micheluzzi, Davide Salvadore, Gianni Toso, Giorgio Giuman, Cristiano Bianchin, Marco Zanini, Giorgio Vigna.

Mogelijk dubbel of verkeerd in de beginlijst: *Seguso Arte Vetro*, *Ars Murano*, *Arte 80*, *AAV Barbini*, *Oball*, *Gambaro & Poggi*, *Yalos* — geen bron gevonden; niet samenvoegen en niet publiceren tot ze geïdentificeerd zijn.

## 7. Beperkingen van deze ronde

- **Geblokkeerde bronnen.** De Corning Museum of Glass (website en collectiedatabase), de Fondazione Giorgio Cini (Centro Studi del Vetro, met de Venini- en Vianello-archieven) en venini.com gaven HTTP 403 op geautomatiseerde toegang. Dat is niet omzeild. Deze bronnen moeten handmatig geraadpleegd worden.
- **Wikipedia en Wikidata** gaven HTTP 429 (te veel verzoeken). Daardoor zijn er nog geen ULAN-, VIAF- of Wikidata-ID's toegevoegd.
- **Boeken.** De standaardliteratuur (Barovier Mentasti, Heiremans, Deboni, Dorigato, de Skira-catalogues raisonnés van Le Stanze del Vetro, de Venini-catalogus van 2000) is geïdentificeerd maar niet geraadpleegd (`NOT_CONSULTED`). Tot dat gebeurt is een deel van de VERIFIED-status gebaseerd op DBI + tentoonstellingsteksten + collectieteksten.
- **DBI-zoekmethode.** Lemma's zijn gezocht via de standaard-URL per naam. Voor o.a. Archimede Seguso, Flavio Poli, Dino Martens, Fulvio Bianconi, Tomaso Buzzi, Alfredo Barbini, Anzolo Fuga en Antonio Salviati gaf die URL een lege pagina. Dat bewijst niet dat er geen lemma is; een handmatige zoektocht in Treccani is nodig.
- **Museum del Vetro-catalogus** is alleen op instapniveau bekeken; de objectdatabase is nog niet doorzocht. ICCD (catalogo.beniculturali.it) en de Regione Veneto (merk Vetro Artistico Murano) zijn nog niet geraadpleegd.
- **Museumwerken** komen alleen van de Met, AIC en CMA, omdat die een open API hebben. Dat geeft een Amerikaanse vertekening; V&A (API toegestaan, nog niet bevraagd), Corning, Museo del Vetro en Fondazione CFC ontbreken nog.
- **Zoekindex-gegevens** (13 bronnen) zijn alleen gebruikt om conflicten aan te wijzen of namen te vinden, nooit voor VERIFIED.
- **Exacte geboorte- en sterfdatum van Carlo Scarpa** zijn nog niet uit het DBI-lemma overgenomen (jaren staan er wel in via AIC en Olnick Spanu).

## 8. Beeldrechten

- Alleen beelden die een museum zelf als open access aanmerkt, hebben het label PUBLIC DOMAIN: 9 objecten van de Met uit 1860–1880 (Salviati, Compagnia di Venezia e Murano, Vincenzo Moretti, Barovier). De basis staat per beeld vermeld.
- Alle 20e-eeuwse werken (Scarpa, Venini, Bianconi, Poli, Martens, Seguso, Sottsass, Tagliapietra e.a.) hebben REFERENCE LINK ONLY: de musea geven ze niet vrij en de ontwerpen zelf vallen waarschijnlijk nog onder het auteursrecht. In Italië kan industrieel ontwerp met artistieke waarde beschermd zijn tot 70 jaar na de dood van de ontwerper (wet 633/1941, art. 2 nr. 10); voor Scarpa († 1978) loopt dat tot eind 2048. **Dit is geen juridisch advies**; laat dit toetsen voordat beelden van 20e-eeuws glas worden gepubliceerd, ook als een museum een foto onder CC0 vrijgeeft.
- Er is niets gedownload of gepubliceerd. Google Images en willekeurige websites zijn niet gebruikt.

## 9. Vervolgonderzoek (voorstel voor Phase 2, in volgorde)

1. **Salviati-complex ontwarren** (DOS-07/08) met Barovier Mentasti, Met- en V&A-catalogi en eventueel de Museo del Vetro-database.
2. **Handmatige raadpleging** van Corning (collectiedatabase en Rakow Library), Cini/Centro Studi del Vetro, venini.com.
3. **Catalogues raisonnés** van Le Stanze del Vetro (Scarpa, Buzzi, Bianconi, Cappellin) en de Venini-catalogus 2000 voor modelnummers, data en signaturen; Heiremans voor S.A.L.I.R. en A.VE.M.
4. **Treccani handmatig doorzoeken** voor Poli, Martens, Bianconi, Buzzi, Archimede Seguso, Salviati, Barbini.
5. **Museo del Vetro-objectdatabase, ICCD, V&A-API** voor werken buiten de VS, en Fondazione CFC-objectpagina's.
6. **Signaturen en merken** per glasblazerij uit A/B-bronnen (bijv. de Venini-zuurstempel, Seguso-etiketten), met datering.
7. **Identifiers** toevoegen (ULAN, VIAF, Wikidata) zodra de rate limit voorbij is.
8. **Hedendaagse makers** verifiëren via Promovetro/Consorzio, Regione Veneto (merk Vetro Artistico Murano), Fondazione Cologni, Homo Faber, en direct contact; daarna de bestaande MURANIQ-biografieën herzien.
9. **Bedrijfsclaims** (1295, 1397, Compasso d'Oro) controleren bij archief- en ADI-bronnen.
10. **Technieken** definiëren met een glossariumbron (bijv. Corning, Museo del Vetro) en pas daarna op de website zetten.
