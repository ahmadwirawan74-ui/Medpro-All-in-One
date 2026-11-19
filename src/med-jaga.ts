/**
 * Jaga & SBAR MedPro: daftar tugas jaga per pasien (dengan jam & prioritas, pengingat otomatis), serta serah terima
 * SBAR yang disusun otomatis dari data CPPT (bisa diedit, disalin, atau diekspor PDF).
 */
import { Notice } from "obsidian";
import type { HubView } from "./hub-view";
import { cppt, cpptOpenPatient, CpptNote, CpptPatient, CpptState, CpptVit } from "./med-cppt";
import { copyText, disclaimer, med } from "./medis";
import { chipRow, ibtn, nrm } from "./med-ui";
import { footerPages, kop, newPdf, para, pdfSafe, savePdf } from "./med-pdf";
import { play } from "./sound";
import { btn } from "./util";
import type MedProPlugin from "./main";

export interface JagaTask { id: string; text: string; pid?: string; due?: number; done?: boolean; t: number; pri?: "tinggi" | "normal"; notified?: boolean; doneAt?: number }
export interface JagaState { tasks: JagaTask[]; sbar: Record<string, string>; shift: string }
export function jaga(p: MedProPlugin): JagaState {
	const m = med(p) as ReturnType<typeof med> & { jaga?: JagaState };
	m.jaga ??= { tasks: [], sbar: {}, shift: "" };
	m.jaga.tasks ??= []; m.jaga.sbar ??= {}; m.jaga.shift ??= "";
	return m.jaga;
}
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const hm = (t: number) => new Date(t).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
const dmy = (t: number) => new Date(t).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
const TPL = ["Cek GDS", "Cek hasil lab", "Visite ulang", "Observasi TTV", "Evaluasi nyeri", "Ganti/cek infus", "Konsul spesialis", "Edukasi keluarga", "Cek balans cairan", "Persiapan pulang"];

/** Periksa tugas yang jatuh tempo & tampilkan pengingat (dipanggil tiap menit oleh plugin). */
export function checkReminders(p: MedProPlugin) {
	const j = jaga(p);
	const now = Date.now();
	const pts = (med(p) as { cppt?: CpptState }).cppt?.patients ?? [];
	let changed = false;
	for (const t of j.tasks) {
		if (t.done || t.notified || !t.due || t.due > now) continue;
		t.notified = true; changed = true;
		const pt = pts.find((x) => x.id === t.pid);
		new Notice(`⏰ Tugas jaga${t.pri === "tinggi" ? " (PENTING)" : ""}: ${t.text}${pt ? ` — ${pt.name}${pt.room ? ` (${pt.room})` : ""}` : ""}`, 12000);
		play("chime");
	}
	if (changed) { p.requestSave(); p.refreshViews(); }
}

const S = { tab: "tugas", pid: "", text: "", time: "", pri: "normal" as "tinggi" | "normal", showDone: false };

export function renderJaga(hub: HubView, el: HTMLElement) {
	const p = hub.plugin;
	const j = jaga(p);
	const c = cppt(hub);
	const act = c.patients.filter((x) => !x.done);
	const now = Date.now();
	const open = j.tasks.filter((t) => !t.done);
	const late = open.filter((t) => t.due && t.due < now);
	const head = el.createDiv("mp-mx-pagehead");
	const ht = head.createDiv("mp-grow");
	ht.createEl("h2", { text: "📋 Jaga & SBAR" });
	ht.createDiv({ cls: "mp-small mp-muted", text: `${open.length} tugas terbuka${late.length ? ` · ${late.length} terlambat` : ""} · ${act.length} pasien aktif` });
	ibtn(head, "copy", "Salin semua SBAR", () => copyText(act.map((pt) => sbarText(hub, c, pt)).join("\n\n—————\n\n") || "Tidak ada pasien aktif", "SBAR semua pasien disalin"));
	ibtn(head, "file-down", "PDF serah terima", () => void handoverPdf(hub), "mp-jg-pdf");
	chipRow(el, [{ id: "tugas", label: "Tugas jaga", icon: "✅", n: open.length }, { id: "sbar", label: "Serah terima SBAR", icon: "🔁", n: act.length }], S.tab, (v) => { S.tab = v; hub.renderPage(); }, "mp-jg-tabs");
	if (S.tab === "tugas") tasks(hub, el, j, act);
	else sbarView(hub, el, c, act);
	disclaimer(el);
}

