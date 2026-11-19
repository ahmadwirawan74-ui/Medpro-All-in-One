/**
 * EKG & radiologi MedPro: langkah baca EKG sistematis, galeri irama dengan gelombang EKG yang digambar secara
 * prosedural di atas kertas grid, kuis tebak irama, kalkulator (frekuensi, QTc, aksis), dan foto toraks skematis
 * interaktif dengan kalkulator CTR. Rujukan: Dubin, ECG Made Easy, AHA/ACC, Felson's Principles of Chest Roentgenology.
 */
import type { HubView } from "./hub-view";
import { num } from "./med-engine";
import { copyText, disclaimer, field, seg, toNum } from "./medis";
import { acc, chipRow, mlist } from "./med-ui";
import { play } from "./sound";
import { btn } from "./util";

const NS = "http://www.w3.org/2000/svg";
const T = { tab: "baca", rhythm: "nsr", cxr: "normal" };

// ---------------------------------------------------------------- generator gelombang
interface Beat { t: number; pr?: number; p?: boolean; qrs?: number; amp?: number; st?: number; tAmp?: number; wide?: boolean; inv?: boolean }
interface Rhythm { id: string; name: string; group: string; rate: string; beats: (dur: number) => Beat[]; base?: (t: number) => number; crit: string[]; cause: string[]; tx: string[]; noBeats?: boolean; pOnly?: number[] }
const g = (t: number, c: number, w: number, a: number) => a * Math.exp(-((t - c) ** 2) / (2 * w * w));
function beatV(t: number, b: Beat): number {
	const x = t - b.t;
	if (x < -0.35 || x > 0.6) return 0;
	const amp = b.amp ?? 1;
	if (b.wide) {
		const s = b.inv ? -1 : 1;
		return g(x, 0, 0.045, 1.2 * amp * s) + g(x, 0.09, 0.05, -0.5 * amp * s) + g(x, 0.32, 0.07, -0.35 * s);
	}
	const qw = (b.qrs ?? 0.08) / 0.08;
	let v = 0;
	if (b.p !== false) v += g(x, -(b.pr ?? 0.16) + 0.05, 0.025, 0.13);
	v += g(x, -0.025 * qw, 0.01 * qw, -0.12) + g(x, 0, 0.011 * qw, amp) + g(x, 0.028 * qw, 0.011 * qw, -0.28);
	const st = b.st ?? 0;
	if (st) { const k = (y: number) => 1 / (1 + Math.exp(-y)); v += st * k((x - 0.035 * qw) / 0.006) * (1 - k((x - 0.24) / 0.03)); }
	v += g(x, 0.28 + (qw - 1) * 0.03, b.tAmp && b.tAmp > 0.5 ? 0.035 : 0.055, b.tAmp ?? 0.3);
	return v;
}
const reg = (rate: number, dur: number, f: (i: number, t: number) => Partial<Beat> = () => ({})) => { const out: Beat[] = []; const rr = 60 / rate; for (let i = 0, t = 0.45; t < dur; i++, t += rr) out.push({ t, ...f(i, t) }); return out; };
const rng = (seed: number) => () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };

export const RHYTHMS: Rhythm[] = [
	{ id: "nsr", name: "Irama sinus normal", group: "Sinus", rate: "60–100", beats: (d) => reg(75, d), crit: ["Gelombang P positif di II sebelum setiap QRS", "PR 0,12–0,20 detik, QRS < 0,12 detik", "Interval RR teratur, frekuensi 60–100 x/menit"], cause: ["Normal"], tx: ["Tidak perlu tata laksana"] },
	{ id: "sb", name: "Sinus bradikardia", group: "Sinus", rate: "< 60", beats: (d) => reg(45, d), crit: ["Irama sinus dengan frekuensi < 60 x/menit"], cause: ["Atlet, tidur", "Beta-bloker, digoksin, CCB", "Hipotiroid, hipotermia", "Peningkatan TIK (Cushing), infark inferior"], tx: ["Bila simptomatik/tidak stabil: atropin 1 mg IV (ulang tiap 3–5 menit, maks 3 mg)", "Pacu transkutan / dopamin / adrenalin bila atropin gagal"] },
	{ id: "st", name: "Sinus takikardia", group: "Sinus", rate: "> 100", beats: (d) => reg(125, d, () => ({ pr: 0.13 })), crit: ["Irama sinus > 100 x/menit (jarang > 150 pada dewasa)", "P dapat menempel pada T sebelumnya"], cause: ["Demam, nyeri, ansietas", "Hipovolemia, perdarahan, sepsis", "Anemia, hipertiroid, emboli paru", "Obat (salbutamol, kafein)"], tx: ["Atasi penyebab — bukan diberi antiaritmia"] },
	{ id: "af", name: "Fibrilasi atrium", group: "Supraventrikular", rate: "bervariasi", beats: (d) => { const r = rng(7); const o: Beat[] = []; for (let t = 0.4; t < d; t += 0.42 + r() * 0.55) o.push({ t, p: false }); return o; }, base: (t) => 0.04 * Math.sin(2 * Math.PI * 6.3 * t) + 0.03 * Math.sin(2 * Math.PI * 8.7 * t + 1) + 0.02 * Math.sin(2 * Math.PI * 4.1 * t + 2), crit: ["Irregularly irregular (RR tidak teratur sama sekali)", "Tidak ada gelombang P; garis dasar bergelombang halus (gelombang f)", "QRS sempit"], cause: ["Hipertensi, penyakit katup (stenosis mitral)", "Gagal jantung, PJK", "Hipertiroid, alkohol (holiday heart), sepsis"], tx: ["Tidak stabil: kardioversi sinkron", "Kontrol laju: beta-bloker, diltiazem, digoksin (gagal jantung)", "Antikoagulan sesuai skor CHA₂DS₂-VASc"] },
	{ id: "afl", name: "Flutter atrium (2:1)", group: "Supraventrikular", rate: "±150", beats: (d) => reg(150, d, () => ({ p: false })), base: (t) => { const ph = (t * 5) % 1; return -0.16 * (ph < 0.8 ? ph / 0.8 : (1 - ph) / 0.2) + 0.08; }, crit: ["Gelombang flutter gigi gergaji ±300 x/menit (paling jelas di II, III, aVF)", "Konduksi 2:1 → laju ventrikel ±150 x/menit — curigai flutter bila takikardia tepat 150"], cause: ["Penyakit jantung struktural, PPOK, pasca-bedah jantung"], tx: ["Kardioversi (energi rendah sering efektif)", "Kontrol laju seperti FA; ablasi istmus kavotrikuspid"] },
	{ id: "svt", name: "Takikardia supraventrikular (SVT)", group: "Supraventrikular", rate: "150–250", beats: (d) => reg(190, d, () => ({ p: false, tAmp: 0.22 })), crit: ["Takikardia QRS sempit teratur 150–250 x/menit", "Gelombang P tidak terlihat (tersembunyi dalam QRS) atau retrograd"], cause: ["Re-entri nodus AV (AVNRT), jalur aksesori (AVRT/WPW)"], tx: ["Stabil: manuver vagal (Valsalva termodifikasi)", "Adenosin 6 mg IV bolus cepat + flush, lalu 12 mg", "Tidak stabil: kardioversi sinkron"] },
	{ id: "pvc", name: "Ekstrasistol ventrikel (VES)", group: "Ventrikular", rate: "dasar 60–100", beats: (d) => { const o: Beat[] = []; let t = 0.45, i = 0; while (t < d) { if (i % 4 === 3) { o.push({ t: t - 0.25, wide: true }); t += 0.55; } else { o.push({ t }); t += 0.8; } i++; } return o; }, crit: ["Kompleks QRS lebar & aneh yang datang lebih awal, tanpa P", "Diikuti jeda kompensasi penuh", "Bigemini/trigemini bila berpola"], cause: ["Kafein, stres, kurang tidur", "Hipokalemia, hipomagnesemia", "Iskemia, kardiomiopati, toksisitas digoksin"], tx: ["Koreksi elektrolit & pemicu", "Beta-bloker bila simptomatik"] },
	{ id: "vt", name: "Takikardia ventrikel (VT)", group: "Ventrikular", rate: "> 100 (150–250)", beats: (d) => reg(170, d, () => ({ wide: true })), crit: ["Takikardia QRS lebar (> 0,12 detik) teratur", "Disosiasi AV, capture/fusion beat (bila terlihat)"], cause: ["Infark/skar miokard, kardiomiopati", "Hipokalemia, hipomagnesemia, obat pemanjang QT"], tx: ["Tanpa nadi: algoritma henti jantung (DC shock)", "Dengan nadi tidak stabil: kardioversi sinkron", "Stabil: amiodaron 150 mg IV dalam 10 menit"] },
	{ id: "vf", name: "Fibrilasi ventrikel (VF)", group: "Henti jantung", rate: "—", noBeats: true, beats: () => [], base: (t) => 0.45 * Math.sin(2 * Math.PI * 4.7 * t) * (0.6 + 0.4 * Math.sin(2 * Math.PI * 0.7 * t)) + 0.25 * Math.sin(2 * Math.PI * 6.9 * t + 1.3) + 0.12 * Math.sin(2 * Math.PI * 9.1 * t + 0.4), crit: ["Gelombang kacau tanpa QRS yang dapat dikenali", "Pasien tanpa nadi"], cause: ["Infark miokard akut, VT yang memburuk", "Elektrolit berat, tersengat listrik"], tx: ["RJP berkualitas + defibrilasi segera (bifasik 120–200 J)", "Adrenalin 1 mg tiap 3–5 menit setelah shock ke-2", "Amiodaron 300 mg setelah shock ke-3"] },
	{ id: "asis", name: "Asistol", group: "Henti jantung", rate: "0", noBeats: true, beats: () => [], base: (t) => 0.02 * Math.sin(2 * Math.PI * 0.4 * t), crit: ["Garis (hampir) datar — konfirmasi di 2 sadapan, periksa kabel & gain"], cause: ["Henti jantung lanjut; 5H 5T (hipoksia, hipovolemia, H⁺, hipo/hiperkalemia, hipotermia; tension pneumothorax, tamponade, toksin, trombosis koroner/paru)"], tx: ["RJP + adrenalin 1 mg segera tiap 3–5 menit", "TIDAK diberi shock", "Cari & atasi penyebab reversibel"] },
	{ id: "avb1", name: "Blok AV derajat I", group: "Blok", rate: "normal", beats: (d) => reg(70, d, () => ({ pr: 0.3 })), crit: ["PR memanjang > 0,20 detik dan tetap", "Setiap P diikuti QRS"], cause: ["Atlet, vagal", "Beta-bloker, digoksin, CCB", "Iskemia inferior, demam reumatik"], tx: ["Umumnya tidak perlu terapi; evaluasi obat"] },
	{ id: "avb2a", name: "Blok AV derajat II Mobitz I (Wenckebach)", group: "Blok", rate: "sedikit lambat", beats: (d) => { const o: Beat[] = []; const prs = [0.16, 0.24, 0.32]; let t = 0.5, i = 0; while (t < d) { const k = i % 4; if (k < 3) { o.push({ t: t + prs[k], pr: prs[k] }); } t += 0.78; i++; } return o; }, pOnly: [], crit: ["PR memanjang progresif lalu satu P tidak diikuti QRS", "Pola berulang (grouped beating)"], cause: ["Infark inferior, obat penekan nodus AV, vagal"], tx: ["Biasanya jinak; atropin bila simptomatik"] },
	{ id: "avb2b", name: "Blok AV derajat II Mobitz II", group: "Blok", rate: "lambat", beats: (d) => { const o: Beat[] = []; let t = 0.5, i = 0; while (t < d) { if (i % 3 !== 2) o.push({ t: t + 0.18, pr: 0.18, qrs: 0.11 }); t += 0.75; i++; } return o; }, crit: ["PR tetap, lalu tiba-tiba P tidak diikuti QRS", "QRS sering lebar (blok infranodal)"], cause: ["Infark anterior, penyakit sistem konduksi"], tx: ["Berisiko menjadi blok total — persiapkan pacu jantung", "Atropin sering tidak efektif"] },
	{ id: "avb3", name: "Blok AV total (derajat III)", group: "Blok", rate: "20–40 (ventrikel)", beats: (d) => reg(38, d, () => ({ p: false, qrs: 0.13 })), crit: ["P dan QRS berjalan sendiri-sendiri (disosiasi AV)", "Laju atrium > laju ventrikel; RR teratur lambat, QRS sering lebar"], cause: ["Infark inferior/anterior, degeneratif, toksisitas digoksin, hiperkalemia, penyakit Lyme"], tx: ["Pacu transkutan → pacu jantung permanen", "Dopamin/adrenalin sementara"] },
	{ id: "stemi", name: "STEMI (elevasi ST)", group: "Iskemia", rate: "bervariasi", beats: (d) => reg(88, d, () => ({ st: 0.32, tAmp: 0.42 })), crit: ["Elevasi ST ≥ 1 mm di ≥ 2 sadapan bersebelahan (V2–V3: ≥ 2 mm pria, ≥ 1,5 mm wanita)", "Lokasi: V1–V4 anterior (LAD), II-III-aVF inferior (RCA), I-aVL-V5-V6 lateral (LCx)", "Depresi resiprokal; LBBB baru setara STEMI"], cause: ["Oklusi akut arteri koroner"], tx: ["Aspirin 160–320 mg kunyah + P2Y12 (klopidogrel 300–600 mg)", "Reperfusi: PCI primer (< 120 menit) atau fibrinolitik (< 12 jam)", "Nitrat bila tidak hipotensi/infark ventrikel kanan; oksigen bila SpO₂ < 90%"] },
	{ id: "hiperk", name: "Hiperkalemia", group: "Elektrolit", rate: "bervariasi", beats: (d) => reg(70, d, () => ({ tAmp: 0.85, qrs: 0.1, pr: 0.2 })), crit: ["T tinggi runcing (peaked) dengan dasar sempit — tanda paling awal", "Lanjut: PR memanjang, P mendatar/hilang, QRS melebar → pola sinus (sine wave) → VF/asistol"], cause: ["Gagal ginjal, obat (ACE-I/ARB, spironolakton), asidosis, rabdomiolisis, hemolisis sampel (pseudo)"], tx: ["Kalsium glukonas 10% 10–30 mL IV bila ada perubahan EKG", "Insulin 10 U + dekstrosa; salbutamol nebul", "Pengikat kalium, diuretik, dialisis"] },
];

