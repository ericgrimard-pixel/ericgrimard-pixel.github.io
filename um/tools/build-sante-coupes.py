#!/usr/bin/env python3
"""Reproducible build of the two Class-2 health cuts (Hub v21.06).

Reads the original CSVs (byte-preserving) and writes:
  um/data/sante/villes-wup2025/          CSV + index.json + cities.json
  um/data/sante/provinces-canada-statcan-13-10-0114/   CSV + index.json
  um/engine/data/sante-villes.js         LIB system (country medians)
  um/engine/data/sante-provinces.js      LIB system (10 geos × sex × age columns)

The cities engine entry is one Class-1 point per country (median of that
country's city populations, thousands). The Manifestation Engine builds one
mesh per Class-1 object (engine.js makeObj); 16 768 meshes are not loaded.
Every city stays in the original CSV and in cities.json. Gap flags are copied
onto the LIB entry so the Hub can show them without another request.

Does not touch um/data/sante/xyz/ or um/engine/engine.js.

Usage (from the repo root):
  python3 um/tools/build-sante-coupes.py

If um/_incoming/claude-2026-11-27/ still holds the split city parts, they are
reassembled (part01 in full, later parts drop the repeated header through the
first LF). Line endings are not normalised. The result must be 2 024 403 bytes,
SHA-256 11fb42ead42163c32f54ab998cddebdd78b86162cc5aee17a64fc92b84defdf5.
"""
from __future__ import annotations

import csv
import hashlib
import io
import json
import statistics
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
INCOMING = ROOT / "um" / "_incoming" / "claude-2026-11-27"
VILLES = ROOT / "um" / "data" / "sante" / "villes-wup2025"
PROV = ROOT / "um" / "data" / "sante" / "provinces-canada-statcan-13-10-0114"
ENGINE_DATA = ROOT / "um" / "engine" / "data"
U5 = ROOT / "um" / "data" / "sante" / "u5mr" / "index.json"

VILLES_SHA = "11fb42ead42163c32f54ab998cddebdd78b86162cc5aee17a64fc92b84defdf5"
VILLES_BYTES = 2024403
VILLES_NAME = "sante-villes-wup2025-T0-1990-T1-2024.csv"
PROV_SHA = "f9c1c9163bc32ab18c01f8406ba42e7168d187b6daf944e4f6ba75bacf0f962a"
PROV_BYTES = 20205
PROV_NAME = "sante-provinces-canada-statcan-13-10-0114.csv"

UNATTACHED = ["CUW", "ESH", "GIB", "GLP", "GUF", "HKG", "JEY", "MAC", "MTQ", "MYT", "NCL", "PRI", "PYF", "REU", "TWN"]
ZONE_FR = {
    "Africa": "Afrique",
    "America": "Amériques",
    "East": "Est",
    "Europe": "Europe",
    "Middle_East": "Moyen-Orient",
    "South_Pacific": "Pacifique Sud",
}
ZONE_ORDER = ["Africa", "America", "East", "Europe", "Middle_East", "South_Pacific"]
GEO_FR = {
    "Alberta": ("AB", "Alberta"),
    "British Columbia": ("BC", "Colombie-Britannique"),
    "Canada": ("CA", "Canada"),
    "Manitoba": ("MB", "Manitoba"),
    "New Brunswick": ("NB", "Nouveau-Brunswick"),
    "Newfoundland and Labrador": ("NL", "Terre-Neuve-et-Labrador"),
    "Nova Scotia": ("NS", "Nouvelle-Écosse"),
    "Ontario": ("ON", "Ontario"),
    "Quebec": ("QC", "Québec"),
    "Saskatchewan": ("SK", "Saskatchewan"),
}
SEX_FR = {"Both sexes": ("b", "les deux sexes"), "Females": ("f", "femmes"), "Males": ("m", "hommes")}
AGE_FR = {
    "0 years": ("0", "0 an"),
    "15 years": ("15", "15 ans"),
    "25 years": ("25", "25 ans"),
    "45 years": ("45", "45 ans"),
    "65 years": ("65", "65 ans"),
    "85 years": ("85", "85 ans"),
}
SEX_ORDER = ["Both sexes", "Females", "Males"]
AGE_ORDER = ["0 years", "15 years", "25 years", "45 years", "65 years", "85 years"]