// ================================================================ tugas
function tasks(hub: HubView, el: HTMLElement, j: JagaState, act: CpptPatient[]) {
	const p = hub.plugin;
	const add = el.createDiv("mp-md-card mp-jg-add");
	const r = add.createDiv("mp-jg-addrow");
	const inp = r.createEl("input", { type: "text", cls: "mp-md-in mp-jg-text", attr: { placeholder: "Tugas baru… (mis. Cek GDS jam 22, konsul bedah)" } });
	inp.value = S.text;
	inp.oninput = () => (S.text = inp.value);
	const tm = r.createEl("input", { type: "time", cls: "mp-md-in mp-jg-time" });
	tm.value = S.time;
	tm.onchange = () => (S.time = tm.value);
	const sel = r.createEl("select", { cls: "dropdown mp-jg-pt" });
	sel.createEl("option", { text: "— tanpa pasien —", value: "" });
	for (const pt of act) sel.createEl("option", { text: `${pt.name}${pt.room ? ` · ${pt.room}` : ""}`, value: pt.id });
	sel.value = S.pid;
	sel.onchange = () => (S.pid = sel.value);
	const pri = r.createEl("button", { cls: "mp-mx-chip mp-jg-pri" + (S.pri === "tinggi" ? " is-on" : ""), text: "❗ Penting" });
	pri.style.setProperty("--c", "#ef4444");
	pri.onclick = () => { S.pri = S.pri === "tinggi" ? "normal" : "tinggi"; pri.toggleClass("is-on", S.pri === "tinggi"); };
	const doAdd = () => {
		const text = inp.value.trim();
		if (!text) { inp.focus(); return; }
		let due: number | undefined;
		if (S.time) { const [h, m] = S.time.split(":").map(Number); const d = new Date(); d.setHours(h, m, 0, 0); if (d.getTime() < Date.now() - 6 * 3600e3) d.setDate(d.getDate() + 1); due = d.getTime(); }
		j.tasks.push({ id: uid(), text, pid: S.pid || undefined, due, t: Date.now(), pri: S.pri });
		S.text = ""; S.time = ""; S.pri = "normal";
		p.requestSave(); play("click"); hub.renderPage();
	};
	inp.onkeydown = (e) => { if (e.key === "Enter") doAdd(); };
	btn(r, { text: "Tambah", icon: "plus", cls: "mp-btn-primary mp-jg-addbtn", onClick: doAdd });
	const tp = add.createDiv("mp-cp-tpl");
	for (const t of TPL) { const b = tp.createEl("button", { cls: "mp-md-rchip is-link", text: `+ ${t}` }); b.onclick = () => { inp.value = S.text = (S.text ? S.text + "; " : "") + t; inp.focus(); }; }

	const now = Date.now();
	const open = j.tasks.filter((t) => !t.done);
	const sorted = (xs: JagaTask[]) => xs.sort((a, b) => (a.due ?? 9e15) - (b.due ?? 9e15) || (a.pri === "tinggi" ? -1 : 1));
	const groups: [string, string, JagaTask[]][] = [
		["⏰ Terlambat", "is-late", sorted(open.filter((t) => t.due && t.due < now))],
		["🕑 Berikutnya", "", sorted(open.filter((t) => t.due && t.due >= now))],
		["📝 Tanpa jam", "", sorted(open.filter((t) => !t.due))],
	];
	const list = el.createDiv("mp-jg-list");
	if (!j.tasks.length) { const e = list.createDiv("mp-cp-empty"); e.createDiv({ cls: "mp-cp-empty-ic", text: "✅" }); e.createDiv({ cls: "mp-strong", text: "Belum ada tugas jaga" }); e.createDiv({ cls: "mp-small mp-muted", text: "Tambahkan tugas dengan jam — MedPro akan mengingatkan saat jatuh tempo (selama Obsidian terbuka)." }); }
	for (const [title, cls, xs] of groups) {
		if (!xs.length) continue;
		list.createDiv({ cls: "mp-dz-cat " + cls, text: `${title} (${xs.length})` });
		for (const t of xs) row(hub, list, j, t, act, cls);
	}
	const done = j.tasks.filter((t) => t.done).sort((a, b) => (b.doneAt ?? 0) - (a.doneAt ?? 0));
	if (done.length) {
		const d = list.createEl("details", { cls: "mp-md-det" });
		d.open = S.showDone;
		d.ontoggle = () => (S.showDone = d.open);
		d.createEl("summary", { text: `✔️ Selesai (${done.length})` });
		for (const t of done.slice(0, 50)) row(hub, d, j, t, act, "is-done");
		btn(d, { text: "Bersihkan tugas selesai", icon: "trash", cls: "mp-btn-sm", onClick: () => { j.tasks = j.tasks.filter((x) => !x.done); p.requestSave(); hub.renderPage(); } });
	}
}
function row(hub: HubView, parent: HTMLElement, j: JagaState, t: JagaTask, pts: CpptPatient[], cls: string) {
	const p = hub.plugin;
	const r = parent.createDiv("mp-jg-row " + cls + (t.pri === "tinggi" ? " is-pri" : ""));
	const cb = r.createEl("input", { type: "checkbox", cls: "mp-jg-cb" });
	cb.checked = !!t.done;
	cb.onchange = () => { t.done = cb.checked; t.doneAt = cb.checked ? Date.now() : undefined; p.requestSave(); if (cb.checked) play("correct"); window.setTimeout(() => hub.renderPage(), 180); };
	const b = r.createDiv("mp-grow");
	b.createDiv({ cls: "mp-jg-t", text: (t.pri === "tinggi" ? "❗ " : "") + t.text });
	const meta = b.createDiv("mp-jg-meta");
	if (t.due) meta.createSpan({ cls: "mp-jg-due", text: `🕑 ${hm(t.due)}${new Date(t.due).toDateString() !== new Date().toDateString() ? ` (${dmy(t.due)})` : ""}` });
	const pt = pts.find((x) => x.id === t.pid);
	if (pt) { const c = meta.createEl("button", { cls: "mp-md-rchip is-link mp-jg-ptchip", text: `👤 ${pt.name}${pt.room ? ` · ${pt.room}` : ""}` }); c.onclick = () => cpptOpenPatient(hub, pt.id); }
	ibtn(r, "alarm-clock-plus", "Tunda 30 menit", () => { t.due = Math.max(Date.now(), t.due ?? Date.now()) + 30 * 60e3; t.notified = false; p.requestSave(); hub.renderPage(); }, "mp-mx-only-ic mp-mx-sm");
	ibtn(r, "trash", "Hapus", () => { j.tasks = j.tasks.filter((x) => x.id !== t.id); p.requestSave(); hub.renderPage(); }, "mp-mx-only-ic mp-mx-sm");
}

