/**
 * Lab & AGD MedPro: analisis gas darah bertahap (gangguan primer, kompensasi, anion gap, delta ratio, oksigenasi),
 * koreksi elektrolit (Na-glukosa, Ca-albumin, osmolalitas, defisit air bebas, Adrogué-Madias, kalium, bikarbonat),
 * dan tabel nilai rujukan yang bisa dicari. Rujukan: Harrison's, Marino ICU Book, Tietz, PMK & lab RS di Indonesia.
 */
import type { HubView } from "./hub-view";
import { num } from "./med-engine";
import { copyText, disclaimer, field, med, seg, toNum } from "./medis";
import { acc, chipRow, mlist, nrm } from "./med-ui";

const T = { tab: "agd" };
const A: Record<string, number> = { ph: 0, pco2: 0, hco3: 0, po2: 0, fio2: 21, age: 40, na: 0, cl: 0, alb: 4, lac: 0 };
const r1 = (n: number) => Math.round(n * 10) / 10;
const r2 = (n: number) => Math.round(n * 100) / 100;

export function renderLab(hub: HubView, el: HTMLElement) {
	const head = el.createDiv("mp-mx-pagehead");
	const ht = head.createDiv("mp-grow");
	ht.createEl("h2", { text: "🧪 Lab & AGD" });
	ht.createDiv({ cls: "mp-small mp-muted", text: `Analisis gas darah bertahap, koreksi elektrolit, dan ${REF.length} nilai rujukan laboratorium` });
	chipRow(el, [{ id: "agd", label: "Analisis gas darah", icon: "🫧" }, { id: "elek", label: "Elektrolit & koreksi", icon: "🧂" }, { id: "ref", label: "Nilai rujukan", icon: "📋" }], T.tab, (v) => { T.tab = v; hub.renderPage(); }, "mp-lab-tabs");
	const body = el.createDiv("mp-lab-body");
	if (T.tab === "agd") agd(hub, body);
	else if (T.tab === "elek") elek(hub, body);
	else refTable(body);
	disclaimer(el);
}

