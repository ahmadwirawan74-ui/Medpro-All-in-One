/**
 * Atlas anatomi 3D MedPro — model Z-Anatomy (turunan BodyParts3D, CC BY-SA 4.0).
 * 8 lapisan sistem, ±4.500 objek 3D yang bisa diputar, diperbesar, diketuk, disembunyikan, diisolasi, dan dipotong.
 * Materi berbahasa Indonesia (fungsi, klinis, penyakit, pemeriksaan fisik) ditautkan ke struktur 3D-nya;
 * struktur lain menampilkan nama Latin TA2 dan definisi Wikipedia (bahasa Inggris).
 */
import { Notice, Platform } from "obsidian";
import type { HubView } from "./hub-view";
import { Atlas3D } from "./anat3d-viewer";
import {
	AObj, cleanEn, definition, groupChain, groupName, groups, hasIdName, latinOf, nameOf, objects, objsUnder, systems,
} from "./anat3d-store";
import { AnatTopic, TOPICS } from "./anat3d-content";
import { DISEASES } from "./med-dis";
import { PFM } from "./med-pf-skdi";
import { copyText, disclaimer, med } from "./medis";
import { openDisease } from "./medis3";
import { openPfMat } from "./med-pfui";
import { acc, ibtn, mlist, nrm } from "./med-ui";
import { play } from "./sound";
import { btn, confetti } from "./util";

/** Lapisan sistem (id dari data Z-Anatomy). */
const LAYERS: { id: string; label: string; icon: string; color: string }[] = [
	{ id: "9", label: "Kulit", icon: "🧍", color: "#f97316" },
	{ id: "4", label: "Otot", icon: "💪", color: "#ef4444" },
	{ id: "1", label: "Tulang", icon: "🦴", color: "#78716c" },
	{ id: "3", label: "Sendi & ligamen", icon: "🦵", color: "#8b5cf6" },
	{ id: "5", label: "Jantung & pembuluh", icon: "🫀", color: "#dc2626" },
	{ id: "7", label: "Saraf & indra", icon: "🧠", color: "#eab308" },
	{ id: "8", label: "Organ dalam", icon: "🫁", color: "#0ea5e9" },
	{ id: "6", label: "Limfoid", icon: "🟢", color: "#16a34a" },
];
const PRESETS: { label: string; on: string[] }[] = [
	{ label: "Kerangka", on: ["1"] }, { label: "Otot", on: ["4", "1"] }, { label: "Organ", on: ["8", "5", "1"] },
	{ label: "Saraf", on: ["7", "1"] }, { label: "Sirkulasi", on: ["5", "8"] }, { label: "Kulit", on: ["9"] }, { label: "Semua", on: ["1", "3", "4", "5", "6", "7", "8"] },
];
/** Kelompok topik materi (dari atlas versi 1.0). */
const TOPIC_META: Record<string, { name: string; icon: string; color: string }> = {
	kulit: { name: "Kulit (integumen)", icon: "🧴", color: "#f97316" }, otot: { name: "Otot (muskuloskeletal)", icon: "💪", color: "#ef4444" },
	tulang: { name: "Tulang (skeleton)", icon: "🦴", color: "#64748b" }, saraf: { name: "Otak & saraf pusat", icon: "🧠", color: "#8b5cf6" },
	jantung: { name: "Jantung", icon: "🫀", color: "#dc2626" }, paru: { name: "Paru & saluran napas", icon: "🫁", color: "#0ea5e9" },
	cerna: { name: "Saluran cerna & hepatobilier", icon: "🫃", color: "#f59e0b" }, ginjal: { name: "Ginjal & saluran kemih", icon: "🫘", color: "#b45309" },
	"repro-w": { name: "Reproduksi wanita", icon: "♀️", color: "#db2777" }, "repro-p": { name: "Reproduksi pria", icon: "♂️", color: "#2563eb" },
	endokrin: { name: "Sistem endokrin", icon: "🦋", color: "#7c3aed" }, mata: { name: "Mata", icon: "👁️", color: "#06b6d4" }, telinga: { name: "Telinga", icon: "👂", color: "#0891b2" },
};
/** Lapisan yang sebaiknya tampil untuk tiap kelompok topik. */
const TOPIC_LAYERS: Record<string, string[]> = {
	kulit: ["9"], otot: ["4", "1"], tulang: ["1"], saraf: ["7"], jantung: ["5"], paru: ["8", "1"], cerna: ["8"], ginjal: ["8", "5"],
	"repro-w": ["8"], "repro-p": ["8", "1"], endokrin: ["8", "7"], mata: ["7"], telinga: ["7", "1"],
};

type Mode = "jelajah" | "tunjuk" | "nama";
type Tab = "info" | "daftar" | "materi";
const S = {
	mode: "jelajah" as Mode, tab: "materi" as Tab, layers: ["1", "8", "5"] as string[], sel: -1, group: -1, topic: "", q: "",
	xray: false, clip: "none" as "none" | "x" | "y" | "z", clipT: 0.5, alt: false, pendingFocus: true, resetHidden: false,
};
interface AnatState { anatSeen?: Record<string, string[]>; anatBest?: Record<string, number> }
const st = (hub: HubView) => med(hub.plugin) as ReturnType<typeof med> & AnatState;

let V: Atlas3D | null = null;
function viewer(): Atlas3D {
	if (!V) V = new Atlas3D({ mobile: Platform.isMobile });
	return V;
}
/** Bebaskan konteks WebGL (dipanggil saat plugin dimatikan). */
export function disposeAnat3D() { V?.dispose(); V = null; }
/** Untuk pengujian. */
export const anatViewer = () => V;

