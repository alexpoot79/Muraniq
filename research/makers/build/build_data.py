"""One-off builder: writes data/*.json from the seed modules in build/.
After the first build, data/*.json is the canonical store (edit there, then run scripts/validate.py and scripts/export.py).
Re-running this script would overwrite manual edits, so it refuses to run when data/makers.json exists unless --force is given."""
import json, sys, os, csv
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
DATA = os.path.join(HERE, "..", "data")
from sources_seed import SOURCES
from entities_seed import MAKERS, WORKSHOPS
from relations_seed import RELATIONSHIPS
from works_seed import WORKS, IMAGES
from verification_seed import TECHNIQUES, SIGNATURES, CLAIMS, CONFLICTS
from shortlist_seed import SHORTLIST
CHECKED = "2026-11-10"
if os.path.exists(os.path.join(DATA, "makers.json")) and "--force" not in sys.argv:
    sys.exit("data/makers.json exists – refusing to overwrite (use --force).")
for rec in MAKERS + WORKSHOPS:
    rec["checked"] = CHECKED
for r in RELATIONSHIPS: r["checked"] = CHECKED
for t in TECHNIQUES: t["checked"] = CHECKED
for s in SIGNATURES: s["checked"] = CHECKED
verification = {"claims": CLAIMS, "conflicts": [dict(id=k, description=v, claim_ids=[c["id"] for c in CLAIMS if c["conflict_group"] == k], resolution=None, resolution_status="OPEN") for k, v in CONFLICTS.items()]}
out = {"sources": SOURCES, "makers": MAKERS, "workshops": WORKSHOPS, "relationships": RELATIONSHIPS, "works": WORKS,
       "images": IMAGES, "techniques": TECHNIQUES, "signatures": SIGNATURES, "verification": verification, "shortlist": SHORTLIST}
os.makedirs(DATA, exist_ok=True)
for name, obj in out.items():
    with open(os.path.join(DATA, f"{name}.json"), "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2); f.write("\n")
print({k: (len(v) if isinstance(v, list) else {kk: len(vv) for kk, vv in v.items()}) for k, v in out.items()})
