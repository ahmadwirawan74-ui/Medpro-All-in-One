/**
 * Kalkulator antidot MedPro: dosis berbasis berat badan untuk 22 antidot/terapi spesifik keracunan.
 * Rujukan ditulis ulang: Goldfrank's Toxicologic Emergencies, Toxbase/BNF, WHO, ASRA (LAST), pedoman Kemenkes.
 * Hasil adalah alat bantu hitung — selalu cocokkan dengan sediaan lokal dan konsultasikan ke SIKerNas.
 */
import { num } from "./med-engine";
import { copyText, field, seg, toNum } from "./medis";
import { chipRow } from "./med-ui";

type V = Record<string, number | string>;
interface In { k: string; label: string; unit?: string; def?: number | string; ph?: string; opts?: [string, string][] }
interface Out { lines: [string, string, string?][]; warn?: string[]; notes?: string[] }
interface Calc { id: string; name: string; icon: string; tox: string; inputs: In[]; run: (v: V) => Out }

const r1 = (n: number) => Math.round(n * 10) / 10;
const r0 = Math.round;
const W = (v: V) => Math.max(0, Number(v.w) || 0);
const kid = (v: V) => W(v) > 0 && W(v) < 40;
const wIn: In = { k: "w", label: "Berat badan", unit: "kg" };