// ---------------- indeks topik ↔ objek ----------------
let BASE2T: Map<string, AnatTopic[]> | null = null;
let GROUP2T: Map<string, AnatTopic[]> | null = null;
function topicIndex() {
	if (BASE2T && GROUP2T) return;
	BASE2T = new Map(); GROUP2T = new Map();
	for (const t of TOPICS) for (const x of t.t) {
		if (x.startsWith("g:")) { const a = GROUP2T.get(x.slice(2)) ?? []; a.push(t); GROUP2T.set(x.slice(2), a); }
		else if (!x.startsWith("sys:")) { const a = BASE2T.get(x) ?? []; a.push(t); BASE2T.set(x, a); }
	}
}
/** Topik materi yang menaungi objek ini (langsung atau lewat grupnya). */
function topicsFor(o: AObj): AnatTopic[] {
	topicIndex();
	const out = [...(BASE2T!.get(o.base) ?? [])];
	for (const g of groupChain(o.g)) for (const t of GROUP2T!.get(g.name) ?? []) if (!out.includes(t)) out.push(t);
	if (o.sys === "9" && !out.length) out.push(...TOPICS.filter((t) => t.t.includes("sys:9")).slice(0, 1));
	return out;
}
/** Objek 3D untuk sebuah topik. */
function objsForTopic(t: AnatTopic): AObj[] {
	const O = objects(); const G = groups();
	const out: AObj[] = [];
	for (const x of t.t) {
		if (x.startsWith("g:")) { const g = G.find((gg) => gg.name === x.slice(2)); if (g) out.push(...objsUnder(g.i).map((i) => O[i])); }
		else if (x.startsWith("sys:")) out.push(...O.filter((o) => o.sys === x.slice(4) && !o.defHidden));
		else out.push(...O.filter((o) => o.base === x));
	}
	return t.side ? out.filter((o) => !o.side || o.side === t.side) : out;
}
const tmeta = (t: AnatTopic) => TOPIC_META[t.topic] ?? { name: t.topicName, icon: "🫀", color: "#e11d48" };

// ---------------- API untuk modul lain (bentuk {s, p} dipertahankan) ----------------
type Ref = { s: { id: string; name: string; icon: string; color: string }; p: { id: string; name: string } };
const ref = (t: AnatTopic): Ref => ({ s: { id: t.topic, ...tmeta(t) }, p: { id: t.id, name: t.name } });

/** Buka atlas pada topik (`part` = id topik) atau objek 3D (`part` = "obj:<nama>"). */
export function openAnat(hub: HubView, _sys: string, part = "") {
	S.mode = "jelajah"; S.group = -1; S.sel = -1; S.topic = "";
	if (part.startsWith("obj:")) {
		const o = objects().find((x) => x.n === part.slice(4));
		if (o) { S.sel = o.i; S.tab = "info"; if (!S.layers.includes(o.sys)) S.layers = [...S.layers, o.sys]; }
	} else if (part) {
		const t = TOPICS.find((x) => x.id === part);
		if (t) {
			S.topic = t.id; S.tab = "info";
			const ls = TOPIC_LAYERS[t.topic];
			if (ls) S.layers = hub.page === "medanat" ? [...new Set([...S.layers, ...ls])] : [...ls];
			const os = objsForTopic(t); for (const o of os) if (!S.layers.includes(o.sys)) S.layers.push(o.sys);
		}
	}
	S.pendingFocus = true; S.resetHidden = true;
	if (hub.page === "medanat") hub.renderPage(); else hub.navigate("medanat");
}
let DZ2A: Map<string, Ref[]> | null = null;
export function anatForDisease(id: string): Ref[] {
	if (!DZ2A) { DZ2A = new Map(); for (const t of TOPICS) for (const d of t.dz) { const a = DZ2A.get(d) ?? []; a.push(ref(t)); DZ2A.set(d, a); } }
	return DZ2A.get(id) ?? [];
}
let PF2A: Map<string, Ref[]> | null = null;
export function anatForPf(id: string): Ref[] {
	if (!PF2A) { PF2A = new Map(); for (const t of TOPICS) for (const x of t.pf) { const a = PF2A.get(x) ?? []; a.push(ref(t)); PF2A.set(x, a); } }
	return PF2A.get(id) ?? [];
}
let SIDX: { o: AObj; key: string }[] | null = null;
/** Cari topik materi & struktur 3D (nama Indonesia, Latin, atau Inggris). */
export function anatSearch(q: string): Ref[] {
	const ws = nrm(q).split(" ").filter(Boolean); if (!ws.length) return [];
	const out: Ref[] = TOPICS.filter((t) => { const k = nrm(`${t.name} ${t.latin}`); return ws.every((w) => k.includes(w)); }).map(ref);
	if (!SIDX) {
		const seen = new Set<string>(); SIDX = [];
		for (const o of objects()) { if (seen.has(o.base)) continue; seen.add(o.base); SIDX.push({ o, key: nrm(`${nameOf(o.base)} ${latinOf(o.base)} ${cleanEn(o.base)}`) }); }
	}
	const lay = new Map(LAYERS.map((l) => [l.id, l]));
	for (const { o, key } of SIDX) {
		if (out.length >= 40) break;
		if (ws.every((w) => key.includes(w))) { const l = lay.get(o.sys)!; out.push({ s: { id: o.sys, name: `3D · ${l.label}`, icon: l.icon, color: l.color }, p: { id: "obj:" + o.n, name: nameOf(o.base) } }); }
	}
	return out;
}
export const anatStats = () => ({ objects: objects().length, bases: new Set(objects().map((o) => o.base)).size, topics: TOPICS.length });
export const anatTopics = () => TOPICS;

