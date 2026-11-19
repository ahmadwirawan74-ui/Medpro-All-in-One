"""Tahap 3: gabungkan geometri (build/anat3d.bin) + header (objek, grup, nama Latin TA2, definisi Wikipedia)
menjadi satu aset: medpro/assets/anat3d.bin
Format: "ZA3D" | u32 panjang header terkompresi | header (deflate JSON) | chunk geometri... | definisi (deflate JSON)
Lisensi: model CC BY-SA 4.0 (Z-Anatomy, BodyParts3D CC BY-SA 2.1 JP); definisi Wikipedia CC BY-SA 3.0/4.0."""
import os as _os
WORK = _os.environ.get("ZA_WORK", _os.path.expanduser("~/z-anatomy"))  # folder kerja: Z-Anatomy/Startup.blend, raw/, build/
MEDPRO = _os.path.dirname(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))

import json, zlib, re, struct, os
B = WORK + "/build"; RAW = WORK + "/raw"
idx = json.load(open(f"{B}/anat3d-index.json")); geo = open(f"{B}/anat3d.bin", "rb").read()
meta = json.load(open(f"{RAW}/meta.json"))

# ---- grup (hierarki) ----
gnames = list(meta["groups"].keys())
def gclean(n): return re.sub(r"\.g$", "", n) if n else None
gid = {gclean(n): i for i, n in enumerate(gnames)}
groups = [[gclean(n), gid.get(gclean(meta["groups"][n]), -1)] for n in gnames]

def base(n): return re.sub(r"\.[lr]$", "", n)
def side(n):
    m = re.search(r"\.([lr])$", n); return m.group(1) if m else ""

# ---- nama Latin dari TA2 ----
en = {}
for l in open(WORK + "/models-of-human-anatomy/TA2.csv", encoding="utf-8-sig"):
    r = l.strip().strip('"').split(";")
    if len(r) > 2 and r[0].isdigit(): en.setdefault(r[1].strip().lower(), r[2].strip())
ORD = {"first": "I", "second": "II", "third": "III", "fourth": "IV", "fifth": "V", "sixth": "VI", "seventh": "VII", "eighth": "VIII", "ninth": "IX", "tenth": "X", "eleventh": "XI", "twelfth": "XII"}
def norm(n): return re.sub(r"\s*[\(\[].*?[\)\]]|\*", "", n).strip().lower()
def latin(n):
    for k in (n.lower(), norm(n), norm(n).replace(" tooth", ""), re.sub(r" muscle$", "", norm(n)), norm(n) + " muscle"):
        if k in en: return en[k]
    m = re.match(r"vertebra ([ctl])(\d+)$", n.lower())
    if m: return {"c": "Vertebra cervicalis", "t": "Vertebra thoracica", "l": "Vertebra lumbalis"}[m.group(1)] + " " + m.group(1).upper() + m.group(2)
    m = re.match(r"(\w+) rib$", n.lower())
    if m and m.group(1) in ORD: return "Costa " + ORD[m.group(1)]
    m = re.match(r"costal cartilage of (\w+) rib$", n.lower())
    if m and m.group(1) in ORD: return "Cartilago costalis " + ORD[m.group(1)]
    return ""

# ---- definisi Wikipedia (dipotong) ----
def clean_def(s):
    lines = [x.strip() for x in s.split("\n")]
    paras = [x for x in lines if x and not (x.isupper() and len(x) < 90)]
    out = ""
    for p in paras:
        p = re.sub(r"\(\s*[,;]\s*", "(", p); p = re.sub(r"\(\s*\)", "", p); p = re.sub(r"\s{2,}", " ", p)
        if len(out) + len(p) > 1100 and out: break
        out += (" " if out else "") + p
        if len(out) >= 650: break
    return out.strip()

PCH = {}
for sid_, sm in meta["systems"].items():
    for o in sm["objects"]: PCH[o["name"]] = o["parents"]
objs_out = []; bases = set()
for s in idx["systems"]:
    rows = []
    for o in s["objects"]:
        gi = -1
        for par in PCH.get(o["n"], []):  # naik sampai ketemu grup (.g)
            if par.endswith(".g") and gclean(par) in gid: gi = gid[gclean(par)]; break
        ln = o["n"].lower()
        hid = 1 if (re.search(r"fascia(?!e)|intermuscular septum|bursa|tendon sheath|spinal dura|pleura|greater omentum|mesocolon", ln) and "tensor" not in ln) else 0
        rows.append([o["n"], gi, o["v"][0], o["v"][1], o["t"][0], o["t"][1]] + o["c"] + [o["r"], o["type"], hid])
        bases.add(base(o["n"]))
    s2 = {k: s[k] for k in ("id", "name", "nv", "nt")}; s2["off"] = s["off"]; s2["objs"] = rows
    objs_out.append(s2)

lat = {}
for b in sorted(bases):
    l = latin(b)
    if l: lat[b] = l
for g, _ in groups:
    l = latin(g)
    if l: lat[g] = l
defs = {}
for k, v in meta["texts"].items():
    kk = re.sub(r"\.[lr]$", "", k)
    if kk in bases or kk in gid:
        d = clean_def(v)
        if len(d) > 40: defs[kk] = d
dz = zlib.compress(json.dumps(defs, ensure_ascii=False, separators=(",", ":")).encode(), 9)

head = {"v": 1, "bmin": idx["bmin"], "scale": idx["scale"], "palette": idx["palette"], "systems": objs_out, "groups": groups, "latin": lat}
# offset geometri relatif terhadap awal chunk geometri; definisi setelahnya
head["defs"] = [len(geo), len(dz)]
hz = zlib.compress(json.dumps(head, ensure_ascii=False, separators=(",", ":")).encode(), 9)
out = b"ZA3D" + struct.pack("<I", len(hz)) + hz + geo + dz
os.makedirs(MEDPRO + "/assets", exist_ok=True)
open(MEDPRO + "/assets/anat3d.bin", "wb").write(out)
json.dump(sorted(bases), open(f"{B}/bases.json", "w"))
open(f"{B}/groups.txt", "w").write("\n".join(f"{k}\t{v}" for k, v in meta["groups"].items()))
print("header", len(hz), "geo", len(geo), "defs", len(dz), len(defs), "latin", len(lat), "TOTAL", len(out))