function strip(parent: HTMLElement, r: Rhythm, dur = 6, h = 150) {
	const pxs = 100; // px per detik (1 kotak kecil = 0,04 s = 4 px)
	const W = dur * pxs, mid = h * 0.58, mv = 40; // 1 mV = 10 mm = 40 px
	const svg = document.createElementNS(NS, "svg");
	svg.setAttribute("viewBox", `0 0 ${W} ${h}`);
	svg.setAttribute("class", "mp-ekg-svg");
	svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
	const defs = document.createElementNS(NS, "defs");
	const pat = (id: string, s: number, cls: string) => { const p = document.createElementNS(NS, "pattern"); p.setAttribute("id", id); p.setAttribute("width", String(s)); p.setAttribute("height", String(s)); p.setAttribute("patternUnits", "userSpaceOnUse"); const pa = document.createElementNS(NS, "path"); pa.setAttribute("d", `M ${s} 0 L 0 0 0 ${s}`); pa.setAttribute("class", cls); p.appendChild(pa); defs.appendChild(p); };
	const uid = Math.random().toString(36).slice(2, 7);
	pat(`s${uid}`, 4, "mp-ekg-g1"); pat(`b${uid}`, 20, "mp-ekg-g2");
	svg.appendChild(defs);
	for (const id of [`s${uid}`, `b${uid}`]) { const rc = document.createElementNS(NS, "rect"); rc.setAttribute("width", String(W)); rc.setAttribute("height", String(h)); rc.setAttribute("fill", `url(#${id})`); svg.appendChild(rc); }
	const beats = r.noBeats ? [] : r.beats(dur);
	// P "terlepas" untuk blok AV (P tetap muncul meski QRS hilang)
	const extraP: number[] = [];
	if (r.id === "avb2a") for (let t = 0.5, i = 0; t < dur; t += 0.78, i++) if (i % 4 === 3) extraP.push(t + 0.05);
	if (r.id === "avb2b") for (let t = 0.5, i = 0; t < dur; t += 0.75, i++) if (i % 3 === 2) extraP.push(t + 0.05);
	if (r.id === "avb3") for (let t = 0.3; t < dur; t += 0.72) extraP.push(t);
	let d = "";
	for (let i = 0; i <= dur * 250; i++) {
		const t = i / 250;
		let v = r.base ? r.base(t) : 0;
		for (const b of beats) v += beatV(t, b);
		for (const pt of extraP) v += g(t, pt, 0.025, 0.13);
		d += `${i ? "L" : "M"}${(t * pxs).toFixed(1)} ${(mid - v * mv).toFixed(1)}`;
	}
	const path = document.createElementNS(NS, "path");
	path.setAttribute("d", d); path.setAttribute("class", "mp-ekg-trace");
	svg.appendChild(path);
	const lab = document.createElementNS(NS, "text"); lab.setAttribute("x", "6"); lab.setAttribute("y", "14"); lab.setAttribute("class", "mp-ekg-lead"); lab.textContent = "II · 25 mm/s · 10 mm/mV"; svg.appendChild(lab);
	parent.appendChild(svg);
	return svg;
}