// ---------------- halaman ----------------
export function renderAnatomy(hub: HubView, el: HTMLElement) {
	const m = st(hub);
	m.anatSeen ??= {}; m.anatBest ??= {};
	const v = viewer();
	const O = objects();
	const head = el.createDiv("mp-mx-pagehead");
	const ht = head.createDiv("mp-grow");
	ht.createEl("h2", { text: "🫀 Anatomi 3D" });
	const nSeen = (m.anatSeen["3d"] ?? []).length;
	const stats = anatStats();
	ht.createDiv({ cls: "mp-small mp-muted", text: `${systems().length} lapisan · ${stats.bases.toLocaleString("id-ID")} struktur (${stats.objects.toLocaleString("id-ID")} objek 3D) · ${TOPICS.length} materi Indonesia · dijelajahi ${nSeen}` });
	ibtn(head, "shuffle", "Struktur acak", () => {
		const pool = TOPICS.filter((t) => t.t.length);
		const t = pool[Math.floor(Math.random() * pool.length)];
		openAnat(hub, t.topic, t.id);
	});

	if (!v.ok) {
		el.createDiv({ cls: "mp-md-empty", text: "Perangkat ini tidak mendukung WebGL, jadi atlas 3D tidak bisa ditampilkan. Materi tetap bisa dibaca di daftar di bawah." });
		renderMateri(hub, el.createDiv("mp-a3-panel"), null);
		return;
	}

	// pencarian
	const box = el.createDiv("mp-md-search mp-mx-search");
	box.createSpan({ cls: "mp-md-search-ic", text: "🔎" });
	const inp = box.createEl("input", { type: "text", cls: "mp-md-search-in mp-an-q", attr: { placeholder: "Cari struktur: nama Indonesia, Latin, atau Inggris (mis. femur, n. medianus, ventrikel, hati)" } });
	inp.value = S.q;
	const sres = el.createDiv("mp-an-sres");
	const drawRes = () => {
		sres.empty();
		const hits = anatSearch(S.q).slice(0, 18);
		sres.toggleClass("is-open", S.q.trim().length > 1);
		if (S.q.trim().length > 1 && !hits.length) sres.createDiv({ cls: "mp-small mp-muted", text: "Tidak ditemukan." });
		for (const h of hits) { const b = sres.createEl("button", { cls: "mp-md-rchip is-link", text: `${h.s.icon} ${h.p.name}` }); b.title = h.s.name; b.onclick = () => { S.q = ""; openAnat(hub, h.s.id, h.p.id); }; }
	};
	inp.oninput = () => { S.q = inp.value; drawRes(); };
	drawRes();

	// mode
	const tb = el.createDiv("mp-an-tools");
	const seg = tb.createDiv("mp-an-seg");
	for (const [id, lbl] of [["jelajah", "🔍 Jelajah"], ["tunjuk", "👆 Kuis tunjuk"], ["nama", "🏷️ Kuis nama"]] as [Mode, string][]) {
		const b = seg.createEl("button", { cls: "mp-an-segb" + (S.mode === id ? " is-on" : ""), text: lbl });
		b.setAttribute("data-mode", id);
		b.onclick = () => { S.mode = id; if (id !== "jelajah") { S.sel = -1; S.group = -1; S.topic = ""; } hub.renderPage(); };
	}
	const pr = tb.createDiv("mp-a3-presets");
	for (const p of PRESETS) {
		const on = p.on.length === S.layers.length && p.on.every((x) => S.layers.includes(x));
		const b = pr.createEl("button", { cls: "mp-a3-preset" + (on ? " is-on" : ""), text: p.label });
		b.onclick = () => { S.layers = [...p.on]; v.showAll(); syncLayers(); drawLayerChips(); pr.querySelectorAll(".mp-a3-preset").forEach((x) => x.removeClass("is-on")); b.addClass("is-on"); };
	}

	// lapisan
	const lay = el.createDiv("mp-a3-layers");
	const drawLayerChips = () => {
		lay.empty();
		for (const l of LAYERS) {
			const on = S.layers.includes(l.id);
			const b = lay.createEl("button", { cls: "mp-a3-layer" + (on ? " is-on" : ""), attr: { "data-id": l.id, "aria-pressed": String(on) } });
			b.style.setProperty("--c", l.color);
			b.createSpan({ text: l.icon }); b.createSpan({ text: l.label });
			b.onclick = () => { S.layers = on ? S.layers.filter((x) => x !== l.id) : [...S.layers, l.id]; syncLayers(); drawLayerChips(); };
		}
	};
	drawLayerChips();

	const wrap = el.createDiv("mp-a3-wrap" + (S.mode !== "jelajah" ? " mp-mode-quiz" : ""));
	const stage = wrap.createDiv("mp-a3-stage");
	const labelsEl = stage.createDiv("mp-a3-labels");
	const panel = wrap.createDiv("mp-a3-panel");
	const loading = stage.createDiv({ cls: "mp-a3-loading", text: "Memuat model 3D…" });

	// toolbar di atas kanvas
	const ov = stage.createDiv("mp-a3-ov");
	const views: [string, string, Parameters<Atlas3D["view"]>[0]][] = [["D", "Depan", "depan"], ["B", "Belakang", "belakang"], ["Ki", "Sisi kiri", "kiri"], ["Ka", "Sisi kanan", "kanan"], ["A", "Atas", "atas"]];
	const vw = ov.createDiv("mp-a3-views");
	for (const [t, lbl, id] of views) { const b = vw.createEl("button", { cls: "mp-a3-vbtn", text: t, attr: { title: lbl, "aria-label": lbl } }); b.onclick = () => v.view(id); }
	const tools = ov.createDiv("mp-a3-tools");
	const tbtn = (icon: string, label: string, on: () => void, cls = "") => ibtn(tools, icon, label, on, "mp-mx-only-ic mp-mx-sm mp-a3-tbtn " + cls);
	tbtn("zoom-in", "Perbesar", () => v.zoom(0.8));
	tbtn("zoom-out", "Perkecil", () => v.zoom(1.25));
	tbtn("rotate-ccw", "Reset tampilan", () => { v.view("depan"); });
	const lb = tbtn("tag", "Label", () => { v.labelOn = !v.labelOn; lb.toggleClass("is-on", v.labelOn); v.requestRender(); }, v.labelOn ? "is-on" : "");
	const xb = tbtn("scan-eye", "Tembus pandang (X-ray) kulit & otot", () => { S.xray = !S.xray; xb.toggleClass("is-on", S.xray); applyXray(); }, S.xray ? "is-on" : "");
	const cb = tbtn("palette", "Warna fungsi otot & lobus otak", () => { S.alt = !S.alt; cb.toggleClass("is-on", S.alt); v.setAltColors(S.alt); }, S.alt ? "is-on" : "");
	tbtn("eye", "Tampilkan semua yang disembunyikan", () => { v.showAll(); refreshHiddenNote(); });
	tbtn("maximize", "Layar penuh", () => { wrap.toggleClass("is-full", !wrap.hasClass("is-full")); v.requestRender(); });

	// potongan
	const clipBar = stage.createDiv("mp-a3-clip");
	const clipSel = clipBar.createEl("select", { cls: "dropdown mp-a3-clipsel", attr: { "aria-label": "Potongan" } });
	for (const [val, lbl] of [["none", "✂️ Tanpa potongan"], ["z", "Potongan koronal"], ["x", "Potongan sagital"], ["y", "Potongan aksial"]]) clipSel.createEl("option", { value: val, text: lbl });
	clipSel.value = S.clip;
	const clipR = clipBar.createEl("input", { type: "range", cls: "mp-a3-cliprange", attr: { min: "0", max: "1", step: "0.005", "aria-label": "Posisi potongan" } });
	clipR.value = String(S.clipT);
	clipR.toggleClass("is-hidden", S.clip === "none");
	const applyClip = () => { v.setClip(S.clip, S.clipT); clipR.toggleClass("is-hidden", S.clip === "none"); };
	clipSel.onchange = () => { S.clip = clipSel.value as typeof S.clip; applyClip(); };
	clipR.oninput = () => { S.clipT = Number(clipR.value); applyClip(); };
	const hiddenNote = stage.createDiv("mp-a3-hidnote");
	const refreshHiddenNote = () => {
		const n = O.filter((o) => !o.defHidden && v.isHidden(o) && S.layers.includes(o.sys)).length;
		hiddenNote.empty(); hiddenNote.toggleClass("is-hidden", !n);
		if (n) { hiddenNote.createSpan({ text: `${n} struktur disembunyikan · ` }); const a = hiddenNote.createEl("a", { text: "tampilkan" }); a.onclick = () => { v.showAll(); refreshHiddenNote(); }; }
	};

	// pasang kanvas
	v.labelText = (o) => nameOf(o);
	v.attach(stage, labelsEl);
	function applyXray() {
		for (const id of ["9", "4"]) if (v.sys.has(id)) v.setOpacity(id, S.xray ? (id === "9" ? 0.14 : 0.13) : 1);
	}
	function syncLayers() {
		for (const l of LAYERS) v.setVisible(l.id, S.layers.includes(l.id));
		applyXray(); refreshHiddenNote();
	}
	// dekode geometri setelah halaman tampil agar tidak terasa macet
	window.setTimeout(() => {
		try {
			syncLayers();
			v.setClip(S.clip, S.clipT);
			if (S.alt !== v.altColors) v.setAltColors(S.alt);
			loading.remove();
			afterLoad();
		} catch (e) { console.error(e); loading.setText("Gagal memuat model 3D: " + (e as Error).message); }
	}, 30);

	const markSeen = (o: AObj) => {
		const a = (m.anatSeen!["3d"] ??= []);
		if (!a.includes(o.base)) { a.push(o.base); if (a.length > 5000) a.shift(); hub.plugin.requestSave(); }
	};

	// --- pilih objek
	const selectObj = (o: AObj | null, focus = false) => {
		S.sel = o ? o.i : -1; S.group = -1; S.topic = "";
		v.select(o);
		if (o) { markSeen(o); if (focus) v.focus([o]); S.tab = "info"; }
		drawPanel();
	};
	const selectGroup = (gi: number) => {
		S.group = gi; S.sel = -1; S.topic = "";
		const os = objsUnder(gi).map((i) => O[i]);
		for (const o of os) if (!S.layers.includes(o.sys)) { S.layers.push(o.sys); }
		syncLayers(); drawLayerChips();
		v.show(os.filter((o) => !o.defHidden));
		v.select(null, os.map((o) => o.i), groupName(groups()[gi])); v.focus(os);
		S.tab = "info"; drawPanel();
	};
	const selectTopic = (t: AnatTopic, focus = true) => {
		S.topic = t.id; S.sel = -1; S.group = -1;
		const os = objsForTopic(t);
		for (const o of os) if (!S.layers.includes(o.sys)) S.layers.push(o.sys);
		syncLayers(); drawLayerChips();
		if (os.length && !t.t.includes("sys:9")) { v.show(os); v.select(os.length === 1 ? os[0] : null, os.length > 1 ? os.map((o) => o.i) : [], t.name); if (focus) v.focus(os); }
		else v.select(null);
		S.tab = "info"; drawPanel();
	};

	let quizPick: ((o: AObj | null) => void) | null = null;
	v.opts.onPick = (o) => {
		if (S.mode !== "jelajah") { quizPick?.(o); return; }
		selectObj(o);
	};

	// --- panel kanan
	function drawPanel() {
		panel.empty();
		v.quiz = S.mode !== "jelajah"; v.requestRender();
		if (S.mode !== "jelajah") { quiz(hub, panel, v, (fn) => (quizPick = fn), () => S.layers, refreshHiddenNote); return; }
		quizPick = null;
		const tabs = panel.createDiv("mp-a3-tabs");
		for (const [id, lbl] of [["info", "ℹ️ Info"], ["materi", "📚 Materi"], ["daftar", "🌳 Daftar"]] as [Tab, string][]) {
			const b = tabs.createEl("button", { cls: "mp-a3-tab" + (S.tab === id ? " is-on" : ""), text: lbl, attr: { "data-tab": id } });
			b.onclick = () => { S.tab = id; drawPanel(); };
		}
		const body = panel.createDiv("mp-a3-pbody");
		if (S.tab === "materi") return renderMateri(hub, body, (t) => selectTopic(t));
		if (S.tab === "daftar") return renderTree(body, () => S.layers, (o) => selectObj(o, true), selectGroup);
		// info
		if (S.sel >= 0) return objCard(hub, body, O[S.sel], v, { selectGroup, selectTopic, refresh: () => { refreshHiddenNote(); drawPanel(); }, clear: () => selectObj(null) });
		if (S.group >= 0) return groupCard(hub, body, S.group, v, { selectObj: (o) => selectObj(o, true), refresh: refreshHiddenNote });
		if (S.topic) { const t = TOPICS.find((x) => x.id === S.topic); if (t) return topicCard(hub, body, t, v); }
		const e = body.createDiv("mp-a3-empty");
		e.createDiv({ cls: "mp-a3-empty-ic", text: "👆" });
		e.createDiv({ cls: "mp-strong", text: "Ketuk struktur pada model" });
		e.createDiv({ cls: "mp-small mp-muted", text: "Seret untuk memutar · cubit/scroll untuk memperbesar · dua jari/klik kanan untuk menggeser · ketuk dua kali untuk fokus." });
		const tips = e.createDiv("mp-a3-tips");
		for (const t of TOPICS.filter((x) => x.t.length).sort(() => Math.random() - 0.5).slice(0, 6)) {
			const b = tips.createEl("button", { cls: "mp-md-rchip is-link", text: `${tmeta(t).icon} ${t.name}` });
			b.onclick = () => selectTopic(t);
		}
	}
	function afterLoad() {
		if (S.resetHidden) { v.showAll(); S.resetHidden = false; }
		if (S.mode !== "jelajah") { drawPanel(); return; }
		if (S.sel >= 0) { const o = O[S.sel]; v.show([o]); v.select(o); if (S.pendingFocus) v.focus([o], false); }
		else if (S.topic) { const t = TOPICS.find((x) => x.id === S.topic); if (t) selectTopic(t, S.pendingFocus); }
		else if (S.group >= 0) selectGroup(S.group);
		S.pendingFocus = false;
		refreshHiddenNote();
		drawPanel();
	}
	drawPanel();
	disclaimer(el);
	attribution(el);
}

