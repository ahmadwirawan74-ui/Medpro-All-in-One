# Riwayat perubahan

## 1.1.0 — 19 November 2026

### 🫀 Atlas anatomi 3D (Z-Anatomy)
- Anatomi kini **sepenuhnya 3D**, memakai model **Z-Anatomy** (turunan BodyParts3D): 8 lapisan sistem — kulit & regio, otot, tulang, sendi & ligamen, jantung & pembuluh, saraf & indra, organ dalam, limfoid — dengan **±1.800 struktur (3.169 objek 3D)**, menggantikan 13 diagram 2D.
- Putar, perbesar, geser (mouse & sentuh), tampilan depan/belakang/samping/atas, ketuk dua kali untuk fokus.
- Ketuk struktur untuk melihat **nama Indonesia/Latin/Inggris**, posisinya dalam hierarki (ketuk grup untuk menyorot semua anggotanya), **definisi Wikipedia**, dan — bila ada — **materi Indonesia**: fungsi, detail, relevansi klinis, penyakit terkait, cara memeriksa.
- **Sembunyikan, isolasi, tampilkan semua**; **tembus pandang (X-ray)** untuk kulit & otot; **potongan koronal, sagital, aksial** dengan penggeser; warna fungsi otot & lobus otak; label; layar penuh.
- Preset cepat (Kerangka, Otot, Organ, Saraf, Sirkulasi, Kulit, Semua) dan tab **Materi** (166 materi Indonesia) serta **Daftar** (hierarki Terminologia Anatomica).
- **Kuis tunjuk 3D** (ketuk struktur yang disebut) dan **Kuis nama 3D** (tebak struktur yang disorot), dengan skor terbaik & koin.
- **Buat flashcard** dari struktur atau grup (`MedPro/Anatomi/Atlas 3D.md`).
- 649 nama Indonesia untuk tulang, organ, jantung & pembuluh utama, otak, saraf, indra, dan grup utama; struktur lain memakai nama Latin TA2 versi singkat (M./A./V./N./Lig.).
- Tautan penyakit ↔ anatomi dan pemeriksaan fisik ↔ anatomi tetap jalan dan kini membuka struktur 3D-nya.
- Fasia, bursa, selubung tendon, pleura, dan omentum disembunyikan bawaan agar struktur di bawahnya terlihat (bisa ditampilkan lewat pencarian atau tombol 👁️).
- Model diproses ulang (±6,2 juta → ±1,2 juta segitiga) dan dikompres menjadi ±4,5 MB, dibundel di plugin sehingga tetap **bekerja tanpa internet**.

### Catatan
- Model Z-Anatomy adalah tubuh **pria dewasa** dan tidak memuat lapisan mikroskopis. Materi reproduksi wanita (8) dan lapisan kulit tetap tersedia sebagai materi teks; topik kulit menampilkan permukaan kulit 3D.
- Lisensi model & definisi: **CC BY-SA 4.0** (lihat `THIRD_PARTY_NOTICES.md`). Kode plugin tetap MIT.
- `main.js` kini ±12 MB karena model 3D dibundel.

## 1.0.0 — 18 November 2026

Rilis pertama **MedPro All In One** — fitur Medis dari Flashcard Hafalan kini menjadi plugin sendiri, dengan banyak fitur baru.

### Baru
- **Anatomi interaktif**: 13 sistem (kulit, otot depan & belakang, tulang, otak & saraf, jantung, paru, saluran cerna, ginjal & saluran kemih, reproduksi wanita & pria, endokrin, mata, telinga) dengan 166 struktur yang bisa diketuk. Setiap struktur punya nama Latin, fungsi, detail, relevansi klinis, penyakit terkait, dan cara memeriksa. Zoom/geser, label, pencarian lintas sistem, **Kuis tunjuk** dan **Kuis nama**, struktur acak, dan tombol **Buat flashcard** (ditulis ke `MedPro/Anatomi/<sistem>.md`).
- **Anatomi ↔ penyakit ↔ pemeriksaan fisik**: 336 penyakit terhubung ke anatominya. Halaman penyakit dan materi pemeriksaan fisik kini punya bagian **Anatomi terkait**.
- **22 kalkulator antidot** (sebelumnya hanya N-asetilsistein): nalokson, atropin, pralidoksim, flumazenil, natrium bikarbonat, kalsium, insulin dosis tinggi, glukagon, emulsi lipid, digoxin-Fab, fomepizol/etanol, deferoksamin, vitamin K/protamin/idarusizumab, hidroksokobalamin, metilen biru, dekstrosa/oktreotid, piridoksin, magnesium, dantrolen, levokarnitin, SABU, dan NAC. Dosis dihitung dari berat badan, lengkap dengan peringatan dan tombol salin.
- **Lab & AGD**: interpretasi gas darah bertahap (gangguan primer & campuran, kompensasi, anion gap terkoreksi albumin, delta ratio, P/F, gradien A-a) dengan 6 contoh kasus; koreksi natrium & kalsium, osmolalitas & osmolal gap, defisit air bebas, tabel Adrogué-Madias, panduan hipo/hiperkalemia, defisit bikarbonat; 82 nilai rujukan yang bisa dicari.
- **EKG & radiologi**: panduan baca EKG sistematis, galeri 16 irama dengan strip EKG, kuis irama, kalkulator laju jantung, QTc, dan aksis; foto toraks skematis 6 kondisi, panduan ABCDE, kalkulator CTR, dan templat laporan.
- **Jaga & SBAR**: tugas jaga dengan jam, prioritas, pengingat (notifikasi + bunyi), tunda 30 menit, dan templat; SBAR otomatis dari CPPT (tren tanda vital, terapi, instruksi, tugas tertunda) yang bisa disunting; catatan shift; **PDF serah terima**. Tombol *Tugas jaga* di halaman pasien CPPT.
- **Beranda baru** dengan pencarian universal (termasuk anatomi, nilai lab, dan irama EKG), pasien aktif, tugas jaga, dan kartu hafalan harian.
- **Impor dari Flashcard Hafalan** satu ketuk: pasien & catatan CPPT, favorit, catatan pribadi, obat sendiri, identitas dokter, progres pemeriksaan fisik.
- Pengaturan: identitas dokter, efek suara, folder catatan, cadangan JSON, hapus semua data pasien.
- Tampilan HP dengan menu laci (☰) dan bilah atas.

### Dibawa dari Flashcard Hafalan
942 penyakit SKDI, 105 materi pemeriksaan fisik + Mode OSCE, 300 obat, farmakologi, CPPT + PDF, resep + PDF, kalkulator dosis & klinis, cek interaksi, kartu darurat anak, dan kuis obat.
