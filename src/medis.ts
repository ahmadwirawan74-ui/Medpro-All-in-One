import { App, Modal, Notice, TFile, setIcon } from "obsidian";
import type { HubView } from "./hub-view";
import type FlashcardPlugin from "./main";
import { CATS, DRUGS, Drug, Prep, Reg, SEV_INFO, Sev } from "./med-data";
import {
	DEFAULT_PT, Patient, abw, ageMonths, ageText, amount, apls, bmi, bmiCat, bsa, calc, checkIx, ckdEpi, crcl, gfrStage, holliday,
	ibw, isRate, ixOf, num, patientAlerts, perKgUnit, pick, range, regText, renalOf, schwartz, searchDrugs, signa, SEV_ORDER, RATE,
} from "./med-engine";
import { BNF_EN } from "./med-bnf";
import { DEFAULT_DOC, DocInfo, RxPatient } from "./med-rx";
import { DRUGS2 } from "./med-data2";
import { CLASSES } from "./med-ref";
import { DISEASES } from "./med-dis";
import { openDisease } from "./medis3";
import { classOfDrug, moreTools, openClass } from "./medis2";
import { btn } from "./util";
import { firstSentence, glance, ibtn } from "./med-ui";
import { rxPdfDoc, savePdf } from "./med-pdf";
import { play } from "./sound";

// ================================================================ state
export interface MedState { fav: string[]; recent: string[]; notes: Record<string, string>; custom: Drug[]; pt: Patient; inter: string[]; quiz?: { best: number; played: number; correct: number; total: number; streak: number }; doc?: DocInfo; rxPt?: RxPatient; disFav?: string[]; disRecent?: string[]; pfDone?: Record<string, number>; pfBest?: Record<string, number> }
/** Salin teks ke clipboard dengan cadangan bila izin clipboard ditolak (mis. di Android/WebView). */
export function copyText(txt: string, msg = "Disalin") {
	const fallback = () => {
		const ta = document.body.createEl("textarea");
		ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0";
		ta.select();
		let ok = false;
		try { ok = document.execCommand("copy"); } catch { ok = false; }
		ta.remove();
		new Notice(ok ? msg : "Gagal menyalin — blok teks lalu salin manual.");
	};
	try {
		if (!navigator.clipboard?.writeText) return fallback();
		navigator.clipboard.writeText(txt).then(() => new Notice(msg), fallback);
	} catch { fallback(); }
}

export function med(p: FlashcardPlugin): MedState {
	const d = p.data;
	d.med ??= { fav: [], recent: [], notes: {}, custom: [], pt: { ...DEFAULT_PT }, inter: [] };
	const m = d.med;
	m.fav ??= []; m.recent ??= []; m.notes ??= {}; m.custom ??= []; m.inter ??= []; m.quiz ??= { best: 0, played: 0, correct: 0, total: 0, streak: 0 }; m.doc ??= { ...DEFAULT_DOC }; m.rxPt ??= { name: "", age: "", w: "", addr: "", type: "dewasa" }; m.disFav ??= [];
	// Lengkapi kunci yang hilang TANPA mengganti objek (objek pt dipegang oleh halaman yang sedang tampil;
	// mengganti objeknya membuat perubahan seperti pilihan Anak/Dewasa hilang).
	if (!m.pt) m.pt = { ...DEFAULT_PT };
	else if (m.pt.wAuto === undefined) m.pt.wAuto = false;
	if (m.pt) for (const k of Object.keys(DEFAULT_PT) as (keyof Patient)[]) if (m.pt[k] === undefined) (m.pt as unknown as Record<string, unknown>)[k] = DEFAULT_PT[k];
	return m;
}
export const allDrugs = (p: FlashcardPlugin): Drug[] => [...DRUGS, ...med(p).custom.map((d) => ({ ...d, custom: true }))];
export const drugById = (p: FlashcardPlugin, id: string) => allDrugs(p).find((d) => d.id === id);
export const catOf = (id: string) => CATS.find((c) => c.id === id) ?? { id, name: "Lainnya", icon: "💊", color: "#64748b" };

let q = "";
let cat = "all";
let favOnly = false;
let flt = "";
const NEW_IDS = new Set(DRUGS2.map((d) => d.id));
const FILTERS: [string, string, (d: Drug) => boolean][] = [
	["anak", "🧒 Ada dosis anak", (d) => d.regs.some((r) => r.who === "anak" && r.kind !== "text")],
	["inj", "💉 Injeksi/infus", (d) => d.regs.some((r) => /IV|IM|IO|SC/.test(r.route))],
	["ginjal", "🫘 Sesuaikan ginjal", (d) => !!d.renal],
	["hamil", "🤰 Hindari saat hamil", (d) => /kontraindikasi|hindari/i.test(d.preg)],
	["edu", "🗣️ Ada edukasi pasien", (d) => !!d.edu?.length],
	["baru", "🆕 Baru v19", (d) => NEW_IDS.has(d.id)],
	["pribadi", "✍️ Obat pribadi", (d) => !!d.custom],
];
let openId: string | null = null;
let tab: "ring" | "dosis" | "aman" | "ix" | "note" = "ring";
const C = { drug: "paracetamol", reg: -1, prep: 0, t: 0.5, conc: 0, sel: false };

/** Buka halaman detail obat (dipakai juga oleh Cari menu). */
export function openDrug(hub: HubView, id: string) {
	openId = id;
	tab = "ring";
	const m = med(hub.plugin);
	m.recent = [id, ...m.recent.filter((x) => x !== id)].slice(0, 8);
	hub.plugin.requestSave();
	if (hub.page === "medobat") hub.renderPage(); else hub.navigate("medobat");
}
export function calcDrug(hub: HubView, id: string, regIdx = -1) {
	C.drug = id; C.reg = regIdx; C.prep = -2; C.t = 0.5; C.conc = 0;
	hub.navigate("medcalc");
}

// ================================================================ bagian umum
export function hero(el: HTMLElement, title: string, sub: string, emoji: string, extra?: (h: HTMLElement) => void) {
	const h = el.createDiv("mp-md-hero");
	const bg = h.createDiv("mp-md-hero-bg");
	for (let i = 0; i < 7; i++) { const c = bg.createSpan("mp-md-float"); c.setText(["💊", "🩺", "💉", "🧪", "🫀", "🧬", "🩹"][i]); c.style.left = `${8 + i * 13}%`; c.style.animationDelay = `${-i * 1.7}s`; }
	const ecg = h.createDiv("mp-md-ecg");
	const svgNS = "http://www.w3.org/2000/svg";
	const svg = document.createElementNS(svgNS, "svg");
	svg.setAttribute("viewBox", "0 0 600 60");
	svg.setAttribute("preserveAspectRatio", "none");
	const path = document.createElementNS(svgNS, "path");
	path.setAttribute("d", "M0 30 H120 L135 30 L145 12 L155 48 L165 6 L178 54 L188 30 H330 L345 30 L355 12 L365 48 L375 6 L388 54 L398 30 H600");
	svg.appendChild(path);
	ecg.appendChild(svg);
	const t = h.createDiv("mp-md-hero-in");
	t.createDiv({ cls: "mp-md-hero-ic", text: emoji });
	const tt = t.createDiv("mp-grow");
	tt.createEl("h1", { text: title });
	tt.createDiv({ cls: "mp-md-hero-sub", text: sub });
	extra?.(t);
	return h;
}
export function disclaimer(el: HTMLElement) {
	const d = el.createDiv("mp-md-disc");
	d.createSpan({ text: "⚕️" });
	d.createSpan({ text: "Alat bantu referensi klinis, bukan pengganti penilaian dokter. Data disusun dari referensi standar (BNF 85, WHO Model Formulary, PALS/ACLS AHA, pedoman Kemenkes/PNPK/IDAI; interaksi bertanda “BNF 85” berasal dari Lampiran 1 BNF yang dituliskan ulang) untuk fungsi ginjal & hati normal. Selalu cocokkan dengan pedoman terkini, label produk, dan kondisi pasien." });
}
export function section(el: HTMLElement, icon: string, title: string, cls = "") {
	const s = el.createDiv("mp-md-card " + cls);
	const h = s.createDiv("mp-md-card-h");
	h.createSpan({ cls: "mp-md-card-ic", text: icon });
	h.createSpan({ cls: "mp-md-card-t", text: title });
	return s;
}
export function list(el: HTMLElement, items: string[], cls = "") { const u = el.createEl("ul", { cls: "mp-md-list " + cls }); for (const i of items) u.createEl("li", { text: i }); return u; }
export function field(parent: HTMLElement, label: string, value: number | string, onIn: (v: string) => void, o: { type?: string; step?: string; suffix?: string; w?: string; ph?: string } = {}) {
	const f = parent.createDiv("mp-md-field");
	f.createEl("label", { text: label });
	const box = f.createDiv("mp-md-inbox");
	const inp = box.createEl("input", { type: o.type ?? "number", cls: "mp-md-in", attr: { step: o.step ?? "any", placeholder: o.ph ?? "" } });
	if (o.w) inp.style.width = o.w;
	inp.value = value === 0 || value === "" ? "" : String(value);
	inp.oninput = () => onIn(inp.value);
	if (o.suffix) box.createSpan({ cls: "mp-md-suf", text: o.suffix });
	return inp;
}
export const toNum = (v: string) => { const n = parseFloat(v.replace(",", ".")); return isFinite(n) ? n : 0; };
export function seg<T extends string>(parent: HTMLElement, opts: [T, string][], cur: T, on: (v: T) => void, cls = "") {
	const s = parent.createDiv("mp-md-seg " + cls);
	const idx = Math.max(0, opts.findIndex((o) => o[0] === cur));
	s.style.setProperty("--n", String(opts.length));
	s.style.setProperty("--i", String(idx));
	s.createDiv("mp-md-seg-pill");
	opts.forEach(([v, l], i) => { const b = s.createEl("button", { cls: "mp-md-seg-b" + (i === idx ? " is-on" : ""), text: l }); b.onclick = () => { s.style.setProperty("--i", String(i)); on(v); }; });
	return s;
}

/** Pemilih obat dengan pencarian & saran. */
export function drugPicker(parent: HTMLElement, p: FlashcardPlugin, onPick: (d: Drug) => void, ph = "Cari obat… (nama, alias, golongan, indikasi)") {
	const wrap = parent.createDiv("mp-md-pick");
	const box = wrap.createDiv("mp-md-search");
	setIcon(box.createSpan("mp-md-search-ic"), "search");
	const inp = box.createEl("input", { type: "text", cls: "mp-md-search-in", attr: { placeholder: ph } });
	const sug = wrap.createDiv("mp-md-sug");
	let sel = 0, items: Drug[] = [];
	const draw = () => {
		sug.empty();
		const v = inp.value.trim();
		if (!v) { sug.removeClass("is-open"); return; }
		items = searchDrugs(v, allDrugs(p)).slice(0, 8);
		sel = Math.min(sel, Math.max(0, items.length - 1));
		sug.toggleClass("is-open", items.length > 0);
		items.forEach((d, i) => {
			const r = sug.createDiv("mp-md-sug-row" + (i === sel ? " is-sel" : ""));
			r.createSpan({ cls: "mp-md-sug-ic", text: catOf(d.cat).icon });
			const t = r.createDiv("mp-grow");
			t.createDiv({ cls: "mp-strong", text: d.name });
			t.createDiv({ cls: "mp-small mp-muted", text: d.cls });
			r.onmousedown = (e) => { e.preventDefault(); go(i); };
		});
	};
	const go = (i: number) => { const d = items[i]; if (!d) return; inp.value = ""; draw(); onPick(d); };
	inp.oninput = () => { sel = 0; draw(); };
	inp.onkeydown = (e) => {
		if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(items.length - 1, sel + 1); draw(); }
		else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(0, sel - 1); draw(); }
		else if (e.key === "Enter") { e.preventDefault(); go(sel); }
		else if (e.key === "Escape") { inp.value = ""; draw(); }
	};
	inp.onblur = () => window.setTimeout(() => sug.removeClass("is-open"), 120);
	return inp;
}

