# Pipeline atlas 3D (Z-Anatomy → `assets/anat3d.bin`)

Model 3D MedPro dibuat dari [Z-Anatomy](https://github.com/Z-Anatomy/Models-of-human-anatomy) (turunan BodyParts3D), lisensi **CC BY-SA 4.0**. Aset hasilnya juga CC BY-SA 4.0.

## Langkah

```bash
# 1. siapkan folder kerja
export ZA_WORK=~/z-anatomy
git clone --depth 1 https://github.com/Z-Anatomy/Models-of-human-anatomy $ZA_WORK/models-of-human-anatomy
unzip $ZA_WORK/models-of-human-anatomy/Z-Anatomy.zip Z-Anatomy/Startup.blend -d $ZA_WORK

# 2. Blender sebagai modul Python + penyederhana mesh
python3 -m venv ~/bpyenv && ~/bpyenv/bin/pip install bpy pyfqmr

# 3. jalankan dari folder lain (bukan folder ini)
~/bpyenv/bin/python tools/anat3d-pipeline/za_dump.py     # mesh dunia → $ZA_WORK/raw (±15 detik)
~/bpyenv/bin/python tools/anat3d-pipeline/za_pack.py     # decimate + kuantisasi + deflate → $ZA_WORK/build
python3 tools/anat3d-pipeline/za_bundle.py               # header, nama Latin TA2, definisi → assets/anat3d.bin

# 4. salin daftar nama untuk generator nama & materi, lalu tulis ulang file TS
cp $ZA_WORK/build/bases.json $ZA_WORK/build/groups.txt tools/data/
python3 tools/anat3d_names.py -w
python3 tools/anat3d_content.py -w
```

`za_pack.py` menerima faktor anggaran segitiga, mis. `za_pack.py 0.7` untuk model lebih ringan.

## Format `anat3d.bin`
`"ZA3D"` · u32 panjang header · header (zlib JSON: objek, grup, palet, nama Latin) · chunk geometri per sistem (zlib; posisi 16-bit delta+zigzag per bidang byte, palet per verteks, indeks "high-water mark") · definisi Wikipedia (zlib JSON).