function attribution(el: HTMLElement) {
	const a = el.createDiv("mp-a3-attr mp-small mp-muted");
	a.createSpan({ text: "Model 3D: " });
	a.createEl("a", { text: "Z-Anatomy", href: "https://github.com/Z-Anatomy/Models-of-human-anatomy" });
	a.createSpan({ text: " (G. Kervyn, M. Zielinski), turunan " });
	a.createEl("a", { text: "BodyParts3D", href: "https://lifesciencedb.jp/bp3d/" });
	a.createSpan({ text: " © DBCLS — CC BY-SA. Definisi: Wikipedia (CC BY-SA). Model disederhanakan untuk MedPro; dibagikan ulang dengan lisensi CC BY-SA 4.0." });
}

// ---------------- kartu struktur ----------------
function objCard(hub: HubView, el: HTMLElement, o: AObj, v: Atlas3D, act: { selectGroup: (g: number) => void; selectTopic: (t: AnatTopic) => void; refresh: () => void; clear: () => void }) {
	const lay = LAYERS.find((l) => l.id === o.sys)!;
	const card = el.createDiv("mp-an-card is-part");
	card.style.setProperty("--pc", lay.color);
	card.createDiv({ cls: "mp-an-kicker", text: `${lay.icon} ${lay.label}${o.side ? (o.side === "l" ? " · kiri" : " · kanan") : ""}` });
	card.createEl("h3", { cls: "mp-an-name", text: nameOf(o) });
	const lat = latinOf(o.base);
	const sub = card.createDiv("mp-small mp-muted mp-a3-names");
	if (lat && lat !== nameOf(o.base)) sub.createDiv({ text: `Latin: ${lat}` });
	sub.createDiv({ text: `Inggris: ${cleanEn(o.base)}` });
	// rantai grup
	const chain = groupChain(o.g).slice(-4);
	if (chain.length) {
		const bc = card.createDiv("mp-a3-crumbs");
		bc.createSpan({ cls: "mp-small mp-muted", text: "Bagian dari:" });
		for (const g of chain) { const b = bc.createEl("button", { cls: "mp-md-rchip is-link", text: groupName(g) }); b.onclick = () => act.selectGroup(g.i); }
	}
	// aksi
	const ac = card.createDiv("mp-an-acts");
	ibtn(ac, "focus", "Fokus", () => v.focus([o]), "mp-mx-sm");
	ibtn(ac, "scan", "Isolasi", () => { v.isolate([o]); v.focus([o]); act.refresh(); }, "mp-mx-sm");
	ibtn(ac, "eye-off", "Sembunyikan", () => { v.hide([o]); act.clear(); act.refresh(); }, "mp-mx-sm");
	ibtn(ac, "copy", "Salin", () => copyText(`${nameOf(o)} (${lat || cleanEn(o.base)})`), "mp-mx-sm");
	ibtn(ac, "layers", "Buat flashcard", () => void cardsFor(hub, [o]), "mp-mx-sm");

	const ts = topicsFor(o);
	for (const t of ts.slice(0, 3)) topicBody(hub, card, t, ts.length > 1 || t.t.length > 1);
	const def = definition(o.base);
	if (def) {
		const w = acc(card, "📖", "Definisi (Wikipedia, bahasa Inggris)", !ts.length);
		w.createDiv({ cls: "mp-a3-def", text: def });
		w.createDiv({ cls: "mp-small mp-muted", text: "Sumber: Wikipedia, lewat Z-Anatomy — CC BY-SA." });
	}
	if (!ts.length && !def) card.createDiv({ cls: "mp-small mp-muted", text: "Belum ada materi untuk struktur ini. Gunakan nama Latin di atas untuk mencari di buku anatomi." });
}
/** Isi materi Indonesia untuk satu topik. */
function topicBody(hub: HubView, card: HTMLElement, t: AnatTopic, titled: boolean) {
	const wrap = card.createDiv("mp-a3-topic");
	if (titled) wrap.createDiv({ cls: "mp-a3-topic-h", text: `📚 ${t.name}` });
	if (t.approx) wrap.createDiv({ cls: "mp-a3-approx mp-small", text: "ℹ️ " + t.approx });
	wrap.createDiv({ cls: "mp-an-fn", text: t.fn });
	if (t.det) { const d = acc(wrap, "🔬", "Detail anatomi", false); d.createDiv({ cls: "mp-small", text: t.det }); }
	if (t.k.length) { const k = acc(wrap, "🩺", "Relevansi klinis", true); mlist(k, t.k); }
	const dz = t.dz.map((id) => DISEASES.find((d) => d.id === id)).filter(Boolean) as typeof DISEASES;
	if (dz.length) {
		const w = acc(wrap, "🦠", `Penyakit terkait (${dz.length})`, true);
		const row = w.createDiv("mp-an-dz");
		for (const d of dz) { const b = row.createEl("button", { cls: "mp-md-rchip is-link", text: d.name }); b.onclick = () => openDisease(hub, d.id); }
	}
	const pf = t.pf.map((id) => PFM.find((x) => x.id === id)).filter(Boolean) as typeof PFM;
	if (pf.length) {
		const w = acc(wrap, "🔍", "Cara memeriksa", false);
		const row = w.createDiv("mp-an-dz");
		for (const x of pf) { const b = row.createEl("button", { cls: "mp-md-rchip is-link", text: x.name }); b.onclick = () => openPfMat(hub, x.id); }
	}
}
function topicCard(hub: HubView, el: HTMLElement, t: AnatTopic, v: Atlas3D) {
	const mt = tmeta(t);
	const card = el.createDiv("mp-an-card is-part");
	card.style.setProperty("--pc", mt.color);
	card.createDiv({ cls: "mp-an-kicker", text: `${mt.icon} ${mt.name}` });
	card.createEl("h3", { cls: "mp-an-name", text: t.name });
	card.createDiv({ cls: "mp-small mp-muted", text: t.latin });
	const os = objsForTopic(t);
	const ac = card.createDiv("mp-an-acts");
	if (os.length) {
		ibtn(ac, "focus", "Fokus", () => v.focus(os), "mp-mx-sm");
		ibtn(ac, "scan", "Isolasi", () => { v.isolate(os); v.focus(os); }, "mp-mx-sm");
	} else card.createDiv({ cls: "mp-a3-approx mp-small", text: "ℹ️ Struktur ini tidak ada di model 3D Z-Anatomy (model tubuh pria dewasa, tanpa lapisan mikroskopis). Materinya tetap bisa dipelajari di sini." });
	ibtn(ac, "copy", "Salin", () => copyText(`${t.name} (${t.latin}): ${t.fn}`), "mp-mx-sm");
	ibtn(ac, "layers", "Buat flashcard", () => void topicCards(hub, [t]), "mp-mx-sm");
	topicBody(hub, card, t, false);
}
function groupCard(hub: HubView, el: HTMLElement, gi: number, v: Atlas3D, act: { selectObj: (o: AObj) => void; refresh: () => void }) {
	const G = groups(); const O = objects(); const g = G[gi];
	const os = objsUnder(gi).map((i) => O[i]);
	const card = el.createDiv("mp-an-card is-part");
	card.createDiv({ cls: "mp-an-kicker", text: "🌳 Grup struktur" });
	card.createEl("h3", { cls: "mp-an-name", text: groupName(g) });
	const lat = latinOf(g.name);
	card.createDiv({ cls: "mp-small mp-muted", text: [lat, g.name].filter(Boolean).join(" · ") + ` · ${os.length} objek` });
	const chain = groupChain(g.parent).slice(-3);
	if (chain.length) {
		const bc = card.createDiv("mp-a3-crumbs");
		bc.createSpan({ cls: "mp-small mp-muted", text: "Bagian dari:" });
		for (const x of chain) { const b = bc.createEl("button", { cls: "mp-md-rchip is-link", text: groupName(x) }); b.onclick = () => { S.group = x.i; hub.renderPage(); }; }
	}
	const ac = card.createDiv("mp-an-acts");
	ibtn(ac, "focus", "Fokus", () => v.focus(os), "mp-mx-sm");
	ibtn(ac, "scan", "Isolasi grup", () => { v.isolate(os); v.focus(os); act.refresh(); }, "mp-mx-sm");
	ibtn(ac, "eye-off", "Sembunyikan grup", () => { v.hide(os); v.select(null); act.refresh(); }, "mp-mx-sm");
	ibtn(ac, "layers", "Buat flashcard", () => void cardsFor(hub, os), "mp-mx-sm");
	topicIndex();
	for (const t of GROUP2T!.get(g.name) ?? []) topicBody(hub, card, t, true);
	const def = definition(g.name);
	if (def) { const w = acc(card, "📖", "Definisi (Wikipedia, bahasa Inggris)", false); w.createDiv({ cls: "mp-a3-def", text: def }); }
	if (g.children.length) {
		const w = acc(card, "📂", `Subgrup (${g.children.length})`, true);
		const row = w.createDiv("mp-an-dz");
		for (const c of g.children.slice(0, 60)) { const b = row.createEl("button", { cls: "mp-md-rchip is-link", text: groupName(G[c]) }); b.onclick = () => { S.group = c; hub.renderPage(); }; }
	}
	const direct = g.objs.map((i) => O[i]);
	if (direct.length) {
		const w = acc(card, "🧩", `Struktur (${direct.length})`, true);
		const row = w.createDiv("mp-an-dz");
		const seen = new Set<string>();
		for (const o of direct) { const k = o.base; if (seen.has(k)) continue; seen.add(k); const b = row.createEl("button", { cls: "mp-md-rchip is-link", text: nameOf(o.base) }); b.onclick = () => act.selectObj(o); }
	}
}