export function renderEkg(hub: HubView, el: HTMLElement) {
	const head = el.createDiv("mp-mx-pagehead");
	const ht = head.createDiv("mp-grow");
	ht.createEl("h2", { text: "📈 EKG & radiologi" });
	ht.createDiv({ cls: "mp-small mp-muted", text: `Baca EKG sistematis · ${RHYTHMS.length} contoh irama · kuis · kalkulator QTc & aksis · foto toraks interaktif` });
	chipRow(el, [{ id: "baca", label: "Baca EKG", icon: "🧭" }, { id: "irama", label: "Galeri irama", icon: "💓" }, { id: "kuis", label: "Kuis irama", icon: "🎯" }, { id: "kalk", label: "Kalkulator", icon: "🧮" }, { id: "cxr", label: "Foto toraks", icon: "🩻" }], T.tab, (v) => { T.tab = v; hub.renderPage(); }, "mp-ekg-tabs");
	const body = el.createDiv("mp-ekg-body");
	if (T.tab === "baca") baca(body);
	else if (T.tab === "irama") gallery(body);
	else if (T.tab === "kuis") quiz(hub, body);
	else if (T.tab === "kalk") calc(body);
	else cxr(body);
	disclaimer(el);
}

function baca(el: HTMLElement) {
	const demo = el.createDiv("mp-ekg-demo");
	strip(demo, RHYTHMS[0], 6);
	const steps: [string, string, string[]][] = [
		["1. Identitas & kalibrasi", "Nama, waktu, kecepatan 25 mm/detik, kalibrasi 10 mm/mV.", ["1 kotak kecil = 0,04 detik & 0,1 mV; 1 kotak besar = 0,20 detik"]],
		["2. Frekuensi", "Teratur: 300 ÷ jumlah kotak besar antar R (atau 1500 ÷ kotak kecil). Tidak teratur: jumlah QRS dalam 6 detik × 10.", ["< 60 bradikardia · 60–100 normal · > 100 takikardia"]],
		["3. Irama", "Teratur atau tidak? Ada P sebelum tiap QRS? P positif di II & negatif di aVR = sinus.", ["Irregularly irregular tanpa P → fibrilasi atrium"]],
		["4. Aksis", "Lihat defleksi netto QRS di I dan aVF.", ["I (+) aVF (+) normal · I (+) aVF (−) deviasi kiri (cek II) · I (−) aVF (+) deviasi kanan · keduanya (−) ekstrem"]],
		["5. Gelombang P", "Tinggi < 2,5 mm, lebar < 0,12 detik.", ["P pulmonal (tinggi runcing di II) → pembesaran atrium kanan", "P mitral (lebar berlekuk) → pembesaran atrium kiri"]],
		["6. Interval PR", "0,12–0,20 detik (3–5 kotak kecil).", ["> 0,20 → blok AV I · < 0,12 + gelombang delta → WPW"]],
		["7. Kompleks QRS", "Lebar < 0,12 detik; nilai Q patologis, voltase (LVH), pola blok cabang.", ["LVH Sokolow-Lyon: S V1 + R V5/V6 ≥ 35 mm", "RBBB: rSR' di V1 · LBBB: QRS lebar, R lebar berlekuk di V6"]],
		["8. Segmen ST & gelombang T", "Elevasi/depresi ST, T inversi, T runcing.", ["Elevasi ST di sadapan bersebelahan → STEMI (lihat distribusi arteri)", "T runcing → hiperkalemia · ST cekung difus + PR depresi → perikarditis"]],
		["9. Interval QT", "Koreksi dengan frekuensi (QTc).", ["QTc > 450 ms (pria) / > 470 ms (wanita) memanjang; > 500 ms risiko torsades"]],
		["10. Kesimpulan", "Rangkum: irama, frekuensi, aksis, kelainan; bandingkan dengan EKG sebelumnya & klinis.", ["Contoh: Irama sinus 75 x/menit, aksis normal, elevasi ST V1–V4 → STEMI anterior"]],
	];
	for (const [t, d, k] of steps) { const b = acc(el, "🫀", t, t.startsWith("1.") || t.startsWith("2.")); b.createDiv({ cls: "mp-md-p", text: d }); mlist(b, k); }
}

