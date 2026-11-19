/**
 * MedPro All In One — tampilan utama (shell): navigasi samping (laptop) / laci (HP), kepala halaman, dan router.
 */
import { ItemView, WorkspaceLeaf, setIcon } from "obsidian";
import type MedProPlugin from "./main";
import { renderMedCalc, renderMedDrugs, renderMedEmerg, renderMedInter, renderMedTools } from "./medis";
import { renderMedClass, renderMedQuiz, renderMedTox } from "./medis2";
import { renderMedDisease, renderMedRx } from "./medis3";
import { renderMedHome } from "./med-home";
import { renderMedCppt } from "./med-cppt";
import { renderMedPf } from "./med-pfui";
import { renderAnatomy } from "./med-anat";
import { renderLab } from "./med-lab";
import { renderEkg } from "./med-ekg";
import { renderJaga } from "./med-jaga";

export const VIEW_TYPE_MEDPRO = "medpro-all-in-one";

export type Page = "med" | "medpenyakit" | "medanat" | "medpf" | "medobat" | "medclass" | "medcppt" | "medjaga" | "medresep" | "medlab" | "medekg" | "medcalc" | "medtools" | "medtox" | "medinter" | "medemerg" | "medquiz";

export const PAGES: Partial<Record<Page, { label: string; icon: string; desc: string; color: string }>> = {
	med: { label: "Beranda", icon: "home", desc: "Cari apa saja: penyakit, obat, anatomi, pemeriksaan fisik, pasien & alat klinis", color: "#0d9488" },
	medpenyakit: { label: "Penyakit", icon: "stethoscope", desc: "942 penyakit SKDI 2019: definisi hingga tata laksana & resep", color: "#16a34a" },
	medanat: { label: "Anatomi 3D", icon: "person-standing", desc: "Atlas anatomi 3D Z-Anatomy: ±1.800 struktur, terhubung ke penyakit & pemeriksaan", color: "#e11d48" },
	medpf: { label: "Pemeriksaan fisik", icon: "scan-eye", desc: "Materi pemeriksaan fisik lengkap sesuai SKDI 2019: langkah, OSCE & temuan abnormal", color: "#db2777" },
	medobat: { label: "Obat", icon: "pill", desc: "Database obat: dosis, cara pakai, kontraindikasi, kehamilan, interaksi", color: "#7c3aed" },
	medclass: { label: "Farmakologi", icon: "book-open", desc: "Golongan obat: mekanisme, prototipe, efek samping, mutiara klinis", color: "#8b5cf6" },
	medcppt: { label: "CPPT", icon: "clipboard-list", desc: "Catatan perkembangan pasien (SOAP) dengan tanda vital, tren & ekspor PDF", color: "#0ea5e9" },
	medjaga: { label: "Jaga & SBAR", icon: "list-checks", desc: "Tugas jaga per pasien, pengingat, dan serah terima SBAR (salin/PDF)", color: "#0284c7" },
	medresep: { label: "Resep", icon: "file-text", desc: "Resep lengkap berdasarkan penyakit, dosis anak otomatis, ekspor PDF", color: "#0891b2" },
	medlab: { label: "Lab & AGD", icon: "flask-conical", desc: "Nilai rujukan lab, analisis gas darah, anion gap, koreksi elektrolit", color: "#f59e0b" },
	medekg: { label: "EKG & radiologi", icon: "activity", desc: "Baca EKG sistematis dengan contoh gelombang, kalkulator QTc/aksis, foto toraks", color: "#ef4444" },
	medcalc: { label: "Kalkulator dosis", icon: "calculator", desc: "Dosis dewasa & anak berdasarkan BB, usia, ginjal; mL & tablet", color: "#0d9488" },
	medtools: { label: "Kalkulator klinis", icon: "gauge", desc: "CrCl, eGFR, BSA, IMT, cairan, tetesan infus, syringe pump, QTc, GCS, HPL, skor klinis", color: "#6366f1" },
	medtox: { label: "Antidot", icon: "skull", desc: "Keracunan & antidot dengan kalkulator dosis tiap antidot", color: "#475569" },
	medinter: { label: "Interaksi", icon: "zap", desc: "Cek interaksi & duplikasi beberapa obat sekaligus", color: "#f97316" },
	medemerg: { label: "Kartu darurat", icon: "heart-pulse", desc: "Dosis resusitasi & kejang anak berdasarkan berat badan", color: "#dc2626" },
	medquiz: { label: "Kuis obat", icon: "target", desc: "Kuis farmakologi otomatis dari database obat", color: "#db2777" },
};
const NAV: [string, Page[]][] = [
	["", ["med"]],
	["Belajar klinis", ["medpenyakit", "medanat", "medpf", "medobat", "medclass"]],
	["Pasien", ["medcppt", "medjaga", "medresep"]],
	["Alat klinis", ["medlab", "medekg", "medcalc", "medtools", "medtox", "medinter", "medemerg"]],
	["Latihan", ["medquiz"]],
];

export class MedHubView extends ItemView {
	page: Page = "med";
	mainEl!: HTMLElement;
	private navEl!: HTMLElement;
	private bodyEl!: HTMLElement;
	private drawerOpen = false;
	private history: Page[] = [];
	constructor(leaf: WorkspaceLeaf, public plugin: MedProPlugin) { super(leaf); }
	getViewType() { return VIEW_TYPE_MEDPRO; }
	getDisplayText() { return "MedPro"; }
	getIcon() { return "stethoscope"; }