// ================================================================ AGD
const PRESETS: [string, Partial<typeof A>][] = [
	["KAD", { ph: 7.12, pco2: 22, hco3: 8, po2: 98, fio2: 21, na: 132, cl: 98, alb: 4 }],
	["Diare berat", { ph: 7.28, pco2: 30, hco3: 14, po2: 95, fio2: 21, na: 138, cl: 114, alb: 3.8 }],
	["Muntah", { ph: 7.52, pco2: 48, hco3: 38, po2: 90, fio2: 21, na: 136, cl: 88, alb: 4 }],
	["PPOK eksaserbasi", { ph: 7.28, pco2: 68, hco3: 31, po2: 55, fio2: 28, na: 138, cl: 96, alb: 3.6 }],
	["Ansietas (hiperventilasi)", { ph: 7.52, pco2: 26, hco3: 21, po2: 105, fio2: 21, na: 140, cl: 104, alb: 4 }],
	["Sepsis + ARDS", { ph: 7.22, pco2: 36, hco3: 14, po2: 70, fio2: 60, na: 135, cl: 100, alb: 2.5, lac: 6 }],
];
function agd(hub: HubView, el: HTMLElement) {
	const m = med(hub.plugin);
	if (!A.age && m.pt.ageY) A.age = m.pt.ageY;
	const card = el.createDiv("mp-md-card");
	const h = card.createDiv("mp-md-card-h");
	h.createSpan({ cls: "mp-md-card-ic", text: "🫧" }); h.createSpan({ cls: "mp-md-card-t", text: "Masukkan hasil AGD" });
	const pr = card.createDiv("mp-dz-links");
	pr.createSpan({ cls: "mp-small mp-muted", text: "Contoh kasus:" });
	for (const [n, v] of PRESETS) { const b = pr.createEl("button", { cls: "mp-md-rchip is-link mp-lab-preset", text: n }); b.onclick = () => { Object.assign(A, { lac: 0, ...v }); hub.renderPage(); }; }
	const row = card.createDiv("mp-md-row mp-lab-form");
	const f = (k: string, label: string, unit: string, ph = "") => field(row, label, A[k] || "", (v) => { A[k] = toNum(v); run(); }, { suffix: unit, ph });
	f("ph", "pH", "", "7,40"); f("pco2", "pCO₂", "mmHg", "40"); f("hco3", "HCO₃⁻", "mEq/L", "24"); f("po2", "pO₂", "mmHg", "opsional"); f("fio2", "FiO₂", "%", "21"); f("age", "Usia", "th");
	const row2 = card.createDiv("mp-md-row mp-lab-form");
	const f2 = (k: string, label: string, unit: string, ph = "") => field(row2, label, A[k] || "", (v) => { A[k] = toNum(v); run(); }, { suffix: unit, ph });
	f2("na", "Na⁺", "mEq/L", "140"); f2("cl", "Cl⁻", "mEq/L", "104"); f2("alb", "Albumin", "g/dL", "4"); f2("lac", "Laktat", "mmol/L", "opsional");
	const out = el.createDiv("mp-lab-out");
	const run = () => {
		out.empty();
		const { ph, pco2, hco3 } = A;
		if (!(ph > 6.5 && ph < 8) || !(pco2 > 5) || !(hco3 > 2)) { out.createDiv({ cls: "mp-md-warnline", text: "Isi minimal pH, pCO₂, dan HCO₃⁻ (atau pilih contoh kasus)." }); return; }
		const res = interpretAbg(A);
		const steps = out.createDiv("mp-lab-steps");
		res.steps.forEach(([t, v, tone], i) => {
			const s = steps.createDiv("mp-lab-step " + (tone ?? ""));
			s.style.animationDelay = `${i * 0.06}s`;
			s.createDiv({ cls: "mp-lab-stepn", text: String(i + 1) });
			const b = s.createDiv("mp-grow");
			b.createDiv({ cls: "mp-small mp-muted", text: t });
			b.createDiv({ cls: "mp-lab-stepv", text: v });
		});
		const sum = out.createDiv("mp-lab-sum");
		sum.createDiv({ cls: "mp-small mp-muted", text: "Kesimpulan" });
		sum.createDiv({ cls: "mp-lab-sumv", text: res.summary });
		if (res.ddx.length) mlist(acc(out, "🔍", "Pikirkan penyebab", true, "is-accent"), res.ddx);
		const cp = out.createEl("button", { cls: "mp-md-rchip is-link", text: "📋 Salin interpretasi" });
		cp.onclick = () => copyText(`AGD: pH ${ph}, pCO₂ ${pco2}, HCO₃ ${hco3}${A.po2 ? `, pO₂ ${A.po2} (FiO₂ ${A.fio2}%)` : ""}\n${res.steps.map(([t, v]) => `- ${t}: ${v}`).join("\n")}\nKesimpulan: ${res.summary}`, "Interpretasi AGD disalin");
	};
	run();
	const tips = acc(el, "📘", "Rumus yang dipakai", false);
	mlist(tips, ["Kompensasi asidosis metabolik (Winter): pCO₂ harapan = 1,5 × HCO₃ + 8 ± 2", "Alkalosis metabolik: pCO₂ harapan = 0,7 × HCO₃ + 21 ± 2", "Asidosis respiratorik: HCO₃ naik 1 (akut) atau 3,5 (kronik) per kenaikan pCO₂ 10", "Alkalosis respiratorik: HCO₃ turun 2 (akut) atau 5 (kronik) per penurunan pCO₂ 10", "Anion gap = Na − (Cl + HCO₃), normal 8–12; koreksi albumin: AG + 2,5 × (4 − albumin)", "Delta ratio = (AG − 12) / (24 − HCO₃)", "Gradien A-a = [FiO₂ × (760 − 47) − pCO₂/0,8] − pO₂; normal ≈ usia/4 + 4", "Rasio P/F = pO₂ / FiO₂ (ARDS Berlin: ≤ 300 ringan, ≤ 200 sedang, ≤ 100 berat dengan PEEP ≥ 5)"]);
}

