#!/usr/bin/env python3
"""Export the canonical JSON (data/*.json) to CSV (data/csv/*.csv) and regenerate the generated Markdown deliverables:
A-master-maker-index.md, C-source-register.md, F-conflict-register.md. Run after every data edit:  python3 scripts/export.py"""
import csv, json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
def load(n): return json.load(open(os.path.join(ROOT, "data", f"{n}.json"), encoding="utf-8"))
def cell(v):
    if v is None: return ""
    if isinstance(v, list): return " | ".join(cell(x) for x in v)
    if isinstance(v, dict): return json.dumps(v, ensure_ascii=False)
    return str(v)
def write_csv(name, rows):
    os.makedirs(os.path.join(ROOT, "data", "csv"), exist_ok=True)
    keys = []
    for r in rows:
        for k in r:
            if k not in keys: keys.append(k)
    with open(os.path.join(ROOT, "data", "csv", f"{name}.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f); w.writerow(keys)
        for r in rows: w.writerow([cell(r.get(k)) for k in keys])
data = {n: load(n) for n in ["sources", "makers", "workshops", "relationships", "works", "images", "techniques", "signatures", "shortlist"]}
ver = load("verification")
for n, rows in data.items():
    if n == "shortlist":
        rows = [dict({k: v for k, v in d.items() if k != "scores"}, **d["scores"]) for d in rows]
    write_csv(n, rows)
write_csv("claims", ver["claims"]); write_csv("conflicts", ver["conflicts"])
SRC = {s["id"]: s for s in data["sources"]}
ENT = {r["id"]: r for r in data["makers"] + data["workshops"]}
SPECIAL = {"PER-DAROS-ANTONIO": "Da Ros, Antonio (Nini)", "PER-DIAZ-DE-SANTILLANA-LUDOVICO-1931": "Diaz de Santillana, Ludovico",
           "PER-DIAZ-DE-SANTILLANA-ALESSANDRO-1959": "Diaz de Santillana, Alessandro", "PER-DE-SANTILLANA-LAURA-1955": "de Santillana, Laura",
           "PER-BALSAMO-STELLA-GUIDO-1882": "Balsamo Stella, Guido", "PER-FERRO-ANTONIO-LUIGI": "Ferro, Antonio Luigi"}
def index_name(r):
    if r["id"] in SPECIAL: return SPECIAL[r["id"]]
    if r["entity_type"] == "Family": return r["name"].replace(" family", "") + " (family)"
    if r["entity_type"] != "Person": return r["name"]
    m = re.match(r"^(.*?)\s*(\(.*\))?$", r["name"]); base, suf = m.group(1), m.group(2)
    parts = base.split(); out = parts[-1] + ", " + " ".join(parts[:-1])
    return out + (f" {suf}" if suf else "")
def period(r):
    if r["entity_type"] == "Person":
        b, d = r.get("born") or "", r.get("died")
        b = b if b else "Not verified"
        life = f"{b} – {d}" if d else (f"b. {b}" if b != "Not verified" else "")
        act = "; ".join(r.get("periods") or [])
        return "; ".join(x for x in [life, f"active {act}" if act else ""] if x) or "Not verified"
    if r["entity_type"] == "Family": return "; ".join(r.get("periods") or []) or "Not verified"
    f, e = r.get("founded") or "Not verified", r.get("ended") or "Not verified"
    if f == "Not verified" and e == "Not verified": return "Not verified"
    return f"founded {f}; ended {e}" if e != "Not verified" else f"founded {f}"
def md(s): return (s or "").replace("|", "/").replace("\n", " ")
def srcs(ids):
    if not ids: return "—"
    return ", ".join(f"{i} ({SRC[i]['tier']})" for i in ids[:3]) + (f" +{len(ids)-3}" if len(ids) > 3 else "")
rows = sorted(ENT.values(), key=lambda r: index_name(r).lower().replace("'", ""))
L = ["# A — Master Maker Index", "",
     "_Gegenereerd door `scripts/export.py` uit `data/makers.json` en `data/workshops.json`. Niet met de hand bewerken. Onderzoeksdatum: 2026-11-10._", "",
     "Alfabetische index van alle personen, families, glasblazerijen, werkplaatsen, merken en distributeurs die in Phase 1 zijn geïdentificeerd. "
     "Datums staan er precies zoals de bronnen ze geven; tegenstrijdige waarden staan naast elkaar en zijn opgenomen in [F-conflict-register.md](F-conflict-register.md). "
     "'Not verified' betekent dat nog geen gelezen bron de waarde ondersteunt. Bronniveaus: A = museum/instelling, B = wetenschappelijk naslagwerk of gespecialiseerde collectie, C = bedrijf, handelaar of web. "
     "Veldwaarden zijn in het Engels omdat ze bedoeld zijn voor de Engelstalige website.", "",
     f"**Totaal:** {len(rows)} records — " + ", ".join(f"{t}: {sum(1 for r in rows if r['entity_type']==t)}" for t in ["Person","Family","Manufacturer","Workshop","Brand","Distributor"]) + ".  ",
     "**Status:** " + ", ".join(f"{s}: {sum(1 for r in rows if r['verification_status']==s)}" for s in ["VERIFIED","PARTIALLY_VERIFIED","ATTRIBUTED","DISPUTED","UNVERIFIED"]) + ".  ",
     "**Prioriteit:** " + ", ".join(f"{p}: {sum(1 for r in rows if r['research_priority']==p)}" for p in ["P1","P2","P3"]) + " (P1 = valt onder de 30 dossiers in B).", "",
     "| Name | Entity type | Period | Main association | Preliminary sources | Status | Priority | ID |", "|---|---|---|---|---|---|---|---|"]
for r in rows:
    L.append(f"| {md(index_name(r))} | {r['entity_type']} | {md(period(r))} | {md(r.get('main_association'))} | {srcs(r['source_ids'])} | {r['verification_status']} | {r['research_priority']} | `{r['id']}` |")
open(os.path.join(ROOT, "A-master-maker-index.md"), "w", encoding="utf-8").write("\n".join(L) + "\n")
# C
TIERS = {"A": "Tier A — musea, tentoonstellingsinstellingen, archieven, overheid", "B": "Tier B — wetenschappelijke naslagwerken, catalogi, teksten van gespecialiseerde collecties",
         "C": "Tier C — bedrijfssites, handelaren, marktplaatsen, algemeen web (nooit doorslaggevend)"}
ACC = {"OK": "read", "SEARCH_INDEX": "search index only", "UNAVAILABLE": "unavailable", "NOT_CONSULTED": "not yet consulted"}
L = ["# C — Source Register", "", "_Gegenereerd door `scripts/export.py` uit `data/sources.json`. Niet met de hand bewerken._", "",
     "Kolom Access: **read** = pagina volledig gelezen op de controledatum; **search index only** = alleen als zoekresultaat gezien, niet gelezen; "
     "**unavailable** = niet leesbaar vanuit de onderzoeksomgeving (reden vermeld); **not yet consulted** = bibliografische verwijzing, te raadplegen in Phase 2. "
     "Paginaspecifieke vindplaatsen (bijv. afzonderlijke Olnick Spanu-profielen, museumobjectpagina's) staan per claim in `data/verification.json` en per werk in `data/works.json`.", "",
     "**Totaal:** " + ", ".join(f"{ACC[a]}: {sum(1 for s in data['sources'] if s['access']==a)}" for a in ACC) + f" (of {len(data['sources'])}).", ""]
for t in "ABC":
    L += [f"## {TIERS[t]}", "", "| ID | Title | Author / publisher | Date | Type | Access | Checked | Link | Note |", "|---|---|---|---|---|---|---|---|---|"]
    for s in [x for x in data["sources"] if x["tier"] == t]:
        who = " / ".join(x for x in [s.get("author"), s.get("publisher")] if x)
        link = f"[link]({s['url']})" if s.get("url") else "—"
        L.append(f"| `{s['id']}` | {md(s['title'])} | {md(who)} | {md(s.get('date')) or '—'} | {s['type']} | {ACC[s['access']]} | {s.get('checked') or '—'} | {link} | {md(s.get('access_note')) or ''} |")
    L.append("")
open(os.path.join(ROOT, "C-source-register.md"), "w", encoding="utf-8").write("\n".join(L) + "\n")
# F conflicts
CL = {c["id"]: c for c in ver["claims"]}
L = ["# F (bijlage) — Conflictregister", "", "_Gegenereerd door `scripts/export.py` uit `data/verification.json`. Niet met de hand bewerken._", "",
     "Elke conflictgroep toont de concurrerende claims met bron en vindplaats. Status OPEN = nog niet opgelost; er is nergens een 'juiste' waarde gekozen.", ""]
for g in ver["conflicts"]:
    L += [f"## {g['id']} ({g['resolution_status']})", "", g["description"], "", "| Claim | Entity | Field | Value | Source | Locator |", "|---|---|---|---|---|---|"]
    for cid in g["claim_ids"]:
        c = CL[cid]; loc = f"[link]({c['locator']})" if c.get("locator") else (f"[source]({SRC[c['source_id']]['url']})" if SRC[c["source_id"]].get("url") else "—")
        L.append(f"| `{cid}` | {md(ENT[c['entity_id']]['name'])} | {c['field']} | {md(c['value'])} | `{c['source_id']}` ({SRC[c['source_id']]['tier']}) | {loc} |")
    L.append("")
open(os.path.join(ROOT, "F-conflict-register.md"), "w", encoding="utf-8").write("\n".join(L) + "\n")
print("exported:", ", ".join(sorted(os.listdir(os.path.join(ROOT, "data", "csv")))))
# B (generated table part)
SC = {"H": "hoog", "M": "middel", "L": "laag"}
L = ["# B — Priority Research Shortlist (30)", "", "_Gegenereerd door `scripts/export.py` uit `data/shortlist.json`. Niet met de hand bewerken; pas de data aan._", "",
     "Dertig dossiers voor Phase 2: vijftien glasblazerijen (soms met hun voorgangers samen in één dossier, omdat hun geschiedenis niet los te vertellen is) en vijftien personen. "
     "Families (Barovier, Seguso, Toso, Ferro, Barbini, Nason, Zanetti) worden behandeld in D, niet als los dossier.", "",
     "**Criteria** (hoog / middel / laag): *museumrelevantie* = werk of tentoonstelling aangetroffen bij museum of instelling (Met, AIC, CMA, Museo del Vetro, Le Stanze del Vetro); "
     "*historische invloed* = gedocumenteerde rol in de ontwikkeling van het Muranese glas; *verzamelrelevantie* = gewicht in de verzamelaarsliteratuur en collecties "
     "(marktbronnen tellen alleen voor relevantie, nooit voor toeschrijving); *beschikbaarheid documentatie* = gelezen of geïdentificeerde A/B-bronnen waarmee een gebronde tekst te schrijven is.", "",
     "Volgorde: glasblazerijen eerst, dan personen; de nummering is geen rangorde van belang.", "",
     "| # | Dossier | Museum | Invloed | Verzamelen | Documentatie | Waarom | Kernbronnen | Records |", "|---|---|---|---|---|---|---|---|---|"]
for d in data["shortlist"]:
    s = d["scores"]
    status = ", ".join(f"`{i}` ({ENT[i]['verification_status']})" for i in d["entity_ids"])
    L.append(f"| {d['rank']} | **{md(d['title'])}** | {SC[s['museum_relevance']]} | {SC[s['historical_influence']]} | {SC[s['collecting_relevance']]} | {SC[s['documentation_availability']]} | {md(d['motivation'])} | {', '.join('`'+k+'`' for k in d['key_source_ids'])} | {status} |")
L += ["", "Zie [B-priority-shortlist-toelichting](README.md#b--priority-research-shortlist) voor de keuzes en afwegingen."]
open(os.path.join(ROOT, "B-priority-shortlist.md"), "w", encoding="utf-8").write("\n".join(L) + "\n")
# D appendix: full relationship table
KIND_NL = {"family": "familie", "business": "zakelijk", "professional": "professioneel", "organisational": "organisatie", "identity": "identiteit"}
L = ["# D (bijlage) — Relatietabel", "", "_Gegenereerd door `scripts/export.py` uit `data/relationships.json`. Niet met de hand bewerken._", "",
     "Alle vastgelegde relaties, gegroepeerd per soort. Familierelaties zeggen niets over zakelijke banden; die staan alleen in de tabel als een bron ze noemt.", ""]
for kind in ["business", "professional", "organisational", "family", "identity"]:
    rs = [r for r in data["relationships"] if r["relation_kind"] == kind]
    L += [f"## {KIND_NL[kind].capitalize()} ({len(rs)})", "", "| ID | Subject | Relatie | Object | Van | Tot | Status | Bronnen | Toelichting |", "|---|---|---|---|---|---|---|---|---|"]
    for r in rs:
        L.append(f"| `{r['id']}` | {md(ENT[r['subject_id']]['name'])} | {r['predicate']} | {md(ENT[r['object_id']]['name'])} | {md(r.get('start')) or ''} | {md(r.get('end')) or ''} | {r['verification_status']} | {', '.join(r['source_ids']) or '—'} | {md(r.get('notes'))} |")
    L.append("")
open(os.path.join(ROOT, "D-relationship-table.md"), "w", encoding="utf-8").write("\n".join(L) + "\n")