def sha256(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()


def fr_num(x, nd=1):
    if x is None:
        return "—"
    s = f"{x:.{nd}f}".replace(".", ",")
    return s


def reassemble_villes() -> bytes:
    dest = VILLES / VILLES_NAME
    parts = sorted(INCOMING.glob("sante-villes-wup2025-T0-1990-T1-2024.part*.csv")) if INCOMING.is_dir() else []
    if len(parts) >= 2:
        out = bytearray(parts[0].read_bytes())
        for p in parts[1:]:
            b = p.read_bytes()
            cut = b.find(b"\n")
            if cut < 0:
                raise SystemExit(f"part sans LF : {p.name}")
            out.extend(b[cut + 1 :])
        raw = bytes(out)
    elif dest.is_file():
        raw = dest.read_bytes()
    else:
        raise SystemExit("CSV villes introuvable (ni parts _incoming, ni fichier assemblé)")
    if len(raw) != VILLES_BYTES or sha256(raw) != VILLES_SHA:
        raise SystemExit(f"villes SHA/taille inattendus : {len(raw)} {sha256(raw)}")
    return raw


def load_provinces() -> bytes:
    src = INCOMING / PROV_NAME
    dest = PROV / PROV_NAME
    raw = src.read_bytes() if src.is_file() else dest.read_bytes()
    if len(raw) != PROV_BYTES or sha256(raw) != PROV_SHA:
        raise SystemExit(f"provinces SHA/taille inattendus : {len(raw)} {sha256(raw)}")
    return raw


def data_lines(raw: bytes):
    text = raw.decode("utf-8")
    lines = [ln for ln in text.splitlines() if not ln.startswith('"#')]
    return list(csv.DictReader(io.StringIO("\n".join(lines))))


def world_bounds(raw: bytes):
    for ln in raw.decode("utf-8").splitlines():
        if "World bounds" in ln:
            tail = ln.split(":", 1)[-1]
            nums = [float(x.strip().strip('"')) for x in tail.replace('"', "").split(",") if x.strip()]
            if len(nums) >= 6:
                keys = ["tail_lo", "q20", "q40", "q60", "q80", "tail_hi"]
                return dict(zip(keys, nums[:6]))
    raise SystemExit("bornes monde introuvables dans l'en-tête du CSV villes")


def u5_countries():
    ix = json.loads(U5.read_text(encoding="utf-8"))
    geos = []
    seen = set()
    for s in ix["shards"]:
        if s.get("zone") in (None, "_NON_RATTACHE"):
            continue
        g = s["geo"]
        if g not in seen:
            seen.add(g)
            geos.append(g)
    return geos


def num_or_none(s):
    s = (s or "").strip()
    if not s or s == "[INCOMPLET]":
        return None
    try:
        return float(s)
    except ValueError:
        return None


def win_or_none(s):
    s = (s or "").strip()
    if s.isdigit():
        return int(s)
    return None


def build_villes(raw: bytes):
    rows = data_lines(raw)
    bounds = world_bounds(raw)
    by = defaultdict(lambda: {
        "n": 0, "n0": 0, "n1": 0, "both": 0, "one": 0, "none": 0,
        "zone": "", "p0": [], "p1": [], "bounds": "",
        "wm": defaultdict(int), "wp": defaultdict(int),
    })
    compact = []
    none = one = both = 0
    for row in rows:
        iso = row["iso3"].strip()
        p0 = num_or_none(row["pop_k_T0"])
        p1 = num_or_none(row["pop_k_T1"])
        w0 = win_or_none(row["fenetre_monde_T0"])
        w1 = win_or_none(row["fenetre_monde_T1"])
        c0 = win_or_none(row["fenetre_pays_T0"])
        c1 = win_or_none(row["fenetre_pays_T1"])
        g = by[iso]
        g["n"] += 1
        g["zone"] = row["zone"].strip()
        if row.get("bornes_pays_q20_q40_q60_q80"):
            g["bounds"] = row["bornes_pays_q20_q40_q60_q80"].strip()
        if p0 is not None:
            g["n0"] += 1
            g["p0"].append(p0)
        if p1 is not None:
            g["n1"] += 1
            g["p1"].append(p1)
        if p0 is not None and p1 is not None:
            both += 1
            g["both"] += 1
        elif p0 is not None or p1 is not None:
            one += 1
            g["one"] += 1
        else:
            none += 1
            g["none"] += 1
        if w1:
            g["wm"][w1] += 1
        if c1:
            g["wp"][c1] += 1
        compact.append([
            int(row["city_code"]) if row["city_code"].isdigit() else row["city_code"],
            row["city_name"],
            iso,
            p0, p1, w0, w1, c0, c1,
        ])
    known = set(u5_countries())
    present = set(by)
    missing = sorted(known - present)
    if len(rows) != 16768 or len(present) != 179 or both != 6814 or one != 5164 or none != 4790:
        raise SystemExit(f"comptes villes inattendus n={len(rows)} pays={len(present)} both={both} one={one} none={none}")
    countries = []
    for iso in sorted(by, key=lambda k: (ZONE_ORDER.index(by[k]["zone"]) if by[k]["zone"] in ZONE_ORDER else 99, k)):
        g = by[iso]
        med0 = statistics.median(g["p0"]) if g["p0"] else None
        med1 = statistics.median(g["p1"]) if g["p1"] else None
        countries.append({
            "iso3": iso,
            "zone": g["zone"],
            "zone_fr": ZONE_FR.get(g["zone"], g["zone"]),
            "n": g["n"], "n0": g["n0"], "n1": g["n1"],
            "both": g["both"], "one": g["one"], "none": g["none"],
            "median_T0": med0, "median_T1": med1,
            "bornes_pays": g["bounds"],
            "fenetre_monde_T1": {str(k): g["wm"][k] for k in sorted(g["wm"])},
            "fenetre_pays_T1": {str(k): g["wp"][k] for k in sorted(g["wp"])},
        })
    q = bounds
    summary = (
        "Santé — Villes du monde (WUP 2025, fichier 21, population en milliers, T₀ 1990 → T₁ 2024). "
        f"{len(rows)} villes, {len(present)} des 196 pays. "
        f"{both} villes aux deux prises, {one} avec une seule, {none} sans aucune prise. "
        f"Couverture {len(present)}/196 pays ({fr_num(100 * len(present) / 196)} %). "
        f"Villes avec au moins une prise : {both + one}/{len(rows)} ({fr_num(100 * (both + one) / len(rows))} %). "
        f"Villes aux deux prises : {both}/{len(rows)} ({fr_num(100 * both / len(rows))} %). "
        "[INCOMPLET] 4 790 villes sans aucune prise, 5 164 avec une seule. Elles sont gardées, les cellules vides ne sont pas inventées. "
        f"[INCOMPLET] 15 territoires non rattachés aux 196 : {', '.join(UNATTACHED)}. "
        f"[INCOMPLET] {len(missing)} codes des 196 sans aucune ville dans cette coupe : {', '.join(missing)}. "
        "[INCOMPLET] noms de pays absents de la coupe : codes ISO3 seulement. "
        f"Fenêtres monde (quantiles q20 / q40 / q60 / q80), milliers : {fr_num(q['q20'], 1)} / {fr_num(q['q40'], 1)} / {fr_num(q['q60'], 1)} / {fr_num(q['q80'], 1)}. "
        f"Queues monde : {fr_num(q['tail_lo'], 3)} et {fr_num(q['tail_hi'], 3)}. "
        "Fenêtres pays : un bassin par pays, bornes seulement si le pays a au moins 5 valeurs. "
        "Dans le moteur, un point de Classe 1 est la médiane des villes du pays (milliers), pas chaque ville : "
        "le moteur pose un maillage par objet de Classe 1. Le CSV original et cities.json gardent les 16 768 villes. "
        "Classe 2 : les 6 zones. Source UN DESA WUP 2025 F21, SHA-256 "
        + VILLES_SHA + "."
    )
    passages = [summary]
    for c in countries:
        passages.append(
            f"Pays {c['iso3']}, zone {c['zone_fr']}. {c['n']} villes, {c['both']} aux deux prises, "
            f"{c['one']} avec une seule, {c['none']} sans prise. "
            f"Médiane des populations urbaines (milliers) T₀ 1990 → T₁ 2024 : {fr_num(c['median_T0'])} → {fr_num(c['median_T1'])}. "
            f"Fenêtres pays, bornes q20 q40 q60 q80 : {c['bornes_pays'] or '[INCOMPLET]'}."
        )
    return {
        "rows": rows, "bounds": bounds, "countries": countries, "compact": compact,
        "missing": missing, "summary": summary, "passages": passages,
        "counts": {"cities": len(rows), "countries": len(present), "both": both, "one": one, "none": none},
    }


def build_provinces(raw: bytes):
    rows = data_lines(raw)
    cols = []
    for sex in SEX_ORDER:
        for age in AGE_ORDER:
            sid, sl = SEX_FR[sex]
            aid, al = AGE_FR[age]
            cols.append({
                "id": f"ex_{sid}{aid}",
                "sex": sex, "age": age,
                "label": f"Espérance de vie ex · {sl} · {al} (années)",
                "fmt": "dec2",
            })
    by_geo = {}
    for row in rows:
        geo = row["geo"].strip()
        rec = by_geo.setdefault(geo, {})
        key = (row["sexe"].strip(), row["age"].strip())
        rec[key] = row
    if len(rows) != 180 or set(by_geo) != set(GEO_FR):
        raise SystemExit(f"provinces inattendues : {len(rows)} {sorted(by_geo)}")
    summary = (
        "Santé — Provinces du Canada (StatCan 13-10-0114, espérance de vie ex et marge d'erreur). "
        "9 provinces plus la ligne Canada, sexe × âges 0, 15, 25, 45, 65 et 85 ans. "
        "T₀ période 1989/1991 (centrée sur 1990) → T₁ période 2022/2024. "
        "[À VÉRIFIER] T₁ centrée sur 2023 et non 2024 (périodes triennales). "
        "[INCOMPLET] Île-du-Prince-Édouard (Î.-P.-É.) et les trois territoires (Yukon, Territoires du Nord-Ouest, Nunavut) absents de la table. "
        "Couverture des provinces et territoires : 9/13 (69,2 %). La ligne Canada est là, pour référence, dans les fenêtres des provinces. "
        "Fenêtres provinces : pour chaque sexe × âge, un bassin des 9 provinces, quantiles 0,2 / 0,4 / 0,6 / 0,8. "
        "Le moteur lit ces séries comme colonnes ; la ligne ouverte par défaut est l'espérance de vie à 0 an, les deux sexes. "
        "SHA-256 " + PROV_SHA + "."
    )
    passages = [summary]
    objects = []
    for geo, (sg, fr) in GEO_FR.items():
        rec = by_geo[geo]
        st0, st1 = [], []
        bits = []
        for col in cols:
            row = rec[(col["sex"], col["age"])]
            v0 = float(row["ex_T0"])
            v1 = float(row["ex_T1"])
            st0.append(v0)
            st1.append(v1)
            bits.append(
                f"{SEX_FR[col['sex']][1]} {AGE_FR[col['age']][1]} : {fr_num(v0, 2)} → {fr_num(v1, 2)} "
                f"(marge {fr_num(float(row['me_T0']), 2)} → {fr_num(float(row['me_T1']), 2)}, "
                f"fenêtre province {row['fenetre_prov_T0']} → {row['fenetre_prov_T1']}, "
                f"bornes {row['bornes_q20_q40_q60_q80']})"
            )
        birth = rec[("Both sexes", "0 years")]
        a = (
            f"{fr} · source {geo} · espérance de vie à 0 an, les deux sexes, "
            f"{fr_num(float(birth['ex_T0']), 2)} → {fr_num(float(birth['ex_T1']), 2)} ans "
            f"(T₀ 1989/1991 → T₁ 2022/2024)"
        )
        objects.append({
            "s": sg, "id": sg, "sg": sg, "a": a,
            "g": ["Canada" if geo == "Canada" else "Provinces"],
            "st": [st0, st1],
            "c2": [1 if geo == "Canada" else 0],
            "src": geo,
        })
        passages.append(f"{fr} ({geo}, sigle {sg}). " + " ".join(bits) + " [À VÉRIFIER] T₁ centrée sur 2023 et non 2024. [INCOMPLET] Î.-P.-É. et territoires absents.")
    return {"cols": cols, "objects": objects, "summary": summary, "passages": passages, "rows": len(rows)}


def js_wrap(system_id: str, payload: dict, header: str) -> str:
    body = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    return (
        header
        + "(function(){\n"
        + "  var bucket = (typeof LIB !== 'undefined' && LIB && typeof LIB.push === 'function') ? LIB : (window.LIB = window.LIB || []);\n"
        + f"  if (bucket.some(function (s) {{ return s && s.id === '{system_id}'; }})) return;\n"
        + "  bucket.push(" + body + ");\n"
        + "})();\n"
    )


def gap_html_villes(pack):
    q = pack["bounds"]
    miss = ", ".join(pack["missing"])
    una = ", ".join(UNATTACHED)
    c = pack["counts"]
    return (
        "Santé — Villes du monde. UN DESA WUP 2025, fichier 21, population en milliers au 1er juillet. "
        f"T₀ 1990 → T₁ 2024. {c['cities']} villes, couverture <b>{c['countries']}/196</b> pays "
        f"({fr_num(100 * c['countries'] / 196)} %). "
        f"Villes aux deux prises : {c['both']} ({fr_num(100 * c['both'] / c['cities'])} %). "
        f"Au moins une prise : {c['both'] + c['one']} ({fr_num(100 * (c['both'] + c['one']) / c['cities'])} %). "
        f"<span class=\"um-gap-badge\">INCOMPLET</span> [INCOMPLET] 4 790 villes sans aucune prise, 5 164 avec une seule. "
        f"<span class=\"um-gap-badge\">INCOMPLET</span> [INCOMPLET] 15 territoires non rattachés aux 196 : {una}. "
        f"<span class=\"um-gap-badge\">INCOMPLET</span> [INCOMPLET] {len(pack['missing'])} codes des 196 sans ville : {miss}. "
        "[INCOMPLET] noms de pays absents : codes ISO3 seulement. "
        f"Fenêtres monde (q20 / q40 / q60 / q80), milliers : {fr_num(q['q20'])} / {fr_num(q['q40'])} / {fr_num(q['q60'])} / {fr_num(q['q80'])}. "
        "Fenêtres pays : bornes du pays quand le bassin a au moins 5 valeurs. "
        "Point de Classe 1 affiché : médiane des villes du pays. Classe 2 : 6 zones. "
        f"CSV original SHA-256 <code>{VILLES_SHA}</code>, {VILLES_BYTES} octets. "
        "Chaque ville reste dans le CSV et dans cities.json."
    )


def gap_html_prov():
    return (
        "Santé — Provinces du Canada. StatCan 13-10-0114, espérance de vie ex et marge d'erreur. "
        "9 provinces + Canada, sexe × âges 0 / 15 / 25 / 45 / 65 / 85. "
        "T₀ 1989/1991 → T₁ 2022/2024. "
        "<span class=\"um-gap-badge\">À VÉRIFIER</span> [À VÉRIFIER] T₁ centrée sur 2023 et non 2024. "
        "<span class=\"um-gap-badge\">INCOMPLET</span> [INCOMPLET] Î.-P.-É. et territoires absents. "
        "Couverture des provinces et territoires : <b>9/13</b> (69,2 %). "
        "Fenêtres provinces : quantiles des 9 provinces, par sexe × âge ; la ligne Canada est placée dans ces fenêtres pour référence. "
        f"CSV original SHA-256 <code>{PROV_SHA}</code>, {PROV_BYTES} octets."
    )


def main():
    villes_raw = reassemble_villes()
    prov_raw = load_provinces()
    VILLES.mkdir(parents=True, exist_ok=True)
    PROV.mkdir(parents=True, exist_ok=True)
    (VILLES / VILLES_NAME).write_bytes(villes_raw)
    (PROV / PROV_NAME).write_bytes(prov_raw)
    pack = build_villes(villes_raw)
    prov = build_provinces(prov_raw)

    villes_index = {
        "format": "sante-coupe-v21.06",
        "system_id": "sante-villes",
        "name": "Santé — Villes du monde (WUP 2025, T₀ 1990 → T₁ 2024)",
        "source_file": VILLES_NAME,
        "source_sha256": VILLES_SHA,
        "source_bytes": VILLES_BYTES,
        "line_endings": "mixed CRLF and LF, preserved",
        "counts": pack["counts"],
        "coverage": {"countries": 179, "countries_of": 196, "pct": round(100 * 179 / 196, 1)},
        "world_bounds_k": pack["bounds"],
        "unattached_territories": UNATTACHED,
        "missing_of_196": pack["missing"],
        "gaps": [
            "[INCOMPLET] 4 790 villes sans aucune prise, 5 164 avec une seule",
            "[INCOMPLET] 15 territoires non rattachés aux 196 : " + ", ".join(UNATTACHED),
            "[INCOMPLET] " + str(len(pack["missing"])) + " codes des 196 sans ville : " + ", ".join(pack["missing"]),
            "[INCOMPLET] noms de pays absents : codes ISO3 seulement",
        ],
        "manifestation": "Classe 1 = médiane des villes par pays. Classe 2 = zones. CSV et cities.json gardent chaque ville.",
        "countries": pack["countries"],
        "bridget": {
            "title": "Santé — Villes du monde (WUP 2025)",
            "section": "system:sante-villes",
            "selector": "#sys",
            "passages": pack["passages"],
        },
    }
    prov_index = {
        "format": "sante-coupe-v21.06",
        "system_id": "sante-provinces",
        "name": "Santé — Provinces du Canada (StatCan 13-10-0114, espérance de vie)",
        "source_file": PROV_NAME,
        "source_sha256": PROV_SHA,
        "source_bytes": PROV_BYTES,
        "rows": prov["rows"],
        "coverage": {"jurisdictions": "9/13", "pct": 69.2, "note": "9 provinces ; Î.-P.-É. et 3 territoires absents ; ligne Canada présente"},
        "gaps": [
            "[INCOMPLET] Î.-P.-É. et territoires absents",
            "[À VÉRIFIER] T₁ centrée sur 2023 et non 2024",
        ],
        "bridget": {
            "title": "Santé — Provinces du Canada (StatCan 13-10-0114)",
            "section": "system:sante-provinces",
            "selector": "#sys",
            "passages": prov["passages"],
        },
    }
    (VILLES / "index.json").write_text(json.dumps(villes_index, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    (PROV / "index.json").write_text(json.dumps(prov_index, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    cities = {
        "format": "sante-villes-compact/1",
        "source_sha256": VILLES_SHA,
        "source_bytes": VILLES_BYTES,
        "n": pack["counts"]["cities"],
        "fields": ["city_code", "city_name", "iso3", "pop_k_T0", "pop_k_T1", "fenetre_monde_T0", "fenetre_monde_T1", "fenetre_pays_T0", "fenetre_pays_T1"],
        "null_means": "prise ou fenêtre absente, gardée vide, [INCOMPLET]",
        "rows": pack["compact"],
    }
    (VILLES / "cities.json").write_text(json.dumps(cities, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")

    zone_c2 = []
    zone_ix = {}
    for z in ZONE_ORDER:
        zone_ix[z] = len(zone_c2)
        fr = ZONE_FR[z]
        zone_c2.append({"id": "zone:" + z, "ty": "zone", "name": fr, "short": fr})
    t = []
    for c in pack["countries"]:
        st0 = [round(c["median_T0"], 4)] if c["median_T0"] is not None else None
        st1 = [round(c["median_T1"], 4)] if c["median_T1"] is not None else None
        t.append({
            "s": c["iso3"], "id": c["iso3"], "sg": c["iso3"],
            "a": (
                f"{c['iso3']} · {c['zone_fr']} · {c['n']} villes · "
                f"{c['both']} aux deux prises · {c['one']} avec une seule · {c['none']} sans prise · "
                f"médiane milliers {fr_num(c['median_T0'])} → {fr_num(c['median_T1'])}"
            ),
            "g": [c["zone_fr"]],
            "st": [st0, st1],
            "c2": [zone_ix[c["zone"]]],
        })
    villes_sys = {
        "id": "sante-villes",
        "kind": "cols",
        "silo": "Santé",
        "name": "Santé — Villes du monde (WUP 2025, T₀ 1990 → T₁ 2024)",
        "two": True,
        "sigle": True,
        "gap": "[INCOMPLET] 4 790 villes sans aucune prise, 5 164 avec une seule. [INCOMPLET] 15 territoires non rattachés. Couverture 179/196.",
        "source": gap_html_villes(pack),
        "coupe": {
            "kind": "villes",
            "coverage": "179/196",
            "coveragePct": round(100 * 179 / 196, 1),
            "worldBounds": [round(pack["bounds"]["q20"], 3), round(pack["bounds"]["q40"], 3), round(pack["bounds"]["q60"], 3), round(pack["bounds"]["q80"], 3)],
            "flags": [
                {"tag": "INCOMPLET", "text": "4 790 villes sans aucune prise, 5 164 avec une seule"},
                {"tag": "INCOMPLET", "text": "15 territoires non rattachés aux 196 : " + ", ".join(UNATTACHED)},
                {"tag": "INCOMPLET", "text": f"{len(pack['missing'])} codes des 196 sans ville : " + ", ".join(pack["missing"])},
            ],
            "note": "Point affiché : médiane des villes du pays (milliers). Fenêtres pays dans la fiche du pays. CSV et cities.json : chaque ville.",
            "countries": [{
                "iso3": c["iso3"], "zone": c["zone_fr"], "n": c["n"],
                "both": c["both"], "one": c["one"], "none": c["none"],
                "med0": c["median_T0"], "med1": c["median_T1"], "bornes": c["bornes_pays"],
            } for c in pack["countries"]],
        },
        "data": {
            "two": True, "sigle": True,
            "dates": ["T₀ · 1990", "T₁ · 2024"],
            "unit": "pays",
            "cols": ["pop"],
            "lines": [{
                "id": "pop",
                "label": "Médiane des populations urbaines des villes (milliers) · WUP 2025 F21",
                "fmt": "dec2",
            }],
            "assign": ["pop", "pop", "pop", "pop", "pop", "pop", "pop", "pop", "pop", "km"],
            "kmAlt": "pop",
            "ctype": {"zone": {"label": "Zone", "plural": "zones"}},
            "c2": zone_c2,
            "t": t,
        },
    }
    prov_sys = {
        "id": "sante-provinces",
        "kind": "cols",
        "silo": "Santé",
        "name": "Santé — Provinces du Canada (StatCan 13-10-0114, espérance de vie)",
        "two": True,
        "sigle": True,
        "gap": "[INCOMPLET] Î.-P.-É. et territoires absents. [À VÉRIFIER] T₁ centrée sur 2023 et non 2024. Couverture 9/13.",
        "source": gap_html_prov(),
        "coupe": {
            "kind": "provinces",
            "coverage": "9/13",
            "coveragePct": 69.2,
            "flags": [
                {"tag": "INCOMPLET", "text": "Î.-P.-É. et territoires absents"},
                {"tag": "À VÉRIFIER", "text": "T₁ centrée sur 2023 et non 2024"},
            ],
            "note": "Fenêtres provinces : 9 provinces, par sexe × âge. La ligne Canada est dans ces fenêtres, pour référence. Ligne ouverte : 0 an, les deux sexes.",
        },
        "data": {
            "two": True, "sigle": True,
            "dates": ["T₀ · 1989/1991", "T₁ · 2022/2024"],
            "unit": "provinces",
            "cols": [c["id"] for c in prov["cols"]],
            "lines": [{"id": c["id"], "label": c["label"], "fmt": "dec2"} for c in prov["cols"]],
            "assign": ["ex_b0", "ex_b0", "ex_b0", "ex_b0", "ex_b0", "ex_b0", "ex_b0", "ex_b0", "ex_b0", "km"],
            "kmAlt": "ex_b0",
            "ctype": {"groupe": {"label": "Groupe", "plural": "groupes"}},
            "c2": [
                {"id": "groupe:provinces", "ty": "groupe", "name": "Provinces", "short": "Provinces"},
                {"id": "groupe:canada", "ty": "groupe", "name": "Canada", "short": "Canada"},
            ],
            "t": prov["objects"],
        },
    }
    header_v = (
        "/* v21.06 — généré par um/tools/build-sante-coupes.py. Ne pas éditer à la main.\n"
        "   CSV um/data/sante/villes-wup2025/" + VILLES_NAME + "\n"
        "   SHA-256 " + VILLES_SHA + " · " + str(VILLES_BYTES) + " octets · fins de ligne mixtes conservées.\n"
        "   Classe 1 = un pays (médiane des villes). Les 16 768 villes restent dans le CSV et cities.json.\n"
        "   Le moteur (engine.js) n'est pas modifié : un maillage par objet de Classe 1. */\n"
    )
    header_p = (
        "/* v21.06 — généré par um/tools/build-sante-coupes.py. Ne pas éditer à la main.\n"
        "   CSV um/data/sante/provinces-canada-statcan-13-10-0114/" + PROV_NAME + "\n"
        "   SHA-256 " + PROV_SHA + " · " + str(PROV_BYTES) + " octets.\n"
        "   10 points (9 provinces + Canada), 18 colonnes sexe × âge. engine.js inchangé. */\n"
    )
    ENGINE_DATA.mkdir(parents=True, exist_ok=True)
    (ENGINE_DATA / "sante-villes.js").write_text(js_wrap("sante-villes", villes_sys, header_v), encoding="utf-8")
    (ENGINE_DATA / "sante-provinces.js").write_text(js_wrap("sante-provinces", prov_sys, header_p), encoding="utf-8")
    print("villes", pack["counts"], "missing", len(pack["missing"]))
    print("provinces", prov["rows"], "cols", len(prov["cols"]))
    print("wrote", VILLES, PROV)


if __name__ == "__main__":
    main()