/** Interpretasi AGD bertahap (diekspor untuk pengujian). */
export function interpretAbg(a: typeof A): { steps: [string, string, string?][]; summary: string; ddx: string[] } {
	const { ph, pco2, hco3 } = a;
	const steps: [string, string, string?][] = [];
	const ddx: string[] = [];
	const status = ph < 7.35 ? "asidemia" : ph > 7.45 ? "alkalemia" : "pH normal";
	steps.push(["Status pH", `${status} (pH ${num(ph)})`, ph < 7.35 || ph > 7.45 ? "is-red" : "is-ok"]);
	let primary = "";
	let mixed = "";
	if (ph < 7.35) {
		const r = pco2 > 45, mt = hco3 < 22;
		if (r && mt) { primary = (pco2 - 40) / 40 > (24 - hco3) / 24 ? "asidosis respiratorik" : "asidosis metabolik"; mixed = "asidosis campuran (respiratorik + metabolik)"; }
		else primary = r ? "asidosis respiratorik" : "asidosis metabolik";
	} else if (ph > 7.45) {
		const r = pco2 < 35, mt = hco3 > 26;
		if (r && mt) { primary = (40 - pco2) / 40 > (hco3 - 24) / 24 ? "alkalosis respiratorik" : "alkalosis metabolik"; mixed = "alkalosis campuran (respiratorik + metabolik)"; }
		else primary = r ? "alkalosis respiratorik" : "alkalosis metabolik";
	} else {
		if (pco2 > 45 && hco3 > 26) primary = ph < 7.4 ? "asidosis respiratorik" : "alkalosis metabolik";
		else if (pco2 < 35 && hco3 < 22) primary = ph < 7.4 ? "asidosis metabolik" : "alkalosis respiratorik";
	}
	steps.push(["Gangguan primer", primary || "tidak ada gangguan asam-basa primer yang jelas", primary ? "is-amber" : "is-ok"]);
	const extra: string[] = [];
	let agTag = "";
	if (primary === "asidosis metabolik") {
		const exp = 1.5 * hco3 + 8;
		steps.push(["Kompensasi (Winter)", `pCO₂ harapan ${num(r1(exp - 2))}–${num(r1(exp + 2))} mmHg; terukur ${num(pco2)}`]);
		if (pco2 > exp + 2) extra.push("asidosis respiratorik penyerta"); else if (pco2 < exp - 2) extra.push("alkalosis respiratorik penyerta");
	} else if (primary === "alkalosis metabolik") {
		const exp = 0.7 * hco3 + 21;
		steps.push(["Kompensasi", `pCO₂ harapan ${num(r1(exp - 2))}–${num(r1(exp + 2))} mmHg; terukur ${num(pco2)}`]);
		if (pco2 > exp + 2) extra.push("asidosis respiratorik penyerta"); else if (pco2 < exp - 2) extra.push("alkalosis respiratorik penyerta");
		ddx.push("Respons klorida: muntah/NGT, diuretik (kadar Cl urin < 20 → responsif salin)", "Tidak responsif salin: hiperaldosteronisme, Cushing, hipokalemia berat, sindrom Bartter/Gitelman");
	} else if (primary === "asidosis respiratorik" || primary === "alkalosis respiratorik") {
		const d = pco2 - 40;
		const ac = 24 + (primary === "asidosis respiratorik" ? 0.1 : 0.2) * d;
		const ch = 24 + (primary === "asidosis respiratorik" ? 0.35 : 0.5) * d;
		steps.push(["Kompensasi metabolik", `HCO₃ harapan akut ≈ ${num(r1(ac))}, kronik ≈ ${num(r1(ch))} mEq/L; terukur ${num(hco3)}`]);
		const lo = Math.min(ac, ch) - 2, hi = Math.max(ac, ch) + 2;
		const phase = Math.abs(hco3 - ac) < Math.abs(hco3 - ch) ? "akut" : "kronik";
		if (hco3 < lo) extra.push("asidosis metabolik penyerta"); else if (hco3 > hi) extra.push("alkalosis metabolik penyerta"); else extra.push(`kemungkinan ${phase}`);
		if (primary === "asidosis respiratorik") ddx.push("Hipoventilasi: PPOK/asma berat (kelelahan), depresi SSP (opioid, sedatif), kelemahan otot napas (GBS, miastenia), obesitas-hipoventilasi");
		else ddx.push("Hiperventilasi: ansietas, nyeri, hipoksemia, sepsis dini, emboli paru, salisilat awal, kehamilan, sirosis");
	}
	if (a.na && a.cl) {
		const ag = a.na - (a.cl + hco3);
		const agc = ag + 2.5 * (4 - (a.alb || 4));
		const high = agc > 12;
		if (primary === "asidosis metabolik") agTag = high ? " anion gap tinggi" : " anion gap normal (hiperkloremik)";
		steps.push(["Anion gap", `${num(r1(ag))}${a.alb && a.alb !== 4 ? ` → koreksi albumin ${num(r1(agc))}` : ""} mEq/L (${high ? "TINGGI" : "normal"})`, high ? "is-red" : "is-ok"]);
		if (primary === "asidosis metabolik" || high) {
			if (high) {
				const dr = (agc - 12) / Math.max(0.1, 24 - hco3);
				steps.push(["Delta ratio", `${num(r2(dr))} — ${dr < 0.4 ? "asidosis metabolik AG normal (hiperkloremik)" : dr < 0.8 ? "campuran AG tinggi + AG normal" : dr <= 2 ? "asidosis metabolik AG tinggi murni" : "AG tinggi + alkalosis metabolik (atau asidosis respiratorik kronik)"}`]);
				if (dr > 2) extra.push("alkalosis metabolik penyerta (delta ratio > 2)"); else if (dr < 0.8 && dr >= 0.4) extra.push("asidosis metabolik AG normal penyerta");
				ddx.push("AG tinggi (GOLDMARK): Glikol (etilen), Oksoprolin (paracetamol kronik), L-laktat, D-laktat, Metanol, Aspirin, gagal ginjal (Renal), Ketoasidosis (DM, alkohol, kelaparan)");
			} else ddx.push("AG normal (hiperkloremik): diare, fistula pankreas/usus, asidosis tubulus ginjal, infus NaCl 0,9% berlebihan, ureterosigmoidostomi, asetazolamid");
		}
	} else if (primary === "asidosis metabolik") ddx.push("Isi Na⁺ dan Cl⁻ untuk menghitung anion gap dan mempersempit penyebab.");
	if (a.lac > 2) steps.push(["Laktat", `${num(a.lac)} mmol/L — ${a.lac >= 4 ? "hiperlaktatemia berat (syok/hipoperfusi)" : "meningkat"}`, a.lac >= 4 ? "is-red" : "is-amber"]);
	if (a.po2 > 0) {
		const fi = (a.fio2 || 21) / 100;
		const pf = a.po2 / fi;
		const aa = fi * 713 - pco2 / 0.8 - a.po2;
		const expAa = (a.age || 40) / 4 + 4;
		steps.push(["Oksigenasi", `pO₂ ${num(a.po2)} mmHg${a.po2 < 60 ? " (hipoksemia — gagal napas tipe " + (pco2 > 45 ? "2" : "1") + ")" : a.po2 < 80 ? " (hipoksemia ringan)" : ""}`, a.po2 < 60 ? "is-red" : a.po2 < 80 ? "is-amber" : "is-ok"]);
		steps.push(["Rasio P/F", `${num(Math.round(pf))}${pf <= 100 ? " — ARDS berat bila memenuhi kriteria Berlin" : pf <= 200 ? " — ARDS sedang (bila kriteria lain terpenuhi)" : pf <= 300 ? " — ARDS ringan / gangguan oksigenasi" : " — normal"}`, pf <= 200 ? "is-red" : pf <= 300 ? "is-amber" : "is-ok"]);
		steps.push(["Gradien A-a", `${num(Math.round(aa))} mmHg (harapan ≤ ${num(Math.round(expAa))}) — ${aa > expAa + 5 ? "MENINGKAT: gangguan V/Q, shunt, atau difusi" : "normal: hipoksemia (bila ada) karena hipoventilasi / FiO₂ rendah"}`]);
	}
	if (mixed) extra.unshift(mixed);
	const summary = primary ? `${primary[0].toUpperCase() + primary.slice(1)}${agTag}${extra.length ? " dengan " + extra.join(", ") : ""}` + (ph >= 7.35 && ph <= 7.45 && primary ? " (terkompensasi/ campuran — pH dalam batas normal)" : "") : "Tidak tampak gangguan asam-basa bermakna";
	return { steps, summary, ddx };
}