// ================================================================ 1. DATABASE OBAT
export function renderMedDrugs(hub: HubView, el: HTMLElement) {
	const p = hub.plugin;
	const m = med(p);
	if (openId) { const d = drugById(p, openId); if (d) return renderDetail(hub, el, d); openId = null; }
	const all = allDrugs(p);
	const head = el.createDiv("mp-mx-pagehead");
	const ht = head.createDiv("mp-grow");
	ht.createEl("h2", { text: "💊 Obat" });
	ht.createDiv({ cls: "mp-small mp-muted", text: `${all.length} obat · ${all.reduce((a, d) => a + d.regs.length, 0)} regimen dosis · ${CLASSES.length} golongan` });
	ibtn(head, "shuffle", "Acak", () => openDrug(hub, all[Math.floor(Math.random() * all.length)].id));
	ibtn(head, "calculator", "Kalkulator", () => hub.navigate("medcalc"));
	ibtn(head, "zap", m.inter.length ? `Interaksi (${m.inter.length})` : "Interaksi", () => hub.navigate("medinter"));
	// pencarian
	const bar = el.createDiv("mp-md-bar");
	const box = bar.createDiv("mp-md-search mp-grow");
	setIcon(box.createSpan("mp-md-search-ic"), "search");
	const inp = box.createEl("input", { type: "text", cls: "mp-md-search-in", attr: { placeholder: "Cari nama obat, merek generik, golongan, atau indikasi… (mis. “demam”, “OAINS”, “tifoid”)" } });
	inp.value = q;
	const fav = bar.createEl("button", { cls: "mp-md-favtog" + (favOnly ? " is-on" : ""), text: `⭐ Favorit (${m.fav.length})` });
	fav.onclick = () => { favOnly = !favOnly; fav.toggleClass("is-on", favOnly); draw(); };
	btn(bar, { text: "Obat sendiri", icon: "plus", cls: "mp-btn-sm", onClick: () => new CustomDrugModal(hub.app, p, null, () => hub.renderPage()).open() });

	const chips = el.createDiv("mp-md-chips");
	const chip = (id: string, label: string, icon: string, color: string) => {
		const n = id === "all" ? all.length : all.filter((d) => d.cat === id).length;
		const c = chips.createEl("button", { cls: "mp-md-chip" + (cat === id ? " is-on" : "") });
		c.style.setProperty("--c", color);
		c.createSpan({ text: `${icon} ${label}` });
		c.createSpan({ cls: "mp-md-chip-n", text: String(n) });
		c.onclick = () => { cat = id; chips.querySelectorAll(".mp-md-chip").forEach((x) => x.removeClass("is-on")); c.addClass("is-on"); draw(); };
	};
	chip("all", "Semua", "✨", "#0d9488");
	for (const c of CATS) chip(c.id, c.name, c.icon, c.color);
	const fl = el.createDiv("mp-md-filters");
	fl.createSpan({ cls: "mp-small mp-muted", text: "Saring:" });
	for (const [id, label] of FILTERS) {
		const b = fl.createEl("button", { cls: "mp-md-fchip" + (flt === id ? " is-on" : ""), text: label });
		b.onclick = () => { flt = flt === id ? "" : id; fl.querySelectorAll(".mp-md-fchip").forEach((x) => x.removeClass("is-on")); if (flt) b.addClass("is-on"); draw(); };
	}

	if (m.recent.length && !q) {
		const rc = el.createDiv("mp-md-recent");
		rc.createSpan({ cls: "mp-small mp-muted", text: "Terakhir dibuka:" });
		for (const id of m.recent) { const d = drugById(p, id); if (!d) continue; const b = rc.createEl("button", { cls: "mp-md-rchip", text: `${catOf(d.cat).icon} ${d.name}` }); b.onclick = () => openDrug(hub, id); }
	}
	const grid = el.createDiv("mp-md-grid");
	const draw = () => {
		grid.empty();
		let ds = searchDrugs(q, all);
		if (cat !== "all") ds = ds.filter((d) => d.cat === cat);
		if (favOnly) ds = ds.filter((d) => m.fav.includes(d.id));
		const ff = FILTERS.find((f) => f[0] === flt);
		if (ff) ds = ds.filter(ff[2]);
		if (!q) ds = [...ds].sort((a, b) => CATS.findIndex((c) => c.id === a.cat) - CATS.findIndex((c) => c.id === b.cat) || a.name.localeCompare(b.name));
		if (!ds.length) { grid.createDiv({ cls: "mp-md-empty", text: "Tidak ada obat yang cocok. Coba kata lain, atau tambahkan sebagai obat sendiri." }); return; }
		ds.forEach((d, i) => {
			const c = catOf(d.cat);
			const card = grid.createEl("button", { cls: "mp-md-dcard" });
			card.style.setProperty("--c", c.color);
			card.style.animationDelay = `${Math.min(i, 24) * 0.025}s`;
			const top = card.createDiv("mp-md-dcard-top");
			top.createSpan({ cls: "mp-md-dcard-ic", text: c.icon });
			if (m.fav.includes(d.id)) top.createSpan({ cls: "mp-md-dcard-star", text: "⭐" });
			if (d.custom) top.createSpan({ cls: "mp-md-badge", text: "Pribadi" });
			else if (NEW_IDS.has(d.id)) top.createSpan({ cls: "mp-md-badge is-new", text: "Baru" });
			card.createDiv({ cls: "mp-md-dcard-name", text: d.name });
			card.createDiv({ cls: "mp-md-dcard-cls", text: d.cls });
			card.createDiv({ cls: "mp-md-dcard-ind", text: d.ind.slice(0, 2).join(" · ") });
			const tags = card.createDiv("mp-md-dcard-tags");
			if (d.regs.some((r) => r.who === "dewasa")) tags.createSpan({ cls: "mp-md-mini", text: "Dewasa" });
			if (d.regs.some((r) => r.who === "anak")) tags.createSpan({ cls: "mp-md-mini is-kid", text: "Anak" });
			if (d.regs.some((r) => /IV|IM|IO|SC/.test(r.route))) tags.createSpan({ cls: "mp-md-mini is-inj", text: "Injeksi" });
			if (/kontraindikasi/i.test(d.preg)) tags.createSpan({ cls: "mp-md-mini is-bad", text: "Hamil ✕" });
			card.onclick = () => openDrug(hub, d.id);
		});
	};
	inp.oninput = () => { q = inp.value; draw(); };
	draw();
	disclaimer(el);
	if (q) window.setTimeout(() => { inp.focus(); inp.setSelectionRange(q.length, q.length); }, 20);
}

function renderDetail(hub: HubView, el: HTMLElement, d: Drug) {
	const p = hub.plugin;
	const m = med(p);
	const c = catOf(d.cat);
	const head = el.createDiv("mp-md-dhead");
	head.style.setProperty("--c", c.color);
	const top = head.createDiv("mp-md-dhead-top");
	btn(top, { icon: "arrow-left", text: "Database", cls: "mp-btn-ghost mp-btn-sm", onClick: () => { openId = null; hub.renderPage(); } });
	top.createDiv("mp-grow");
	const isFav = m.fav.includes(d.id);
	btn(top, { text: isFav ? "⭐ Favorit" : "☆ Favoritkan", cls: "mp-btn-sm" + (isFav ? " mp-md-isfav" : ""), onClick: () => { m.fav = isFav ? m.fav.filter((x) => x !== d.id) : [...m.fav, d.id]; p.requestSave(); play("click"); hub.renderPage(); } });
	const main = head.createDiv("mp-md-dhead-main");
	const pill = main.createDiv("mp-md-pill");
	pill.createSpan({ text: c.icon });
	const info = main.createDiv("mp-grow");
	info.createDiv({ cls: "mp-md-dhead-cat", text: c.name });
	info.createEl("h1", { text: d.name });
	if (BNF_EN[d.id]) info.createDiv({ cls: "mp-md-dhead-en", text: `🌐 ${BNF_EN[d.id]}` });
	if (d.alias?.length) info.createDiv({ cls: "mp-md-dhead-alias", text: `Nama lain: ${d.alias.join(", ")}` });
	const clsRow = info.createDiv({ cls: "mp-md-dhead-cls", text: d.cls });
	const gk = classOfDrug(d);
	if (gk) { const lk = clsRow.createEl("button", { cls: "mp-md-clslink", text: `${gk.icon} Golongan ${gk.name}` }); lk.onclick = () => openClass(hub, gk.id); }
	const acts = head.createDiv("mp-md-dhead-acts");
	btn(acts, { text: "Hitung dosis", icon: "calculator", cls: "mp-btn-primary", onClick: () => calcDrug(hub, d.id) });
	const inList = m.inter.includes(d.id);
	btn(acts, { text: inList ? "Ada di cek interaksi" : "Tambah ke cek interaksi", icon: "zap", onClick: () => { if (!inList) { m.inter.push(d.id); p.requestSave(); new Notice(`${d.name} ditambahkan ke daftar interaksi`); } hub.navigate("medinter"); } });
	btn(acts, { text: "Buat flashcard", icon: "layers", onClick: () => void makeFlashcards(p, d) });
	if (d.custom) {
		btn(acts, { text: "Edit", icon: "pencil", onClick: () => new CustomDrugModal(hub.app, p, d, () => hub.renderPage()).open() });
		btn(acts, { text: "Hapus", icon: "trash", cls: "mp-btn-danger", onClick: () => { m.custom = m.custom.filter((x) => x.id !== d.id); openId = null; p.requestSave(); hub.renderPage(); } });
	}
	const preps = head.createDiv("mp-md-preps");
	for (const pr of d.preps) preps.createSpan({ cls: "mp-md-prep", text: prepIcon(pr) + " " + pr.label });
	const rA = d.regs.find((r) => r.who === "dewasa"), rK = d.regs.find((r) => r.who === "anak");
	glance(el, [
		{ icon: "🎯", label: "Indikasi utama", text: d.ind.slice(0, 2).join(" • ") },
		{ icon: "🧑", label: "Dosis dewasa", text: rA ? `${rA.label}: ${regText(rA)}` : "" },
		{ icon: "🧒", label: "Dosis anak", text: rK ? `${rK.label}: ${regText(rK)}` : "Tidak ada regimen anak di database" },
		{ icon: "🤰", label: "Kehamilan", text: firstSentence(d.preg, 120), tone: /kontraindikasi|hindari/i.test(d.preg) ? "is-red" : "" },
		{ icon: "⛔", label: "Kontraindikasi", text: d.ci.slice(0, 2).join(" • "), tone: "is-red" },
	]);

	const tabs = el.createDiv("mp-md-tabs");
	const ixAll = ixOf(d, allDrugs(p));
	const nMinor = ixAll.filter((x) => x.rule.sev === "minor").length;
	const nIx = ixAll.length - nMinor;
	const T: [typeof tab, string][] = [["ring", "📋 Ringkasan"], ["dosis", "💊 Dosis"], ["aman", "🛡️ Keamanan"], ["ix", `⚡ Interaksi (${nIx}${nMinor ? ` +${nMinor}` : ""})`], ["note", "📝 Catatan"]];
	const body = el.createDiv("mp-md-tabbody");
	const drawTab = () => {
		tabs.querySelectorAll(".mp-md-tab").forEach((x, i) => x.toggleClass("is-on", T[i][0] === tab));
		body.empty();
		body.removeClass("is-in"); void body.offsetWidth; body.addClass("is-in");
		if (tab === "ring") tabRingkasan(body, d, hub);
		else if (tab === "dosis") tabDosis(hub, body, d);
		else if (tab === "aman") tabAman(body, d);
		else if (tab === "ix") tabIx(hub, body, d);
		else tabNote(p, body, d);
	};
	for (const [k, l] of T) { const b = tabs.createEl("button", { cls: "mp-md-tab", text: l }); b.onclick = () => { tab = k; drawTab(); }; }
	drawTab();
	disclaimer(el);
}
const prepIcon = (p: Prep) => ({ tab: "💊", kap: "💊", syr: "🧴", drop: "💧", inj: "💉", neb: "🌫️", inf: "🩸", supp: "🔻", lain: "📦" } as const)[p.form];

