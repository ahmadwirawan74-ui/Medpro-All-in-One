"""Tahap 2: decimate (pyfqmr) per objek & per material, kuantisasi 16-bit, prefilter + deflate.
Keluaran: build/anat3d.bin (biner terkompresi) + build/anat3d-index.json (dipakai gen TS).
Lisensi data keluaran: CC BY-SA 4.0 (Z-Anatomy / BodyParts3D)."""
import os as _os
WORK = _os.environ.get("ZA_WORK", _os.path.expanduser("~/z-anatomy"))  # folder kerja: Z-Anatomy/Startup.blend, raw/, build/
MEDPRO = _os.path.dirname(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))

import numpy as np, json, zlib, re, sys, os, math
import pyfqmr
RAW = WORK + "/raw"; OUT = WORK + "/build"; os.makedirs(OUT, exist_ok=True)
meta = json.load(open(f"{RAW}/meta.json"))
BUDGET = {"1": 230000, "3": 55000, "4": 300000, "5": 95000, "6": 30000, "7": 175000, "8": 95000, "9": 55000}
if len(sys.argv) > 1: f = float(sys.argv[1]); BUDGET = {k: int(v * f) for k, v in BUDGET.items()}
SYSNAME = {"1": "Tulang", "3": "Sendi & ligamen", "4": "Otot", "5": "Jantung & pembuluh", "6": "Limfoid", "7": "Saraf & indra", "8": "Organ dalam", "9": "Kulit & regio"}

# ---------- palet warna (kategori material) ----------
def cat_color(mn, sid):
    n = mn.lower()
    base = re.sub(r"[-'0-9 ]+$", "", n)
    T = {
        "bone": (0.90, 0.86, 0.76), "suture": (0.78, 0.72, 0.60), "cartilage": (0.64, 0.80, 0.86), "teeth": (0.96, 0.94, 0.88),
        "teeth-roots": (0.86, 0.78, 0.60), "dentine": (0.92, 0.88, 0.76), "ligament": (0.84, 0.87, 0.80), "articular capsule": (0.70, 0.66, 0.86),
        "fat": (0.96, 0.85, 0.45), "bursa": (0.56, 0.76, 0.88), "fascia": (0.80, 0.84, 0.88), "tendon": (0.93, 0.89, 0.80),
        "artery": (0.82, 0.13, 0.13), "vein": (0.20, 0.32, 0.82), "pulmonary artery": (0.32, 0.38, 0.86), "pulmonary vein": (0.86, 0.22, 0.22),
        "lymph": (0.46, 0.76, 0.36), "gland": (0.86, 0.56, 0.34), "brain": (0.93, 0.74, 0.70), "brain-inner": (0.90, 0.66, 0.52),
        "cerebellum": (0.82, 0.56, 0.52), "white matter": (0.92, 0.90, 0.84), "nucleus": (0.66, 0.42, 0.36), "nerve": (0.98, 0.84, 0.32),
        "eye": (0.96, 0.96, 0.96), "cornea": (0.72, 0.86, 0.96), "iris": (0.40, 0.28, 0.16), "lcr": (0.62, 0.86, 0.92), "mucosa": (0.82, 0.42, 0.44),
        "bronchi": (0.86, 0.82, 0.76), "lung": (0.90, 0.62, 0.64), "lung-base": (0.90, 0.62, 0.64), "ductus": (0.52, 0.64, 0.30),
        "gallbladder": (0.38, 0.58, 0.26), "intestine": (0.88, 0.58, 0.52), "organ": (0.62, 0.30, 0.26), "peritoneum": (0.92, 0.78, 0.56),
        "mucosa of stomach": (0.86, 0.52, 0.52), "skin": (0.94, 0.77, 0.66), "skin-in": (0.82, 0.46, 0.42), "nail": (0.96, 0.86, 0.82), "black": (0.16, 0.14, 0.14),
    }
    if base in T: return T[base]
    if base.startswith("nucleus"): return T["nucleus"]
    if base.startswith("lung"): return T["lung"]
    if base.startswith("skin"): return T["skin"]
    if sid == "7": return T["brain"]           # lobus, sulkus, limbik, insula
    if sid in ("4", "5") or base in ("trapezius", "diaphragm", "orbicularis/constrictor"): return (0.74, 0.24, 0.21)  # otot
    if sid == "8": return T["organ"]
    return (0.8, 0.8, 0.8)

palette = []; pal_index = {}
def pal(mn, sid):
    key = (mn, sid)
    if key not in pal_index:
        c = cat_color(mn, sid)
        alt = meta["materials"].get(mn) or c
        if tuple(round(x, 2) for x in alt) in ((0.8, 0.8, 0.8), (0.799, 0.799, 0.799)): alt = c
        pal_index[key] = len(palette); palette.append({"m": mn, "s": sid, "c": [round(x, 3) for x in c], "alt": [round(x, 3) for x in alt]})
    return pal_index[key]

# ---------- bbox global (Blender Z-up -> three Y-up: x, z, -y) ----------
allV = []
data = {}
for sid in BUDGET:
    d = np.load(f"{RAW}/sys{sid}.npz"); V = d["V"].astype(np.float64)
    V = np.stack([V[:, 0], V[:, 2], -V[:, 1]], 1)
    data[sid] = (V, d["T"], d["M"]); allV.append(V.min(0)); allV.append(V.max(0))
allV = np.array(allV); BMIN = allV.min(0) - 0.001; BMAX = allV.max(0) + 0.001
SCALE = (BMAX - BMIN) / 65535.0

