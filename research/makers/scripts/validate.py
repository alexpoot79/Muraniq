#!/usr/bin/env python3
"""Validate the MURANIQ makers research dataset (research/makers/data/*.json).
Usage: python3 scripts/validate.py        -> prints errors/warnings, exit code 1 on errors.
No third-party packages needed; if 'jsonschema' is installed the JSON Schemas in schema/ are applied as well."""
import json, os, re, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
D = lambda n: json.load(open(os.path.join(ROOT, "data", f"{n}.json"), encoding="utf-8"))
sources, makers, workshops, rels, works, images, techs, sigs, ver = (D(n) for n in
    ["sources", "makers", "workshops", "relationships", "works", "images", "techniques", "signatures", "verification"])
claims, conflicts = ver["claims"], ver["conflicts"]
shortlist = D("shortlist")
E, W = [], []
STATUS = {"VERIFIED", "PARTIALLY_VERIFIED", "ATTRIBUTED", "DISPUTED", "UNVERIFIED"}
RIGHTS = {"LICENSED FOR USE", "PUBLIC DOMAIN", "PERMISSION REQUIRED", "REFERENCE LINK ONLY", "RIGHTS UNKNOWN"}
ACCESS = {"OK", "SEARCH_INDEX", "UNAVAILABLE", "NOT_CONSULTED"}
ETYPES = {"Person", "Family", "Manufacturer", "Workshop", "Brand", "Distributor"}
PREDICATES = {"CHILD_OF", "SIBLING_OF", "SON_IN_LAW_OF", "MEMBER_OF_FAMILY", "FOUNDED", "CO_FOUNDED", "PARTNER_IN", "OWNER_OF",
              "MANAGED", "ARTISTIC_DIRECTOR_OF", "DESIGNED_FOR", "MAESTRO_AT", "WORKED_AT", "SUCCEEDED_BY", "MERGED_INTO",
              "RENAMED_TO", "NOT_SAME_AS", "IDENTITY_UNRESOLVED"}
CLAIM_TYPES = {"SOURCE_STATES", "SOURCE_ATTRIBUTES", "COMPANY_CLAIM"}
PREFIX = {"sources": ("SRC",), "shortlist": ("DOS",), "makers": ("PER", "FAM"), "workshops": ("ORG",), "relationships": ("REL",), "works": ("WRK",),
          "images": ("IMG",), "techniques": ("TEC",), "signatures": ("SIG",), "claims": ("CLM",), "conflicts": ("CF",)}
sets = {"sources": sources, "makers": makers, "workshops": workshops, "relationships": rels, "works": works, "images": images,
        "techniques": techs, "signatures": sigs, "claims": claims, "conflicts": conflicts, "shortlist": shortlist}
seen = {}
for name, recs in sets.items():
    for r in recs:
        i = r.get("id", "")
        if not re.fullmatch(r"[A-Z]+-[A-Z0-9-]+", i) or i.split("-")[0] not in PREFIX[name]:
            E.append(f"{name}: bad id '{i}'")
        if i in seen: E.append(f"duplicate id {i} ({seen[i]} / {name})")
        seen[i] = name
SRC = {s["id"]: s for s in sources}
ENT = {r["id"]: r for r in makers + workshops}
WRK = {w["id"] for w in works}; TEC = {t["id"] for t in techs}; CLM = {c["id"] for c in claims}
def srcref(where, ids):
    for s in ids:
        if s not in SRC: E.append(f"{where}: unknown source {s}")
# sources
for s in sources:
    if s["tier"] not in "ABC" or len(s["tier"]) != 1: E.append(f"{s['id']}: tier '{s['tier']}'")
    if s["access"] not in ACCESS: E.append(f"{s['id']}: access '{s['access']}'")
    if s["access"] == "OK" and not (s.get("url") and s.get("checked")): E.append(f"{s['id']}: access OK needs url + checked date")
    if s["access"] in ("UNAVAILABLE", "SEARCH_INDEX") and not s.get("access_note"): W.append(f"{s['id']}: {s['access']} without access_note")
def strong(ids):  # Tier A/B read directly
    return [i for i in ids if i in SRC and SRC[i]["tier"] in "AB" and SRC[i]["access"] == "OK"]
# entities
for r in makers + workshops:
    w = r["id"]
    if r["entity_type"] not in ETYPES: E.append(f"{w}: entity_type '{r['entity_type']}'")
    if r["verification_status"] not in STATUS: E.append(f"{w}: status '{r['verification_status']}'")
    if r["research_priority"] not in ("P1", "P2", "P3"): E.append(f"{w}: priority '{r['research_priority']}'")
    srcref(w, r["source_ids"])
    st = r["verification_status"]
    if st == "VERIFIED" and (len(r["source_ids"]) < 2 or not strong(r["source_ids"])):
        E.append(f"{w}: VERIFIED needs >=2 sources incl. >=1 Tier A/B read directly")
    if st in ("PARTIALLY_VERIFIED", "DISPUTED", "ATTRIBUTED") and not r["source_ids"]:
        E.append(f"{w}: {st} without any source")
    if st in ("VERIFIED", "PARTIALLY_VERIFIED") and r["source_ids"] and all(SRC.get(i, {}).get("type") == "marketplace" for i in r["source_ids"]):
        E.append(f"{w}: status based on marketplace sources only")
    if st == "DISPUTED" and not (r.get("notes") or any(c["entity_id"] == w and c["conflict_group"] for c in claims)):
        W.append(f"{w}: DISPUTED without note or conflict claim")
    if r["research_priority"] == "P1" and st == "UNVERIFIED": W.append(f"{w}: P1 but UNVERIFIED")