function tabRingkasan(el: HTMLElement, d: Drug, hub: HubView) {
	const g = el.createDiv("mp-md-two");
	list(section(g, "🎯", "Indikasi"), d.ind);
	const how = section(g, "🧭", "Cara penggunaan");
	how.createDiv({ cls: "mp-md-p", text: d.how });
	if (d.mech) section(g, "⚙️", "Mekanisme kerja").createDiv({ cls: "mp-md-p", text: d.mech });
	if (d.monitor) section(g, "📈", "Pemantauan").createDiv({ cls: "mp-md-p", text: d.monitor });
	if (d.antidote) section(g, "🧯", "Antidot / tata laksana toksisitas", "is-teal").createDiv({ cls: "mp-md-p", text: d.antidote });
	if (d.tips?.length) list(section(g, "💡", "Tips klinis", "is-amber"), d.tips);
	if (d.edu?.length) list(section(g, "🗣️", "Edukasi pasien", "is-teal"), d.edu);
	const dz = DISEASES.filter((x) => x.drugs.includes(d.id) || x.rx.some((r) => r.items.some((i) => i.d === d.id)));
	if (dz.length) {
		const s2 = section(g, "🩺", "Dipakai pada penyakit");
		const w = s2.createDiv("mp-dz-links");
		for (const x of dz) { const b = w.createEl("button", { cls: "mp-md-rchip is-link", text: x.name }); b.onclick = () => openDisease(hub, x.id, "tx"); }
	}
	const ci = section(g, "⛔", "Kontraindikasi (ringkas)", "is-red");
	list(ci, d.ci.slice(0, 4));
}
function tabDosis(hub: HubView, el: HTMLElement, d: Drug) {
	const g = el.createDiv("mp-md-two");
	for (const who of ["dewasa", "anak"] as const) {
		const col = g.createDiv("mp-md-dcol");
		col.createDiv({ cls: "mp-md-dcol-h", text: who === "dewasa" ? "🧑 Dewasa" : "🧒 Anak" });
		const regs = d.regs.map((r, i) => [r, i] as const).filter(([r]) => r.who === who);
		if (!regs.length) col.createDiv({ cls: "mp-md-empty", text: who === "anak" ? "Tidak ada regimen anak di database." : "Tidak ada regimen dewasa di database." });
		regs.forEach(([r, i], k) => {
			const c = col.createDiv("mp-md-reg");
			c.style.animationDelay = `${k * 0.05}s`;
			const h = c.createDiv("mp-md-reg-h");
			h.createSpan({ cls: "mp-strong", text: r.label });
			h.createSpan({ cls: "mp-md-route", text: r.route });
			c.createDiv({ cls: "mp-md-reg-dose", text: regText(r) });
			if (r.dur) c.createDiv({ cls: "mp-small", text: `⏱️ ${r.dur}` });
			if (r.minAge) c.createDiv({ cls: "mp-small mp-muted", text: `Usia minimal: ${ageText(r.minAge)}` });
			if (r.note) c.createDiv({ cls: "mp-md-reg-note", text: r.note });
			if (r.kind !== "text") btn(c, { text: "Hitung untuk pasien", icon: "calculator", cls: "mp-btn-sm mp-md-reg-go", onClick: () => calcDrug(hub, d.id, i) });
		});
	}
	if (d.renal || d.hepar) {
		const g2 = el.createDiv("mp-md-two mp-mt");
		if (d.renal) section(g2, "🫘", "Penyesuaian ginjal").createDiv({ cls: "mp-md-p", text: d.renal });
		if (d.hepar) section(g2, "🫀", "Penyesuaian hati").createDiv({ cls: "mp-md-p", text: d.hepar });
	}
}
function tabAman(el: HTMLElement, d: Drug) {
	const g = el.createDiv("mp-md-two");
	list(section(g, "⛔", "Kontraindikasi", "is-red"), d.ci);
	list(section(g, "⚠️", "Peringatan & perhatian", "is-amber"), d.warn);
	const se = section(g, "🤒", "Efek samping");
	const ch = se.createDiv("mp-md-sechips");
	for (const s of d.se) ch.createSpan({ cls: "mp-md-sechip", text: s });
	const pr = section(g, "🤰", "Kehamilan & menyusui", "is-pink");
	pr.createDiv({ cls: "mp-md-kv" }).append(kv("Kehamilan", d.preg), kv("Menyusui", d.lact));
	const rh = section(g, "🧫", "Ginjal & hati");
	rh.createDiv({ cls: "mp-md-kv" }).append(kv("Ginjal", d.renal ?? "Tidak ada penyesuaian khusus di database."), kv("Hati", d.hepar ?? "Tidak ada penyesuaian khusus di database."));
}
function kv(k: string, v: string) { const r = document.createElement("div"); r.className = "mp-md-kvrow"; const a = document.createElement("b"); a.textContent = k; const b = document.createElement("span"); b.textContent = v; r.append(a, b); return r; }
function tabIx(hub: HubView, el: HTMLElement, d: Drug) {
	const ix = ixOf(d, allDrugs(hub.plugin));
	if (!ix.length) { el.createDiv({ cls: "mp-md-empty", text: "Tidak ada interaksi bermakna dengan obat lain di database." }); return; }
	const sum = el.createDiv("mp-md-sevsum");
	for (const s of Object.keys(SEV_INFO) as Sev[]) {
		const n = ix.filter((x) => x.rule.sev === s).length;
		if (!n) continue;
		const t = sum.createDiv("mp-md-sevtile");
		t.style.setProperty("--c", SEV_INFO[s].color);
		t.createDiv({ cls: "mp-md-sevtile-n", text: String(n) });
		t.createDiv({ cls: "mp-small", text: SEV_INFO[s].label });
	}
	const minor = ix.filter((x) => x.rule.sev === "minor");
	const main = ix.filter((x) => x.rule.sev !== "minor");
	let host: HTMLElement = el;
	if (!main.length) el.createDiv({ cls: "mp-md-empty", text: "Tidak ada interaksi mayor/moderat di database." });
	for (const { other, rule } of [...main, ...minor]) {
		if (rule.sev === "minor" && host === el) {
			const det = el.createEl("details", { cls: "mp-md-det mp-mt" });
			det.createEl("summary", { text: `🔵 Interaksi minor (${minor.length}) — umumnya cukup dipantau` });
			host = det;
		}
		const r = host.createDiv("mp-md-ixrow");
		r.style.setProperty("--c", SEV_INFO[rule.sev].color);
		const h = r.createDiv("mp-md-ixrow-h");
		h.createSpan({ cls: "mp-md-sevb", text: `${SEV_INFO[rule.sev].icon} ${SEV_INFO[rule.sev].label}` });
		const a = h.createEl("button", { cls: "mp-md-link", text: other.name });
		if (rule.src) h.createSpan({ cls: "mp-md-src", text: rule.src });
		a.onclick = () => openDrug(hub, other.id);
		r.createDiv({ cls: "mp-md-p", text: rule.eff });
		r.createDiv({ cls: "mp-small mp-md-act", text: `➜ ${rule.act}` });
	}
}
function tabNote(p: FlashcardPlugin, el: HTMLElement, d: Drug) {
	const m = med(p);
	const s = section(el, "📝", "Catatan pribadi (disimpan di perangkat ini)");
	s.createDiv({ cls: "mp-small mp-muted", text: "Misalnya protokol rumah sakit, merek & harga di apotek setempat, atau pengalaman klinis." });
	const ta = s.createEl("textarea", { cls: "mp-md-note" });
	ta.value = m.notes[d.id] ?? "";
	let t = 0;
	ta.oninput = () => { window.clearTimeout(t); t = window.setTimeout(() => { if (ta.value.trim()) m.notes[d.id] = ta.value; else delete m.notes[d.id]; p.requestSave(); }, 400); };
}

