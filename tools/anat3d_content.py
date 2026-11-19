"""Materi anatomi berbahasa Indonesia (fungsi, klinis, penyakit, pemeriksaan fisik) dipetakan ke struktur 3D Z-Anatomy.
Sumber materi: tools/data/anat-materi.json (materi atlas versi 1.0). Target: nama dasar objek Z-Anatomy,
"g:<grup>" untuk satu grup, atau "sys:<id>" untuk satu sistem. Topik tanpa target = materi tanpa model 3D.
Jalankan: python3 anat3d_content.py -w  (memvalidasi semua target lalu menulis src/anat3d-content.ts)"""
import json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZB = os.path.join(ROOT, "tools", "data")
OLD = json.load(open(os.path.join(ZB, "anat-materi.json")))
BASES = set(json.load(open(os.path.join(ZB, "bases.json"))))
GROUPS = {l.split("\t")[0][:-2] for l in open(os.path.join(ZB, "groups.txt"))}

T = {
 # ---------- kulit: lapisan mikroskopis tidak ada di model → tampilkan sistem kulit
 **{k: ["sys:9"] for k in ["hipodermis", "dermis", "epidermis", "korneum", "folikel", "rambut", "sebasea", "arektor", "ekrin", "pembuluh", "meissner", "pacini", "saraf-kulit", "melanosit"]},
 # ---------- otot
 "temporalis": ["Temporalis muscle"], "masseter": ["Superficial part of masseter", "Deep part of masseter"],
 "scm": ["Sternocleidomastoid muscle"], "deltoid": ["g:Deltoid muscle"], "pektoralis": ["g:Pectoralis major muscle"],
 "biseps": ["g:Biceps brachii muscle"], "rektus": ["Rectus abdominis muscle"], "obliqus": ["External abdominal oblique muscle"],
 "fleksor-lb": ["Flexor carpi radialis", "Flexor digitorum profundus", "Humero-ulnar head of flexor digitorum superficialis", "Radial head of flexor digitorum superficialis", "Humeral head of flexor carpi ulnaris", "Ulnar head of flexor carpi ulnaris", "Palmaris longus muscle"],
 "kuadriseps": ["Rectus femoris muscle", "Vastus lateralis muscle", "Vastus medialis muscle", "Vastus intermedius muscle"],
 "sartorius": ["Sartorius muscle"], "adduktor": ["Adductor magnus", "Adductor longus", "Adductor brevis", "Gracilis muscle", "Pectineus muscle"],
 "tibialis": ["Tibialis anterior muscle"], "trapezius": ["g:Trapezius muscle"], "latissimus": ["Latissimus dorsi muscle"],
 "triseps": ["g:Triceps brachii muscle"], "gluteus": ["Gluteus maximus muscle"],
 "hamstring": ["Long head of biceps femoris", "Short head of biceps femoris", "Semitendinosus muscle", "Semimembranosus muscle"],
 "gastroknemius": ["Lateral head of gastrocnemius", "Medial head of gastrocnemius", "Soleus muscle"], "achilles": ["Calcaneal tendon"],
 # ---------- tulang
 "kranium": ["g:Cranium"], "mandibula": ["Mandible"], "vertebra": ["g:Bones of vertebral column"], "klavikula": ["Clavicle"],
 "skapula": ["Scapula"], "sternum": ["Manubrium of sternum", "Body of sternum", "Xiphoid process"], "kosta": ["g:Ribs"],
 "humerus": ["Humerus"], "radius-ulna": ["Radius", "Ulna"], "manus": ["g:Bones of hand"], "pelvis": ["Hip bone", "Sacrum", "Coccyx"],
 "femur": ["Femur"], "patela": ["Patella"], "tibia-fibula": ["Tibia", "Fibula"], "pedis": ["g:Bones of foot"],
 # ---------- otak
 "frontal": ["g:Frontal lobe"], "parietal": ["g:Parietal lobe"], "oksipital": ["g:Occipital lobe"], "temporal": ["g:Temporal lobe"],
 "serebelum": ["g:Cerebellum"], "batang-otak": ["g:Brainstem"], "presentral": ["Precentral gyrus"], "postsentral": ["Postcentral gyrus"],
 "broca": ["Opercular part of inferior frontal gyrus", "Triangular part of inferior frontal gyrus"],
 "wernicke": ["Superior temporal gyrus (Lateral part)", "Temporal plane"], "visual": ["Calcarine sulcus", "Cuneus", "Lingual gyrus"],
 # ---------- jantung
 "vka-sup": ["Superior vena cava"], "vka-inf": ["Inferior vena cava (thoracic part)", "Inferior vena cava (abdominal part)"],
 "aorta": ["Aortic arch"], "pulmonalis": ["Pulmonary trunk"],
 "v-pulm": ["Right superior pulmonary vein", "Right inferior pulmonary vein", "Left superior pulmonary vein", "Left inferior pulmonary vein"],
 "atrium-ka": ["Right atrium"], "ventrikel-ka": ["Right ventricle"], "atrium-ki": ["Left atrium"], "ventrikel-ki": ["Left ventricle"],
 "septum": ["Right ventricle", "Left ventricle"], "k-trikuspid": ["g:Right atrioventricular valve"], "k-mitral": ["g:Left atrioventricular valve"],
 "k-aorta": ["g:Aortic valve"], "k-pulmonal": ["g:Pulmonary valve"], "sa-node": ["Right atrium"], "av-node": ["Right atrium", "Right ventricle"],
 # ---------- paru
 "laring": ["g:Larynx"], "trakea": ["Trachea"], "bronkus-ka": ["Right main bronchus"], "bronkus-ki": ["Left main bronchus"],
 "lobus-sup-ka": ["Superior lobe of right lung"], "lobus-med-ka": ["Middle lobe of right lung"], "lobus-inf-ka": ["Inferior lobe of right lung"],
 "lobus-sup-ki": ["Superior lobe of left lung"], "lobus-inf-ki": ["Inferior lobe of left lung"], "pleura": ["Pleura"], "diafragma": ["Diaphragm"],
 "alveolus": ["g:Lungs"],
 # ---------- cerna
 "esofagus": ["Oesophagus"], "usus-halus": ["Jejunum"], "kolon-asc": ["Ascending colon"], "kolon-desc": ["Descending colon"],
 "kolon-trans": ["Transverse colon"], "sekum-apendiks": ["Vermiform appendix"], "sigmoid": ["Sigmoid colon"], "rektum": ["External anal sphincter"],
 "hati": ["Liver"], "empedu": ["Gallbladder"], "lambung": ["Stomach"], "duodenum": ["Duodenum"], "pankreas": ["Pancreas"],
 # ---------- ginjal & saluran kemih
 "aorta-abd": ["Abdominal aorta", "Right renal artery", "Left renal artery"], "vka": ["Inferior vena cava (abdominal part)", "Right renal vein", "Left renal vein"],
 "adrenal": ["Suprarenal gland"], "ginjal-ka": ["Kidney"], "korteks": ["Kidney"], "medula": ["Kidney"], "pelvis-renalis": ["Renal pelvis"],
 "ureter": ["Ureter"], "kandung-kemih": ["Urinary bladder"], "uretra": ["Urethra"],
 # ---------- reproduksi wanita: model Z-Anatomy adalah tubuh pria → materi tanpa model
 # ---------- reproduksi pria
 "vu-p": ["Urinary bladder"], "vesikula": ["Seminal gland"], "prostat": ["Prostate"], "uretra-p": ["Urethra"],
 "penis": ["Corpus cavernosum of penis", "Corpus spongiosum of penis"], "glans": ["Glans penis"], "testis": ["Testis"],
 "epididimis": ["Epididymis"], "vas": ["Ductus deferens"],
 # ---------- endokrin
 "hipotalamus": ["Hypothalamus"], "hipofisis": ["Adenohypophysis", "Neurohypophysis"], "pineal": ["Pineal gland"], "tiroid": ["Thyroid gland"],
 "paratiroid": ["Superior parathyroid gland", "Inferior parathyroid gland"], "timus": ["Left lobe of thymus", "Right lobe of thymus"],
 "adrenal-e": ["Suprarenal gland"], "pankreas-e": ["Pancreas"], "gonad-te": ["Testis"],
 # ---------- mata
 "sklera": ["Sclera"], "koroid": ["Sclera"], "retina": ["Retina"], "vitreus": ["Vitreous body"], "makula": ["Retina"], "diskus": ["Optic nerve (II)"],
 "n-optikus": ["Optic nerve (II)"], "lensa": ["Lens"], "siliaris": ["Zonular fibres"], "iris": ["Iris"], "pupil": ["Iris"],
 "bmd": ["Anterior chamber of eyeball"], "kornea": ["Cornea"], "konjungtiva": ["g:Eyeball"],
 # ---------- telinga
 "kavum-timpani": ["Tympanic membrane", "Malleus", "Incus", "Stapes"], "aurikula": ["g:Auricular region"], "mae": ["Tympanic membrane"],
 "mt": ["Tympanic membrane"], "maleus": ["Malleus"], "inkus": ["Incus"], "stapes": ["Stapes"], "tuba-e": ["Auditory tube"],
 "vestibulum": ["Vestibule"], "kanalis": ["Vestibule"], "koklea": ["Cochlea"], "n-viii": ["Vestibulocochlear nerve (VIII)"], "mastoid": ["Temporal bone"],
}
# Sisi tubuh bawaan untuk topik yang menyebut satu sisi
SIDE = {"ginjal-ka": "r"}
# Catatan bila model 3D hanya mendekati topik
APPROX = {
    "septum": "Septum interventrikular berada di antara kedua ventrikel (tidak dimodelkan terpisah).",
    "sa-node": "Nodus SA terletak di dinding atrium kanan dekat muara vena kava superior (tidak dimodelkan terpisah).",
    "av-node": "Nodus AV & berkas His terletak di septum atrioventrikular (tidak dimodelkan terpisah).",
    "alveolus": "Alveolus berukuran mikroskopis; yang tampil adalah paru secara keseluruhan.",
    "koroid": "Koroid berada tepat di dalam sklera (tidak dimodelkan terpisah).",
    "makula": "Makula & fovea adalah bagian retina di kutub posterior bola mata.",
    "diskus": "Diskus optikus adalah tempat nervus optikus keluar dari bola mata.",
    "pupil": "Pupil adalah lubang di tengah iris.",
    "siliaris": "Yang tampil adalah serat zonula; korpus siliaris tidak dimodelkan terpisah.",
    "konjungtiva": "Konjungtiva melapisi bola mata bagian depan & kelopak (tidak dimodelkan terpisah).",
    "mae": "Meatus akustikus eksternus berakhir di membran timpani.",
    "kavum-timpani": "Kavum timpani berisi tulang-tulang pendengaran.",
    "kanalis": "Kanalis semisirkularis bermuara ke vestibulum (tidak dimodelkan terpisah).",
    "mastoid": "Prosesus mastoideus adalah bagian os temporale.",
    "rektum": "Rektum tidak dimodelkan; yang tampil adalah sfingter ani eksternus.",
    "usus-halus": "Model menampilkan jejunum-ileum sebagai satu struktur.",
    "korteks": "Korteks ginjal adalah lapisan luar ginjal (tidak dimodelkan terpisah).",
    "medula": "Medula ginjal (piramid) berada di bagian dalam ginjal (tidak dimodelkan terpisah).",
    "sekum-apendiks": "Sekum tidak dimodelkan terpisah; yang tampil adalah apendiks vermiformis.",
}
for k in ["hipodermis", "dermis", "epidermis", "korneum", "folikel", "rambut", "sebasea", "arektor", "ekrin", "pembuluh", "meissner", "pacini", "saraf-kulit", "melanosit"]:
    APPROX[k] = "Lapisan & adneksa kulit berukuran mikroskopis; model 3D menampilkan permukaan kulit."