function rhythmCard(el: HTMLElement, r: Rhythm) {
	const c = el.createDiv("mp-ekg-card");
	const h = c.createDiv("mp-ekg-card-h");
	h.createSpan({ cls: "mp-strong", text: r.name });
	h.createSpan({ cls: "mp-mx-pill", text: `${r.group} · ${r.rate} x/mnt` });
	strip(c.createDiv("mp-ekg-strip"), r, 6);
	const cols = c.createDiv("mp-ekg-cols");
	const sec = (t: string, xs: string[], cls = "") => { const b = cols.createDiv("mp-ekg-col " + cls); b.createDiv({ cls: "mp-small mp-strong", text: t }); mlist(b, xs); };
	sec("Kriteria", r.crit); sec("Penyebab", r.cause); sec("Tata laksana", r.tx, "is-tx");
	return c;
}
function gallery(el: HTMLElement) {
	const groups = [...new Set(RHYTHMS.map((r) => r.group))];
	chipRow(el, RHYTHMS.map((r) => ({ id: r.id, label: r.name.replace(/ \(.+\)$/, "") })), T.rhythm, (v) => { T.rhythm = v; draw(); }, "mp-ekg-rchips");
	const box = el.createDiv();
	const draw = () => { box.empty(); rhythmCard(box, RHYTHMS.find((r) => r.id === T.rhythm) ?? RHYTHMS[0]); };
	draw();
	void groups;
}

function quiz(hub: HubView, el: HTMLElement) {
	const N = 8;
	const qs = [...RHYTHMS].sort(() => Math.random() - 0.5).slice(0, N);
	let i = 0, score = 0;
	const box = el.createDiv("mp-ekg-quiz");
	const next = () => {
		box.empty();
		if (i >= N) {
			const r = box.createDiv("mp-pf-qres");
			r.createDiv({ cls: "mp-pf-qscore", text: `${score}/${N}` });
			r.createDiv({ cls: "mp-small", text: score === N ? "Sempurna! 🎉" : "Pelajari galeri irama lalu coba lagi." });
			hub.plugin.addCoins(score); play(score === N ? "victory" : "chime");
			btn(box.createDiv("mp-dz-links"), { text: "Ulangi kuis", icon: "rotate-ccw", cls: "mp-btn-primary mp-btn-sm", onClick: () => hub.renderPage() });
			return;
		}
		const q = qs[i];
		box.createDiv({ cls: "mp-small mp-muted", text: `Soal ${i + 1}/${N} · skor ${score}` });
		box.createDiv({ cls: "mp-pf-qq", text: "Irama apakah ini?" });
		strip(box.createDiv("mp-ekg-strip"), q, 6);
		const opts = [q, ...RHYTHMS.filter((r) => r.id !== q.id).sort(() => Math.random() - 0.5).slice(0, 3)].sort(() => Math.random() - 0.5);
		const ob = box.createDiv("mp-pf-qopts");
		for (const o of opts) {
			const b = ob.createEl("button", { cls: "mp-pf-qopt mp-ekg-opt", text: o.name });
			b.onclick = () => {
				ob.querySelectorAll("button").forEach((z) => { (z as HTMLButtonElement).disabled = true; if (z.textContent === q.name) z.addClass("is-right"); });
				if (o.id === q.id) { score++; play("correct"); } else { b.addClass("is-wrong"); play("wrong"); }
				box.createDiv({ cls: "mp-small mp-ekg-why", text: `💡 ${q.crit[0]}` });
				i++; window.setTimeout(next, 1700);
			};
		}
	};
	next();
}