// ================================================================ Elektrolit & koreksi
const E: Record<string, number | string> = { na: 0, glu: 0, ca: 0, alb: 0, ureum: 0, osmm: 0, w: 0, sex: "L", tua: "tidak", k: 0, hco3: 0, kronik: "ya" };
function elek(hub: HubView, el: HTMLElement) {
	const m = med(hub.plugin);
	if (!E.w && m.pt.w) E.w = m.pt.w;
	const c = el.createDiv("mp-md-card");
	const h = c.createDiv("mp-md-card-h");
	h.createSpan({ cls: "mp-md-card-ic", text: "🧂" }); h.createSpan({ cls: "mp-md-card-t", text: "Data pasien" });
	const row = c.createDiv("mp-md-row mp-lab-form");
	const f = (k: string, label: string, unit: string, ph = "") => field(row, label, (E[k] as number) || "", (v) => { E[k] = toNum(v); run(); }, { suffix: unit, ph });
	f("w", "BB", "kg"); f("na", "Na⁺", "mEq/L"); f("k", "K⁺", "mEq/L"); f("glu", "Glukosa", "mg/dL"); f("ca", "Ca total", "mg/dL"); f("alb", "Albumin", "g/dL"); f("ureum", "Ureum", "mg/dL"); f("osmm", "Osmolalitas terukur", "mOsm/kg", "opsional"); f("hco3", "HCO₃⁻", "mEq/L");
	const row2 = c.createDiv("mp-md-row mp-lab-form");
	const sw = row2.createDiv("mp-md-field"); sw.createEl("label", { text: "Jenis kelamin" }); seg(sw, [["L", "Laki-laki"], ["P", "Perempuan"], ["A", "Anak"]], String(E.sex), (v) => { E.sex = v; run(); }, "mp-md-seg-sm");
	const tw = row2.createDiv("mp-md-field"); tw.createEl("label", { text: "Lansia (≥ 65 th)" }); seg(tw, [["tidak", "Tidak"], ["ya", "Ya"]], String(E.tua), (v) => { E.tua = v; run(); }, "mp-md-seg-sm");
	const kw = row2.createDiv("mp-md-field"); kw.createEl("label", { text: "Hiponatremia kronik (> 48 jam)?" }); seg(kw, [["ya", "Ya/tidak tahu"], ["tidak", "Akut"]], String(E.kronik), (v) => { E.kronik = v; run(); }, "mp-md-seg-sm");
	const out = el.createDiv("mp-lab-ecards");
	const run = () => {
		out.empty();
		const n = (k: string) => Number(E[k]) || 0;
		const card = (icon: string, title: string, val: string, sub: string, tone = "") => { const x = out.createDiv("mp-lab-ecard " + tone); x.createDiv({ cls: "mp-small mp-muted", text: `${icon} ${title}` }); x.createDiv({ cls: "mp-lab-ev", text: val }); x.createDiv({ cls: "mp-small", text: sub }); return x; };
		const na = n("na"), glu = n("glu"), w = n("w");
		if (na && glu) { const c1 = na + 1.6 * ((glu - 100) / 100), c2 = na + 2.4 * ((glu - 100) / 100); card("🍬", "Na koreksi glukosa", `${num(r1(c1))}–${num(r1(c2))} mEq/L`, "Katz (1,6) – Hillier (2,4) per 100 mg/dL di atas 100; penting pada KAD/HHS"); }
		if (n("ca") && n("alb")) { const cc = n("ca") + 0.8 * (4 - n("alb")); card("🦴", "Ca koreksi albumin", `${num(r1(cc))} mg/dL`, cc < 8.5 ? "hipokalsemia (periksa Ca ion)" : cc > 10.5 ? "hiperkalsemia" : "normal (8,5–10,5)", cc < 8.5 || cc > 10.5 ? "is-amber" : ""); }
		if (na && glu && n("ureum")) {
			const bun = n("ureum") / 2.14; const osm = 2 * na + glu / 18 + bun / 2.8;
			const x = card("🧮", "Osmolalitas hitung", `${num(Math.round(osm))} mOsm/kg`, "2×Na + glukosa/18 + BUN/2,8 (BUN = ureum/2,14); normal 275–295", osm > 320 ? "is-red" : "");
			if (n("osmm")) { const gap = n("osmm") - osm; x.createDiv({ cls: "mp-small mp-strong", text: `Gap osmolal ${num(Math.round(gap))} ${gap > 10 ? "— MENINGKAT: curigai metanol, etilen glikol, etanol, manitol" : "(normal < 10)"}` }); }
		}
		const tbwF = E.sex === "A" ? 0.6 : E.sex === "P" ? (E.tua === "ya" ? 0.45 : 0.5) : E.tua === "ya" ? 0.5 : 0.6;
		const tbw = w * tbwF;
		if (na > 145 && w) { const def = tbw * (na / 140 - 1); card("💧", "Defisit air bebas", `${num(r1(def))} L`, `TBW ${num(r1(tbw))} L × (Na/140 − 1). Turunkan Na ≤ 10 mEq/L/24 jam (kronik)`, "is-amber"); }
		if (na && na < 135 && w) {
			const x = card("🧂", "Koreksi hiponatremia (Adrogué-Madias)", `TBW ${num(r1(tbw))} L`, `Batas koreksi: ${E.kronik === "ya" ? "≤ 8–10 mEq/L dalam 24 jam (risiko demielinasi osmotik)" : "akut — boleh lebih cepat"}`, "is-amber");
			const tb = x.createDiv("mp-lab-adro");
			for (const [nm, nai] of [["NaCl 3%", 513], ["NaCl 0,9%", 154], ["Ringer laktat", 130]] as [string, number][]) {
				const d = (nai - na) / (tbw + 1);
				const need = d > 0 ? (E.kronik === "ya" ? 8 : 10) / d : 0;
				tb.createDiv({ cls: "mp-small", text: `${nm}: Na naik ${num(r2(d))} mEq/L per 1 L${need ? ` → ±${num(Math.round(need * 1000))} mL/24 jam untuk target ${E.kronik === "ya" ? 8 : 10} mEq/L` : ""}` });
			}
			if (na < 125) x.createDiv({ cls: "mp-small mp-strong", text: "Gejala berat (kejang, penurunan kesadaran): NaCl 3% 150 mL IV dalam 20 menit (anak 2 mL/kg), boleh diulang 2–3× sampai Na naik 5 mEq/L." });
		}
		const k = n("k");
		if (k) {
			if (k < 3.5) card("🍌", "Hipokalemia", k < 2.5 ? "berat" : k < 3 ? "sedang" : "ringan", `Perkiraan defisit ±${k < 3 ? "200–400" : "100–200"} mEq. KCl IV perifer ≤ 10 mEq/jam (≤ 20 mEq/jam via sentral + monitor EKG), konsentrasi ≤ 40 mEq/L perifer. Koreksi magnesium bila rendah.`, k < 3 ? "is-red" : "is-amber");
			else if (k > 5.5) card("⚡", "Hiperkalemia", k >= 6.5 ? "berat" : "sedang", "EKG segera. Ca glukonas 10% 10–30 mL IV (stabilisasi membran) bila ada perubahan EKG; insulin reguler 10 U + D40% 50 mL; salbutamol nebul 10–20 mg; hentikan obat pemicu; pertimbangkan dialisis.", "is-red");
		}
		if (n("hco3") && n("hco3") < 15 && w) card("🫧", "Defisit bikarbonat", `${num(Math.round(0.5 * w * (24 - n("hco3"))))} mEq`, "0,5 × BB × (24 − HCO₃). Berikan separuh, evaluasi ulang AGD; bikarbonat umumnya hanya bila pH < 7,1 atau AG normal berat.", "is-amber");
		if (!out.childElementCount) out.createDiv({ cls: "mp-md-warnline", text: "Isi nilai yang tersedia — kartu hasil muncul otomatis." });
	};
	run();
}