def simplify(V, T, target):
    if len(T) <= target or target >= len(T) * 0.95: return V, T
    s = pyfqmr.Simplify(); s.setMesh(V, T)
    s.simplify_mesh(target_count=max(4, int(target)), aggressiveness=7, preserve_border=True, verbose=False)
    v, t, _ = s.getMesh(); return v, t

def reorder(V, T):
    """urutkan verteks sesuai pemakaian pertama di indeks (indeks jadi kecil & berurutan)"""
    order = []; seen = -np.ones(len(V), np.int64)
    flat = T.reshape(-1); newi = np.empty_like(flat)
    k = 0
    for j, v in enumerate(flat):
        if seen[v] < 0: seen[v] = k; order.append(v); k += 1
        newi[j] = seen[v]
    order = np.array(order, np.int64); return V[order], newi.reshape(-1, 3), order

def zig(a): a = a.astype(np.int64); return ((a << 1) ^ (a >> 63)).astype(np.uint64)

index = {"bmin": BMIN.tolist(), "scale": SCALE.tolist(), "palette": palette, "systems": []}
blobs = []; off = 0; total_t = 0
for sid, budget in BUDGET.items():
    V, T, M = data[sid]; objs = meta["systems"][sid]["objects"]
    nts = np.array([o["t"][1] for o in objs], np.float64)
    # alokasi anggaran: target_i = clamp(s * nt^0.85, min(nt, 30), nt)
    lo, hi = 1e-6, 10.0
    for _ in range(60):
        s = (lo + hi) / 2; tgt = np.minimum(nts, np.maximum(np.minimum(nts, 30), s * nts ** 0.85))
        if tgt.sum() > budget: hi = s
        else: lo = s
    tgt = np.minimum(nts, np.maximum(np.minimum(nts, 30), lo * nts ** 0.85))
    POS = []; MAT = []; IDX = []; olist = []; vcount = 0; tcount = 0
    for o, tg in zip(objs, tgt):
        t0, nt = o["t"]; tri = T[t0:t0 + nt]; mi = M[t0:t0 + nt]
        parts_v = []; parts_t = []; parts_m = []; vo = 0
        for k in np.unique(mi):
            sel = tri[mi == k]; used = np.unique(sel)
            lv = V[used]; lt = np.searchsorted(used, sel)
            share = len(sel) / nt
            sv, st = simplify(lv, lt.astype(np.int32), max(4, tg * share))
            if len(st) == 0: continue
            parts_v.append(sv); parts_t.append(st + vo); parts_m.append(np.full(len(sv), pal(o["mats"][k] if k < len(o["mats"]) else "", sid), np.uint8)); vo += len(sv)
        if not parts_v: continue
        ov = np.concatenate(parts_v); ot = np.concatenate(parts_t); om = np.concatenate(parts_m)
        if len(ov) > 65535: raise SystemExit(f"terlalu banyak verteks {o['name']} {len(ov)}")
        # buang verteks tak terpakai lalu urutkan
        ov, ot, order = reorder(ov, ot); om = om[order]
        q = np.clip(np.round((ov - BMIN) / SCALE), 0, 65535).astype(np.int64)
        POS.append(q); IDX.append(ot)
        olist.append({"n": o["name"], "p": o["parents"][:1], "v": [vcount, len(ov)], "t": [tcount, len(ot)], "type": o["type"][0],
                      "c": ((q.min(0) + q.max(0)) / 2).astype(int).tolist(), "r": int(np.linalg.norm((q.max(0) - q.min(0)) * SCALE) * 500)})
        MAT.append(om); vcount += len(ov); tcount += len(ot)
    index["systems"].append({"id": sid, "name": SYSNAME[sid], "objects": olist, "nv": vcount, "nt": tcount})
    blobs.append((sid, POS, MAT, IDX)); total_t += tcount
    print(sid, SYSNAME[sid], len(olist), "obj", tcount, "tris", vcount, "verts", flush=True)
print("TOTAL tris", total_t)

def planes16(a):
    a = a.astype(np.uint16); return (a & 0xFF).astype(np.uint8).tobytes() + (a >> 8).astype(np.uint8).tobytes()
def enc_pos(qs):
    out = []
    for c in range(3):
        allz = []
        for q in qs:
            col = q[:, c].astype(np.int64); d = np.diff(np.concatenate([[0], col])) & 0xFFFF
            sd = np.where(d >= 32768, d - 65536, d); z = ((sd << 1) ^ (sd >> 15)) & 0xFFFF
            allz.append(z)
        out.append(planes16(np.concatenate(allz)))
    return b"".join(out)
def enc_idx(ts):
    allc = []
    for t in ts:
        f = t.reshape(-1); hw = 0; c = np.empty(len(f), np.int64)
        for j, v in enumerate(f):
            c[j] = hw - v
            if v == hw: hw += 1
        allc.append(c)
    a = np.concatenate(allc); assert a.max() < 65536 and a.min() >= 0
    return planes16(a)
out = bytearray()
for (sid, POS, MAT, IDX), sysd in zip(blobs, index["systems"]):
    raw = enc_pos(POS) + np.concatenate(MAT).tobytes() + enc_idx(IDX)
    comp = zlib.compress(raw, 9)
    sysd["off"] = [len(out), len(comp), len(raw)]
    out += comp
    print(sid, "raw", len(raw), "deflate", len(comp), flush=True)
open(f"{OUT}/anat3d.bin", "wb").write(out)
json.dump(index, open(f"{OUT}/anat3d-index.json", "w"), separators=(",", ":"))
print("BIN", len(out), "bytes")
