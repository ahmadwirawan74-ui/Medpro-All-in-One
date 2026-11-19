// Komponen antarmuka bersama untuk bagian Medis (v22): warna sistem, chip, akordeon, kartu sekilas,
// mode hafalan, dan pencarian global. Semua memakai variabel tema --mp-* agar cocok di semua gaya.
import { setIcon } from "obsidian";

export const SYS_COLOR: Record<string, string> = {
	saraf: "#8b5cf6", psikiatri: "#ec4899", indra: "#06b6d4", respirasi: "#0ea5e9", kardio: "#ef4444", gi: "#f59e0b",
	ginjal: "#b45309", reproduksi: "#db2777", endokrin: "#65a30d", hemato: "#dc2626", muskulo: "#64748b", kulit: "#f97316",
	forensik: "#475569", umum: "#0d9488", anak: "#16a34a", lain: "#0d9488", mata: "#06b6d4", tht: "#0891b2", abdomen: "#d97706",
};
export const sysColor = (id: string) => SYS_COLOR[id] ?? "#0d9488";

export type ChipItem = { id: string; label: string; icon?: string; n?: number; color?: string };
/** Baris chip yang bisa digulir horizontal. Mengembalikan elemen baris. */
export function chipRow(parent: HTMLElement, items: ChipItem[], cur: string, on: (id: string) => void, cls = "") {
	const row = parent.createDiv("mp-mx-chips " + cls);
	for (const it of items) {
		const b = row.createEl("button", { cls: "mp-mx-chip" + (it.id === cur ? " is-on" : "") });
		if (it.color) b.style.setProperty("--c", it.color);
		if (it.icon) b.createSpan({ cls: "mp-mx-chip-ic", text: it.icon });
		b.createSpan({ text: it.label });
		if (it.n !== undefined) b.createSpan({ cls: "mp-mx-chip-n", text: String(it.n) });
		b.setAttr("data-id", it.id);
		b.onclick = () => { row.querySelectorAll(".mp-mx-chip").forEach((x) => x.removeClass("is-on")); b.addClass("is-on"); on(it.id); };
	}
	return row;
}

/** Kartu akordeon (details) bergaya. */
export function acc(parent: HTMLElement, icon: string, title: string, open = true, tone = "") {
	const d = parent.createEl("details", { cls: "mp-mx-acc " + tone });
	d.open = open;
	const s = d.createEl("summary", { cls: "mp-mx-acc-h" });
	s.createSpan({ cls: "mp-mx-acc-ic", text: icon });
	s.createSpan({ cls: "mp-mx-acc-t", text: title });
	const chev = s.createSpan("mp-mx-acc-chev");
	setIcon(chev, "chevron-down");
	return d.createDiv("mp-mx-acc-b");
}

/** Daftar butir; pada mode hafalan setiap butir disamarkan sampai diketuk. */
export function mlist(parent: HTMLElement, items: string[] | undefined) {
	if (!items?.length) return null;
	const u = parent.createEl("ul", { cls: "mp-mx-list" });
	for (const t of items) {
		const li = u.createEl("li", { text: t });
		li.onclick = () => li.toggleClass("is-shown", !li.hasClass("is-shown"));
	}
	return u;
}

/** Kepala halaman detail berwarna (penyakit/obat/keterampilan). */
export function heroCard(parent: HTMLElement, o: { color: string; emoji: string; kicker: string; title: string; titleCls?: string; sub?: string }) {
	const h = parent.createDiv("mp-mx-hero");
	h.style.setProperty("--c", o.color);
	h.createDiv({ cls: "mp-mx-hero-em", text: o.emoji });
	const t = h.createDiv("mp-mx-hero-t");
	t.createDiv({ cls: "mp-mx-kicker", text: o.kicker });
	t.createEl("h2", { cls: "mp-mx-title " + (o.titleCls ?? ""), text: o.title });
	if (o.sub) t.createDiv({ cls: "mp-mx-hero-sub", text: o.sub });
	const chips = t.createDiv("mp-mx-hero-chips");
	return { h, chips };
}

/** Kisi kartu "sekilas". */
export function glance(parent: HTMLElement, tiles: { icon: string; label: string; text: string; tone?: string }[]) {
	const g = parent.createDiv("mp-mx-glance");
	for (const t of tiles) {
		if (!t.text) continue;
		const c = g.createDiv("mp-mx-gl " + (t.tone ?? ""));
		c.createDiv({ cls: "mp-mx-gl-h", text: `${t.icon} ${t.label}` });
		c.createDiv({ cls: "mp-mx-gl-t", text: t.text });
	}
	return g;
}

/** Tombol ikon kecil. */
export function ibtn(parent: HTMLElement, icon: string, label: string, on: () => void, cls = "") {
	const b = parent.createEl("button", { cls: "mp-mx-ibtn " + cls, attr: { "aria-label": label, title: label } });
	setIcon(b.createSpan(), icon);
	b.createSpan({ cls: "mp-mx-ibtn-l", text: label });
	b.onclick = on;
	return b;
}

export const firstSentence = (s: string, max = 180) => {
	const m = s.match(/^.{20,}?[.;](\s|$)/);
	const t = (m ? m[0] : s).trim();
	return t.length > max ? t.slice(0, max - 1).trimEnd() + "…" : t;
};
export const nrm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

/** Indeks harian deterministik (untuk "kartu hari ini"). */
export function dayIndex(n: number, salt = 0) {
	const d = new Date();
	const k = d.getFullYear() * 400 + d.getMonth() * 32 + d.getDate() + salt * 7919;
	return ((k * 2654435761) >>> 0) % Math.max(1, n);
}
