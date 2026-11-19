# Pemberitahuan pihak ketiga

Plugin ini membundel pustaka berikut. Masing-masing tetap berada di bawah lisensinya sendiri; teks lisensinya ada di folder [`licenses/`](licenses/).

## Pustaka
- **jsPDF** 4.2.1 (ekspor PDF CPPT, resep, dan serah terima SBAR) — MIT — `licenses/LICENSE-jspdf-4.2.1.txt`. Dibundel bersama dependensinya: **fast-png** 6.4.0 (MIT, `licenses/LICENSE-fast-png-6.4.0.txt`), **iobuffer** 5.4.0 (MIT, `licenses/LICENSE-iobuffer-5.4.0.txt`), **pako** 2.2.0 (MIT AND Zlib, `licenses/LICENSE-pako-2.2.0.txt`), dan **@babel/runtime** 7.29.14 (MIT, `licenses/LICENSE-babel-runtime-7.29.14.txt`). Modul opsional jsPDF (html2canvas, DOMPurify, canvg) tidak dibundel dan tidak dipakai.
- **three.js** 0.185.1 (penampil atlas 3D, termasuk `OrbitControls` dari contoh resmi) — MIT — `licenses/LICENSE-three-0.185.1.txt`.
- **fflate** 0.8.3 (dekompresi aset 3D) — MIT — `licenses/LICENSE-fflate-0.8.3.txt`.

## Model anatomi 3D — CC BY-SA 4.0
File `assets/anat3d.bin` (juga tertanam di `main.js`) adalah **karya turunan** dari:
- **Z-Anatomy — The libre 3D atlas of anatomy** (Gauthier Kervyn: desain, 3D, anatomi; Marcin Zielinski: add-on Blender) — CC BY-SA 4.0 — https://github.com/Z-Anatomy/Models-of-human-anatomy — `licenses/LICENSE-z-anatomy-CC-BY-SA-4.0.md`.
- **BodyParts3D**, © The Database Center for Life Science (DBCLS), model asli oleh Kousaku Okubo — CC BY-SA 2.1 Japan — https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html
- Model yang dijadikan acuan/diadaptasi oleh Z-Anatomy: "Brainder" & "White matter" (University of Washington); "Cranial Nerves and Foramina" (University of Dundee, CAHID — CC BY 4.0); **"Anatomy of the Inner Ear" (University of Dundee School of Medicine — CC BY-NC-SA 4.0)**; **"Kidney" (Lissie Cowley — CC BY-NC 4.0)**. Bagian yang berasal dari dua model terakhir membawa syarat **NonCommercial**: MedPro dibagikan gratis dan tidak boleh dijual.
- **Definisi** struktur (bahasa Inggris, dipotong): Wikipedia, lewat Z-Anatomy — CC BY-SA 3.0/4.0.
- **Nama Latin**: Terminologia Anatomica 2 (TA2), daftar dari Z-Anatomy.

Perubahan oleh MedPro: konversi ke koordinat dunia, kurva pembuluh/saraf diubah menjadi mesh beresolusi rendah, penyederhanaan poligon (±6,2 juta → ±1,2 juta segitiga), kuantisasi 16-bit, palet warna baru, dan kompresi. Aset turunan ini **dibagikan ulang dengan lisensi CC BY-SA 4.0** (teks lengkap: `licenses/CC-BY-SA-4.0-legalcode.txt`). Kode plugin tetap MIT. Pipeline pembuatannya ada di `tools/anat3d-pipeline/`.

## Materi medis
Materi penyakit, obat, pemeriksaan fisik, materi anatomi berbahasa Indonesia, antidot, lab, EKG, dan CPPT ditulis ulang dengan bahasa sendiri dari referensi standar (SKDI 2019 KKI, PNPK/PPK Kemenkes, BNF 85, WHO Model Formulary, PALS/ACLS AHA, Macleod's Clinical Examination, Bates' Guide, CMDT, Moore *Clinically Oriented Anatomy*, Netter, Snell, Sobotta). Daftar kompetensi & keterampilan klinis mengikuti SKDI 2019 (Konsil Kedokteran Indonesia). Tidak ada teks yang disalin utuh.

## Gambar
Foto toraks skematis dan strip EKG digambar sendiri (SVG prosedural). Model anatomi 3D: lihat bagian di atas.

## Font
Tidak ada font yang dibundel; plugin memakai font antarmuka Obsidian.