# relationships
for r in rels:
    w = r["id"]
    for k in ("subject_id", "object_id"):
        if r[k] not in ENT: E.append(f"{w}: unknown {k} {r[k]}")
    if r["predicate"] not in PREDICATES: E.append(f"{w}: predicate {r['predicate']}")
    if r["verification_status"] not in STATUS: E.append(f"{w}: status {r['verification_status']}")
    srcref(w, r["source_ids"])
    if r["verification_status"] != "UNVERIFIED" and not r["source_ids"]: E.append(f"{w}: needs a source")
    if r["verification_status"] == "VERIFIED" and (len(r["source_ids"]) < 2 or not strong(r["source_ids"])):
        E.append(f"{w}: VERIFIED relation needs >=2 sources incl. >=1 Tier A/B read directly")
    if r["subject_id"] == r["object_id"]: E.append(f"{w}: self-relation")
# works / images
for x in works:
    for k in ("designer_ids", "maker_ids", "workshop_ids", "candidate_workshop_ids"):
        for i in x[k]:
            if i not in ENT: E.append(f"{x['id']}: unknown {k} {i}")
    for t in x["technique_ids"]:
        if t not in TEC: E.append(f"{x['id']}: unknown technique {t}")
    srcref(x["id"], x["source_ids"])
    if x["attribution_status"] not in STATUS: E.append(f"{x['id']}: attribution_status")
    if not x.get("object_url"): E.append(f"{x['id']}: object_url missing")
for im in images:
    if im["work_id"] not in WRK: E.append(f"{im['id']}: unknown work {im['work_id']}")
    if im["rights_label"] not in RIGHTS: E.append(f"{im['id']}: rights_label {im['rights_label']}")
    if im["rights_label"] == "PUBLIC DOMAIN" and not (im.get("image_url") and im.get("rights_basis")): E.append(f"{im['id']}: PD needs image_url + basis")
    if (im.get("downloaded") or im.get("published")) and im["rights_label"] not in ("PUBLIC DOMAIN", "LICENSED FOR USE"):
        E.append(f"{im['id']}: downloaded/published although rights are '{im['rights_label']}'")
# techniques / signatures
for t in techs:
    srcref(t["id"], t["source_ids"])
    for i in t["associated_entity_ids"]:
        if i not in ENT: E.append(f"{t['id']}: unknown entity {i}")
    for i in t["example_work_ids"]:
        if i not in WRK: E.append(f"{t['id']}: unknown work {i}")
for s in sigs:
    if s["entity_id"] not in ENT: E.append(f"{s['id']}: unknown entity")
    if not s["source_ids"]: E.append(f"{s['id']}: signature without source (never record undocumented marks)")
    srcref(s["id"], s["source_ids"])
# claims / conflicts
groups = {c["id"] for c in conflicts}
for c in claims:
    if c["entity_id"] not in ENT: E.append(f"{c['id']}: unknown entity {c['entity_id']}")
    if c["source_id"] not in SRC: E.append(f"{c['id']}: unknown source {c['source_id']}")
    if c["claim_type"] not in CLAIM_TYPES: E.append(f"{c['id']}: claim_type")
    if c["conflict_group"] and c["conflict_group"] not in groups: E.append(f"{c['id']}: unknown conflict {c['conflict_group']}")
for g in conflicts:
    if len(g["claim_ids"]) < 2: W.append(f"{g['id']}: fewer than 2 claims")
    for i in g["claim_ids"]:
        if i not in CLM: E.append(f"{g['id']}: unknown claim {i}")
# shortlist
if len(shortlist) != 30: E.append(f"shortlist: expected 30 dossiers, found {len(shortlist)}")
for d in shortlist:
    for i in d["entity_ids"]:
        if i not in ENT: E.append(f"{d['id']}: unknown entity {i}")
        elif ENT[i]["research_priority"] != "P1": W.append(f"{d['id']}: {i} is not P1")
    srcref(d["id"], d["key_source_ids"])
    for k, v in d["scores"].items():
        if v not in ("H", "M", "L"): E.append(f"{d['id']}: score {k}={v}")
# optional JSON Schema pass
try:
    import jsonschema
    for name in ["sources", "makers", "workshops", "relationships", "works", "images", "techniques", "signatures", "verification", "shortlist"]:
        p = os.path.join(ROOT, "schema", f"{name}.schema.json")
        if os.path.exists(p):
            v = jsonschema.Draft202012Validator(json.load(open(p)))
            for err in v.iter_errors(D(name)): E.append(f"schema {name}: {'/'.join(map(str, err.path))}: {err.message}")
except ImportError:
    W.append("jsonschema not installed – JSON Schema pass skipped (built-in checks ran)")
for x in W: print("WARN ", x)
for x in E: print("ERROR", x)
print(f"\n{len(E)} errors, {len(W)} warnings – sources {len(sources)}, makers {len(makers)}, workshops {len(workshops)}, "
      f"relationships {len(rels)}, works {len(works)}, images {len(images)}, techniques {len(techs)}, signatures {len(sigs)}, "
      f"claims {len(claims)}, conflicts {len(conflicts)}")
sys.exit(1 if E else 0)