export const CALCS: Calc[] = [
	{ id: "nalokson", name: "Nalokson", icon: "💉", tox: "Opioid (morfin, petidin, kodein, tramadol, heroin)", inputs: [wIn, { k: "dep", label: "Ketergantungan opioid kronik?", opts: [["tidak", "Tidak"], ["ya", "Ya / paliatif"]], def: "tidak" }, { k: "eff", label: "Total bolus yang efektif (untuk infus)", unit: "mg", ph: "opsional" }],
		run: (v) => {
			const w = W(v); const L: Out["lines"] = []; const warn: string[] = [];
			if (v.dep === "ya") L.push(["Bolus awal (titrasi)", "0,04 mg IV", "ulang/naikkan tiap 2 menit sampai RR ≥ 10–12 — cegah putus zat akut"]);
			else if (kid(v)) { L.push(["Bolus anak", `${num(Math.min(r1(w * 0.01 * 100) / 100, 0.4))} mg IV/IM/IN`, "0,01 mg/kg (maks 0,4 mg); ulang tiap 2–3 menit"]); L.push(["Overdosis berat / henti napas", `${num(Math.min(r1(w * 0.1 * 10) / 10, 2))} mg`, "0,1 mg/kg (maks 2 mg)"]); }
			else L.push(["Bolus dewasa", "0,4–2 mg IV/IM/IN", "ulang tiap 2–3 menit; pertimbangkan diagnosis lain bila total 10 mg tidak berespons"]);
			const e = Number(v.eff) || 0;
			if (e > 0) L.push(["Infus rumatan", `${num(r1((e * 2) / 3 * 100) / 100)} mg/jam`, "2/3 total bolus efektif per jam; separuh bolus diberikan lagi 15 menit setelah infus mulai"]);
			warn.push("Durasi nalokson (45–90 menit) lebih singkat dari banyak opioid (metadon, tramadol lepas lambat) — observasi ≥ 6 jam setelah dosis terakhir.");
			return { lines: L, warn, notes: ["Target: napas adekuat, bukan sadar penuh.", "Ventilasi dengan BVM bila apnea sambil menunggu respons."] };
		} },
	{ id: "atropin", name: "Atropin", icon: "🧪", tox: "Organofosfat / karbamat (insektisida), krisis kolinergik", inputs: [wIn, { k: "tot", label: "Total atropin sampai teratropinisasi", unit: "mg", ph: "isi setelah tercapai" }],
		run: (v) => {
			const w = W(v); const L: Out["lines"] = [];
			if (kid(v)) L.push(["Bolus anak", `${num(Math.max(0.1, r1(w * 0.02 * 100) / 100))}–${num(r1(w * 0.05 * 100) / 100)} mg IV`, "0,02–0,05 mg/kg (min 0,1 mg); gandakan tiap 5 menit"]);
			else { L.push(["Bolus dewasa", "1–3 mg IV", "lalu GANDAKAN tiap 5 menit sampai teratropinisasi"]); L.push(["Contoh eskalasi", "2 → 4 → 8 → 16 → 32 mg", "dosis kumulatif bisa > 100 mg pada keracunan berat"]); }
			const t = Number(v.tot) || 0;
			if (t > 0) L.push(["Infus rumatan", `${num(r1(t * 0.1))}–${num(r1(t * 0.2))} mg/jam`, "10–20% total dosis atropinisasi per jam; titrasi"]);
			return { lines: L, warn: ["Tanda toksisitas atropin: delirium, hipertermia, ileus, retensi urin → hentikan infus 30–60 menit lalu mulai lagi ±70% laju."], notes: ["Target atropinisasi: dada bersih (tanpa ronki/bronkorea), nadi > 80 x/menit, TD sistolik > 80 mmHg, pupil tidak lagi pin-point, aksila kering.", "Takikardia BUKAN kontraindikasi pemberian atropin (bisa akibat hipoksia).", "Dekontaminasi: lepas pakaian, cuci kulit dengan sabun & air; petugas memakai APD."] };
		} },
	{ id: "pralidoksim", name: "Pralidoksim (2-PAM)", icon: "🧫", tox: "Organofosfat (diberikan bersama atropin)", inputs: [wIn],
		run: (v) => { const w = W(v); return { lines: [["Dosis muat", `${num(Math.min(r0(w * 30), 2000))} mg IV`, "30 mg/kg (maks 2 g) dalam 100 mL NaCl 0,9% selama 15–30 menit"], ["Infus rumatan", `${num(r0(w * 8))}–${num(r0(w * 10))} mg/jam`, "8–10 mg/kg/jam (WHO), sampai klinis membaik ≥ 12–24 jam setelah atropin tidak diperlukan"]], warn: ["Pemberian bolus cepat dapat menyebabkan henti jantung & laringospasme."], notes: ["Paling bermanfaat bila diberikan dini sebelum aging enzim (terutama dimetil-OP).", "Tidak dianjurkan rutin pada keracunan karbamat."] }; } },
	{ id: "flumazenil", name: "Flumazenil", icon: "😴", tox: "Benzodiazepin (terutama sedasi iatrogenik)", inputs: [wIn],
		run: (v) => { const w = W(v); return { lines: kid(v) ? [["Dosis anak", `${num(Math.min(r1(w * 0.01 * 100) / 100, 0.2))} mg IV`, "0,01 mg/kg (maks 0,2 mg) dalam 15 detik; ulang tiap menit"], ["Total maksimal", `${num(Math.min(r1(w * 0.05 * 100) / 100, 1))} mg`, "0,05 mg/kg atau 1 mg"]] : [["Dosis awal", "0,2 mg IV", "dalam 15 detik"], ["Dosis ulang", "0,1 mg tiap 1 menit", "total maks 1 mg (jarang 2 mg)"]], warn: ["JANGAN pada overdosis campuran (terutama antidepresan trisiklik), riwayat epilepsi, atau pengguna benzodiazepin kronik — dapat memicu kejang yang sulit diatasi.", "Efek lebih singkat dari banyak benzodiazepin → resedasi; observasi."] }; } },
	{ id: "bikarbonat", name: "Natrium bikarbonat", icon: "🧂", tox: "Antidepresan trisiklik (QRS > 100 ms), salisilat, penghambat kanal Na", inputs: [wIn, { k: "mode", label: "Indikasi", opts: [["tca", "QRS lebar / aritmia"], ["alk", "Alkalinisasi urin (salisilat)"]], def: "tca" }],
		run: (v) => {
			const w = W(v); const L: Out["lines"] = []; const conc = w < 5 ? 0.5 : 1;
			L.push(["Bolus", `${num(r0(w))}–${num(r0(w * 2))} mEq IV`, `1–2 mEq/kg = ${num(r1(w / conc))}–${num(r1((w * 2) / conc))} mL NaHCO₃ ${conc === 1 ? "8,4%" : "4,2% (bayi)"}`]);
			if (v.mode === "tca") L.push(["Ulangi", "tiap 3–5 menit", "sampai QRS menyempit / hipotensi teratasi; target pH darah 7,45–7,55"]);
			else L.push(["Infus alkalinisasi", "150 mEq NaHCO₃ dalam 1 L D5% (+ KCl 20–40 mEq)", `laju ±${num(r0(w * 2.5))}–${num(r0(w * 3))} mL/jam (1,5–2× rumatan), target pH urin 7,5–8`]);
			return { lines: L, warn: ["Pantau kalium (hipokalemia menghambat alkalinisasi), natrium, dan pH darah (hindari > 7,55)."] };
		} },
	{ id: "kalsium", name: "Kalsium (glukonas / klorida)", icon: "🦴", tox: "Penghambat kanal kalsium, hiperkalemia, hipermagnesemia, hipokalsemia, asam fluorida", inputs: [wIn, { k: "jenis", label: "Sediaan", opts: [["glu", "Ca glukonas 10%"], ["kl", "CaCl₂ 10%"]], def: "glu" }],
		run: (v) => {
			const w = W(v); const glu = v.jenis !== "kl"; const L: Out["lines"] = [];
			if (glu) { L.push(["Dosis", kid(v) ? `${num(Math.min(r1(w * 0.6), 30))} mL IV` : "30 mL (3 g) IV", kid(v) ? "0,6 mL/kg (60 mg/kg), maks 30 mL, dalam 5–10 menit" : "dalam 5–10 menit; keracunan CCB: dapat 60 mL, ulang tiap 10–20 menit (3–4 kali)"]); L.push(["Kandungan", "1 mL = 0,22 mmol Ca²⁺", "boleh lewat vena perifer"]); }
			else { L.push(["Dosis", kid(v) ? `${num(Math.min(r1(w * 0.2), 10))} mL IV` : "10 mL (1 g) IV", kid(v) ? "0,2 mL/kg (20 mg/kg), maks 10 mL" : "keracunan CCB: 20 mL, ulang tiap 10–20 menit"]); L.push(["Kandungan", "1 mL = 0,68 mmol Ca²⁺ (≈ 3× glukonas)", "sebaiknya via vena sentral — iritan bila ekstravasasi"]); }
			return { lines: L, warn: ["Hati-hati pada toksisitas digoksin (dahulu dianggap kontraindikasi; kini tidak mutlak).", "Jangan dicampur dengan bikarbonat (mengendap)."] };
		} },
	{ id: "hiet", name: "Insulin dosis tinggi (HIET)", icon: "🍬", tox: "Penghambat kanal kalsium / beta-bloker dengan syok", inputs: [wIn, { k: "gd", label: "Gula darah", unit: "mg/dL" }],
		run: (v) => {
			const w = W(v); const gd = Number(v.gd) || 0; const L: Out["lines"] = [];
			L.push(["Bolus insulin reguler", `${num(r1(w))} unit IV`, "1 unit/kg"]);
			L.push(["Bolus dekstrosa", gd && gd >= 250 ? "tidak perlu (GD ≥ 250)" : `${num(r1(w * 0.5))} g = ${num(r0(w * 1.25))} mL D40%`, "0,5 g/kg bila GD < 250 mg/dL"]);
			L.push(["Infus insulin", `${num(r1(w))}–${num(r1(w * 10))} unit/jam`, "mulai 1 unit/kg/jam, naikkan tiap 10–15 menit sampai hemodinamik membaik (maks ±10 unit/kg/jam)"]);
			L.push(["Infus dekstrosa", `${num(r1(w * 0.5))} g/jam`, `0,5 g/kg/jam (mis. D40% ${num(r0(w * 1.25))} mL/jam via sentral) — titrasi agar GD 100–250`]);
			return { lines: L, warn: ["Periksa GD tiap 15–30 menit di awal, kalium tiap jam (target 2,8–3,2 mmol/L tidak perlu dikoreksi agresif)."], notes: ["Efek inotropik muncul 15–60 menit; berikan bersama kalsium & vasopresor."] };
		} },
	{ id: "glukagon", name: "Glukagon", icon: "🫀", tox: "Beta-bloker (bradikardia, hipotensi); juga hipoglikemia", inputs: [wIn],
		run: (v) => { const w = W(v); return { lines: [["Bolus", kid(v) ? `${num(r1(w * 0.05))}–${num(r1(Math.min(w * 0.15, 10)))} mg IV` : "5–10 mg IV", "50–150 mcg/kg dalam 1–2 menit; ulang bila perlu"], ["Infus", kid(v) ? `${num(r1(w * 0.05))}–${num(r1(w * 0.1))} mg/jam` : "1–5 mg/jam", "dosis bolus efektif per jam"], ["Hipoglikemia", kid(v) && w < 25 ? "0,5 mg IM/SC" : "1 mg IM/SC", "bila akses IV sulit"]], warn: ["Sering menyebabkan muntah — lindungi jalan napas; berikan antiemetik."] }; } },
	{ id: "lipid", name: "Emulsi lipid 20%", icon: "🧈", tox: "Toksisitas anestesi lokal sistemik (LAST: bupivakain, lidokain); obat lipofilik lain", inputs: [wIn],
		run: (v) => {
			const w = W(v); const big = w > 70;
			return { lines: [["Bolus", big ? "100 mL" : `${num(r1(w * 1.5))} mL IV`, "1,5 mL/kg dalam 2–3 menit"], ["Infus", big ? "200–250 mL dalam 15–20 menit" : `${num(r1(w * 0.25))} mL/menit (${num(r0(w * 0.25 * 60))} mL/jam)`, "0,25 mL/kg/menit"], ["Bila tetap tidak stabil", "ulang bolus 1–2 kali; gandakan infus", `0,5 mL/kg/menit = ${num(r1(w * 0.5))} mL/menit`], ["Batas atas", `${num(r0(w * 12))} mL`, "12 mL/kg dalam 30 menit pertama"]], warn: ["Pada henti jantung akibat LAST: lakukan RJP, adrenalin dosis kecil (≤ 1 mcg/kg), hindari vasopresin, CCB, beta-bloker, dan lidokain."], notes: ["Lanjutkan infus ≥ 15 menit setelah sirkulasi stabil."] };
		} },
	{ id: "digifab", name: "Fragmen antibodi digoksin (Fab)", icon: "💊", tox: "Toksisitas digoksin (aritmia mengancam, K⁺ > 5–5,5 akut)", inputs: [wIn, { k: "lvl", label: "Kadar digoksin serum", unit: "ng/mL", ph: "bila ada" }, { k: "mg", label: "Jumlah digoksin tertelan", unit: "mg", ph: "bila diketahui" }],
		run: (v) => {
			const w = W(v); const lvl = Number(v.lvl) || 0; const mg = Number(v.mg) || 0; const L: Out["lines"] = [];
			if (lvl > 0) L.push(["Berdasarkan kadar", `${Math.ceil((lvl * w) / 100)} vial`, `(kadar ng/mL × BB) / 100 = ${num(r1((lvl * w) / 100))}`]);
			if (mg > 0) L.push(["Berdasarkan jumlah tertelan", `${Math.ceil((mg * 0.8) / 0.5)} vial`, "(mg × 0,8 bioavailabilitas) / 0,5 mg per vial"]);
			L.push(["Empiris (tanpa data)", kid(v) ? "1–2 vial (kronik) · 10 vial (akut berat)" : "10 vial akut · 3–6 vial kronik", "1 vial (40 mg) mengikat ±0,5 mg digoksin"]);
			return { lines: L, notes: ["Kadar digoksin total tetap tinggi setelah Fab (terukur ikut fragmen) — jangan dipakai untuk pemantauan.", "Pantau kalium (dapat turun cepat setelah Fab)."] };
		} },
	{ id: "fomepizol-etanol", name: "Fomepizol / etanol", icon: "🍶", tox: "Metanol (miras oplosan), etilen glikol", inputs: [wIn, { k: "pilih", label: "Antidot tersedia", opts: [["etanol", "Etanol"], ["fom", "Fomepizol"]], def: "etanol" }, { k: "konsen", label: "Sediaan etanol", opts: [["10", "10% IV"], ["40", "40% oral (NGT)"]], def: "10" }, { k: "peminum", label: "Peminum kronik?", opts: [["tidak", "Tidak"], ["ya", "Ya"]], def: "tidak" }],
		run: (v) => {
			const w = W(v); const L: Out["lines"] = [];
			if (v.pilih === "fom") { L.push(["Dosis muat", `${num(r0(w * 15))} mg IV`, "15 mg/kg dalam 30 menit"]); L.push(["Rumatan", `${num(r0(w * 10))} mg tiap 12 jam × 4 dosis`, `lalu ${num(r0(w * 15))} mg tiap 12 jam (15 mg/kg) sampai kadar < 20 mg/dL`]); L.push(["Saat hemodialisis", "tiap 4 jam", "fomepizol ikut terdialisis"]); }
			else {
				const pct = Number(v.konsen) || 10; const gml = (pct / 100) * 0.789;
				const maint = v.peminum === "ya" ? 154 : 66;
				L.push(["Dosis muat", `${num(r0((w * 0.8) / gml))} mL etanol ${pct}%`, `0,8 g/kg (${num(r1(w * 0.8))} g) ${pct === 10 ? "IV dalam 30–60 menit" : "via NGT, diencerkan"}`]);
				L.push(["Rumatan", `${num(r0(((w * maint) / 1000) / gml))} mL/jam`, `${maint} mg/kg/jam (${v.peminum === "ya" ? "peminum kronik" : "bukan peminum"}); gandakan saat hemodialisis`]);
				L.push(["Target kadar etanol", "100–150 mg/dL", "periksa tiap 1–2 jam; pantau gula darah (hipoglikemia, terutama anak)"]);
			}
			return { lines: L, warn: ["Indikasi hemodialisis: asidosis berat (pH < 7,25), gangguan penglihatan, gagal ginjal, kadar metanol > 50 mg/dL."], notes: ["Metanol: asam folat 50 mg IV tiap 6 jam. Etilen glikol: tiamin 100 mg + piridoksin 50 mg IV tiap 6 jam.", "Koreksi asidosis dengan natrium bikarbonat (target pH > 7,3)."] };
		} },
	{ id: "deferoksamin", name: "Deferoksamin (besi)", icon: "🧲", tox: "Overdosis tablet besi (sering pada anak)", inputs: [wIn, { k: "tab", label: "Jumlah tablet tertelan" }, { k: "mgtab", label: "mg garam besi per tablet", unit: "mg", def: 300 }, { k: "garam", label: "Jenis garam", opts: [["sulfat", "Fero sulfat (20%)"], ["fumarat", "Fero fumarat (33%)"], ["glukonat", "Fero glukonat (12%)"], ["elemental", "Sudah elemental"]], def: "sulfat" }],
		run: (v) => {
			const w = W(v); const frac: Record<string, number> = { sulfat: 0.2, fumarat: 0.33, glukonat: 0.12, elemental: 1 };
			const el = (Number(v.tab) || 0) * (Number(v.mgtab) || 0) * (frac[String(v.garam)] ?? 0.2); const mk = w > 0 ? el / w : 0;
			const L: Out["lines"] = [];
			if (el > 0) L.push(["Besi elemental", `${num(r0(el))} mg ≈ ${num(r1(mk))} mg/kg`, mk < 20 ? "< 20 mg/kg: biasanya asimptomatik" : mk < 60 ? "20–60 mg/kg: risiko toksisitas GI — observasi, periksa kadar besi 4–6 jam" : "> 60 mg/kg: berpotensi serius/letal — rawat & pertimbangkan deferoksamin"]);
			L.push(["Deferoksamin infus", `${num(r0(w * 15))} mg/jam`, "15 mg/kg/jam IV (maks ±80 mg/kg/24 jam; umumnya ≤ 24 jam)"]);
			return { lines: L, warn: ["Indikasi: syok, asidosis metabolik, gejala sistemik, kadar besi serum > 500 mcg/dL.", "Urin berwarna merah anggur (vin rosé) menandakan kompleks feroksamin."], notes: ["Arang aktif TIDAK mengikat besi; pertimbangkan irigasi usus total bila tablet tampak pada foto abdomen."] };
		} },
	{ id: "vitk", name: "Vitamin K & reversal antikoagulan", icon: "🩸", tox: "Warfarin, rodentisida antikoagulan (superwarfarin), heparin, DOAC", inputs: [wIn, { k: "inr", label: "INR" }, { k: "bleed", label: "Perdarahan", opts: [["tidak", "Tidak"], ["minor", "Minor"], ["mayor", "Mayor/mengancam"]], def: "tidak" }],
		run: (v) => {
			const w = W(v); const inr = Number(v.inr) || 0; const L: Out["lines"] = [];
			if (v.bleed === "mayor") { L.push(["Vitamin K", kid(v) ? `${num(Math.min(r1(w * 0.1), 10))} mg IV pelan` : "5–10 mg IV pelan", "dalam 20–30 menit (risiko anafilaktoid bila cepat)"]); L.push(["Faktor koagulasi", "PCC 25–50 IU/kg atau FFP", `FFP 15 mL/kg ≈ ${num(r0(w * 15))} mL bila PCC tidak ada`]); }
			else if (inr > 10) L.push(["Vitamin K", kid(v) ? `${num(Math.min(r1(w * 0.03), 5))} mg PO/IV` : "2–5 mg PO", "INR > 10 tanpa perdarahan; tunda warfarin, cek INR 24 jam"]);
			else if (inr > 4.5 || v.bleed === "minor") L.push(["Vitamin K", kid(v) ? "0,5–2 mg PO" : "1–2,5 mg PO", "tunda 1–2 dosis warfarin"]);
			else L.push(["Tindakan", "tunda/kurangi dosis warfarin", "vitamin K umumnya tidak perlu"]);
			L.push(["Superwarfarin (racun tikus)", "vitamin K₁ oral 50–100 mg/hari (dewasa)", "selama berminggu-bulan sesuai INR"]);
			L.push(["Heparin → protamin", "1 mg per 100 unit heparin (≤ 2 jam terakhir)", "maks 50 mg per dosis, ≤ 5 mg/menit; enoksaparin: 1 mg per 1 mg (≤ 8 jam)"]);
			L.push(["Dabigatran", "idarusizumab 5 g IV", "2 × 2,5 g"]);
			return { lines: L, warn: ["Fitonadion IV harus diberikan pelan; vitamin K3 (menadion) tidak efektif untuk reversal warfarin."] };
		} },
	{ id: "hidroksokobalamin", name: "Hidroksokobalamin", icon: "🔥", tox: "Sianida (kebakaran ruang tertutup, singkong pahit, nitroprusid)", inputs: [wIn],
		run: (v) => { const w = W(v); return { lines: [["Dosis", kid(v) ? `${num(Math.min(r0(w * 70), 5000))} mg IV` : "5 g IV", kid(v) ? "70 mg/kg (maks 5 g) dalam 15 menit" : "dalam 15 menit; dapat diulang 5 g (total 10 g)"]], warn: ["Menyebabkan kulit & urin merah serta mengganggu pemeriksaan laboratorium kolorimetri."], notes: ["Curigai sianida bila asidosis laktat berat (laktat > 8–10 mmol/L) pada korban kebakaran.", "Berikan oksigen 100%."] }; } },
	{ id: "metilen-biru", name: "Metilen biru", icon: "🔵", tox: "Methemoglobinemia (nitrit, dapson, anestesi lokal topikal, nitrobenzen)", inputs: [wIn],
		run: (v) => { const w = W(v); return { lines: [["Dosis", `${num(r1(w))}–${num(r1(w * 2))} mg IV`, `1–2 mg/kg dalam 5 menit = ${num(r1(w * 0.1))}–${num(r1(w * 0.2))} mL larutan 1%`], ["Ulangan", `${num(r1(w))} mg`, "1 mg/kg setelah 30–60 menit bila belum membaik; total maks 7 mg/kg"]], warn: ["Kontraindikasi pada defisiensi G6PD (hemolisis) dan pasien dengan obat serotonergik (risiko sindrom serotonin)."], notes: ["Indikasi: MetHb > 20–30% atau bergejala (SpO₂ menetap ±85%, darah coklat cokelat)."] }; } },
	{ id: "dekstrosa", name: "Dekstrosa & oktreotid", icon: "🍭", tox: "Hipoglikemia akibat insulin / sulfonilurea", inputs: [wIn],
		run: (v) => {
			const w = W(v);
			const L: Out["lines"] = kid(v) ? [["Dekstrosa 10%", `${num(r1(w * 2))}–${num(r1(w * 5))} mL IV`, "2–5 mL/kg (neonatus 2 mL/kg); lanjut infus rumatan D10%"]] : [["Dekstrosa 40%", "50 mL IV (20 g)", "atau D50% 50 mL / D10% 150–250 mL; ulang sesuai GD"], ["Lanjutkan", "infus D10% 100 mL/jam", "pantau GD tiap 1 jam"]];
			L.push(["Oktreotid (sulfonilurea)", kid(v) ? `${num(r1(w * 1))}–${num(r1(w * 1.25))} mcg SC/IV tiap 6–12 jam` : "50–100 mcg SC/IV tiap 6–12 jam", "mencegah hipoglikemia berulang akibat pelepasan insulin"]);
			return { lines: L, warn: ["Sulfonilurea dapat menyebabkan hipoglikemia berulang hingga 24–72 jam — rawat inap & observasi."] };
		} },
	{ id: "piridoksin", name: "Piridoksin (vitamin B6)", icon: "🧬", tox: "Isoniazid (INH) — kejang refrakter", inputs: [wIn, { k: "g", label: "INH tertelan", unit: "g", ph: "bila diketahui" }],
		run: (v) => { const w = W(v); const g = Number(v.g) || 0; return { lines: [["Dosis", g > 0 ? `${num(Math.min(g, 5))} g IV` : kid(v) ? `${num(Math.min(r0(w * 70), 5000))} mg IV` : "5 g IV", g > 0 ? "1 g per 1 g INH (maks 5 g awal)" : "dosis empiris bila jumlah tidak diketahui (anak 70 mg/kg, maks 5 g)"], ["Kecepatan", "0,5–1 g/menit", "saat kejang; dapat diulang"]], notes: ["Berikan bersama benzodiazepin untuk kejang.", "Bila sediaan IV kurang, tablet dapat digerus via NGT."] }; } },
	{ id: "magnesium", name: "Magnesium sulfat", icon: "⚡", tox: "Torsades de pointes (obat pemanjang QT), hipomagnesemia", inputs: [wIn],
		run: (v) => { const w = W(v); return { lines: [["Torsades", kid(v) ? `${num(r0(w * 25))}–${num(Math.min(r0(w * 50), 2000))} mg IV` : "2 g IV", kid(v) ? "25–50 mg/kg (maks 2 g) dalam 10–20 menit" : "dalam 1–2 menit bila tanpa nadi, 10–15 menit bila stabil"], ["MgSO₄ 20%", kid(v) ? `${num(r1(Math.min(w * 50, 2000) / 200))} mL` : "10 mL", "1 mL = 200 mg"], ["MgSO₄ 40%", kid(v) ? `${num(r1(Math.min(w * 50, 2000) / 400))} mL` : "5 mL", "1 mL = 400 mg — encerkan"]], warn: ["Pantau refleks patela & RR (toksisitas Mg: hiporefleksia, depresi napas); antidot: kalsium glukonas."] }; } },
	{ id: "dantrolen", name: "Dantrolen", icon: "🌡️", tox: "Hipertermia maligna, sindrom neuroleptik maligna berat", inputs: [wIn],
		run: (v) => { const w = W(v); return { lines: [["Bolus", `${num(r0(w * 2.5))} mg IV`, "2,5 mg/kg cepat"], ["Ulangan", `${num(r0(w))} mg`, "1 mg/kg tiap 5–10 menit sampai gejala teratasi (total biasanya ≤ 10 mg/kg)"], ["Vial 20 mg", `${Math.ceil((w * 2.5) / 20)} vial untuk bolus`, "tiap vial dilarutkan 60 mL air steril"]], notes: ["Hentikan pemicu (agen volatil/suksinilkolin; antipsikotik pada NMS), pendinginan aktif, koreksi hiperkalemia."] }; } },
	{ id: "levokarnitin", name: "Levokarnitin", icon: "🧠", tox: "Toksisitas asam valproat (hiperamonemia, hepatotoksik)", inputs: [wIn],
		run: (v) => { const w = W(v); return { lines: [["Dosis muat", `${num(Math.min(r0(w * 100), 6000))} mg IV`, "100 mg/kg (maks 6 g) dalam 30 menit"], ["Rumatan", `${num(r0(w * 15))} mg tiap 4 jam`, "15 mg/kg tiap 4 jam (maks 6 g/hari)"]], notes: ["Indikasi: hiperamonemia, ensefalopati, hepatotoksisitas, atau kadar valproat sangat tinggi (> 450 mg/L)."] }; } },
	{ id: "sabu", name: "Serum antibisa ular (SABU)", icon: "🐍", tox: "Gigitan ular berbisa (hematotoksik, neurotoksik)", inputs: [wIn],
		run: () => ({ lines: [["Dosis awal", "sesuai brosur SABU/pedoman Kemenkes", "umumnya 2 vial dalam 100–500 mL NaCl 0,9% atau D5%, tetes cepat"], ["Ulangan", "tiap 6 jam bila gejala menetap / 20WBCT tetap tidak membeku", "dosis anak SAMA dengan dewasa (bergantung jumlah bisa)"]], warn: ["Siapkan adrenalin IM (0,01 mg/kg, maks 0,5 mg) untuk reaksi anafilaksis sebelum memberikan SABU."], notes: ["Indikasi: gejala sistemik (koagulopati — uji pembekuan darah 20 menit/20WBCT, neurotoksik: ptosis, kelemahan), bengkak cepat meluas > ½ ekstremitas.", "Imobilisasi ekstremitas (pressure immobilization untuk ular neurotoksik); JANGAN diinsisi, dihisap, atau ditorniket ketat.", "Neurotoksik: pertimbangkan neostigmin + atropin."] }) },
	{ id: "nac", name: "N-asetilsistein (lihat kalkulator di bawah)", icon: "💊", tox: "Overdosis paracetamol", inputs: [], run: () => ({ lines: [["Rejimen 3 kantong 21 jam", "150 → 50 → 100 mg/kg", "gunakan kalkulator lengkap NAC di bawah (dengan nomogram)"]] }) },
];

