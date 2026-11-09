# MURANIQ — Architectuurpakket voor Claude

9 november 2026 · Architectuur en bouwinstructies; nog geen gebouwde of gepubliceerde website.

Dit pakket combineert de luxury-masterprompt, het aanvullende audit/herbouwplan en een eigen browserinspectie van tien openbare MURANIQ-pagina’s. Het is bedoeld als concrete basis voor Claude: beslissingen uitvoeren, met controleerbare doelen en zo weinig mogelijk herhaalde analyse.

## Wat je aan Claude geeft

Open de projectmap in Claude Code en geef het pakket mee. Kies Opus 5.5 en stel voor de belangrijke ontwerp- en bouwbeslissingen `xhigh` in als interpretatie van “Extra”. Controleer of de provider dit model en deze instelling aanbiedt. [Claude Code modelinstellingen](https://code.claude.com/docs/en/model-config).

De vier documenten hebben ieder een eigen functie.

1. **`docs/01-BRONAUDIT-EN-MIGRATIE.md`** — wat werkelijk op de bestaande website is gezien en hoe die inhoud behouden blijft.
2. **`docs/02-ARCHITECTUUR.md`** — de gekozen vormgeving, pagina's, technische opzet, CMS, collectiemodel, media, zoekfunctie, beveiliging, kostenafweging en kwaliteitsnormen.
3. **`docs/03-CLAUDE-BOUWOPDRACHT.md`** — de Engelstalige uitvoeringsinstructie, inclusief het geverifieerde Alchemy-pakket.
4. **`docs/04-GOALS.md`** — zeven afgebakende bouwdoelen G0–G6, met afhankelijkheden en bewijs van voltooiing.

De bestanden in `sources/` zijn ongewijzigde kopieën van de aangeleverde plannen. Ze dienen als achtergrond. Als de plannen verschillende stacks, routes of fasen voorstellen, staan de samengevoegde besluiten in document 02. Latere gebruikersinstructies blijven leidend.

## Starttekst voor Claude

```text
Lees LEESMIJ-MURANIQ.md en de vier documenten in docs/.
Voer daarna docs/03-CLAUDE-BOUWOPDRACHT.md uit, met de architectuur
in docs/02-ARCHITECTUUR.md en de Goals in docs/04-GOALS.md.

Gebruik de werkelijke l-gevity/l-gevity-skills Alchemy-werkwijze.
Controleer de aanwezige installatie en revisie; lees de passende skills.
Als Alchemy beschikbaar is:
/alchemy implement the next ready MURANIQ increment

Begin bij G0, ga vervolgens zelfstandig verder met de uitvoerbare doelen,
en maak eerst het collectiemodel en de twee referentiepagina's.
Gebruik Claude Code /goal met de voorwaarden uit docs/04-GOALS.md.
Houd de doelkaart bij en hervat vanaf het laatst geverifieerde resultaat.

Behoud de bestaande website tijdens de bouw. Bereid externe integraties,
kostenkeuzes en de uiteindelijke release concreet voor; activeer geen
betaalde diensten en wijzig productie niet zonder mijn toestemming.
Rapporteer wat echt gebouwd en getest is, plus resterende afhankelijkheden.
```

Voor Claude Code in een terminal kun je de sessie starten met `claude --model claude-opus-5-5 --effort xhigh`. Geef Claude eerst de starttekst of de bouwopdracht. Start daarna één `/goal` uit de doelkaart. De doelopdracht begint direct te werken. [Claude Code modelinstellingen](https://code.claude.com/docs/en/model-config) · [Claude Code Goals](https://code.claude.com/docs/en/goal).

## Belangrijkste keuzes

- Een exclusieve Engelstalige privégalerie met een samenhangend onderzoeksarchief.
- Obsidian, champagnegoud en beige, met echte objectfotografie als hoofdonderwerp.
- Next.js op Vercel; Sanity Studio als aanbevolen redactieomgeving voor honderden objecten.
- Vier collectiegebieden, inclusief Collectible Objects, en individuele objectdossiers met zichtbare bewijsstatus.
- Behoud van waardevolle bestaande paden, gecontroleerde migratie en een intacte huidige website tijdens de bouw.
- Detailviewer, onderzoek en bruikbare filters vóór complexe 3D-functies.

De aanbevolen private Sanity-dataset vereist een betaald plan. Het pakket levert de architectuurkeuze en de latere aansluitstap op. Alchemy levert de engineeringwerkwijze en Claude Code `/goal` bewaakt de voltooiingsvoorwaarde per fase.

Officiële skillbron: [l-gevity/l-gevity-skills](https://github.com/l-gevity/l-gevity-skills). De architectuurdocumenten bevatten de overige bronverwijzingen bij de relevante besluiten.