// ================================================================ SBAR
const VL: [keyof CpptVit, string, string][] = [["td", "TD", "mmHg"], ["n", "N", "x/mnt"], ["rr", "RR", "x/mnt"], ["t", "T", "°C"], ["spo2", "SpO₂", "%"], ["gcs", "GCS", ""], ["nyeri", "Nyeri", "/10"], ["gds", "GDS", "mg/dL"]];
const vit = (v: CpptVit) => VL.filter(([k]) => v[k]).map(([k, l, u]) => `${l} ${v[k]}${u ? (u.startsWith("/") ? u : " " + u) : ""}`).join(", ");
const fnum = (s?: string) => { const n = parseFloat((s ?? "").replace(",", ".")); return isFinite(n) ? n : NaN; };
function ageOf(pt: CpptPatient) {
	if (pt.dob) { const b = new Date(pt.dob); if (!isNaN(b.getTime())) { const y = Math.floor((Date.now() - b.getTime()) / (365.25 * 864e5)); return y >= 2 ? `${y} th` : `${Math.floor((Date.now() - b.getTime()) / (30.4 * 864e5))} bln`; } }
	return pt.age;
}
function trend(ns: CpptNote[]): string {
	const w = ns.filter((n) => Object.keys(n.vit).length);
	if (w.length < 2) return "";
	const [a, b] = [w[1].vit, w[0].vit];
	const out: string[] = [];
	const cmp = (lbl: string, x: number, y: number, better: "down" | "up") => { if (!isFinite(x) || !isFinite(y) || x === y) return; const up = y > x; out.push(`${lbl} ${up ? "↑" : "↓"} (${x}→${y})${(better === "down") === !up ? " membaik" : " memburuk"}`); };
	cmp("suhu", fnum(a.t), fnum(b.t), "down"); cmp("nadi", fnum(a.n), fnum(b.n), "down"); cmp("SpO₂", fnum(a.spo2), fnum(b.spo2), "up"); cmp("nyeri", fnum(a.nyeri), fnum(b.nyeri), "down");
	return out.length ? `Tren: ${out.join("; ")}` : "";
}
export function sbarText(hub: HubView, c: CpptState, pt: CpptPatient): string {
	const j = jaga(hub.plugin);
	if (j.sbar[pt.id]?.trim()) return j.sbar[pt.id];
	const ns = c.notes.filter((n) => n.pid === pt.id).sort((a, b) => b.t - a.t);
	const last = ns[0];
	const first = ns[ns.length - 1];
	const dx = last?.dx.map((d) => (d.icd ? `${d.name} (${d.icd})` : d.name)).join("; ") || "—";
	const tasks = j.tasks.filter((t) => t.pid === pt.id && !t.done).map((t) => `${t.due ? `[${hm(t.due)}] ` : ""}${t.text}`);
	const S = `S: ${pt.name}, ${[pt.sex, ageOf(pt)].filter(Boolean).join("/")}${pt.room ? `, ${pt.room}` : ""}${pt.rm ? `, RM ${pt.rm}` : ""}. Dx: ${dx}.${last?.s.trim() ? ` Keluhan terkini: ${last.s.trim().replace(/\n/g, " ")}` : ""}`;
	const B = `B: Dirawat sejak ${dmy(pt.created)}${first && first !== last && first.s.trim() ? `; awal: ${first.s.trim().replace(/\n/g, " ").slice(0, 160)}` : ""}. Alergi: ${pt.allergy || "tidak ada"}. DPJP: ${pt.dpjp || "—"}.`;
	const A = `A: ${last ? `TTV (${hm(last.t)} ${dmy(last.t)}): ${vit(last.vit) || "—"}.` : "Belum ada catatan."}${last?.a.trim() ? ` ${last.a.trim().replace(/\n/g, " ")}` : ""}${trend(ns) ? ` ${trend(ns)}.` : ""}`;
	const R = `R: ${[last?.instr.trim(), last?.p.trim() ? `Terapi: ${last.p.trim().replace(/\n/g, "; ")}` : "", tasks.length ? `Tugas tertunda: ${tasks.join("; ")}` : ""].filter(Boolean).join(" ") || "Lanjutkan pemantauan."}`;
	return [S, B, A, R].join("\n");
}
function sbarView(hub: HubView, el: HTMLElement, c: CpptState, act: CpptPatient[]) {
	const p = hub.plugin;
	const j = jaga(p);
	const sh = el.createDiv("mp-md-card mp-jg-shift");
	sh.createDiv({ cls: "mp-md-card-h", text: "🗒️ Catatan umum shift" });
	const st = sh.createEl("textarea", { cls: "mp-md-note mp-cp-ta", attr: { placeholder: "Info umum untuk dokter jaga berikutnya (bed kosong, pasien rencana masuk, obat kosong, dll.)", rows: "2" } });
	st.value = j.shift; st.oninput = () => { j.shift = st.value; p.requestSave(); };
	if (!act.length) { el.createDiv({ cls: "mp-md-empty", text: "Belum ada pasien aktif di CPPT. Tambahkan pasien & catatan SOAP — SBAR akan tersusun otomatis." }); btn(el, { text: "Buka CPPT", icon: "clipboard-list", cls: "mp-btn-primary", onClick: () => hub.navigate("medcppt") }); return; }
	const q = el.createDiv("mp-md-search mp-mx-search");
	q.createSpan({ cls: "mp-md-search-ic", text: "🔎" });
	const qi = q.createEl("input", { type: "text", cls: "mp-md-search-in", attr: { placeholder: "Saring pasien…" } });
	const grid = el.createDiv("mp-jg-sbars");
	const draw = () => {
		grid.empty();
		const k = nrm(qi.value);
		for (const pt of act.filter((x) => !k || nrm(`${x.name} ${x.room} ${x.rm}`).includes(k))) {
			const card = grid.createDiv("mp-jg-sbar");
			const h = card.createDiv("mp-jg-sbar-h");
			const nm = h.createEl("button", { cls: "mp-md-rchip is-link mp-strong", text: `👤 ${pt.name}` });
			nm.onclick = () => cpptOpenPatient(hub, pt.id);
			if (pt.room) h.createSpan({ cls: "mp-mx-pill", text: pt.room });
			if (pt.allergy) h.createSpan({ cls: "mp-cp-allergy is-mini", text: `⚠ ${pt.allergy}` });
			h.createDiv("mp-grow");
			const edited = !!j.sbar[pt.id]?.trim();
			if (edited) h.createSpan({ cls: "mp-small mp-muted", text: "✏️ disunting" });
			const ta = card.createEl("textarea", { cls: "mp-md-note mp-cp-ta mp-jg-sbarta" });
			ta.value = sbarText(hub, c, pt);
			const fit = () => { ta.style.height = "auto"; ta.style.height = `${Math.min(480, ta.scrollHeight + 2)}px`; };
			ta.oninput = () => { j.sbar[pt.id] = ta.value; p.requestSave(); fit(); };
			window.setTimeout(fit, 0);
			const a = card.createDiv("mp-dz-links");
			btn(a, { text: "Salin", icon: "copy", cls: "mp-btn-sm", onClick: () => copyText(ta.value, `SBAR ${pt.name} disalin`) });
			if (edited) btn(a, { text: "Susun ulang dari CPPT", icon: "refresh-cw", cls: "mp-btn-sm", onClick: () => { delete j.sbar[pt.id]; p.requestSave(); draw(); } });
		}
	};
	qi.oninput = draw;
	draw();
}