	async onOpen() {
		const root = this.contentEl;
		root.empty();
		root.addClass("mp");
		const shell = root.createDiv("mp-shell");
		this.navEl = shell.createDiv("mp-nav");
		this.mainEl = shell.createDiv("mp-main");
		const scrim = shell.createDiv("mp-scrim");
		scrim.onclick = () => this.toggleDrawer(false);
		this.bodyEl = this.mainEl;
		this.page = (this.plugin.data.lastPage as Page) || "med";
		this.renderNav();
		this.renderPage();
	}
	async onClose() { this.contentEl.empty(); }

	toggleDrawer(open = !this.drawerOpen) { this.drawerOpen = open; this.contentEl.toggleClass("mp-drawer-open", open); }

	private renderNav() {
		const n = this.navEl;
		n.empty();
		const brand = n.createDiv("mp-brand");
		const mark = brand.createDiv("mp-brand-mark");
		setIcon(mark, "stethoscope");
		const bt = brand.createDiv("mp-brand-t");
		bt.createDiv({ cls: "mp-brand-name", text: "MedPro" });
		bt.createDiv({ cls: "mp-brand-sub", text: "All In One" });
		const close = brand.createEl("button", { cls: "mp-nav-close", attr: { "aria-label": "Tutup menu" } });
		setIcon(close, "x");
		close.onclick = () => this.toggleDrawer(false);
		const list = n.createDiv("mp-nav-list");
		for (const [g, pages] of NAV) {
			if (g) list.createDiv({ cls: "mp-nav-group", text: g });
			for (const pg of pages) {
				const meta = PAGES[pg]!;
				const it = list.createEl("button", { cls: "mp-nav-item" + (this.page === pg ? " is-active" : "") });
				it.style.setProperty("--c", meta.color);
				setIcon(it.createSpan("mp-nav-ic"), meta.icon);
				it.createSpan({ cls: "mp-nav-label", text: meta.label });
				const badge = this.badge(pg);
				if (badge) it.createSpan({ cls: "mp-nav-count", text: badge });
				it.setAttr("data-page", pg);
				it.onclick = () => { this.navigate(pg); this.toggleDrawer(false); };
			}
		}
		const foot = n.createDiv("mp-nav-foot");
		const st = foot.createEl("button", { cls: "mp-nav-item" });
		setIcon(st.createSpan("mp-nav-ic"), "settings");
		st.createSpan({ cls: "mp-nav-label", text: "Pengaturan" });
		st.onclick = () => this.plugin.openSettings();
	}
	private badge(pg: Page): string {
		const m = this.plugin.data.med;
		if (!m) return "";
		if (pg === "medcppt") { const n = (((m as Record<string, any>).cppt?.patients ?? []) as { done?: boolean }[]).filter((x: { done?: boolean }) => !x.done).length; return n ? String(n) : ""; }
		if (pg === "medjaga") { const n = this.plugin.openTasks(); return n ? String(n) : ""; }
		return "";
	}

	navigate(pg: Page) {
		if (pg !== this.page) this.history.push(this.page);
		this.page = pg;
		this.plugin.data.lastPage = pg;
		this.plugin.requestSave();
		this.renderNav();
		this.renderPage();
		this.mainEl.scrollTop = 0;
	}
	back() { const p = this.history.pop(); if (p) { this.page = p; this.renderNav(); this.renderPage(); } }

	renderPage() {
		const m = this.bodyEl;
		const keep = m.scrollTop;
		m.empty();
		const top = m.createDiv("mp-topbar");
		const menu = top.createEl("button", { cls: "mp-menu-btn", attr: { "aria-label": "Menu" } });
		setIcon(menu, "menu");
		menu.onclick = () => this.toggleDrawer(true);
		const meta = PAGES[this.page];
		const t = top.createDiv("mp-topbar-t");
		if (meta) { setIcon(t.createSpan("mp-topbar-ic"), meta.icon); t.createSpan({ text: meta.label }); }
		const home = top.createEl("button", { cls: "mp-menu-btn", attr: { "aria-label": "Beranda" } });
		setIcon(home, "home");
		home.onclick = () => this.navigate("med");
		const page = m.createDiv("mp-page mp-page-" + this.page);
		try {
			this.route(page);
		} catch (e) {
			console.error(e);
			page.createDiv({ cls: "mp-md-empty", text: "Terjadi kesalahan saat menampilkan halaman ini: " + (e as Error).message });
		}
		window.requestAnimationFrame(() => (m.scrollTop = keep));
		this.refreshBadges();
	}
	refreshBadges() {
		this.navEl.querySelectorAll<HTMLElement>(".mp-nav-item[data-page]").forEach((it) => {
			const pg = it.getAttribute("data-page") as Page;
			const b = this.badge(pg);
			let c = it.querySelector(".mp-nav-count");
			if (!b) { c?.remove(); return; }
			if (!c) c = it.createSpan("mp-nav-count");
			c.textContent = b;
		});
	}
	private route(page: HTMLElement) {
		switch (this.page) {
			case "med": return renderMedHome(this, page);
			case "medpenyakit": return renderMedDisease(this, page);
			case "medanat": return renderAnatomy(this, page);
			case "medpf": return renderMedPf(this, page);
			case "medobat": return renderMedDrugs(this, page);
			case "medclass": return renderMedClass(this, page);
			case "medcppt": return renderMedCppt(this, page);
			case "medjaga": return renderJaga(this, page);
			case "medresep": return renderMedRx(this, page);
			case "medlab": return renderLab(this, page);
			case "medekg": return renderEkg(this, page);
			case "medcalc": return renderMedCalc(this, page);
			case "medtools": return renderMedTools(this, page);
			case "medtox": return renderMedTox(this, page);
			case "medinter": return renderMedInter(this, page);
			case "medemerg": return renderMedEmerg(this, page);
			case "medquiz": return renderMedQuiz(this, page);
		}
	}
}
export type HubView = MedHubView;