async function makeFlashcards(p: FlashcardPlugin, d: Drug) {
	const safe = d.name.replace(/[\\/:*?"<>|#^[\]()]/g, "").replace(/\s+/g, " ").trim();
	const path = `Medis/Obat/${safe}.md`;
	if (p.app.vault.getAbstractFileByPath(path) instanceof TFile) { new Notice(`Catatan ${safe} sudah ada. Membukanya…`); void p.openAt(path, 0); return; }
	const clean = (s: string) => s.replace(/::/g, ":").replace(/\{\{|\}\}/g, "");
	const L: string[] = [`> Dibuat dari bagian Medis · ${d.cls}`, "", "## Identitas", `Golongan ${d.name} :: ${clean(d.cls)}`, "", `Indikasi utama ${d.name}`, "?", ...d.ind.map((x) => `- ${clean(x)}`), ""];
	if (d.mech) L.push(`Mekanisme kerja ${d.name} :: ${clean(d.mech)}`, "");
	L.push("## Dosis");
	for (const r of d.regs) L.push(`Dosis ${r.who} ${d.name} — ${clean(r.label)} (${clean(r.route)}) :: ${clean(regText(r))}`);
	L.push("", "## Keamanan", `Kontraindikasi ${d.name}`, "?", ...d.ci.map((x) => `- ${clean(x)}`), "", `Efek samping ${d.name}`, "?", ...d.se.map((x) => `- ${clean(x)}`), "");
	L.push(`${d.name} pada kehamilan :: ${clean(d.preg)}`);
	if (d.renal) L.push(`Penyesuaian ginjal ${d.name} :: ${clean(d.renal)}`);
	if (d.antidote) L.push(`Antidot ${d.name} :: ${clean(d.antidote)}`);
	if (d.edu?.length) L.push("", `Edukasi pasien ${d.name}`, "?", ...d.edu.map((x) => `- ${clean(x)}`));
	if (BNF_EN[d.id]) L.push(`Nama internasional ${d.name} :: ${clean(BNF_EN[d.id])}`);
	const ix = ixOf(d).filter((x) => x.rule.sev === "kontra" || x.rule.sev === "mayor").slice(0, 6);
	if (ix.length) L.push("", "## Interaksi penting", ...ix.map((x) => `${d.name} + ${x.other.name} :: ${clean(x.rule.eff)} ${clean(x.rule.act)}`));
	const f = await p.appendToNote(path, L.join("\n"));
	if (f) { new Notice(`🃏 Flashcard ${d.name} dibuat di ${path}`); play("chime"); void p.openAt(f.path, 0); }
}

// ================================================================ 2. KALKULATOR DOSIS
export function renderMedCalc(hub: HubView, el: HTMLElement) {
	const p = hub.plugin;
	const m = med(p);
	const pt = m.pt;
	hero(el, "Kalkulator Dosis", "Berdasarkan berat, usia, dan fungsi ginjal pasien: dosis per kali, volume sediaan, jumlah tablet, batas maksimal, dan resep siap salin.", "🧮");
	const grid = el.createDiv("mp-md-calc");
	const left = grid.createDiv("mp-md-calc-l");
	const right = grid.createDiv("mp-md-calc-r");
	const save = () => p.requestSave();

	// ---- pasien
	const pc = left.createDiv("mp-md-card mp-md-ptcard");
	const ph = pc.createDiv("mp-md-card-h");
	ph.createSpan({ cls: "mp-md-card-ic", text: pt.type === "anak" ? "🧒" : "🧑" });
	ph.createSpan({ cls: "mp-md-card-t", text: "Data pasien" });
	seg(pc, [["anak", "🧒 Anak"], ["dewasa", "🧑 Dewasa"]], pt.type, (v) => {
		if (pt.type === v) return;
		pt.type = v;
		if (v === "dewasa") {
			if (pt.ageY < 18) pt.ageY = 30;
			pt.ageM = 0;
			if (pt.wAuto || pt.w < 30) { pt.w = 60; pt.wAuto = false; }
		} else {
			if (pt.ageY >= 18) { pt.ageY = 4; pt.ageM = 0; }
			pt.wAuto = true;
			autoW();
		}
		C.reg = -1; save(); window.setTimeout(() => hub.renderPage(), 220);
	}, "mp-md-ptseg");
	const f1 = pc.createDiv("mp-md-row");
	const wIn = field(f1, "Berat badan", pt.w, (v) => { pt.w = toNum(v); pt.wAuto = false; wHint(); save(); derived(); drawRes(); }, { suffix: "kg" });
	/** Anak: BB otomatis diperkirakan dari usia selama belum diisi manual. */
	const autoW = () => {
		if (pt.type !== "anak" || !pt.wAuto) return;
		const w = apls(ageMonths(pt));
		if (!isFinite(w)) return;
		pt.w = Math.round(w * 10) / 10;
		if (wIn) wIn.value = String(pt.w);
		wHint();
	};
	const onAge = () => { autoW(); save(); derived(); drawRes(); };
	field(f1, "Usia", pt.ageY, (v) => { pt.ageY = toNum(v); onAge(); }, { suffix: "th" });
	if (pt.type === "anak") field(f1, " ", pt.ageM, (v) => { pt.ageM = toNum(v); onAge(); }, { suffix: "bl" });
	const wNote = pc.createDiv("mp-md-wnote");
	const wHint = () => {
		wNote.empty();
		if (pt.type !== "anak") return;
		if (pt.wAuto) wNote.setText(`⚖️ BB ${num(pt.w)} kg = perkiraan dari usia (APLS${ageMonths(pt) > 144 ? ", kasar untuk > 12 th" : ""}). Ketik BB hasil timbang untuk mengganti.`);
		else { wNote.setText("⚖️ BB diisi manual. "); const a = wNote.createEl("a", { text: "Pakai perkiraan dari usia", href: "#" }); a.onclick = (e) => { e.preventDefault(); pt.wAuto = true; autoW(); save(); derived(); drawRes(); }; }
	};
	wHint();
	const f2 = pc.createDiv("mp-md-row");
	field(f2, "Tinggi", pt.h, (v) => { pt.h = toNum(v); save(); derived(); drawRes(); }, { suffix: "cm" });
	field(f2, "Kreatinin", pt.scr, (v) => { pt.scr = toNum(v); save(); derived(); drawRes(); }, { suffix: "mg/dL" });
	const f3 = pc.createDiv("mp-md-row mp-md-row-c");
	seg(f3, [["L", "♂ L"], ["P", "♀ P"]], pt.sex, (v) => { pt.sex = v; save(); derived(); drawRes(); }, "mp-md-seg-sm");
	if (pt.type === "dewasa") {
		const tg = (k: "preg" | "lact", l: string) => { const b = f3.createEl("button", { cls: "mp-md-tog" + (pt[k] ? " is-on" : ""), text: l }); b.onclick = () => { pt[k] = !pt[k]; b.toggleClass("is-on", pt[k]); save(); drawRes(); }; };
		tg("preg", "🤰 Hamil");
		tg("lact", "🤱 Menyusui");
	} else {
		btn(f3, { text: "Perkiraan BB dari usia", icon: "sparkles", cls: "mp-btn-sm", onClick: () => { const w = apls(ageMonths(pt)); if (!isFinite(w)) return void new Notice("Perkiraan BB tersedia untuk usia 0–17 tahun."); pt.wAuto = true; autoW(); save(); derived(); drawRes(); new Notice(`Perkiraan BB: ${num(pt.w)} kg. Timbang bila memungkinkan.`); } });
	}
	const der = pc.createDiv("mp-md-derived");
	const derived = () => {
		der.empty();
		const chip = (t: string, v: string, c = "") => { const x = der.createDiv("mp-md-dchip " + c); x.createDiv({ cls: "mp-small", text: t }); x.createDiv({ cls: "mp-strong", text: v }); };
		chip("Usia", ageText(ageMonths(pt)));
		if (pt.w > 0 && pt.h > 0) { chip("BSA", `${num(bsa(pt.w, pt.h))} m²`); if (pt.type === "dewasa") { const b = bmi(pt.w, pt.h); chip("IMT", `${num(b)} · ${bmiCat(b).t}`); } }
		const rf = renalOf(pt);
		if (rf) chip(rf.label, `${num(rf.val)} mL/menit · ${gfrStage(rf.val)}`, rf.val < 30 ? "is-red" : rf.val < 60 ? "is-amber" : "is-ok");
		else if (pt.scr > 0) chip("Fungsi ginjal", pt.type === "anak" ? "isi tinggi badan" : "isi usia & BB");
	};
	derived();

	// ---- pilih obat
	const pick0 = left.createDiv("mp-md-card");
	const h2 = pick0.createDiv("mp-md-card-h");
	h2.createSpan({ cls: "mp-md-card-ic", text: "💊" });
	h2.createSpan({ cls: "mp-md-card-t", text: "Obat" });
	drugPicker(pick0, p, (d) => { C.drug = d.id; C.reg = -1; C.prep = -2; C.t = 0.5; C.conc = 0; hub.renderPage(); });
	const d = drugById(p, C.drug) ?? DRUGS[0];
	const cur = pick0.createDiv("mp-md-curdrug");
	cur.style.setProperty("--c", catOf(d.cat).color);
	cur.createSpan({ cls: "mp-md-curdrug-ic", text: catOf(d.cat).icon });
	const ct = cur.createDiv("mp-grow");
	ct.createDiv({ cls: "mp-strong", text: d.name });
	ct.createDiv({ cls: "mp-small mp-muted", text: d.cls });
	btn(cur, { icon: "info", cls: "mp-btn-ghost mp-btn-sm", label: "Buka detail obat", onClick: () => openDrug(hub, d.id) });
	const mine = d.regs.map((r, i) => [r, i] as const).filter(([r]) => r.who === pt.type);
	const regs = mine.length ? mine : d.regs.map((r, i) => [r, i] as const);
	if (!mine.length) pick0.createDiv({ cls: "mp-md-warnline", text: `Tidak ada regimen ${pt.type} untuk obat ini; menampilkan regimen lain.` });
	if (C.reg < 0 || !regs.some(([, i]) => i === C.reg)) C.reg = (regs.find(([r]) => r.kind !== "text") ?? regs[0])[1];
	const rl = pick0.createDiv("mp-md-reglist");
	for (const [r, i] of regs) {
		const b = rl.createEl("button", { cls: "mp-md-regchip" + (i === C.reg ? " is-on" : "") });
		b.createDiv({ cls: "mp-strong", text: r.label });
		b.createDiv({ cls: "mp-small", text: `${r.who === "anak" ? "🧒" : "🧑"} ${r.route}` });
		b.onclick = () => { C.reg = i; C.prep = -2; C.t = 0.5; rl.querySelectorAll(".mp-md-regchip").forEach((x) => x.removeClass("is-on")); b.addClass("is-on"); drawRes(); };
	}

	// ---- hasil
	const res = right.createDiv("mp-md-res");
	const drawRes = () => {
		res.empty();
		const r = d.regs[C.reg];
		const cres = calc(r, pt);
		const card = res.createDiv("mp-md-rescard");
		card.style.setProperty("--c", catOf(d.cat).color);
		const top = card.createDiv("mp-md-res-top");
		top.createDiv({ cls: "mp-md-res-k", text: `${r.label} · ${r.route}` });
		top.createDiv({ cls: "mp-md-res-reg", text: regText(r) });
		if (r.kind === "text") { card.createDiv({ cls: "mp-md-p mp-md-res-text", text: r.text ?? "" }); alerts(res); return; }
		if (!cres.ok && !cres.label) { for (const w of cres.warns) card.createDiv({ cls: "mp-md-warnline", text: w }); if (cres.label) card.createDiv({ text: cres.label }); return; }
		const u = cres.unit;
		let per = 0, day: number | null = null, capped: string[] = [];
		if (cres.steps) {
			const st = card.createDiv("mp-md-steps");
			cres.steps.forEach((s, k) => {
				const x = st.createDiv("mp-md-step");
				x.style.animationDelay = `${k * 0.08}s`;
				x.createDiv({ cls: "mp-md-step-n", text: String(k + 1) });
				const t = x.createDiv("mp-grow");
				t.createDiv({ cls: "mp-small mp-muted", text: s.txt });
				t.createDiv({ cls: "mp-md-step-v", text: num(s.mg, u) + (s.capped ? " (maks)" : "") });
				const pr = prepFor(d, r);
				if (pr) { const a = amount(pr, s.mg, u); if (a) t.createDiv({ cls: "mp-small", text: `${a.main} ${pr.label}` }); }
			});
			per = cres.steps[0].mg;
		} else {
			const ranged = r.dose && r.dose[1] > r.dose[0] && (r.kind === "kg" || r.kind === "kgday" || r.kind === "fixed");
			const pk = ranged ? pick(r, pt, C.t)! : cres.lo!;
			per = pk.per; day = pk.day; capped = pk.capped;
			const big = card.createDiv("mp-md-big");
			if (per > 0) {
				const v = big.createDiv("mp-md-big-v");
				animateNum(v, per, u);
				big.createDiv({ cls: "mp-md-big-l", text: (isRate(u) ? `kecepatan infus kontinu (${RATE[u][0]} per ${RATE[u][1]})` : r.every?.includes("/jam") ? "per jam (infus kontinu)" : r.every?.includes("tunggal") ? "dosis tunggal" : "per kali pemberian") + (r.basis ? ` · sebagai ${r.basis}` : "") });
			}
			if (cres.label) card.createDiv({ cls: "mp-md-bandlabel", text: cres.label });
			if (ranged) {
				const sl = card.createDiv("mp-md-slider");
				const lo = cres.lo!.per, hi = cres.hi!.per;
				sl.createSpan({ cls: "mp-small", text: num(lo, u) });
				const inp = sl.createEl("input", { type: "range", attr: { min: "0", max: "1", step: "0.05" } });
				inp.value = String(C.t);
				sl.createSpan({ cls: "mp-small", text: num(hi, u) });
				const rv = r.dose![0] + (r.dose![1] - r.dose![0]) * C.t;
				card.createDiv({ cls: "mp-small mp-muted mp-center", text: `Rentang ${range(lo, hi, u)} · dipilih ${num(rv)} ${r.kind === "kg" || r.kind === "kgday" ? perKgUnit(r) : u}` });
				inp.oninput = () => { C.t = parseFloat(inp.value); drawRes(); res.querySelector<HTMLInputElement>(".mp-md-slider input")?.focus(); };
			}
			const facts = card.createDiv("mp-md-facts");
			const fact = (k: string, v: string) => { const f = facts.createDiv("mp-md-fact"); f.createDiv({ cls: "mp-small mp-muted", text: k }); f.createDiv({ cls: "mp-strong", text: v }); };
			fact(isRate(u) ? "Titrasi" : "Frekuensi", r.every ?? "—");
			if (day !== null) fact("Total per hari", num(day, u));
			if (r.kind === "kg" || r.kind === "kgday") fact("BB dipakai", `${num(cres.wUsed)} kg`);
			if (r.dur) fact("Durasi", r.dur);
			if (day !== null && (r.maxDay || r.maxDayKg)) {
				const mx = Math.min(r.maxDay ?? Infinity, r.maxDayKg ? r.maxDayKg * cres.wUsed : Infinity);
				const pct = Math.min(1, day / mx);
				const g = card.createDiv("mp-md-gauge");
				g.createDiv({ cls: "mp-small", text: `Dari batas harian ${num(mx, u)}` });
				const bar = g.createDiv("mp-md-gauge-bar");
				const fill = bar.createDiv("mp-md-gauge-fill");
				fill.style.setProperty("--w", `${pct * 100}%`);
				fill.toggleClass("is-hot", pct > 0.9);
				g.createDiv({ cls: "mp-small mp-strong", text: `${Math.round(pct * 100)}%` });
			}
		}
		for (const cp of capped) card.createDiv({ cls: "mp-md-capline", text: `🔒 ${cp}` });
		for (const w of cres.warns) card.createDiv({ cls: "mp-md-warnline", text: `⚠️ ${w}` });
		for (const w of cres.info) card.createDiv({ cls: "mp-md-infoline", text: `ℹ️ ${w}` });
		if (r.note) card.createDiv({ cls: "mp-md-reg-note", text: r.note });

		// sediaan
		if (u !== "mL" && !cres.steps && per > 0 && (d.preps.some((x) => x.mg || x.mgMl))) {
			const pv = res.createDiv("mp-md-card");
			const h = pv.createDiv("mp-md-card-h");
			h.createSpan({ cls: "mp-md-card-ic", text: "🧴" });
			h.createSpan({ cls: "mp-md-card-t", text: isRate(u) ? "Sediaan & kecepatan pompa" : "Sediaan & takaran" });
			const pg = pv.createDiv("mp-md-prepgrid");
			const usable = d.preps.map((x, i) => [x, i] as const).filter(([x]) => x.mg || x.mgMl);
			if (!usable.some(([, i]) => i === C.prep)) { const best = prepFor(d, r); C.prep = best ? d.preps.indexOf(best) : usable[0][1]; }
			for (const [pr, i] of usable) {
				const a = amount(pr, per, u);
				if (!a) continue;
				const c2 = pg.createEl("button", { cls: "mp-md-prepcard" + (i === C.prep ? " is-on" : "") + (a.warn ? " has-warn" : "") });
				c2.createDiv({ cls: "mp-small mp-muted", text: `${prepIcon(pr)} ${pr.label}` });
				c2.createDiv({ cls: "mp-md-prepcard-v", text: a.main });
				if (a.sub) c2.createDiv({ cls: "mp-small", text: a.sub });
				if (a.warn) c2.createDiv({ cls: "mp-small mp-md-prepwarn", text: a.warn });
				c2.onclick = () => { C.prep = i; drawRes(); };
			}
			const cc = pv.createDiv("mp-md-conc");
			cc.createSpan({ cls: "mp-small", text: "Kadar lain:" });
			const ph = isRate(u) ? `${RATE[u][0] === "mcg" ? "mg" : RATE[u][0]}/mL` : `${u}/mL`;
			const ci = cc.createEl("input", { type: "number", cls: "mp-md-in", attr: { placeholder: ph, step: "any" } });
			if (C.conc) ci.value = String(C.conc);
			const out = cc.createSpan({ cls: "mp-strong" });
			const upd = () => { C.conc = toNum(ci.value); const a2 = C.conc ? amount({ label: "", form: "inj", mgMl: C.conc }, per, u) : null; out.setText(a2 ? `→ ${a2.main}` : ""); };
			ci.oninput = upd; upd();
			// visual takaran
			const pr = C.prep >= 0 ? d.preps[C.prep] : null;
			const a = pr ? amount(pr, per, u) : null;
			if (pr && a) measureVisual(pv, pr, a);
			// resep
			const sg = res.createDiv("mp-md-card mp-md-rx");
			const sh = sg.createDiv("mp-md-card-h");
			sh.createSpan({ cls: "mp-md-card-ic", text: "℞" });
			sh.createSpan({ cls: "mp-md-card-t", text: "Resep (draf)" });
			const txt = signa(d, r, pr, per);
			sg.createEl("pre", { cls: "mp-md-rxpre", text: txt });
			const ra = sg.createDiv("mp-dz-links");
			btn(ra, { text: "Salin", icon: "copy", cls: "mp-btn-sm", onClick: () => copyText(txt, "Resep disalin") });
			btn(ra, { text: "Ekspor PDF", icon: "file-down", cls: "mp-btn-sm mp-md-rxpdf", onClick: () => { const [r1, ...rest] = txt.split("\n").map((x) => x.trim()); const mm = med(p); void savePdf(p, rxPdfDoc({ doc: mm.doc!, pa: { ...mm.rxPt!, w: mm.rxPt!.w || (pt.w ? String(pt.w) : ""), age: mm.rxPt!.age || ageText(pt.ageY * 12 + pt.ageM) }, lines: [{ r: r1.replace(/^R\/\s*/, ""), s: rest.join(" · ") }], title: `Kalkulator dosis · ${d.name}`, wText: pt.w ? `${num(pt.w)} kg` : "" }), "Medis/Resep", `Resep ${d.name}`); } });
		}
		alerts(res);
	};
	const alerts = (host: HTMLElement) => {
		const al = patientAlerts(d, pt);
		const box = host.createDiv("mp-md-card");
		const h = box.createDiv("mp-md-card-h");
		h.createSpan({ cls: "mp-md-card-ic", text: "🛡️" });
		h.createSpan({ cls: "mp-md-card-t", text: "Cek keamanan untuk pasien ini" });
		for (const a of al) box.createDiv({ cls: `mp-md-alert is-${a.lvl}`, text: a.t });
		const ci = box.createEl("details", { cls: "mp-md-det" });
		ci.createEl("summary", { text: `Kontraindikasi ${d.name} (${d.ci.length})` });
		list(ci, d.ci);
		if (!al.length) box.createDiv({ cls: "mp-md-alert is-ok", text: "Tidak ada peringatan khusus dari data pasien yang diisi." });
	};
	drawRes();

	if (pt.type === "anak" && pt.w > 0) quickTable(hub, el, pt);
	disclaimer(el);
}
function prepFor(d: Drug, r?: Reg) { return prepOrder(d, r)[0] ?? null; }
/** Urutkan sediaan yang cocok dengan rute regimen (rektal → rektal tube, IV/IM → injeksi, nebul → nebul, oral → cair dulu). */
function prepOrder(d: Drug, r?: Reg): Prep[] {
	const route = (r?.route ?? "").toLowerCase();
	const want: Prep["form"][] = r && isRate(r.unit ?? "mg") ? ["inf", "inj"] : /rektal/.test(route) ? ["supp"] : /nebul/.test(route) ? ["neb"] : /iv|im|io|sc|intranasal|bukal/.test(route) && !/oral/.test(route) ? ["inj", "inf"] : ["syr", "drop", "tab", "kap"];
	const ok = d.preps.filter((x) => x.mg || x.mgMl);
	const score = (x: Prep) => { const i = want.indexOf(x.form); return i < 0 ? 10 : i; };
	return [...ok].sort((a, b) => score(a) - score(b));
}
function animateNum(el: HTMLElement, v: number, unit: string) {
	const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
	const prev = parseFloat(el.dataset.v ?? "0");
	el.dataset.v = String(v);
	const n = el.createSpan({ cls: "mp-md-big-n" });
	el.createSpan({ cls: "mp-md-big-u", text: ` ${unit}` });
	if (reduce) { n.setText(num(v)); return; }
	const t0 = performance.now(), dur = 520;
	const step = (t: number) => { const k = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - k, 3); n.setText(num(prev + (v - prev) * e)); if (k < 1) requestAnimationFrame(step); };
	requestAnimationFrame(step);
}
function measureVisual(parent: HTMLElement, pr: Prep, a: ReturnType<typeof amount>) {
	if (!a) return;
	const v = parent.createDiv("mp-md-visual");
	if (a.rate && a.ml !== undefined) {
		const pump = v.createDiv("mp-md-pump");
		const scr = pump.createDiv("mp-md-pump-scr");
		scr.createDiv({ cls: "mp-md-pump-v", text: num(Math.round(a.ml * 10) / 10) });
		scr.createDiv({ cls: "mp-md-pump-u", text: "mL/jam" });
		const line = pump.createDiv("mp-md-pump-line");
		for (let i = 0; i < 4; i++) { const d = line.createDiv("mp-md-pump-drop"); d.style.animationDelay = `${i * 0.35}s`; d.style.animationDuration = `${Math.max(0.6, Math.min(3, 6 / Math.max(0.5, a.ml)))}s`; }
		v.createDiv({ cls: "mp-small mp-muted", text: `Syringe/infusion pump · ${pr.label}` });
		return;
	}
	if (a.ml !== undefined) {
		const cap = a.ml <= 1 ? 1 : a.ml <= 3 ? 3 : a.ml <= 5 ? 5 : a.ml <= 10 ? 10 : a.ml <= 20 ? 20 : 50;
		const sy = v.createDiv("mp-md-syr");
		const barrel = sy.createDiv("mp-md-syr-barrel");
		const fill = barrel.createDiv("mp-md-syr-fill");
		fill.style.setProperty("--f", `${Math.min(1, a.ml / cap) * 100}%`);
		for (let i = 1; i < 10; i++) barrel.createDiv("mp-md-syr-tick").style.left = `${i * 10}%`;
		sy.createDiv("mp-md-syr-plunger");
		sy.createDiv("mp-md-syr-tip");
		v.createDiv({ cls: "mp-small mp-muted", text: `Spuit ${cap} mL · isi ${a.main}` });
	} else if (a.tabs !== undefined) {
		const row = v.createDiv("mp-md-tabs-vis");
		const n = Math.min(8, Math.ceil(a.tabs));
		for (let i = 0; i < n; i++) {
			const part = Math.min(1, a.tabs - i);
			const t = row.createDiv("mp-md-tabvis" + (pr.form === "kap" ? " is-cap" : ""));
			t.style.setProperty("--p", String(part));
			t.style.animationDelay = `${i * 0.07}s`;
		}
		v.createDiv({ cls: "mp-small mp-muted", text: `${a.main} · ${pr.label}` });
	}
}

/** Tabel dosis cepat obat anak yang sering dipakai, untuk BB pasien saat ini. */
function quickTable(hub: HubView, el: HTMLElement, pt: Patient) {
	const ids: [string, number][] = [["paracetamol", 2], ["ibuprofen", 1], ["amoksisilin", 2], ["amoksisilin", 3], ["amoksiklav", 1], ["sefiksim", 1], ["azitromisin", 1], ["kotrimoksazol", 1], ["metronidazol", 3], ["ondansetron", 1], ["setirizin", 1], ["salbutamol", 3], ["prednison", 1], ["deksametason", 3], ["oralit", 0], ["zinc", 0], ["diazepam", 4], ["epinefrin", 2]];
	const s = section(el, "⚡", `Dosis cepat anak · BB ${num(pt.w)} kg · usia ${ageText(ageMonths(pt))}`, "mp-mt");
	const t = s.createDiv("mp-md-qtable");
	const head = t.createDiv("mp-md-qrow is-head");
	for (const h of ["Obat", "Regimen", "Per kali", "Takaran", ""]) head.createDiv({ text: h });
	for (const [id, ri] of ids) {
		const d = DRUGS.find((x) => x.id === id);
		const r = d?.regs[ri];
		if (!d || !r || r.who !== "anak") continue;
		const c = calc(r, pt);
		const per = c.steps ? c.steps[0].mg : c.lo ? (c.lo.per === c.hi!.per ? c.lo.per : (c.lo.per + c.hi!.per) / 2) : 0;
		const rng = c.lo && c.hi && c.lo.per !== c.hi.per ? range(c.lo.per, c.hi.per, c.unit) : num(per, c.unit);
		const pr = c.unit === "mL" ? null : prepFor(d, r);
		const a = pr ? amount(pr, per, c.unit) : null;
		const row = t.createDiv("mp-md-qrow" + (c.warns.length ? " is-warn" : ""));
		row.createDiv({ cls: "mp-strong", text: d.name });
		row.createDiv({ cls: "mp-small", text: `${r.label} · ${r.every ?? ""}` });
		row.createDiv({ cls: "mp-strong", text: c.label && !c.lo?.per ? c.label : rng });
		row.createDiv({ cls: "mp-small", text: a && pr ? `${a.main} · ${pr.label}` : c.warns[0] ?? "" });
		const go = row.createEl("button", { cls: "mp-md-qgo", text: "›", attr: { "aria-label": `Hitung ${d.name}` } });
		go.onclick = () => calcDrug(hub, d.id, ri);
	}
	s.createDiv({ cls: "mp-small mp-muted", text: "Takaran memakai nilai tengah rentang. Klik › untuk perhitungan lengkap dan pilihan sediaan." });
}

// ================================================================ 3. INTERAKSI
export function renderMedInter(hub: HubView, el: HTMLElement) {
	const p = hub.plugin;
	const m = med(p);
	hero(el, "Cek Interaksi Obat", "Masukkan semua obat pasien. Sistem memeriksa setiap pasangan, duplikasi golongan, dan kombinasi berbahaya seperti “triple whammy”.", "⚡");
	const box = el.createDiv("mp-md-card mp-md-ixbox");
	drugPicker(box, p, (d) => { if (!m.inter.includes(d.id)) { m.inter.push(d.id); p.requestSave(); play("click"); } draw(); }, "Tambah obat… ketik lalu Enter");
	const chips = box.createDiv("mp-md-ixchips");
	const quick = box.createDiv("mp-md-ixquick");
	const out = el.createDiv("mp-md-ixout");
	const draw = () => {
		chips.empty(); quick.empty(); out.empty();
		const ds = m.inter.map((id) => drugById(p, id)).filter((x): x is Drug => !!x);
		if (!ds.length) chips.createDiv({ cls: "mp-small mp-muted", text: "Belum ada obat. Tambahkan minimal 2 obat." });
		ds.forEach((d, i) => {
			const c = chips.createDiv("mp-md-ixchip");
			c.style.setProperty("--c", catOf(d.cat).color);
			c.style.animationDelay = `${i * 0.03}s`;
			c.createSpan({ text: `${catOf(d.cat).icon} ${d.name}` });
			const x = c.createEl("button", { cls: "mp-md-ixchip-x", text: "✕", attr: { "aria-label": `Hapus ${d.name}` } });
			x.onclick = () => { c.addClass("is-out"); window.setTimeout(() => { m.inter = m.inter.filter((y) => y !== d.id); p.requestSave(); draw(); }, 180); };
		});
		if (ds.length) btn(quick, { text: "Kosongkan", icon: "trash", cls: "mp-btn-sm mp-btn-ghost", onClick: () => { m.inter = []; p.requestSave(); draw(); } });
		const samples: [string, string[]][] = [["Contoh: lansia hipertensi + nyeri", ["kaptopril", "furosemid", "ibuprofen", "spironolakton"]], ["Contoh: AF + infeksi", ["warfarin", "amiodaron", "klaritromisin", "simvastatin"]], ["Contoh: depresi + nyeri", ["fluoksetin", "tramadol", "amitriptilin"]]];
		if (ds.length < 2) for (const [l, ids] of samples) btn(quick, { text: l, cls: "mp-btn-sm", onClick: () => { m.inter = ids; p.requestSave(); draw(); } });
		if (ds.length < 2) { out.createDiv({ cls: "mp-md-empty", text: "Hasil pemeriksaan muncul di sini setelah ada minimal 2 obat." }); return; }
		const r = checkIx(ds);
		// ringkasan
		const worst = r.hits[0]?.rule.sev;
		const sum = out.createDiv("mp-md-ixsum");
		const g = sum.createDiv("mp-md-ixgauge" + (worst ? ` sev-${worst}` : " sev-none"));
		g.createDiv({ cls: "mp-md-ixgauge-ic", text: worst ? SEV_INFO[worst].icon : "✅" });
		const gt = g.createDiv();
		gt.createDiv({ cls: "mp-md-ixgauge-t", text: worst ? `Risiko tertinggi: ${SEV_INFO[worst].label}` : "Tidak ada interaksi bermakna terdeteksi" });
		gt.createDiv({ cls: "mp-small", text: `${ds.length} obat · ${(ds.length * (ds.length - 1)) / 2} pasangan diperiksa · ${r.hits.length} interaksi${r.dupes.length ? ` · ${r.dupes.length} duplikasi` : ""}` });
		const tiles = sum.createDiv("mp-md-sevsum");
		for (const s of Object.keys(SEV_INFO) as Sev[]) {
			const n = r.hits.filter((x) => x.rule.sev === s).length;
			const t = tiles.createDiv("mp-md-sevtile" + (n ? "" : " is-zero"));
			t.style.setProperty("--c", SEV_INFO[s].color);
			t.createDiv({ cls: "mp-md-sevtile-n", text: String(n) });
			t.createDiv({ cls: "mp-small", text: SEV_INFO[s].label });
		}
		// matriks
		if (ds.length >= 3) {
			const mx = out.createDiv("mp-md-card mp-md-matrix-card");
			const h = mx.createDiv("mp-md-card-h");
			h.createSpan({ cls: "mp-md-card-ic", text: "🔲" });
			h.createSpan({ cls: "mp-md-card-t", text: "Matriks interaksi" });
			const grid = mx.createDiv("mp-md-matrix");
			grid.style.setProperty("--n", String(ds.length + 1));
			grid.createDiv();
			for (const d of ds) grid.createDiv({ cls: "mp-md-mx-h", text: d.name.split(" ")[0] });
			ds.forEach((a, i) => {
				grid.createDiv({ cls: "mp-md-mx-h is-row", text: a.name.split(" ")[0] });
				ds.forEach((b, j) => {
					if (i === j) { grid.createDiv("mp-md-mx-c is-self"); return; }
					const hs = r.hits.filter((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a));
					const s = hs.sort((x, y) => SEV_ORDER[x.rule.sev] - SEV_ORDER[y.rule.sev])[0]?.rule.sev;
					const c = grid.createDiv("mp-md-mx-c" + (s ? ` sev-${s}` : ""));
					c.style.animationDelay = `${(i + j) * 0.03}s`;
					c.setAttr("aria-label", s ? `${a.name} + ${b.name}: ${SEV_INFO[s].label}` : `${a.name} + ${b.name}: aman`);
					c.setText(s ? SEV_INFO[s].icon : "·");
				});
			});
		}
		if (r.triple) {
			const t = out.createDiv("mp-md-ixcard sev-mayor is-special");
			t.createDiv({ cls: "mp-md-ixcard-h", text: `🔺 Triple whammy: ${r.triple.map((x) => x.name).join(" + ")}` });
			t.createDiv({ cls: "mp-md-p", text: "Kombinasi ACEI/ARB + diuretik + OAINS meningkatkan risiko gangguan ginjal akut secara bermakna, terutama pada lansia, dehidrasi, atau CKD." });
			t.createDiv({ cls: "mp-small mp-md-act", text: "➜ Hindari OAINS; bila terpaksa, pastikan hidrasi dan cek kreatinin dalam beberapa hari." });
		}
		for (const du of r.dupes) {
			const t = out.createDiv("mp-md-ixcard sev-moderat is-special");
			t.createDiv({ cls: "mp-md-ixcard-h", text: `♊ Duplikasi ${du.label}: ${du.drugs.map((x) => x.name).join(" + ")}` });
			t.createDiv({ cls: "mp-md-p", text: "Dua obat dari golongan yang sama jarang memberi manfaat tambahan dan menambah efek samping." });
			t.createDiv({ cls: "mp-small mp-md-act", text: "➜ Pertahankan satu obat saja, kecuali kombinasi tersebut disengaja." });
		}
		r.hits.forEach((x, i) => {
			const c = out.createDiv(`mp-md-ixcard sev-${x.rule.sev}`);
			c.style.animationDelay = `${i * 0.05}s`;
			const h = c.createDiv("mp-md-ixcard-h");
			h.createSpan({ cls: "mp-md-sevb", text: `${SEV_INFO[x.rule.sev].icon} ${SEV_INFO[x.rule.sev].label}` });
			h.createSpan({ cls: "mp-strong", text: `${x.a.name} + ${x.b.name}` });
			if (x.rule.src) h.createSpan({ cls: "mp-md-src", text: x.rule.src });
			c.createDiv({ cls: "mp-md-p", text: x.rule.eff });
			if (x.rule.mech) c.createDiv({ cls: "mp-small mp-muted", text: `Mekanisme: ${x.rule.mech}` });
			c.createDiv({ cls: "mp-small mp-md-act", text: `➜ ${x.rule.act}` });
		});
		const legend = out.createDiv("mp-md-legend");
		for (const s of Object.keys(SEV_INFO) as Sev[]) legend.createSpan({ cls: "mp-small", text: `${SEV_INFO[s].icon} ${SEV_INFO[s].label}: ${SEV_INFO[s].desc}` });
	};
	draw();
	disclaimer(el);
}

// ================================================================ 4. KALKULATOR KLINIS
export function renderMedTools(hub: HubView, el: HTMLElement) {
	const pt = med(hub.plugin).pt;
	hero(el, "Kalkulator Klinis", "Antropometri, fungsi ginjal, cairan, tetesan infus, syringe pump, elektrolit, QTc, usia kehamilan, dan GCS.", "📐");
	const g = el.createDiv("mp-md-tools");
	const tool = (icon: string, title: string, build: (body: HTMLElement, out: HTMLElement) => () => void) => {
		const c = g.createDiv("mp-md-tool");
		const h = c.createDiv("mp-md-card-h");
		h.createSpan({ cls: "mp-md-card-ic", text: icon });
		h.createSpan({ cls: "mp-md-card-t", text: title });
		const body = c.createDiv("mp-md-tool-in");
		const out = c.createDiv("mp-md-tool-out");
		const upd = build(body, out);
		upd();
	};
	const res = (out: HTMLElement, rows: [string, string, string?][]) => { out.empty(); for (const [k, v, cl] of rows) { const r = out.createDiv("mp-md-orow " + (cl ?? "")); r.createSpan({ cls: "mp-small", text: k }); r.createSpan({ cls: "mp-strong", text: v }); } };

	tool("📏", "Antropometri", (b, out) => {
		const s = { w: pt.w || 60, h: pt.h || 165, sex: pt.sex };
		const row = b.createDiv("mp-md-row");
		const u = () => {
			if (!(s.w > 0 && s.h > 0)) return res(out, [["", "Isi BB & TB"]]);
			const bm = bmi(s.w, s.h), cat2 = bmiCat(bm), ib = ibw(s.h, s.sex);
			res(out, [["IMT", `${num(bm)} kg/m²`], ["Kategori (Asia-Pasifik)", cat2.t], ["BSA (Mosteller)", `${num(bsa(s.w, s.h))} m²`], ["BB ideal (Devine)", `${num(ib)} kg`], ["BB terkoreksi (obesitas)", s.w > ib * 1.2 ? `${num(abw(ib, s.w))} kg` : "tidak diperlukan"]]);
		};
		field(row, "BB", s.w, (v) => { s.w = toNum(v); u(); }, { suffix: "kg" });
		field(row, "TB", s.h, (v) => { s.h = toNum(v); u(); }, { suffix: "cm" });
		seg(b, [["L", "♂ Laki-laki"], ["P", "♀ Perempuan"]], s.sex, (v) => { s.sex = v; u(); }, "mp-md-seg-sm");
		return u;
	});
	tool("🫘", "Fungsi ginjal", (b, out) => {
		const s = { age: pt.type === "dewasa" && pt.ageY ? pt.ageY : 50, w: pt.w || 60, scr: pt.scr || 1, sex: pt.sex, h: pt.h || 0 };
		const row = b.createDiv("mp-md-row");
		const u = () => {
			if (!(s.scr > 0)) return res(out, [["", "Isi kreatinin serum"]]);
			const rows: [string, string, string?][] = [];
			if (s.age > 0 && s.w > 0) { const c = crcl(s.age, s.w, s.scr, s.sex); rows.push(["CrCl Cockcroft-Gault", `${num(c)} mL/menit`, c < 30 ? "is-red" : c < 60 ? "is-amber" : ""]); }
			if (s.age >= 18) { const e = ckdEpi(s.scr, s.age, s.sex); rows.push(["eGFR CKD-EPI 2021", `${num(e)} mL/menit/1,73m²`], ["Stadium KDIGO", gfrStage(e)]); }
			if (s.h > 0 && s.age < 18) rows.push(["eGFR Schwartz (anak)", `${num(schwartz(s.h, s.scr))} mL/menit/1,73m²`]);
			res(out, rows.length ? rows : [["", "Lengkapi data"]]);
		};
		field(row, "Usia", s.age, (v) => { s.age = toNum(v); u(); }, { suffix: "th" });
		field(row, "BB", s.w, (v) => { s.w = toNum(v); u(); }, { suffix: "kg" });
		const row2 = b.createDiv("mp-md-row");
		field(row2, "Kreatinin", s.scr, (v) => { s.scr = toNum(v); u(); }, { suffix: "mg/dL" });
		field(row2, "TB (anak)", s.h, (v) => { s.h = toNum(v); u(); }, { suffix: "cm" });
		seg(b, [["L", "♂ L"], ["P", "♀ P"]], s.sex, (v) => { s.sex = v; u(); }, "mp-md-seg-sm");
		return u;
	});
	tool("💧", "Cairan rumatan & defisit", (b, out) => {
		const s = { w: pt.w || 15, deh: 0 };
		const row = b.createDiv("mp-md-row");
		const u = () => {
			if (!(s.w > 0)) return res(out, [["", "Isi BB"]]);
			const h = holliday(s.w);
			const rows: [string, string, string?][] = [["Rumatan (Holliday-Segar)", `${num(h.day)} mL/hari`], ["Laju rumatan (4-2-1)", `${num(h.hr)} mL/jam`]];
			if (s.deh > 0) { const def = s.deh * s.w * 10; rows.push(["Defisit cairan", `${num(def)} mL`], ["Rehidrasi 24 jam (defisit + rumatan)", `${num((def + h.day) / 24)} mL/jam`]); }
			res(out, rows);
		};
		field(row, "BB", s.w, (v) => { s.w = toNum(v); u(); }, { suffix: "kg" });
		field(row, "Dehidrasi", s.deh, (v) => { s.deh = toNum(v); u(); }, { suffix: "%" });
		b.createDiv({ cls: "mp-small mp-muted", text: "Dehidrasi berat/syok: bolus kristaloid 10–20 mL/kg terlebih dulu. Pantau natrium; gunakan cairan isotonik untuk rumatan." });
		return u;
	});
	tool("🩸", "Tetesan infus", (b, out) => {
		const s = { vol: 500, hr: 8, df: 20 };
		const row = b.createDiv("mp-md-row");
		const u = () => {
			if (!(s.vol > 0 && s.hr > 0)) return res(out, [["", "Isi volume & durasi"]]);
			const mlh = s.vol / s.hr;
			res(out, [["Kecepatan", `${num(mlh)} mL/jam`], ["Tetesan", `${num(Math.round((s.vol * s.df) / (s.hr * 60)))} tetes/menit`], ["Setiap", `${num(60 / ((s.vol * s.df) / (s.hr * 60)))} detik 1 tetes`]]);
		};
		field(row, "Volume", s.vol, (v) => { s.vol = toNum(v); u(); }, { suffix: "mL" });
		field(row, "Durasi", s.hr, (v) => { s.hr = toNum(v); u(); }, { suffix: "jam" });
		seg(b, [["20", "Makro 20"], ["15", "15 tts/mL"], ["60", "Mikro 60"]], String(s.df) as "20", (v) => { s.df = parseInt(v, 10); u(); }, "mp-md-seg-sm");
		return u;
	});
	tool("💉", "Syringe pump (mcg/kg/menit)", (b, out) => {
		const s = { dose: 5, w: pt.w || 60, mg: 200, ml: 50 };
		const row = b.createDiv("mp-md-row");
		const u = () => {
			if (!(s.dose > 0 && s.w > 0 && s.mg > 0 && s.ml > 0)) return res(out, [["", "Lengkapi data"]]);
			const conc = (s.mg * 1000) / s.ml;
			res(out, [["Konsentrasi", `${num(conc)} mcg/mL`], ["Kecepatan pompa", `${num((s.dose * s.w * 60) / conc)} mL/jam`], ["1 mL/jam setara", `${num(conc / (s.w * 60))} mcg/kg/menit`]]);
		};
		field(row, "Dosis", s.dose, (v) => { s.dose = toNum(v); u(); }, { suffix: "mcg/kg/mnt" });
		field(row, "BB", s.w, (v) => { s.w = toNum(v); u(); }, { suffix: "kg" });
		const row2 = b.createDiv("mp-md-row");
		field(row2, "Obat", s.mg, (v) => { s.mg = toNum(v); u(); }, { suffix: "mg" });
		field(row2, "dalam", s.ml, (v) => { s.ml = toNum(v); u(); }, { suffix: "mL" });
		b.createDiv({ cls: "mp-small mp-muted", text: "Contoh: dopamin/dobutamin 200 mg dalam 50 mL; norepinefrin 4 mg dalam 50 mL. Sesuaikan dengan protokol setempat." });
		return u;
	});
	tool("⚗️", "Elektrolit & asam-basa", (b, out) => {
		const s = { ca: 0, alb: 0, na: 0, cl: 0, hco3: 0, glu: 0 };
		const row = b.createDiv("mp-md-row"), row2 = b.createDiv("mp-md-row"), row3 = b.createDiv("mp-md-row");
		const u = () => {
			const rows: [string, string, string?][] = [];
			if (s.ca && s.alb) rows.push(["Kalsium terkoreksi", `${num(s.ca + 0.8 * (4 - s.alb))} mg/dL`]);
			if (s.na && s.cl && s.hco3) { const ag = s.na - (s.cl + s.hco3); rows.push(["Anion gap", `${num(ag)} mEq/L`, ag > 12 ? "is-amber" : ""]); if (s.alb) rows.push(["Anion gap terkoreksi albumin", `${num(ag + 2.5 * (4 - s.alb))} mEq/L`]); }
			if (s.na && s.glu) rows.push(["Na terkoreksi glukosa", `${num(s.na + 1.6 * ((s.glu - 100) / 100))} mEq/L`]);
			if (s.na && s.glu) rows.push(["Osmolalitas (tanpa BUN)", `${num(2 * s.na + s.glu / 18)} mOsm/kg (perkiraan)`]);
			res(out, rows.length ? rows : [["", "Isi nilai yang tersedia"]]);
		};
		field(row, "Ca total", s.ca, (v) => { s.ca = toNum(v); u(); }, { suffix: "mg/dL" });
		field(row, "Albumin", s.alb, (v) => { s.alb = toNum(v); u(); }, { suffix: "g/dL" });
		field(row2, "Na", s.na, (v) => { s.na = toNum(v); u(); }, { suffix: "mEq/L" });
		field(row2, "Cl", s.cl, (v) => { s.cl = toNum(v); u(); }, { suffix: "mEq/L" });
		field(row3, "HCO₃", s.hco3, (v) => { s.hco3 = toNum(v); u(); }, { suffix: "mEq/L" });
		field(row3, "Glukosa", s.glu, (v) => { s.glu = toNum(v); u(); }, { suffix: "mg/dL" });
		return u;
	});
	tool("❤️", "MAP & QTc", (b, out) => {
		const s = { sbp: 0, dbp: 0, qt: 0, hr: 0 };
		const row = b.createDiv("mp-md-row"), row2 = b.createDiv("mp-md-row");
		const u = () => {
			const rows: [string, string, string?][] = [];
			if (s.sbp && s.dbp) { const map = (s.sbp + 2 * s.dbp) / 3; rows.push(["MAP", `${num(map)} mmHg`, map < 65 ? "is-red" : ""]); }
			if (s.qt && s.hr) {
				const rr = 60 / s.hr;
				const baz = s.qt / Math.sqrt(rr), fri = s.qt / Math.cbrt(rr);
				rows.push(["QTc Bazett", `${num(baz)} ms`, baz > 500 ? "is-red" : baz > 460 ? "is-amber" : ""], ["QTc Fridericia", `${num(fri)} ms`, fri > 500 ? "is-red" : fri > 460 ? "is-amber" : ""]);
			}
			res(out, rows.length ? rows : [["", "Isi tekanan darah atau QT & nadi"]]);
		};
		field(row, "Sistolik", s.sbp, (v) => { s.sbp = toNum(v); u(); }, { suffix: "mmHg" });
		field(row, "Diastolik", s.dbp, (v) => { s.dbp = toNum(v); u(); }, { suffix: "mmHg" });
		field(row2, "QT", s.qt, (v) => { s.qt = toNum(v); u(); }, { suffix: "ms" });
		field(row2, "Nadi", s.hr, (v) => { s.hr = toNum(v); u(); }, { suffix: "/mnt" });
		b.createDiv({ cls: "mp-small mp-muted", text: "QTc > 500 ms atau naik > 60 ms dari awal: risiko torsades tinggi; tinjau obat pemanjang QT." });
		return u;
	});
	tool("🤰", "Usia kehamilan & HPL", (b, out) => {
		const s = { hpht: "" };
		const u = () => {
			if (!s.hpht) return res(out, [["", "Pilih tanggal HPHT"]]);
			const d0 = new Date(s.hpht + "T00:00:00");
			if (isNaN(d0.getTime())) return res(out, [["", "Tanggal tidak valid"]]);
			const hpl = new Date(d0.getTime() + 280 * 86400000);
			const days = Math.floor((Date.now() - d0.getTime()) / 86400000);
			const tri = days < 14 * 7 ? "Trimester I" : days < 28 * 7 ? "Trimester II" : "Trimester III";
			res(out, [["HPL (Naegele)", hpl.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })], ["Usia kehamilan", days >= 0 ? `${Math.floor(days / 7)} minggu ${days % 7} hari` : "—"], ["Trimester", days >= 0 ? tri : "—"], ["Sisa menuju HPL", `${Math.max(0, 280 - days)} hari`]]);
		};
		const i = field(b, "HPHT (hari pertama haid terakhir)", "", (v) => { s.hpht = v; u(); }, { type: "date" });
		i.addClass("mp-md-in-date");
		return u;
	});
	tool("🧠", "Glasgow Coma Scale", (b, out) => {
		const s = { e: 4, v: 5, m: 6 };
		const sel = (label: string, opts: string[], k: "e" | "v" | "m") => {
			const f = b.createDiv("mp-md-field mp-md-field-wide");
			f.createEl("label", { text: label });
			const se = f.createEl("select", { cls: "dropdown mp-md-sel" });
			opts.forEach((o, i) => se.createEl("option", { text: `${opts.length - i} · ${o}`, attr: { value: String(opts.length - i) } }));
			se.value = String(s[k]);
			se.onchange = () => { s[k] = parseInt(se.value, 10); u(); };
		};
		sel("Mata (E)", ["Spontan", "Terhadap suara", "Terhadap nyeri", "Tidak ada"], "e");
		sel("Verbal (V)", ["Orientasi baik", "Bingung", "Kata-kata tidak tepat", "Suara tidak jelas", "Tidak ada"], "v");
		sel("Motorik (M)", ["Mengikuti perintah", "Melokalisasi nyeri", "Menarik (withdrawal)", "Fleksi abnormal", "Ekstensi", "Tidak ada"], "m");
		const u = () => {
			const t = s.e + s.v + s.m;
			res(out, [["Total GCS", `${t} (E${s.e}V${s.v}M${s.m})`, t <= 8 ? "is-red" : t <= 12 ? "is-amber" : ""], ["Interpretasi", t <= 8 ? "Berat — pertimbangkan proteksi jalan napas" : t <= 12 ? "Sedang" : "Ringan"]]);
		};
		return u;
	});
	moreTools(tool, res, pt);
	disclaimer(el);
}