async function handoverPdf(hub: HubView) {
	const p = hub.plugin;
	const c = cppt(hub);
	const j = jaga(p);
	const act = c.patients.filter((x) => !x.done);
	const cx = newPdf("a4");
	const { doc, W, H, M } = cx;
	const d = med(p).doc!;
	kop(cx, c.header.faskes || "Serah Terima Jaga", [c.header.unit ? `Unit: ${c.header.unit}` : "", `Dibuat ${new Date().toLocaleString("id-ID")} oleh ${d.name ? (d.name.toLowerCase().startsWith("dr") ? d.name : `dr. ${d.name}`) : "dokter jaga"}`], "SBAR");
	doc.setFont("helvetica", "bold"); doc.setFontSize(12);
	doc.text("SERAH TERIMA PASIEN (SBAR)", W / 2, cx.y + 3, { align: "center" }); cx.y += 9;
	if (j.shift.trim()) { cx.y += para(cx, `Catatan shift: ${j.shift.trim()}`, M, W - 2 * M, 9.5, "italic") + 3; }
	for (const pt of act) {
		const txt = sbarText(hub, c, pt);
		const lines = txt.split("\n");
		doc.setFont("helvetica", "normal"); doc.setFontSize(9);
		const need = lines.reduce((a, l) => a + (doc.splitTextToSize(pdfSafe(l), W - 2 * M - 8) as string[]).length * 4.3, 0) + 12;
		if (cx.y + need > H - 18) { doc.addPage(); cx.y = M; }
		doc.setFillColor(230, 242, 250); doc.rect(M, cx.y, W - 2 * M, 7, "F");
		doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(10, 60, 100);
		doc.text(pdfSafe(`${pt.name}${pt.room ? ` · ${pt.room}` : ""}${pt.rm ? ` · RM ${pt.rm}` : ""}${pt.allergy ? `  [ALERGI: ${pt.allergy}]` : ""}`), M + 2, cx.y + 4.8);
		doc.setTextColor(0); cx.y += 9;
		for (const l of lines) { cx.y += para(cx, l, M + 4, W - 2 * M - 8, 9, "normal", 1.3) + 0.8; }
		cx.y += 4;
	}
	const free = j.tasks.filter((t) => !t.done && !t.pid);
	if (free.length) { if (cx.y > H - 40) { doc.addPage(); cx.y = M; } doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.text("Tugas lain yang belum selesai", M, cx.y + 4); cx.y += 6; for (const t of free) cx.y += para(cx, `[ ] ${t.due ? hm(t.due) + " " : ""}${t.text}`, M + 4, W - 2 * M - 8, 9) + 0.5; }
	if (cx.y > H - 40) { doc.addPage(); cx.y = M; }
	cx.y += 10;
	doc.setFont("helvetica", "normal"); doc.setFontSize(9);
	doc.text("Yang menyerahkan,", M + 10, cx.y); doc.text("Yang menerima,", W - M - 50, cx.y);
	doc.text("(………………………………)", M + 10, cx.y + 22); doc.text("(………………………………)", W - M - 50, cx.y + 22);
	footerPages(cx, "Serah terima jaga · RAHASIA — berisi data pasien");
	if (!act.length && !free.length) { new Notice("Tidak ada pasien aktif atau tugas untuk diserahterimakan."); return; }
	await savePdf(p, cx, "CPPT", "Serah terima SBAR");
}

/** Buka halaman tugas jaga dengan pasien terpilih (dipanggil dari CPPT). */
export function jagaForPatient(hub: HubView, pid: string) { S.tab = "tugas"; S.pid = pid; hub.navigate("medjaga"); }