const K: Record<string, number | string> = { mode: "kotak", n: 0, rr: 0, qt: 0, hr: 0, sex: "L", I: 0, avf: 0 };
function calc(el: HTMLElement) {
	// frekuensi
	const c1 = el.createDiv("mp-md-card");
	c1.createDiv({ cls: "mp-md-card-h", text: "💓 Frekuensi jantung" });
	const r1 = c1.createDiv("mp-md-row");
	const sw = r1.createDiv("mp-md-field"); sw.createEl("label", { text: "Metode" });
	seg(sw, [["kotak", "Kotak besar"], ["kecil", "Kotak kecil"], ["rr", "Interval RR (ms)"], ["6s", "QRS dalam 6 detik"]], String(K.mode), (v) => { K.mode = v; u1(); }, "mp-md-seg-sm");
	field(r1, "Nilai", (K.n as number) || "", (v) => { K.n = toNum(v); u1(); }, { ph: "mis. 4" });
	const o1 = c1.createDiv("mp-ekg-res");
	const u1 = () => {
		const n = Number(K.n) || 0;
		const hr = !n ? 0 : K.mode === "kotak" ? 300 / n : K.mode === "kecil" ? 1500 / n : K.mode === "rr" ? 60000 / n : n * 10;
		o1.setText(hr ? `≈ ${num(Math.round(hr))} x/menit — ${hr < 60 ? "bradikardia" : hr > 100 ? "takikardia" : "normal"}` : "Isi nilai.");
		if (hr) K.hr = Math.round(hr);
	};
	u1();
	// QTc
	const c2 = el.createDiv("mp-md-card mp-mt");
	c2.createDiv({ cls: "mp-md-card-h", text: "⏱️ QT terkoreksi (QTc)" });
	const r2 = c2.createDiv("mp-md-row");
	field(r2, "QT", (K.qt as number) || "", (v) => { K.qt = toNum(v); u2(); }, { suffix: "ms" });
	field(r2, "Frekuensi", (K.hr as number) || "", (v) => { K.hr = toNum(v); u2(); }, { suffix: "x/mnt" });
	const sx = r2.createDiv("mp-md-field"); sx.createEl("label", { text: "Jenis kelamin" }); seg(sx, [["L", "Pria"], ["P", "Wanita"]], String(K.sex), (v) => { K.sex = v; u2(); }, "mp-md-seg-sm");
	const o2 = c2.createDiv("mp-ekg-res");
	const u2 = () => {
		const qt = Number(K.qt) || 0, hr = Number(K.hr) || 0;
		if (!qt || !hr) { o2.setText("Isi QT dan frekuensi."); return; }
		const rr = 60 / hr;
		const baz = qt / Math.sqrt(rr), fri = qt / Math.cbrt(rr), fra = qt + 154 * (1 - rr);
		const lim = K.sex === "P" ? 470 : 450;
		o2.empty();
		o2.createDiv({ text: `Bazett ${Math.round(baz)} ms · Fridericia ${Math.round(fri)} ms · Framingham ${Math.round(fra)} ms` });
		o2.createDiv({ cls: "mp-small mp-strong", text: fri > 500 ? "QTc > 500 ms: risiko torsades tinggi — hentikan obat pemanjang QT, koreksi K⁺ & Mg²⁺" : fri > lim ? `Memanjang (> ${lim} ms)` : fri < 350 ? "Pendek (< 350 ms) — pertimbangkan hiperkalsemia/sindrom QT pendek" : "Normal" });
		o2.createDiv({ cls: "mp-small mp-muted", text: "Fridericia lebih akurat pada frekuensi tinggi/rendah; Bazett cenderung berlebih pada takikardia." });
	};
	u2();
	// aksis
	const c3 = el.createDiv("mp-md-card mp-mt");
	c3.createDiv({ cls: "mp-md-card-h", text: "🧭 Aksis QRS" });
	c3.createDiv({ cls: "mp-small mp-muted", text: "Masukkan amplitudo netto QRS (tinggi R dikurangi dalam Q/S, dalam mm) di sadapan I dan aVF." });
	const r3 = c3.createDiv("mp-md-row");
	field(r3, "Netto lead I", (K.I as number) || "", (v) => { K.I = toNum(v); u3(); }, { suffix: "mm", ph: "mis. 8 atau -3" });
	field(r3, "Netto aVF", (K.avf as number) || "", (v) => { K.avf = toNum(v); u3(); }, { suffix: "mm" });
	const axWrap = c3.createDiv("mp-ekg-axis");
	const o3 = axWrap.createDiv("mp-ekg-res");
	const dial = axWrap.createDiv("mp-ekg-dial");
	const u3 = () => {
		const I = Number(K.I) || 0, F = Number(K.avf) || 0;
		dial.empty();
		const svg = document.createElementNS(NS, "svg"); svg.setAttribute("viewBox", "-60 -60 120 120"); svg.setAttribute("class", "mp-ekg-dialsvg");
		const sector = (a0: number, a1: number, cls: string) => { const p = document.createElementNS(NS, "path"); const rad = (a: number) => (a * Math.PI) / 180; p.setAttribute("d", `M0 0 L${50 * Math.cos(rad(a0))} ${50 * Math.sin(rad(a0))} A50 50 0 0 1 ${50 * Math.cos(rad(a1))} ${50 * Math.sin(rad(a1))} Z`); p.setAttribute("class", cls); svg.appendChild(p); };
		sector(-30, 90, "mp-ekg-s-norm"); sector(90, 180, "mp-ekg-s-right"); sector(180, 270, "mp-ekg-s-ext"); sector(270, 330, "mp-ekg-s-left");
		for (const [a, t] of [[0, "I 0°"], [90, "aVF +90°"], [180, "±180°"], [-90, "−90°"]] as [number, string][]) { const tx = document.createElementNS(NS, "text"); tx.setAttribute("x", String(56 * Math.cos((a * Math.PI) / 180))); tx.setAttribute("y", String(56 * Math.sin((a * Math.PI) / 180) + 3)); tx.setAttribute("text-anchor", "middle"); tx.setAttribute("class", "mp-ekg-dialt"); tx.textContent = t; svg.appendChild(tx); }
		if (I || F) {
			const ang = (Math.atan2(F, I) * 180) / Math.PI;
			const ln = document.createElementNS(NS, "line"); ln.setAttribute("x1", "0"); ln.setAttribute("y1", "0"); ln.setAttribute("x2", String(46 * Math.cos((ang * Math.PI) / 180))); ln.setAttribute("y2", String(46 * Math.sin((ang * Math.PI) / 180))); ln.setAttribute("class", "mp-ekg-needle"); svg.appendChild(ln);
			const a = Math.round(ang);
			o3.setText(`Aksis ≈ ${a > 0 ? "+" : ""}${a}° — ${a >= -30 && a <= 90 ? "normal (−30° s.d. +90°)" : a > 90 && a <= 180 ? "deviasi aksis kanan (RVH, infark lateral, PPOK, emboli paru, LPFB)" : a < -30 && a >= -90 ? "deviasi aksis kiri (LVH, LAFB, infark inferior, WPW)" : "aksis ekstrem (VT, hiperkalemia berat, salah pasang elektroda)"}`);
		} else o3.setText("Isi amplitudo netto I dan aVF.");
		dial.appendChild(svg);
	};
	u3();
}