// ---------------- daftar materi & pohon ----------------
function renderMateri(hub: HubView, el: HTMLElement, pick: ((t: AnatTopic) => void) | null) {
	el.createDiv({ cls: "mp-small mp-muted", text: `${TOPICS.length} materi anatomi berbahasa Indonesia, lengkap dengan relevansi klinis, penyakit terkait, dan cara memeriksa. Ketuk untuk melihatnya di model 3D.` });
	const byT = new Map<string, AnatTopic[]>();
	for (const t of TOPICS) { const a = byT.get(t.topic) ?? []; a.push(t); byT.set(t.topic, a); }
	const seen = new Set(st(hub).anatSeen?.["3d"] ?? []);
	for (const [k, ts] of byT) {
		const mt = TOPIC_META[k] ?? { name: k, icon: "🫀", color: "#e11d48" };
		const w = acc(el, mt.icon, `${mt.name} (${ts.length})`, false);
		const row = w.createDiv("mp-an-list");
		for (const t of ts) {
			const b = row.createEl("button", { cls: "mp-an-li" + (!t.t.length ? " is-flat" : "") + (t.t.some((x) => seen.has(x)) ? " is-seen" : ""), text: t.name });
			b.style.setProperty("--c", mt.color);
			if (!t.t.length) b.title = "Tanpa model 3D";
			b.onclick = () => (pick ? pick(t) : openAnat(hub, t.topic, t.id));
		}
	}
}
function renderTree(el: HTMLElement, layers: () => string[], pickObj: (o: AObj) => void, pickGroup: (g: number) => void) {
	const G = groups(); const O = objects();
	const lay = new Set(layers());
	el.createDiv({ cls: "mp-small mp-muted", text: "Jelajahi hierarki Terminologia Anatomica. Ketuk nama grup untuk menyorot seluruh anggotanya." });
	const hasVisible = (gi: number) => objsUnder(gi).some((i) => lay.has(O[i].sys));
	const roots = G.filter((g) => g.parent < 0 && hasVisible(g.i));
	const build = (parent: HTMLElement, gi: number, depth: number) => {
		const g = G[gi];
		const d = parent.createEl("details", { cls: "mp-a3-tnode" });
		const s = d.createEl("summary");
		const nm = s.createSpan({ cls: "mp-a3-tname", text: groupName(g) });
		s.createSpan({ cls: "mp-a3-tcount", text: String(objsUnder(gi).filter((i) => lay.has(O[i].sys)).length) });
		nm.onclick = (e) => { e.preventDefault(); pickGroup(gi); };
		let built = false;
		d.addEventListener("toggle", () => {
			if (!d.open || built) return; built = true;
			const inner = d.createDiv("mp-a3-tkids");
			for (const c of g.children) if (hasVisible(c)) build(inner, c, depth + 1);
			const seen = new Set<string>();
			for (const i of g.objs) {
				const o = O[i]; if (!lay.has(o.sys) || seen.has(o.base)) continue; seen.add(o.base);
				const b = inner.createEl("button", { cls: "mp-a3-tleaf" + (hasIdName(o.base) ? " is-id" : ""), text: nameOf(o.base) });
				b.onclick = () => pickObj(o);
			}
		});
	};
	if (!roots.length) el.createDiv({ cls: "mp-small mp-muted", text: "Aktifkan minimal satu lapisan." });
	for (const r of roots) build(el, r.i, 0);
}