const S: { id: string; v: V } = { id: "nalokson", v: {} };
/** Panel kalkulator antidot (pilih antidot lewat chip). */
export function antidoteCalcs(el: HTMLElement, defW: number) {
	const box = el.createDiv("mp-md-card mp-mt mp-ad");
	const h = box.createDiv("mp-md-card-h");
	h.createSpan({ cls: "mp-md-card-ic", text: "🧮" });
	h.createSpan({ cls: "mp-md-card-t", text: `Kalkulator antidot (${CALCS.length})` });
	box.createDiv({ cls: "mp-small mp-muted", text: "Pilih antidot, isi berat badan — dosis dihitung otomatis. Hasil hanya alat bantu; cocokkan dengan sediaan setempat." });
	chipRow(box, CALCS.map((c) => ({ id: c.id, label: c.name.replace(/ \(.+\)$/, ""), icon: c.icon })), S.id, (id) => { S.id = id; draw(); }, "mp-ad-chips");
	const body = box.createDiv("mp-ad-body");
	if (S.v.w === undefined && defW > 0) S.v.w = defW;
	const draw = () => {
		body.empty();
		const c = CALCS.find((x) => x.id === S.id) ?? CALCS[0];
		const hd = body.createDiv("mp-ad-head");
		hd.createSpan({ cls: "mp-ad-ic", text: c.icon });
		const t = hd.createDiv("mp-grow");
		t.createDiv({ cls: "mp-strong mp-ad-name", text: c.name });
		t.createDiv({ cls: "mp-small mp-muted", text: `Untuk: ${c.tox}` });
		const form = body.createDiv("mp-md-row mp-ad-form");
		const out = body.createDiv("mp-ad-out");
		const calc = () => {
			out.empty();
			if (c.inputs.some((i) => i.k === "w") && !(W(S.v) > 0)) { out.createDiv({ cls: "mp-md-warnline", text: "Isi berat badan untuk menghitung dosis." }); return; }
			const r = c.run(S.v);
			const grid = out.createDiv("mp-ad-lines");
			for (const [k, val, note] of r.lines) {
				const ln = grid.createDiv("mp-ad-line");
				ln.createDiv({ cls: "mp-small mp-muted", text: k });
				ln.createDiv({ cls: "mp-ad-val", text: val });
				if (note) ln.createDiv({ cls: "mp-small", text: note });
			}
			for (const w of r.warn ?? []) out.createDiv({ cls: "mp-md-alert is-amber", text: `⚠️ ${w}` });
			for (const n of r.notes ?? []) out.createDiv({ cls: "mp-small mp-ad-note", text: `ℹ️ ${n}` });
			const cp = out.createEl("button", { cls: "mp-md-rchip is-link", text: "📋 Salin hasil" });
			cp.onclick = () => copyText([`${c.name} — ${c.tox}`, W(S.v) ? `BB ${W(S.v)} kg` : "", ...r.lines.map(([a, b, n]) => `${a}: ${b}${n ? ` (${n})` : ""})`), ...(r.warn ?? []).map((x) => `⚠ ${x}`)].filter(Boolean).join("\n"), "Hasil kalkulator disalin");
		};
		for (const inp of c.inputs) {
			if (inp.opts) {
				if (S.v[inp.k] === undefined) S.v[inp.k] = inp.def ?? inp.opts[0][0];
				const w = form.createDiv("mp-md-field");
				w.createEl("label", { text: inp.label });
				seg(w, inp.opts, String(S.v[inp.k]), (val) => { S.v[inp.k] = val; calc(); }, "mp-md-seg-sm");
			} else {
				if (S.v[inp.k] === undefined && inp.def !== undefined) S.v[inp.k] = inp.def;
				field(form, inp.label, (S.v[inp.k] as number) ?? "", (val) => { S.v[inp.k] = toNum(val); calc(); }, { suffix: inp.unit, ph: inp.ph });
			}
		}
		calc();
	};
	draw();
}