bad = []
for k, ts in T.items():
    for t in ts:
        if t.startswith("g:"):
            if t[2:] not in GROUPS: bad.append((k, t))
        elif t.startswith("sys:"): pass
        elif t not in BASES: bad.append((k, t))
known = {p["id"] for s in OLD for p in s["parts"]}
unk = [k for k in T if k not in known]
if bad or unk:
    print("TARGET TIDAK ADA:", bad, "ID TIDAK DIKENAL:", unk); sys.exit(1)

topics = []
SYSLABEL = {s["id"]: s["name"] for s in OLD}
for s in OLD:
    for p in s["parts"]:
        topics.append({"id": p["id"], "name": p["name"], "latin": p["latin"], "topic": s["id"], "topicName": s["name"],
                       "fn": p["fn"], "k": p["k"], "dz": p["dz"], "pf": p["pf"], "det": p["det"], "t": T.get(p["id"], []),
                       **({"side": SIDE[p["id"]]} if p["id"] in SIDE else {}), **({"approx": APPROX[p["id"]]} if p["id"] in APPROX else {})})
n3d = sum(1 for t in topics if t["t"]); print(len(topics), "topik;", n3d, "dengan model 3D;", len(topics) - n3d, "materi tanpa model")
if "-w" in sys.argv:
    out = ["// Dibuat oleh tools/anat3d_content.py — jangan disunting manual.",
           "export interface AnatTopic { id: string; name: string; latin: string; topic: string; topicName: string; fn: string; k: string[]; dz: string[]; pf: string[]; det: string; t: string[]; side?: \"l\" | \"r\"; approx?: string }",
           "export const TOPICS: AnatTopic[] = " + json.dumps(topics, ensure_ascii=False, indent=0) + ";", ""]
    open(os.path.join(ROOT, "src", "anat3d-content.ts"), "w").write("\n".join(out))
    print("ditulis src/anat3d-content.ts")