// ---------------- kuis 3D ----------------
function quiz(hub: HubView, el: HTMLElement, v: Atlas3D, setPick: (fn: (o: AObj | null) => void) => void, layers: () => string[], refresh: () => void) {
	const m = st(hub);
	const lay = new Set(layers());
	const O = objects();
	// kumpulan soal: struktur bernama Indonesia/umum, cukup besar, di lapisan yang tampil
	const seen = new Set<string>();
	const pool = O.filter((o) => {
		if (!lay.has(o.sys) || o.defHidden || v.isHidden(o) || o.r < 0.012 || seen.has(o.base)) return false;
		if (!hasIdName(o.base)) return false;
		seen.add(o.base); return true;
	});
	const card = el.createDiv("mp-an-card");
	if (pool.length < 4) {
		card.createDiv({ cls: "mp-strong", text: "Soal belum cukup" });
		card.createDiv({ cls: "mp-small mp-muted", text: "Aktifkan lapisan lain (mis. Tulang, Organ dalam, atau Jantung & pembuluh), atau tampilkan lagi struktur yang disembunyikan, agar ada cukup struktur untuk kuis." });
		btn(card, { text: "Tampilkan semua struktur", icon: "eye", cls: "mp-btn-primary", onClick: () => { v.showAll(); el.empty(); quiz(hub, el, v, setPick, layers, refresh); } });
		return;
	}
	const N = Math.min(10, pool.length);
	const qs = [...pool].sort(() => Math.random() - 0.5).slice(0, N);
	const key = "3d-" + S.mode;
	let i = 0, score = 0, locked = false;
	const next = () => {
		card.empty(); locked = false; v.select(null);
		if (i >= N) {
			const pct = Math.round((score / N) * 100);
			const best = Math.max(m.anatBest![key] ?? 0, pct); m.anatBest![key] = best;
			hub.plugin.addCoins(score * 2); hub.plugin.requestSave();
			card.createDiv({ cls: "mp-an-kicker", text: "Hasil kuis 3D" });
			card.createEl("h3", { cls: "mp-an-name", text: `${score}/${N} benar (${pct}%)` });
			card.createDiv({ cls: "mp-small mp-muted", text: `Skor terbaik: ${best}% · +${score * 2} koin` });
			if (pct >= 80) { play("chime"); if (hub.plugin.data.settings.confetti !== false) confetti(card); }
			btn(card, { text: "Ulangi", icon: "rotate-ccw", cls: "mp-btn-primary", onClick: () => { i = 0; score = 0; next(); } });
			btn(card, { text: "Kembali ke jelajah", icon: "compass", onClick: () => { S.mode = "jelajah"; hub.renderPage(); } });
			return;
		}
		const q = qs[i];
		card.createDiv({ cls: "mp-an-kicker", text: `Soal ${i + 1} dari ${N} · skor ${score}` });
		const bar = card.createDiv("mp-mx-bar is-thin"); bar.createDiv("mp-mx-bar-f").style.width = `${(i / N) * 100}%`;
		if (S.mode === "tunjuk") {
			card.createDiv({ cls: "mp-an-qlabel", text: "Ketuk struktur ini pada model:" });
			card.createDiv({ cls: "mp-an-qname", text: nameOf(q.base) });
			const lat = latinOf(q.base); if (lat) card.createDiv({ cls: "mp-small mp-muted", text: lat });
			const skip = card.createEl("button", { cls: "mp-md-rchip is-link", text: "🙈 Tunjukkan jawabannya" });
			skip.onclick = () => { if (locked) return; locked = true; v.select(q); v.focus([q]); card.createDiv({ cls: "mp-an-fb is-wrong", text: "Ini dia. Coba ingat letaknya." }); i++; window.setTimeout(next, 1800); };
			setPick((o) => {
				if (locked || !o) return;
				locked = true;
				const ok = o.base === q.base;
				if (ok) { score++; play("correct"); v.select(o); card.createDiv({ cls: "mp-an-fb is-right", text: "✓ Tepat!" }); }
				else { play("wrong"); v.select(q, [o.i]); v.focus([q, o]); card.createDiv({ cls: "mp-an-fb is-wrong", text: `✗ Itu ${nameOf(o)}. Yang benar disorot biru.` }); }
				i++; window.setTimeout(next, ok ? 1100 : 2200);
			});
		} else {
			v.select(q); v.focus([q]);
			card.createDiv({ cls: "mp-an-qlabel", text: "Struktur yang disorot biru adalah…" });
			const others = pool.filter((p) => p.base !== q.base);
			const same = others.filter((p) => p.sys === q.sys).sort(() => Math.random() - 0.5);
			const opts = [q, ...[...same, ...others].filter((x, k, a) => a.findIndex((y) => y.base === x.base) === k).slice(0, 3)].sort(() => Math.random() - 0.5);
			const box = card.createDiv("mp-pf-qopts");
			for (const o of opts) {
				const b = box.createEl("button", { cls: "mp-pf-qopt mp-an-opt", text: nameOf(o.base) });
				b.onclick = () => {
					if (locked) return; locked = true;
					box.querySelectorAll("button").forEach((z) => { (z as HTMLButtonElement).disabled = true; if (z.textContent === nameOf(q.base)) z.addClass("is-right"); });
					if (o.base === q.base) { score++; play("correct"); } else { b.addClass("is-wrong"); play("wrong"); }
					i++; window.setTimeout(next, 1200);
				};
			}
			setPick(() => {});
		}
	};
	refresh();
	if (S.mode === "tunjuk") v.view("depan");
	next();
}

