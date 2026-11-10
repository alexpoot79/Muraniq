# MURANIQ — Makers & Workshops: onderzoek Phase 1

Onderzoeksdatabase voor **GLASS GUIDE → MAKERS & WORKSHOPS** op muraniq.nl. Dit is de eerste levering (Phase 1: onderzoek en leveringen A–F). Er is **geen websitecode** gewijzigd en er is niets in Sanity geïmporteerd; dit staat bewust op een eigen branch (`claude/project-thread-d9abh3`), los van de website-branch en PR #1.

Onderzoeksdatum van alle controles: **2026-11-10**.

## Wat staat waar

| Levering | Bestand | Soort |
|---|---|---|
| A — Master Maker Index | [A-master-maker-index.md](A-master-maker-index.md) | gegenereerd uit de data (155 records) |
| B — Priority Research Shortlist (30) | [B-priority-shortlist.md](B-priority-shortlist.md) · toelichting hieronder | gegenereerd + toelichting |
| C — Source Register | [C-source-register.md](C-source-register.md) | gegenereerd (78 bronnen, met toegangsstatus en datum) |
| D — Historical Relationships | [D-historical-relationships.md](D-historical-relationships.md) · [volledige relatietabel](D-relationship-table.md) | handgeschreven (9 casussen) + gegenereerde tabel (140 relaties) |
| E — Data Architecture | [E-data-architecture.md](E-data-architecture.md) | handgeschreven, met echte voorbeeldrecords |
| F — Research Quality Report | [F-research-quality-report.md](F-research-quality-report.md) · [conflictregister](F-conflict-register.md) | handgeschreven + gegenereerd register (30 conflicten) |
| Data | `data/*.json` (canoniek), `data/csv/*.csv` (afgeleid), `data/csv/url-checks.csv` (URL-log) | JSON + CSV |
| Schema's en scripts | `schema/*.schema.json`, `scripts/validate.py`, `scripts/export.py` | JSON Schema, Python 3 |

## Werken met de data

```bash
cd research/makers
python3 scripts/validate.py   # moet eindigen met "0 errors"
python3 scripts/export.py     # werkt CSV's en gegenereerde Markdown (A, B, C, D-tabel, F-register) bij
```

Pas alleen `data/*.json` aan. De CSV's en de gegenereerde Markdown worden overschreven bij de volgende export. De bestanden in `build/` zijn de seeds waarmee versie 0.1 is opgebouwd; `build/build_data.py` weigert bestaande data te overschrijven.

## Hoe betrouwbaar is dit?

- Elke entiteit, relatie en bewering heeft een status: `VERIFIED`, `PARTIALLY_VERIFIED`, `ATTRIBUTED`, `DISPUTED` of `UNVERIFIED`. De criteria staan in F §2 en worden door het validatiescript afgedwongen (bijv. VERIFIED vereist minstens twee bronnen, waarvan één museum- of wetenschappelijke bron die echt gelezen is).
- Ontbrekende gegevens staan als `Not verified`; onbereikbare bronnen als `UNAVAILABLE` met reden. Er zijn geen titels, datums, signaturen of samenwerkingen ingevuld zonder bron.
- Bronnen die niet geautomatiseerd te lezen waren (Corning Museum of Glass, Fondazione Giorgio Cini, venini.com) zijn niet omzeild maar gemarkeerd voor handmatige raadpleging. De standaardboeken zijn geïdentificeerd maar nog niet geraadpleegd. Zie F §7.
- Beelden: 9 kandidaten zijn PUBLIC DOMAIN volgens de open-access-vlag van de Met (19e-eeuws glas); alle 20e-eeuwse werken zijn REFERENCE LINK ONLY. Er is niets gedownload of gepubliceerd.

## B — Priority Research Shortlist

De dertig dossiers zijn gekozen op vier criteria (museumrelevantie, historische invloed, verzamelrelevantie, beschikbaarheid van documentatie), met een paar bewuste keuzes:

- **Bedrijven met hun voorgangers samen.** V.S.M. Venini & C. en Venini & C. vormen één dossier; Barovier & Toso neemt Artisti Barovier, de Vetreria Artistica Barovier en S.A.I.A.R. Ferro Toso mee; Seguso Vetri d'Arte neemt Barovier Seguso & Ferro mee. Hun geschiedenis is niet los te vertellen. V.S.M. Cappellin Venini & C. en M.V.M. Cappellin & C. zijn wel aparte dossiers, omdat de splitsing van 1925 juist het verhaal is.
- **Salviati en de Compagnia di Venezia e Murano / Pauly** staan erin ondanks de rommelige bronnen, omdat ze de 19e-eeuwse herleving dragen en omdat de website anders op één bedrijfsgeschiedenis zou leunen.
- **Antonio Da Ros en Gino Cenedese** scoren laag op documentatie maar staan erin omdat ze expliciet gevraagd zijn en veel voorkomen in collecties; juist daar is bronwerk nodig.
- **Angelo Barovier (15e eeuw)** is opgenomen als historisch anker (cristallo), met een homoniemwaarschuwing.
- **Families** (Barovier, Seguso, Toso, Ferro, Barbini, Nason, Zanetti) zijn geen los dossier; hun verbanden staan in D.
- Niet in de 30, wel hoog in P2: Giuseppe en Benvenuto Barovier, Tobia Scarpa, Ermanno Toso, Anzolo Fuga, Giorgio Ferro, Guido Balsamo Stella, Vinicio Vianello, Alessandro Pianon, Yoichi Ohira, Livio Seguso, Pino Signoretto, Carlo Moretti, Nason & Moretti.

## Volgende stap

Voorstel voor Phase 2 staat in F §9. Eerste punten: het Salviati-complex ontwarren, de geblokkeerde bronnen (Corning, Cini, Venini) handmatig raadplegen, en de catalogues raisonnés van Le Stanze del Vetro gebruiken voor modelnummers, data en signaturen.