// ================================================================ 5. KARTU DARURAT
export function renderMedEmerg(hub: HubView, el: HTMLElement) {
	const p = hub.plugin;
	const pt = med(p).pt;
	const s = { w: pt.type === "anak" && pt.w ? pt.w : 16, m: pt.type === "anak" ? ageMonths(pt) : 48, auto: pt.type !== "anak" || !!pt.wAuto };
	hero(el, "Kartu Darurat Anak", "Dosis resusitasi, kejang, anafilaksis, energi defibrilasi, dan ukuran ETT, otomatis dari berat badan (PALS/APLS).", "🚑");
	const ctl = el.createDiv("mp-md-card mp-md-emctl");
	const row = ctl.createDiv("mp-md-row mp-md-row-c");
	const wIn = field(row, "Berat badan", s.w, (v) => { s.w = toNum(v); s.auto = false; draw(); }, { suffix: "kg" });
	const autoW = () => { if (!s.auto) return; const w = apls(s.m); if (isFinite(w)) { s.w = Math.round(w * 10) / 10; wIn.value = String(s.w); } };
	field(row, "Usia", Math.round((s.m / 12) * 10) / 10, (v) => { s.m = Math.round(toNum(v) * 12); autoW(); draw(); }, { suffix: "tahun", step: "0.5" });
	btn(row, { text: "BB dari usia (APLS)", icon: "sparkles", cls: "mp-btn-sm", onClick: () => { s.auto = true; autoW(); draw(); } });
	const big = ctl.createDiv("mp-md-embig");
	const out = el.createDiv("mp-md-em");
	type Row = [string, string, number, number | null, string, string?];
	const draw = () => {
		big.empty(); out.empty();
		big.createDiv({ cls: "mp-md-embig-v", text: `${num(s.w)} kg` });
		if (s.auto) big.createDiv({ cls: "mp-small mp-muted", text: "BB = perkiraan dari usia (APLS). Ketik BB hasil timbang bila ada." });
		big.createDiv({ cls: "mp-small", text: `Usia ${num(s.m / 12)} tahun · ETT tanpa cuff ${num(s.m / 12 / 4 + 4)} · dengan cuff ${num(s.m / 12 / 4 + 3.5)} · kedalaman bibir ${num((s.m / 12 / 4 + 4) * 3)} cm` });
		if (!(s.w > 0)) return;
		const w = s.w;
		const grp = (icon: string, title: string, color: string, rows: Row[]) => {
			const c = out.createDiv("mp-md-emgrp");
			c.style.setProperty("--c", color);
			const h = c.createDiv("mp-md-emgrp-h");
			h.createSpan({ text: icon });
			h.createSpan({ text: title });
			for (const [name, perKg, dose, conc, unit, note] of rows) {
				const r = c.createDiv("mp-md-emrow");
				const a = r.createDiv("mp-grow");
				a.createDiv({ cls: "mp-strong", text: name });
				a.createDiv({ cls: "mp-small mp-muted", text: perKg + (note ? ` · ${note}` : "") });
				const v = r.createDiv("mp-md-emval");
				v.createDiv({ cls: "mp-md-emdose", text: `${num(dose)} ${unit}` });
				if (conc) v.createDiv({ cls: "mp-small", text: `${num(Math.round((dose / conc) * 100) / 100)} mL` });
			}
		};
		const cap = (v: number, mx: number) => Math.min(v, mx);
		grp("❤️‍🔥", "Henti jantung & aritmia", "#e11d48", [
			["Epinefrin IV/IO", "0,01 mg/kg (1:10.000 = 0,1 mL/kg) tiap 3–5 mnt", cap(0.01 * w, 1), 0.1, "mg", "maks 1 mg"],
			["Amiodaron (VF/pVT)", "5 mg/kg bolus, ulang hingga 15 mg/kg", cap(5 * w, 300), 50, "mg", "maks 300 mg; ampul 150 mg/3 mL"],
			["Lidokain (alternatif)", "1 mg/kg IV", cap(w, 100), 20, "mg", "lidokain 2%"],
			["Adenosin dosis 1", "0,1 mg/kg bolus cepat + flush", cap(0.1 * w, 6), 3, "mg", "maks 6 mg"],
			["Adenosin dosis 2", "0,2 mg/kg", cap(0.2 * w, 12), 3, "mg", "maks 12 mg"],
			["Atropin (bradikardia)", "0,02 mg/kg, dapat diulang 1x", cap(0.02 * w, 0.5), 0.25, "mg", "maks 0,5 mg/dosis"],
			["Kalsium klorida 10%", "20 mg/kg (0,2 mL/kg)", cap(20 * w, 1000), 100, "mg", "vena besar/sentral"],
			["Kalsium glukonat 10%", "60 mg/kg (0,6 mL/kg)", cap(60 * w, 3000), 100, "mg"],
			["Natrium bikarbonat 8,4%", "1 mEq/kg (tidak rutin)", cap(w, 50), 1, "mEq", "maks 50 mEq"],
			["Dekstrosa (hipoglikemia)", "0,5–1 g/kg → D10 5–10 mL/kg", 0.5 * w, null, "g", `D10 ${num(5 * w)}–${num(10 * w)} mL`],
			["Nalokson", "0,1 mg/kg (reversal penuh)", cap(0.1 * w, 2), 0.4, "mg", "maks 2 mg"],
			["Magnesium sulfat (torsades)", "25–50 mg/kg", cap(50 * w, 2000), 200, "mg", "MgSO₄ 20%"],
		]);
		grp("⚡", "Energi listrik", "#f59e0b", [
			["Defibrilasi syok 1", "2 J/kg", 2 * w, null, "J"],
			["Defibrilasi syok 2", "4 J/kg (berikutnya ≥ 4 J/kg)", cap(4 * w, 200), null, "J", "maks 10 J/kg atau dosis dewasa"],
			["Kardioversi sinkron", "0,5–1 J/kg, lalu 2 J/kg", 0.5 * w, null, "J", `naik ke ${num(2 * w)} J`],
		]);
		grp("🌀", "Kejang (status epileptikus)", "#6366f1", [
			["Midazolam intranasal/bukal", "0,2 mg/kg (bukal 0,5 mg/kg)", cap(0.2 * w, 10), 5, "mg", "maks 10 mg"],
			["Midazolam IM", "BB 13–40 kg: 5 mg; > 40 kg: 10 mg", w > 40 ? 10 : w >= 13 ? 5 : 0.2 * w, 5, "mg"],
			["Diazepam IV", "0,2–0,3 mg/kg pelan", cap(0.2 * w, 10), 5, "mg", "maks 10 mg"],
			["Diazepam rektal", "0,5 mg/kg", cap(0.5 * w, 10), null, "mg", w < 12 ? "praktis: 5 mg" : "praktis: 10 mg"],
			["Fenitoin IV", "20 mg/kg dalam NaCl, ≤ 1 mg/kg/mnt", cap(20 * w, 1500), 50, "mg", "maks 1.500 mg; monitor EKG"],
			["Fenobarbital IV", "20 mg/kg", cap(20 * w, 1000), 50, "mg", "maks 1.000 mg"],
			["Levetirasetam IV", "40–60 mg/kg dalam 5–15 mnt", cap(60 * w, 4500), 100, "mg", "maks 4.500 mg"],
			["Asam valproat IV", "40 mg/kg", cap(40 * w, 3000), 100, "mg", "hindari < 2 th / penyakit hati"],
		]);
		grp("🐝", "Anafilaksis", "#0d9488", [
			["Epinefrin IM (1:1.000)", "0,01 mg/kg di paha, ulang tiap 5–15 mnt", cap(0.01 * w, 0.3), 1, "mg", "maks 0,3 mg (remaja 0,5 mg)"],
			["Bolus kristaloid", "20 mL/kg cepat", 20 * w, null, "mL"],
			["Hidrokortison IV", "2 mg/kg", cap(2 * w, 100), 50, "mg", "maks 100 mg"],
			["Difenhidramin IV", "1 mg/kg", cap(w, 50), 10, "mg", "≥ 2 tahun; maks 50 mg"],
			["Salbutamol nebul", "BB ≤ 20 kg: 2,5 mg; > 20 kg: 5 mg", w > 20 ? 5 : 2.5, 1, "mg", "bila bronkospasme"],
		]);
		grp("💧", "Cairan & lainnya", "#0ea5e9", [
			["Bolus cairan (syok)", "10–20 mL/kg isotonik, nilai ulang", 10 * w, null, "mL", `hingga ${num(20 * w)} mL`],
			["Darah (PRC)", "10–15 mL/kg", 10 * w, null, "mL", `hingga ${num(15 * w)} mL`],
			["Rumatan (4-2-1)", "Holliday-Segar", holliday(w).hr, null, "mL/jam"],
			["Manitol 20%", "0,5–1 g/kg (TIK meningkat)", 0.5 * w, null, "g", `${num(2.5 * w)}–${num(5 * w)} mL`],
			["NaCl 3%", "3–5 mL/kg (TIK meningkat / hiponatremia simptomatik)", 3 * w, null, "mL", `hingga ${num(5 * w)} mL`],
		]);
		const ad = out.createDiv("mp-md-card mp-md-acls");
		const h = ad.createDiv("mp-md-card-h");
		h.createSpan({ cls: "mp-md-card-ic", text: "🧑" });
		h.createSpan({ cls: "mp-md-card-t", text: "Referensi cepat dewasa (ACLS)" });
		list(ad, ["Epinefrin 1 mg IV/IO tiap 3–5 menit (henti jantung)", "Amiodaron 300 mg bolus, lalu 150 mg (VF/pVT refrakter)", "Adenosin 6 mg bolus cepat, lalu 12 mg", "Atropin 1 mg IV tiap 3–5 menit, maks 3 mg", "Defibrilasi bifasik 120–200 J (sesuai alat), monofasik 360 J", "Anafilaksis: epinefrin 0,5 mg IM paha (1 mg/mL)", "Hipoglikemia: dekstrosa 25 g IV (D40 62,5 mL)"]);
	};
	draw();
	el.createDiv({ cls: "mp-md-disc mp-mt" }).setText("⚕️ Sumber: ringkasan obat PALS/ACLS (AHA), APLS, pedoman status epileptikus AES 2016/ESETT. Verifikasi dengan protokol resusitasi setempat. Untuk neonatus gunakan pedoman resusitasi neonatus.");
}

