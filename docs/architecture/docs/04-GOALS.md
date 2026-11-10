# MURANIQ — Doelkaart voor de bouw

9 november 2026. De bouwdoelen hieronder staan klaar voor uitvoering met Claude Opus 5.5. De gekozen instelling voor “Extra” is `xhigh`. [Claude Code modelinstellingen](https://code.claude.com/docs/en/model-config).

Gebruik Claude Code’s ingebouwde `/goal` voor de actieve fase. Houd dit bestand bij als register over meerdere sessies of wanneer Goals is uitgeschakeld. `/goal` toont de huidige status en `/goal clear` beëindigt de actieve doelopdracht. Een nieuwe doelopdracht vervangt de vorige en start meteen. Plaats de uitgevoerde controles met resultaten in de chat, zodat de evaluator kan beoordelen of de voorwaarde is bereikt. [Claude Code Goals](https://code.claude.com/docs/en/goal).

## Direct bruikbare doelopdrachten

Voer iedere opdracht afzonderlijk uit nadat Claude de bouwopdracht heeft gelezen. Start met G0 en G1. Sluit externe diensten aan zodra hun concrete inrichting is goedgekeurd. Gebruik Alchemy bij de technische beslissingen binnen het actieve doel.

```text
/goal Rond G0 en G1 uit docs/04-GOALS.md lokaal af. Toon de inventaris, het werkende contentcontract en geslaagde checks op attributie, relaties en publieke velden. Gebruik alleen lokale fixtures en bestaande toegestane assets.
```

```text
/goal Rond G3 lokaal af volgens docs/02-ARCHITECTUUR.md. Toon een werkende homepage en objectpagina, een geslaagde build en visuele en toetsenbordcontroles op de afgesproken schermformaten. Rapporteer ontbrekende echte beelden of rechten als afhankelijkheid.
```

```text
/goal Maak de releasecontrole van G5 reviewbaar. Toon de resultaten van build, hoofdflows, URL-mapping, CMS en contactbezorging, plus open afhankelijkheden en het terugvalplan. Stop bij de gebruikersbeslissing voor productie.
```

Voor G2 en G4 gebruik je de bewijsvoorwaarden uit hun doelbeschrijving. Activeer G6 uitsluitend na de concrete productieopdracht. Een geblokkeerde integratie krijgt de status ‘wacht op afhankelijkheid’ en houdt zelfstandig uitvoerbaar werk buiten die integratie niet op.

## Werkwijze per doel

Gebruik de statussen `niet gestart`, `actief`, `wacht op afhankelijkheid` en `gereed`. Noteer eigenaar, invoer, uitvoer, bewijs, afhankelijkheden en eerstvolgende afgebakende stap. Alleen aantoonbaar afgerond werk wordt gereed. Een ontbrekende externe koppeling houdt onafhankelijk ontwerp- en programmeerwerk niet tegen.

Werk vanuit de vastgelegde architectuur. Houd de coördinatie centraal; verdeel zo nodig onafhankelijke taken over ontwerp/UI, content/CMS en QA/SEO. Dit zijn mogelijke werkpakketten, geen verplicht team. Geef iedere eigenaar concrete bestanden. De coördinator beheert gedeelde configuratie, afhankelijkheden en lockfile.

Gebruik Alchemy per echte technische beslissing, niet voor iedere tekstwijziging. De [pipeline](https://github.com/l-gevity/l-gevity-skills/blob/main/ALCHEMY-PIPELINE-DESIGN.md) beperkt de route tot noodzakelijke stappen en verbindt uitvoering aan bewijs. MURANIQ vertaalt dit naar: hervat het eerstvolgende uitvoerbare doel, onderzoek alleen gewijzigde aannames en herhaal geen volledige audit zonder aanleiding.

## G0 — Betrouwbare uitgangssituatie

- **Invoer:** bronaudit, architectuur, masterprompt, bestaande workspace en beschikbare assets.
- **Uitvoer:** korte inventaris van code, collectiegegevens, beeldrechten, afhankelijkheden, versies en beschikbare ontwikkelhulpmiddelen.
- **Bewijs van gereed:** aangetroffen bestanden en tools zijn benoemd; onzekerheden hebben een status; bronnen en assets zijn niet als geverifieerd voorgesteld zonder controle.
- **Afhankelijkheden:** toegang tot lokale bestanden. Ontbrekende collectie-informatie wordt apart geregistreerd.
- **Eerstvolgende stap:** inventariseer en kies één authentiek object dat de eerste volledige objectpagina kan dragen.

De gevraagde bron is gevonden: [l-gevity/l-gevity-skills](https://github.com/l-gevity/l-gevity-skills), met kleine letter **l**. De [package metadata](https://github.com/l-gevity/l-gevity-skills/blob/main/package.json) vermeldt versie **4.0.0** bij inspectie op 9 november 2026. README en [Alchemy SKILL.md](https://github.com/l-gevity/l-gevity-skills/blob/main/.claude/skills/alchemy/SKILL.md) zijn gelezen; er is niets geïnstalleerd. Controleer bij de bouw de aanwezige revisie en instructies. Leg een gecontroleerde projectinstallatie vast wanneer nodig; een ontbrekende installatie blokkeert onafhankelijk werk niet. De bouwopdracht bevat de geverifieerde werkwijze.

## G1 — Contentcontract en publicatiegrens

- **Invoer:** goedgekeurd datamodel, bekende bronvelden en privacygrenzen.
- **Uitvoer:** types/schema's voor objecten, makers, technieken, categorieën, media, bronnen en onzekerheid; expliciete openbare projecties.
- **Bewijs van gereed:** betekenisvolle controles weigeren ongeldige relaties, onduidelijke attributiestatus en ongeoorloofde publicatievelden. Een signatuur wordt niet automatisch auteurschap.
- **Afhankelijkheden:** G0. Onbekende feiten blijven onbekend; ontbrekende waarden worden niet aangevuld met verzonnen inhoud.
- **Eerstvolgende stap:** verwerk één gecontroleerd record en bewijs dat uitsluitend vrijgegeven velden de openbare weergave bereiken.

Lokale fixtures dienen om schema en weergave te ontwikkelen. Ze zijn geen vervanging voor de uiteindelijke gebruiksvriendelijke redactieomgeving. Interne eigendomsgegevens, waarden, opslaglocaties en vertrouwelijke documenten blijven buiten het publicatiesysteem; controleer ook EXIF en bestandsnamen.

## G2 — Redactie tot veilige preview

- **Invoer:** G1, CMS-schema, previewontwerp en concrete configuratievoorstellen.
- **Uitvoer:** een complete route van redactiewijziging via beschermde preview naar gecontroleerde publicatie in de voorgestelde hosted Sanity Studio.
- **Bewijs van gereed:** een wijziging is terug te zien, conceptgegevens blijven privé en publicatie en intrekking werken door in caches, zoekindex en openbare pagina’s. Upload uitsluitend vrijgegeven media. Test de afzonderlijke procedure voor media-intrekking.
- **Afhankelijkheden:** geschikte CMS-toegang, gekozen plan en toestemming voor noodzakelijke externe kosten. Dit doel is zonder werkende koppeling niet volledig gereed.
- **Eerstvolgende stap:** bereid schema, lokale adapter en voorbeeldflow voor; maak daarna de concrete account- en budgetkeuze reviewbaar.

De aanbevolen private publicatiedataset bevat alleen publiceerbare gegevens. Ontbrekende externe toestemming blokkeert het aansluiten, niet het bouwen van schema, interface, validatie en fixtures.

## G3 — Twee referentiepagina's

- **Invoer:** ontwerpsysteem, G1, authentieke goedgekeurde foto's en beschikbare objectinformatie.
- **Uitvoer:** homepage en objectdetail als visuele en functionele standaard.
- **Bewijs van gereed:** visuele controle op mobiel, tablet en desktop; leesbare typografie; volledige objectcontour; bruikbare viewer; zichtbare onzekerheid; toetsenbordbediening en reduced motion.
- **Afhankelijkheden:** echte content voor definitieve beoordeling. G2 mag voor lokaal bouwen nog openstaan; een definitieve CMS-weergave vereist de koppeling.
- **Eerstvolgende stap:** realiseer één complete objectpagina en pas dezelfde kwaliteit vervolgens op de homepage toe.

De homepage krijgt drie uitgelichte werken wanneer drie goedgekeurde werken beschikbaar zijn. Gebruik anders het werkelijke aantal en registreer de ontbrekende inhoud. Geen verplicht minimum aan verzonnen voorbeeldobjecten. Routes en composities volgen de architectuur.

## G4 — Collectie en onderzoek

- **Invoer:** goedgekeurde templates, categorieën, maker- en techniekrelaties.
- **Uitvoer:** collectie-ingang, vier bestaande categorieën, zoeken, filters, makerpagina's en bruikbare Glass Guide.
- **Bewijs van gereed:** deelbare filter-URL's; correcte lege resultaten; werkende terugnavigatie; geen volledige collectie in de browser; bronclaims blijven herkenbaar.
- **Afhankelijkheden:** G1 en herbruikbare patronen uit G3; echte publicatie vraagt G2.
- **Eerstvolgende stap:** maak categorie → filter → object → maker als één controleerbare bezoekersroute.

Geavanceerde functies volgen pas bij geschikt bronmateriaal en aantoonbare waarde. 360 graden, lichtstudies en vergelijkingen mogen de kernlancering niet onnodig vertragen.

## G5 — Contact, migratie en kwaliteit

- **Invoer:** werkende kernpagina's, definitieve bronmapping en contactconfiguratie.
- **Uitvoer:** geteste contactroute, redirectplan, SEO-inrichting, beveiligingsinstellingen en kwaliteitsrapport.
- **Bewijs van gereed:** typecheck, relevante tests en productiebuild slagen; formulierbezorging is gecontroleerd; ontbrekende controles zijn expliciet vermeld; prestaties zijn gemeten.
- **Afhankelijkheden:** G2–G4 voor volledige verificatie; externe mailtoegang voor echte bezorging.
- **Eerstvolgende stap:** controleer alle kritieke bezoekersroutes en herstel gevonden fouten voordat extra functies starten.

Behoud bestaande waardevolle paden. Redirect oude makerpagina's pas bij migratie naar werkelijk beschikbare bestemmingen. Onderscheid prestatiedoelen van gemeten resultaten en een preview van productie.

## G6 — Geautoriseerde productierelease

- **Invoer:** G5, controleerbaar releasepakket, terugvalplan en expliciete releaseopdracht van de gebruiker.
- **Uitvoer:** gecontroleerde productiepublicatie met juiste domeinen en bewaakte hoofdflows.
- **Bewijs van gereed:** openbare routes, redirect van secundair domein, HTTPS, metadata, media en contact zijn na publicatie daadwerkelijk gecontroleerd.
- **Afhankelijkheden:** expliciete toestemming voor deze productiehandeling en eventueel noodzakelijke kosten.
- **Eerstvolgende stap:** presenteer het afgeronde resultaat, open risico's en concrete releasehandeling ter beslissing.

Zonder die opdracht blijft G6 open. Geef ondertussen de reviewbare lokale of geautoriseerde previewversie met de werkelijk uitgevoerde controles. Een architectuurdocument of geslaagde lokale build telt nooit als een afgeronde live release.
