"""
Bharat Villages — FastAPI Backend
Run:  python -m uvicorn main:app --reload
UI:   http://127.0.0.1:8000/ui
Docs: http://127.0.0.1:8000/docs
"""

import json
import os
import subprocess
import sys
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

# ── Bootstrap: run data processor if outputs are missing ──────────────────────
def _bootstrap():
    need = not Path("village_data.json").exists() or not Path("final_village_dataset.csv").exists()
    if need and Path("process_data.py").exists():
        print("🔄  Generating data files (first run)…")
        subprocess.run([sys.executable, "process_data.py"], check=True)

_bootstrap()

# ── Load data ─────────────────────────────────────────────────────────────────
_DATA_FILE = "village_data.json"

def _load() -> dict:
    if not Path(_DATA_FILE).exists():
        return {}
    with open(_DATA_FILE, encoding="utf-8") as f:
        return json.load(f)

DATA: dict = _load()   # { State → { District → { Subdistrict → [ village, … ] } } }


def _ci(s: str) -> str:
    """Case-insensitive normalise."""
    return s.strip().lower()


# ── Pre-compute flat search index ─────────────────────────────────────────────
_FLAT: List[dict] = []

for state, districts in DATA.items():
    for district, subdistricts in districts.items():
        for subdistrict, villages in subdistricts.items():
            for v in villages:
                # Handle both plain strings AND {"code":…, "name":…} dicts
                if isinstance(v, dict):
                    vname = v.get("name", "")
                    vcode = v.get("code", "")
                else:
                    vname = str(v)
                    vcode = ""
                _FLAT.append({
                    "state":       state,
                    "district":    district,
                    "subdistrict": subdistrict,
                    "village":     vname,
                    "code":        vcode,
                    "_key":        " ".join([state, district, subdistrict, vname]).lower(),
                })


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Bharat Villages API",
    description="Village-level geographical data for all Indian states.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/", summary="Health check")
def root():
    return {"status": "ok", "message": "Bharat Villages API is running 🇮🇳"}


@app.get("/ui", summary="Serve frontend", include_in_schema=False)
def serve_ui():
    path = Path("index.html")
    if not path.exists():
        raise HTTPException(404, "index.html not found")
    return FileResponse(str(path), media_type="text/html")


@app.get("/stats", summary="Dataset statistics")
def stats():
    states       = len(DATA)
    districts    = sum(len(d) for d in DATA.values())
    subdistricts = sum(len(s) for d in DATA.values() for s in d.values())
    villages     = len(_FLAT)
    return {
        "states":       states,
        "districts":    districts,
        "subdistricts": subdistricts,
        "villages":     villages,
    }


@app.get("/states", summary="List all states", response_model=List[str])
def list_states():
    return sorted(DATA.keys())


@app.get("/districts/{state}", summary="List districts in a state")
def list_districts(state: str):
    key = _ci(state)
    match = next((k for k in DATA if _ci(k) == key), None)
    if match is None:
        raise HTTPException(404, f"State '{state}' not found")
    return sorted(DATA[match].keys())


@app.get("/subdistricts/{state}/{district}", summary="List subdistricts")
def list_subdistricts(state: str, district: str):
    skey = _ci(state)
    dkey = _ci(district)
    smatch = next((k for k in DATA if _ci(k) == skey), None)
    if smatch is None:
        raise HTTPException(404, f"State '{state}' not found")
    dmatch = next((k for k in DATA[smatch] if _ci(k) == dkey), None)
    if dmatch is None:
        raise HTTPException(404, f"District '{district}' not found in state '{state}'")
    return sorted(DATA[smatch][dmatch].keys())


@app.get("/villages/{state}/{district}/{subdistrict}", summary="List villages")
def list_villages(state: str, district: str, subdistrict: str):
    skey  = _ci(state)
    dkey  = _ci(district)
    sdkey = _ci(subdistrict)

    smatch = next((k for k in DATA if _ci(k) == skey), None)
    if smatch is None:
        raise HTTPException(404, f"State '{state}' not found")

    dmatch = next((k for k in DATA[smatch] if _ci(k) == dkey), None)
    if dmatch is None:
        raise HTTPException(404, f"District '{district}' not found")

    sdmatch = next((k for k in DATA[smatch][dmatch] if _ci(k) == sdkey), None)
    if sdmatch is None:
        raise HTTPException(404, f"Subdistrict '{subdistrict}' not found")

    result = []
    for v in DATA[smatch][dmatch][sdmatch]:
        if isinstance(v, dict):
            result.append({"name": v.get("name", ""), "code": v.get("code", "")})
        else:
            result.append({"name": str(v), "code": ""})
    return sorted(result, key=lambda x: x["name"])


@app.get("/search", summary="Search villages")
def search(q: str = Query(..., min_length=1, description="Search query")):
    key = _ci(q)
    results = [
        {k: v for k, v in r.items() if not k.startswith("_")}
        for r in _FLAT
        if key in r["_key"]
    ]
    return sorted(results, key=lambda r: (
        0 if _ci(r["village"]).startswith(key) else
        1 if key in _ci(r["village"]) else 2,
        r["village"]
    ))[:200]  # cap at 200 for performance


# ── Dev entrypoint ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)