// ================================================================ obat sendiri
class CustomDrugModal extends Modal {
	constructor(app: App, private p: FlashcardPlugin, private d: Drug | null, private done: () => void) { super(app); }
	onOpen() {
		this.modalEl.addClass("mp-modal", "mp-md-modal");
		const el = this.contentEl;
		el.createDiv({ cls: "mp-modal-title", text: this.d ? `Edit ${this.d.name}` : "➕ Tambah obat sendiri" });
		el.createDiv({ cls: "mp-small mp-muted", text: "Obat pribadi tersimpan di data plugin dan ikut muncul di database, kalkulator, dan flashcard." });
		const d = this.d;
		const val: Record<string, string> = {
			name: d?.name ?? "", cls: d?.cls ?? "", cat: d?.cat ?? "analgesik", ind: d?.ind.join("\n") ?? "",
			adult: d?.regs.find((r) => r.who === "dewasa")?.text ?? "", child: d?.regs.find((r) => r.who === "anak" && r.kind === "text")?.text ?? "",
			kgLo: String(d?.regs.find((r) => r.kind === "kg")?.dose?.[0] ?? ""), kgHi: String(d?.regs.find((r) => r.kind === "kg")?.dose?.[1] ?? ""),
			freq: String(d?.regs.find((r) => r.kind === "kg")?.freq ?? ""), max: String(d?.regs.find((r) => r.kind === "kg")?.max ?? ""),
			prep: d?.preps.map((x) => x.mgMl ? `${x.label} | ${x.mgMl}` : x.label).join("\n") ?? "", ci: d?.ci.join("\n") ?? "", se: d?.se.join("\n") ?? "", how: d?.how ?? "", preg: d?.preg ?? "",
		};
		const inp = (k: string, label: string, area = false, ph = "") => {
			el.createEl("label", { cls: "mp-small mp-strong mp-md-mlabel", text: label });
			const i = area ? el.createEl("textarea", { cls: "mp-input mp-md-marea", attr: { placeholder: ph } }) : el.createEl("input", { type: "text", cls: "mp-input", attr: { placeholder: ph } });
			i.value = val[k];
			i.oninput = () => (val[k] = i.value);
		};
		inp("name", "Nama obat *", false, "mis. Sefuroksim");
		inp("cls", "Golongan", false, "mis. Sefalosporin generasi II");
		el.createEl("label", { cls: "mp-small mp-strong mp-md-mlabel", text: "Kategori" });
		const sel = el.createEl("select", { cls: "dropdown mp-select" });
		for (const c of CATS) sel.createEl("option", { text: `${c.icon} ${c.name}`, attr: { value: c.id } });
		sel.value = val.cat;
		sel.onchange = () => (val.cat = sel.value);
		inp("ind", "Indikasi (satu per baris)", true);
		inp("adult", "Dosis dewasa (teks)", true, "mis. 250–500 mg 2x sehari");
		inp("child", "Dosis anak (teks)", true);
		const r = el.createDiv("mp-md-row");
		const small = (k: string, l: string) => { const f = r.createDiv("mp-md-field"); f.createEl("label", { text: l }); const i = f.createEl("input", { type: "number", cls: "mp-md-in", attr: { step: "any" } }); i.value = val[k]; i.oninput = () => (val[k] = i.value); };
		small("kgLo", "Anak mg/kg/dosis (min)"); small("kgHi", "(maks)"); small("freq", "x/hari"); small("max", "Maks mg/dosis");
		inp("prep", "Sediaan (satu per baris; tambahkan “| kadar mg/mL” untuk cairan)", true, "Sirup 125 mg/5 mL | 25");
		inp("ci", "Kontraindikasi (satu per baris)", true);
		inp("se", "Efek samping (satu per baris)", true);
		inp("how", "Cara penggunaan / catatan", true);
		inp("preg", "Kehamilan & menyusui", false);
		const foot = el.createDiv("mp-modal-foot mp-mt");
		foot.createDiv("mp-grow");
		btn(foot, { text: "Batal", onClick: () => this.close() });
		btn(foot, {
			text: "Simpan", icon: "check", cls: "mp-btn-primary", onClick: () => {
				if (!val.name.trim()) return void new Notice("Nama obat wajib diisi.");
				const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
				const regs: Reg[] = [];
				if (val.adult.trim()) regs.push({ who: "dewasa", label: "Dosis dewasa", route: "—", kind: "text", text: val.adult.trim() });
				const lo = toNum(val.kgLo), hi = toNum(val.kgHi) || lo;
				if (lo > 0) regs.push({ who: "anak", label: "Dosis anak (mg/kg)", route: "—", kind: "kg", dose: [lo, hi], freq: toNum(val.freq) || 1, every: `${toNum(val.freq) || 1}x sehari`, max: toNum(val.max) || undefined });
				if (val.child.trim()) regs.push({ who: "anak", label: "Dosis anak", route: "—", kind: "text", text: val.child.trim() });
				const preps: Prep[] = lines(val.prep).map((l) => { const [lab, c] = l.split("|").map((x) => x.trim()); const mgMl = toNum(c ?? ""); return mgMl ? { label: lab, form: "syr", mgMl } : { label: lab, form: "lain" }; });
				const nd: Drug = {
					id: d?.id ?? "c-" + Date.now().toString(36), name: val.name.trim(), cls: val.cls.trim() || "Obat pribadi", cat: val.cat, tags: [], preps, ind: lines(val.ind), regs,
					how: val.how.trim() || "—", ci: lines(val.ci), warn: [], se: lines(val.se), preg: val.preg.trim() || "Belum diisi.", lact: "Belum diisi.",
				};
				const m = med(this.p);
				m.custom = d ? m.custom.map((x) => (x.id === d.id ? nd : x)) : [...m.custom, nd];
				this.p.requestSave();
				new Notice(`💊 ${nd.name} disimpan`);
				this.close();
				this.done();
			},
		});
	}
	onClose() { this.contentEl.empty(); }
}