// ================================================================ Nilai rujukan
type Ref = [string, string, string, string, string?];
/** [kategori, pemeriksaan, nilai rujukan dewasa, satuan, catatan]. Nilai bervariasi antar laboratorium. */
export const REF: Ref[] = [
	["Darah lengkap", "Hemoglobin", "L 13–17 · P 12–15", "g/dL", "Anemia WHO: L < 13, P < 12, hamil < 11"],
	["Darah lengkap", "Hematokrit", "L 40–50 · P 36–44", "%", "Naik ≥ 20% pada DBD (hemokonsentrasi)"],
	["Darah lengkap", "Leukosit", "4.000–10.000", "/µL", "Leukositosis > 10.000; leukopenia < 4.000"],
	["Darah lengkap", "Trombosit", "150.000–400.000", "/µL", "DBD: ≤ 100.000"],
	["Darah lengkap", "Eritrosit", "L 4,5–5,5 · P 4,0–5,0", "juta/µL"],
	["Darah lengkap", "MCV", "80–100", "fL", "< 80 mikrositik (defisiensi besi, talasemia); > 100 makrositik (B12/folat)"],
	["Darah lengkap", "MCH", "27–33", "pg"],
	["Darah lengkap", "MCHC", "32–36", "g/dL"],
	["Darah lengkap", "RDW", "11,5–14,5", "%", "Meningkat pada defisiensi besi (vs talasemia normal)"],
	["Darah lengkap", "Retikulosit", "0,5–2,5", "%"],
	["Darah lengkap", "LED", "L < 15 · P < 20", "mm/jam"],
	["Hitung jenis", "Neutrofil", "50–70", "%", "ANC < 500 = neutropenia berat"],
	["Hitung jenis", "Limfosit", "20–40", "%"],
	["Hitung jenis", "Eosinofil", "1–4", "%", "Meningkat: alergi, parasit"],
	["Hitung jenis", "Monosit", "2–8", "%"],
	["Elektrolit", "Natrium (Na⁺)", "135–145", "mEq/L"],
	["Elektrolit", "Kalium (K⁺)", "3,5–5,0", "mEq/L"],
	["Elektrolit", "Klorida (Cl⁻)", "98–106", "mEq/L"],
	["Elektrolit", "Kalsium total", "8,5–10,5", "mg/dL", "Koreksi dengan albumin"],
	["Elektrolit", "Kalsium ion", "4,5–5,3", "mg/dL"],
	["Elektrolit", "Magnesium", "1,7–2,4", "mg/dL"],
	["Elektrolit", "Fosfat", "2,5–4,5", "mg/dL"],
	["Ginjal", "Ureum", "15–40", "mg/dL", "BUN = ureum / 2,14"],
	["Ginjal", "BUN", "7–20", "mg/dL"],
	["Ginjal", "Kreatinin", "L 0,7–1,3 · P 0,6–1,1", "mg/dL"],
	["Ginjal", "eGFR", "≥ 90", "mL/menit/1,73 m²", "CKD bila < 60 selama > 3 bulan"],
	["Ginjal", "Asam urat", "L 3,5–7,2 · P 2,6–6,0", "mg/dL"],
	["Hati", "SGOT (AST)", "< 35", "U/L"],
	["Hati", "SGPT (ALT)", "< 40", "U/L", "Hepatitis akut virus: sering > 10× batas atas"],
	["Hati", "Bilirubin total", "0,3–1,2", "mg/dL", "Ikterus klinis > 2–3 mg/dL"],
	["Hati", "Bilirubin direk", "< 0,3", "mg/dL"],
	["Hati", "Alkali fosfatase", "40–130", "U/L"],
	["Hati", "Gamma-GT", "L < 60 · P < 40", "U/L"],
	["Hati", "Albumin", "3,5–5,0", "g/dL"],
	["Hati", "Protein total", "6,0–8,0", "g/dL"],
	["Glukosa", "Glukosa puasa", "70–99", "mg/dL", "DM ≥ 126; prediabetes 100–125"],
	["Glukosa", "Glukosa 2 jam PP / TTGO", "< 140", "mg/dL", "DM ≥ 200"],
	["Glukosa", "Glukosa sewaktu", "< 200", "mg/dL", "DM ≥ 200 + gejala klasik"],
	["Glukosa", "HbA1c", "< 5,7", "%", "Prediabetes 5,7–6,4; DM ≥ 6,5"],
	["Lipid", "Kolesterol total", "< 200", "mg/dL"],
	["Lipid", "LDL", "< 100", "mg/dL", "Target sesuai risiko (< 70 / < 55)"],
	["Lipid", "HDL", "L > 40 · P > 50", "mg/dL"],
	["Lipid", "Trigliserida", "< 150", "mg/dL", "> 500 risiko pankreatitis"],
	["Koagulasi", "PT", "11–13,5", "detik"],
	["Koagulasi", "INR", "0,8–1,2", "", "Target warfarin umumnya 2–3"],
	["Koagulasi", "APTT", "25–35", "detik"],
	["Koagulasi", "Fibrinogen", "200–400", "mg/dL"],
	["Koagulasi", "D-dimer", "< 0,5", "µg/mL FEU", "Negatif menyingkirkan TVD/emboli paru risiko rendah"],
	["Jantung", "Troponin I hs", "< persentil 99 (lab)", "ng/L", "Naik-turun = infark miokard akut"],
	["Jantung", "CK-MB", "< 25", "U/L"],
	["Jantung", "NT-proBNP", "< 125 (< 75 th)", "pg/mL", "Gagal jantung akut: > 300"],
	["Inflamasi", "CRP", "< 5", "mg/L"],
	["Inflamasi", "Prokalsitonin", "< 0,5", "ng/mL", "> 2 sugestif sepsis bakteri"],
	["Inflamasi", "Laktat", "0,5–2,0", "mmol/L", "≥ 4 = hipoperfusi berat"],
	["Tiroid", "TSH", "0,4–4,0", "mIU/L"],
	["Tiroid", "FT4", "0,8–1,8", "ng/dL"],
	["Pankreas", "Lipase", "< 60", "U/L", "Pankreatitis: > 3× batas atas"],
	["Pankreas", "Amilase", "30–110", "U/L"],
	["Besi", "Feritin", "L 30–400 · P 15–150", "ng/mL", "< 30 = defisiensi besi"],
	["Besi", "Serum iron", "60–170", "µg/dL"],
	["Besi", "TIBC", "250–450", "µg/dL"],
	["Besi", "Saturasi transferin", "20–50", "%"],
	["AGD", "pH", "7,35–7,45", ""],
	["AGD", "pCO₂", "35–45", "mmHg"],
	["AGD", "pO₂", "80–100", "mmHg", "Udara ruang"],
	["AGD", "HCO₃⁻", "22–26", "mEq/L"],
	["AGD", "Base excess", "−2 s.d. +2", "mEq/L"],
	["AGD", "SaO₂", "95–100", "%"],
	["Urinalisis", "Berat jenis", "1,005–1,030", ""],
	["Urinalisis", "pH urin", "4,5–8", ""],
	["Urinalisis", "Leukosit urin", "0–5", "/LPB", "> 10/LPB + nitrit (+) = ISK"],
	["Urinalisis", "Eritrosit urin", "0–3", "/LPB"],
	["Urinalisis", "Protein urin", "negatif", "", "Kehamilan: ≥ +1 dengan hipertensi → preeklamsia"],
	["Urinalisis", "Rasio albumin/kreatinin urin", "< 30", "mg/g", "Albuminuria 30–300 (sedang), > 300 (berat)"],
	["Serologi", "NS1 dengue", "negatif", "", "Positif hari 1–5 demam"],
	["Serologi", "IgM/IgG dengue", "negatif", "", "IgM (+) hari ≥ 4–5"],
	["Serologi", "Widal", "< 1/160", "", "Interpretasi terbatas; kultur darah baku emas"],
	["Serologi", "HBsAg", "nonreaktif", ""],
	["Serologi", "Anti-HIV", "nonreaktif", "", "Strategi 3 tes berbeda untuk diagnosis"],
	["Cairan otak", "Sel LCS", "0–5", "/µL", "Bakteri: PMN ↑, glukosa ↓, protein ↑"],
	["Cairan otak", "Glukosa LCS", "> 60% glukosa darah", ""],
	["Cairan otak", "Protein LCS", "15–45", "mg/dL"],
];
let RQ = "";
let RC = "";
function refTable(el: HTMLElement) {
	const box = el.createDiv("mp-md-search mp-mx-search");
	box.createSpan({ cls: "mp-md-search-ic", text: "🔎" });
	const inp = box.createEl("input", { type: "text", cls: "mp-md-search-in mp-lab-refq", attr: { placeholder: "Cari pemeriksaan… (mis. trombosit, kreatinin, HbA1c)" } });
	inp.value = RQ;
	const cats = [...new Set(REF.map((r) => r[0]))];
	chipRow(el, [{ id: "", label: "Semua", n: REF.length }, ...cats.map((c) => ({ id: c, label: c, n: REF.filter((r) => r[0] === c).length }))], RC, (v) => { RC = v; draw(); }, "mp-lab-cats");
	const tbl = el.createDiv("mp-lab-ref");
	const draw = () => {
		tbl.empty();
		const q = nrm(RQ);
		const rows = REF.filter((r) => (!RC || r[0] === RC) && (!q || nrm(r.join(" ")).includes(q)));
		let last = "";
		for (const [cat, name, val, unit, note] of rows) {
			if (cat !== last && !q) { tbl.createDiv({ cls: "mp-dz-cat", text: cat }); last = cat; }
			const r = tbl.createDiv("mp-lab-row");
			const a = r.createDiv("mp-grow");
			a.createDiv({ cls: "mp-strong", text: name });
			if (note) a.createDiv({ cls: "mp-small mp-muted", text: note });
			r.createDiv({ cls: "mp-lab-val", text: `${val}${unit ? " " + unit : ""}` });
		}
		if (!rows.length) tbl.createDiv({ cls: "mp-md-empty", text: "Tidak ditemukan." });
		tbl.createDiv({ cls: "mp-small mp-muted", text: "Nilai rujukan dapat berbeda antar laboratorium — selalu utamakan rentang pada lembar hasil lab Anda." });
	};
	inp.oninput = () => { RQ = inp.value; draw(); };
	draw();
}