// ---------------------------------------------------------------- foto toraks
const CXR: { id: string; name: string; find: string[]; ddx: string[] }[] = [
	{ id: "normal", name: "Normal (PA)", find: ["Trakea di tengah, kedua hemidiafragma tegas & cembung (kanan lebih tinggi)", "Sudut kostofrenikus lancip", "CTR < 0,5; corakan bronkovaskular normal"], ddx: ["—"] },
	{ id: "kardiomegali", name: "Kardiomegali", find: ["CTR > 0,5 pada foto PA (tidak berlaku untuk AP/terlentang)", "Apeks tertanam ke bawah-lateral (pembesaran ventrikel kiri)"], ddx: ["Gagal jantung, kardiomiopati, penyakit katup, efusi perikard (bentuk botol air)"] },
	{ id: "efusi", name: "Efusi pleura kanan", find: ["Perselubungan homogen di basal dengan sudut kostofrenikus tumpul", "Batas atas melengkung (meniskus) ke lateral", "Efusi masif mendorong mediastinum ke sisi kontralateral"], ddx: ["Transudat: gagal jantung, sirosis, nefrotik", "Eksudat: TB, pneumonia (parapneumonik), keganasan"] },
	{ id: "pneumotoraks", name: "Pneumotoraks kiri", find: ["Garis pleura viseral dengan area hiperlusen tanpa corakan paru di perifer", "Tension: mediastinum terdorong ke kanan, diafragma mendatar — diagnosis klinis, jangan menunggu foto!"], ddx: ["Spontan primer (pria muda tinggi kurus), sekunder (PPOK, TB), trauma, iatrogenik"] },
	{ id: "konsolidasi", name: "Konsolidasi lobus kanan bawah", find: ["Perselubungan inhomogen-homogen dengan air bronchogram", "Batas diafragma kanan menghilang (silhouette sign) — lobus bawah; batas jantung kanan hilang — lobus medius"], ddx: ["Pneumonia, aspirasi, TB, kanker paru dengan pneumonia obstruktif"] },
	{ id: "edema", name: "Edema paru kardiogenik", find: ["Kardiomegali, sefalisasi (redistribusi vaskular ke apeks)", "Garis Kerley B, edema interstisial, pola bat-wing perihiler", "Efusi pleura bilateral"], ddx: ["Gagal jantung kiri akut, overload cairan, gagal ginjal"] },
];
const CX = { th: 0, ht: 0 };
function cxr(el: HTMLElement) {
	chipRow(el, CXR.map((c) => ({ id: c.id, label: c.name })), T.cxr, (v) => { T.cxr = v; draw(); }, "mp-cxr-chips");
	const wrap = el.createDiv("mp-cxr-wrap");
	const pic = wrap.createDiv("mp-cxr-pic");
	const info = wrap.createDiv("mp-cxr-info");
	const draw = () => {
		pic.empty(); info.empty();
		const x = CXR.find((c) => c.id === T.cxr) ?? CXR[0];
		const svg = document.createElementNS(NS, "svg"); svg.setAttribute("viewBox", "0 0 300 320"); svg.setAttribute("class", "mp-cxr-svg");
		const add = (tag: string, a: Record<string, string | number>) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, String(v)); svg.appendChild(e); return e; };
		add("rect", { x: 0, y: 0, width: 300, height: 320, fill: "#0b0b0d" });
		// rongga toraks & paru (lusen gelap), iga, mediastinum
		const lungR = "M140 60 C110 50 70 70 52 130 C40 180 42 240 50 268 C80 262 120 258 140 262 Z";
		const lungL = "M160 60 C190 50 230 70 248 130 C260 180 258 240 250 268 C220 262 180 258 160 262 Z";
		add("path", { d: "M40 40 C60 20 240 20 260 40 L272 290 L28 290 Z", fill: "#3f3f46" });
		const pneumo = T.cxr === "pneumotoraks";
		add("path", { d: lungR, fill: "#18181b" });
		add("path", { d: lungL, fill: pneumo ? "#050506" : "#18181b" });
		if (pneumo) add("path", { d: "M164 66 C186 64 214 90 222 140 C228 190 222 236 214 258 L164 262 Z", fill: "#202024", stroke: "#e4e4e7", "stroke-width": 1.2 });
		// corakan vaskular
		if (!pneumo || true) for (const [x1, y1, x2, y2] of [[140, 130, 90, 110], [140, 150, 80, 170], [140, 160, 100, 220], [160, 130, 210, 110], [160, 150, 220, 170], [160, 160, 200, 220]]) { if (pneumo && x1 === 160) continue; add("path", { d: `M${x1} ${y1} L${x2} ${y2}`, stroke: T.cxr === "edema" ? "#a1a1aa" : "#52525b", "stroke-width": T.cxr === "edema" ? 2.4 : 1.3, fill: "none" }); }
		for (let i = 0; i < 8; i++) { add("path", { d: `M150 ${58 + i * 25} C110 ${50 + i * 25} 66 ${70 + i * 25} 46 ${96 + i * 26}`, stroke: "#71717a", "stroke-width": 3, fill: "none", opacity: 0.55 }); add("path", { d: `M150 ${58 + i * 25} C190 ${50 + i * 25} 234 ${70 + i * 25} 254 ${96 + i * 26}`, stroke: "#71717a", "stroke-width": 3, fill: "none", opacity: 0.55 }); }
		add("rect", { x: 143, y: 20, width: 14, height: 70, rx: 5, fill: "#111113" }); // trakea (lusen)
		const big = T.cxr === "kardiomegali" || T.cxr === "edema";
		const heart = big ? "M128 120 C110 130 96 170 92 214 C90 240 108 262 150 266 C200 268 232 250 236 220 C240 180 214 140 176 122 Z" : "M132 124 C120 134 112 170 112 206 C112 236 128 256 154 258 C186 260 206 244 208 218 C210 186 196 148 172 126 Z";
		add("path", { d: "M136 60 L164 60 L170 126 L130 126 Z", fill: "#d4d4d8" }); // mediastinum atas
		add("path", { d: heart, fill: "#d4d4d8" });
		// diafragma
		const dR = "M50 268 C70 238 120 240 150 262", dL = "M150 262 C180 244 230 244 250 268";
		add("path", { d: `${dR} L150 300 L50 300 Z`, fill: "#e4e4e7" });
		add("path", { d: `${dL} L250 300 L150 300 Z`, fill: "#e4e4e7" });
		if (T.cxr === "efusi") add("path", { d: "M46 200 C70 210 110 214 140 222 L140 270 L46 280 Z", fill: "#d4d4d8", opacity: 0.95 });
		if (T.cxr === "konsolidasi") { add("path", { d: "M58 196 C80 186 120 190 136 206 L138 258 C110 254 76 258 54 262 Z", fill: "#a1a1aa", opacity: 0.8 }); add("path", { d: "M120 214 L96 236 M110 206 L84 222", stroke: "#18181b", "stroke-width": 2, fill: "none" }); }
		if (T.cxr === "edema") { for (const y of [230, 238, 246]) { add("path", { d: `M48 ${y} L60 ${y}`, stroke: "#d4d4d8", "stroke-width": 1, fill: "none" }); add("path", { d: `M240 ${y} L252 ${y}`, stroke: "#d4d4d8", "stroke-width": 1, fill: "none" }); } add("ellipse", { cx: 112, cy: 150, rx: 26, ry: 30, fill: "#a1a1aa", opacity: 0.45 }); add("ellipse", { cx: 190, cy: 150, rx: 26, ry: 30, fill: "#a1a1aa", opacity: 0.45 }); }
		// garis CTR
		const hw = big ? [92, 236] : [112, 208];
		add("path", { d: `M${hw[0]} 284 L${hw[1]} 284`, stroke: "#f59e0b", "stroke-width": 2, "stroke-dasharray": "4 3", fill: "none" });
		add("path", { d: "M40 300 L260 300", stroke: "#22d3ee", "stroke-width": 2, "stroke-dasharray": "4 3", fill: "none" });
		const tx = add("text", { x: 150, y: 314, "text-anchor": "middle", fill: "#e4e4e7", "font-size": 10 }); tx.textContent = `CTR ≈ ${num(Math.round(((hw[1] - hw[0]) / 220) * 100) / 100)} (jingga ÷ biru)`;
		const R = add("text", { x: 14, y: 30, fill: "#e4e4e7", "font-size": 13, "font-weight": 700 }); R.textContent = "R";
		pic.appendChild(svg);
		info.createDiv({ cls: "mp-strong", text: x.name });
		mlist(acc(info, "🔍", "Temuan", true, "is-accent"), x.find);
		mlist(acc(info, "🩺", "Pikirkan", true), x.ddx);
	};
	draw();
	const sys = acc(el, "🧭", "Membaca foto toraks secara sistematis (ABCDE)", false);
	mlist(sys, ["Identitas, proyeksi (PA/AP/lateral), inspirasi cukup (≥ 9–10 iga posterior), rotasi (prosesus spinosus di tengah antara ujung medial klavikula), penetrasi (vertebra torakal tampak samar di balik jantung)", "A — Airway: trakea di tengah, karina, bronkus utama", "B — Breathing: lapang paru kanan-kiri (zona atas-tengah-bawah), corakan, perselubungan, lusensi, garis pleura", "C — Cardiac: ukuran jantung (CTR), batas jantung kanan/kiri, mediastinum, hilus", "D — Diaphragm: bentuk, ketinggian, sudut kostofrenikus, udara bebas di bawah diafragma", "E — Everything else: tulang (iga, klavikula, vertebra), jaringan lunak, alat (ETT, CVC, WSD, NGT)"]);
	const c = el.createDiv("mp-md-card mp-mt");
	c.createDiv({ cls: "mp-md-card-h", text: "📏 Kalkulator CTR (cardiothoracic ratio)" });
	const row = c.createDiv("mp-md-row");
	field(row, "Lebar jantung maksimal", CX.ht || "", (v) => { CX.ht = toNum(v); u(); }, { suffix: "cm" });
	field(row, "Lebar toraks internal maksimal", CX.th || "", (v) => { CX.th = toNum(v); u(); }, { suffix: "cm" });
	const o = c.createDiv("mp-ekg-res");
	const u = () => { if (!CX.ht || !CX.th) { o.setText("Ukur pada foto PA: jarak terlebar bayangan jantung kanan + kiri dari garis tengah dibagi lebar toraks dalam terlebar."); return; } const r = CX.ht / CX.th; o.setText(`CTR = ${num(Math.round(r * 100) / 100)} — ${r > 0.5 ? "kardiomegali (bila foto PA, inspirasi cukup)" : "normal (≤ 0,5)"}`); };
	u();
	const cp = c.createEl("button", { cls: "mp-md-rchip is-link", text: "📋 Salin templat ekspertise" });
	cp.onclick = () => copyText("Foto toraks PA: Trakea di tengah. Cor: CTR < 50%, bentuk & letak normal. Pulmo: corakan bronkovaskular normal, tidak tampak infiltrat/perselubungan. Sinus kostofrenikus kanan-kiri lancip. Diafragma kanan-kiri licin. Tulang & jaringan lunak dalam batas normal.\nKesan: Cor dan pulmo dalam batas normal.", "Templat disalin");
}