// ---------------- flashcard ----------------
async function cardsFor(hub: HubView, os: AObj[]) {
	const seen = new Set<string>(); const L: string[] = [];
	for (const o of os) {
		if (seen.has(o.base)) continue; seen.add(o.base);
		const lat = latinOf(o.base); const nm = nameOf(o.base);
		const ts = topicsFor(o).filter((t) => !t.t.includes("sys:9"));
		if (lat && lat !== nm) L.push(`Nama Latin ${nm}? :: ${lat}`);
		else L.push(`Nama Indonesia/Latin untuk "${cleanEn(o.base)}"? :: ${nm}`);
		for (const t of ts.slice(0, 1)) { L.push(`Fungsi ${t.name}? :: ${t.fn}`); if (t.k[0]) L.push(`Relevansi klinis ${t.name}? :: ${t.k.join("; ")}`); }
	}
	await writeCards(hub, L);
}
async function topicCards(hub: HubView, ts: AnatTopic[]) {
	const L: string[] = [];
	for (const t of ts) { L.push(`Fungsi ${t.name}? :: ${t.fn}`); if (t.k[0]) L.push(`Relevansi klinis ${t.name}? :: ${t.k.join("; ")}`); if (t.latin) L.push(`Nama Latin ${t.name}? :: ${t.latin}`); }
	await writeCards(hub, L);
}
async function writeCards(hub: HubView, lines: string[]) {
	if (!lines.length) return;
	const p = hub.plugin;
	const path = `${p.data.settings.noteFolder || "MedPro"}/Anatomi/Atlas 3D`;
	const body = ["#flashcards", "", `> Ditambahkan oleh MedPro dari atlas anatomi 3D — ${new Date().toLocaleDateString("id-ID")}.`, "", ...lines].join("\n");
	const f = await p.appendToNote(path, body);
	if (f) { new Notice(`🃏 ${lines.length} kartu ditambahkan ke ${f.path}`); play("chime"); }
}
