/**
 * MedPro All In One — plugin Obsidian untuk dokter & mahasiswa kedokteran:
 * penyakit SKDI, atlas anatomi 3D, pemeriksaan fisik, obat, CPPT, jaga & SBAR, resep, lab/AGD, EKG, antidot.
 * Semua data pasien disimpan lokal di data plugin (data.json) dan tidak pernah diunggah.
 */
import { App, Notice, Plugin, PluginSettingTab, Setting, TFile, normalizePath } from "obsidian";
import { disposeAnat3D } from "./med-anat";
import { MedHubView, Page, PAGES, VIEW_TYPE_MEDPRO } from "./hub-view";
import { med, MedState } from "./medis";
import { configureSound } from "./sound";
import { checkReminders } from "./med-jaga";

export interface MedProSettings { sound: boolean; confetti: boolean; noteFolder: string }
export interface MedProData { med?: MedState & Record<string, unknown>; settings: MedProSettings; lastPage?: string; xp: number; importAsked?: boolean; version?: string }
const DEFAULTS: MedProData = { settings: { sound: true, confetti: true, noteFolder: "MedPro" }, xp: 0 };
export const FLASHCARD_ID = "flashcard-hafalan";

export default class MedProPlugin extends Plugin {
	data!: MedProData;
	private saveTimer: number | null = null;

	async onload() {
		const raw = (await this.loadData()) as Partial<MedProData> | null;
		this.data = { ...DEFAULTS, ...(raw ?? {}), settings: { ...DEFAULTS.settings, ...(raw?.settings ?? {}) } };
		med(this);
		this.data.version = this.manifest.version;
		configureSound({ enabled: this.data.settings.sound, sfxVol: 0.6, musicVol: 0.4 });
		this.registerView(VIEW_TYPE_MEDPRO, (leaf) => new MedHubView(leaf, this));
		this.addRibbonIcon("stethoscope", "Buka MedPro", () => void this.open());
		this.addCommand({ id: "open", name: "Buka MedPro", callback: () => void this.open() });
		for (const [pg, meta] of Object.entries(PAGES)) {
			if (pg === "med" || !meta) continue;
			this.addCommand({ id: `open-${pg}`, name: `Buka ${meta.label}`, callback: () => void this.open(pg as Page) });
		}
		this.addCommand({ id: "import-flashcard", name: "Impor data Medis dari Flashcard Hafalan", callback: () => void this.importFromFlashcard(true) });
		this.addSettingTab(new MedProSettingTab(this.app, this));
		this.registerInterval(window.setInterval(() => checkReminders(this), 30000));
		this.app.workspace.onLayoutReady(() => checkReminders(this));
	}
	onunload() {
		disposeAnat3D();
		if (this.saveTimer) { window.clearTimeout(this.saveTimer); void this.saveData(this.data); }
	}

	requestSave() {
		if (this.saveTimer) window.clearTimeout(this.saveTimer);
		this.saveTimer = window.setTimeout(() => { this.saveTimer = null; void this.saveData(this.data); }, 400);
	}
	async saveNow() { if (this.saveTimer) { window.clearTimeout(this.saveTimer); this.saveTimer = null; } await this.saveData(this.data); }

	async open(page?: Page): Promise<MedHubView> {
		const ws = this.app.workspace;
		let leaf = ws.getLeavesOfType(VIEW_TYPE_MEDPRO)[0];
		if (!leaf) { leaf = ws.getLeaf("tab"); await leaf.setViewState({ type: VIEW_TYPE_MEDPRO, active: true }); }
		ws.revealLeaf(leaf);
		const v = leaf.view as MedHubView;
		if (page && v.navigate) v.navigate(page);
		return v;
	}
	openSettings() {
		const s = (this.app as unknown as { setting?: { open: () => void; openTabById: (id: string) => void } }).setting;
		if (s) { s.open(); s.openTabById(this.manifest.id); }
	}
	refreshViews() { for (const l of this.app.workspace.getLeavesOfType(VIEW_TYPE_MEDPRO)) (l.view as MedHubView).renderPage(); }

	/** Jumlah tugas jaga yang belum selesai (untuk lencana navigasi). */
	openTasks(): number {
		const j = (this.data.med as Record<string, unknown> | undefined)?.jaga as { tasks?: { done?: boolean }[] } | undefined;
		return (j?.tasks ?? []).filter((t) => !t.done).length;
	}
	addCoins(n: number) { this.data.xp = (this.data.xp ?? 0) + n; this.requestSave(); }

	async openAt(path: string, line: number) {
		const f = this.app.vault.getAbstractFileByPath(path);
		if (!(f instanceof TFile)) return;
		const leaf = this.app.workspace.getLeaf("split", "vertical");
		await leaf.openFile(f, { eState: { line }, active: true });
	}
	/** Tambahkan markdown ke akhir catatan (dibuat bila belum ada). */
	async appendToNote(path: string, markdown: string): Promise<TFile | null> {
		const p = normalizePath(path.replace(/\.md$/, "") + ".md");
		const v = this.app.vault;
		let f = v.getAbstractFileByPath(p);
		if (!(f instanceof TFile)) {
			const folder = p.includes("/") ? p.slice(0, p.lastIndexOf("/")) : "";
			if (folder && !v.getAbstractFileByPath(folder)) await v.createFolder(folder);
			f = await v.create(p, `# ${p.split("/").pop()!.replace(/\.md$/, "")}\n`);
		}
		const file = f as TFile;
		await v.process(file, (d) => d.replace(/\s+$/, "") + "\n\n" + markdown.trim() + "\n");
		return file;
	}

	// ---------------------------------------------------------------- impor dari Flashcard Hafalan
	flashcardDataPath() { return normalizePath(`${this.app.vault.configDir}/plugins/${FLASHCARD_ID}/data.json`); }
	async flashcardHasMed(): Promise<boolean> {
		try { const a = this.app.vault.adapter; if (!(await a.exists(this.flashcardDataPath()))) return false; const j = JSON.parse(await a.read(this.flashcardDataPath())); return !!j?.med; } catch { return false; }
	}
	/** Gabungkan data Medis lama (CPPT, favorit, catatan, obat sendiri, identitas dokter) dari Flashcard Hafalan. */
	async importFromFlashcard(verbose = false): Promise<boolean> {
		let src: Record<string, unknown> | undefined;
		try {
			const a = this.app.vault.adapter;
			if (!(await a.exists(this.flashcardDataPath()))) { if (verbose) new Notice("Data Flashcard Hafalan tidak ditemukan di vault ini."); return false; }
			src = JSON.parse(await a.read(this.flashcardDataPath()))?.med;
		} catch (e) { new Notice("Gagal membaca data Flashcard Hafalan: " + (e as Error).message); return false; }
		if (!src) { if (verbose) new Notice("Flashcard Hafalan tidak memiliki data Medis."); return false; }
		const m = med(this) as Record<string, any>;
		const s = src as Record<string, any>;
		const uniq = <T>(a: T[] = [], b: T[] = []) => [...new Set([...a, ...b])];
		const byId = <T extends { id: string }>(a: T[] = [], b: T[] = []) => { const ids = new Set(a.map((x) => x.id)); return [...a, ...b.filter((x) => !ids.has(x.id))]; };
		let nPt = 0, nNote = 0;
		m.fav = uniq(m.fav, s.fav); m.recent = uniq(m.recent, s.recent).slice(0, 20); m.disFav = uniq(m.disFav, s.disFav); m.disRecent = uniq(m.disRecent, s.disRecent).slice(0, 12);
		m.inter = uniq(m.inter, s.inter);
		m.custom = byId(m.custom, s.custom);
		m.notes = { ...(s.notes ?? {}), ...(m.notes ?? {}) };
		m.pfDone = { ...(s.pfDone ?? {}), ...(m.pfDone ?? {}) };
		m.pfBest = { ...(s.pfBest ?? {}), ...(m.pfBest ?? {}) };
		if (s.doc && !m.doc?.name) m.doc = { ...m.doc, ...s.doc };
		if (s.quiz && !(m.quiz?.played > 0)) m.quiz = s.quiz;
		if (s.cppt) {
			m.cppt ??= { patients: [], notes: [], header: { faskes: "", unit: "", addr: "" } };
			const before = [m.cppt.patients.length, m.cppt.notes.length];
			m.cppt.patients = byId(m.cppt.patients, s.cppt.patients);
			m.cppt.notes = byId(m.cppt.notes, s.cppt.notes);
			if (s.cppt.header && !m.cppt.header?.faskes) m.cppt.header = s.cppt.header;
			nPt = m.cppt.patients.length - before[0]; nNote = m.cppt.notes.length - before[1];
		}
		this.data.importAsked = true;
		await this.saveNow();
		new Notice(`✅ Data Medis diimpor dari Flashcard Hafalan: ${nPt} pasien, ${nNote} catatan CPPT, favorit & catatan pribadi.`);
		this.refreshViews();
		return true;
	}

	/** Cadangan JSON ke vault (berisi data pasien — simpan dengan aman). */
	async backup(): Promise<string | null> {
		const v = this.app.vault;
		const dir = normalizePath(this.data.settings.noteFolder || "MedPro");
		if (!v.getAbstractFileByPath(dir)) await v.createFolder(dir);
		const d = new Date(); const z = (n: number) => String(n).padStart(2, "0");
		const path = normalizePath(`${dir}/cadangan-medpro-${d.getFullYear()}${z(d.getMonth() + 1)}${z(d.getDate())}-${z(d.getHours())}${z(d.getMinutes())}.json`);
		await v.create(path, JSON.stringify(this.data, null, 1));
		new Notice(`💾 Cadangan disimpan: ${path}`);
		return path;
	}
}

class MedProSettingTab extends PluginSettingTab {
	constructor(app: App, private p: MedProPlugin) { super(app, p); }
	display() {
		const el = this.containerEl;
		el.empty();
		el.addClass("mp-settings");
		const p = this.p;
		const m = med(p);
		const d = m.doc!;
		el.createEl("h2", { text: "MedPro All In One" });
		el.createDiv({ cls: "setting-item-description", text: `Versi ${p.manifest.version}. Alat bantu referensi klinis — bukan pengganti penilaian dokter.` });
		new Setting(el).setHeading().setName("Identitas dokter (resep, CPPT, SBAR)");
		const txt = (name: string, val: string, on: (v: string) => void, ph = "") => new Setting(el).setName(name).addText((t) => t.setPlaceholder(ph).setValue(val).onChange((v) => { on(v); p.requestSave(); }));
		txt("Nama dokter", d.name, (v) => (d.name = v), "dr. Nama");
		txt("No. SIP", d.sip, (v) => (d.sip = v));
		txt("Alamat praktik", d.addr, (v) => (d.addr = v));
		txt("Kota", d.city, (v) => (d.city = v));
		txt("Telepon", d.phone, (v) => (d.phone = v));
		new Setting(el).setHeading().setName("Tampilan & suara");
		new Setting(el).setName("Efek suara").addToggle((t) => t.setValue(p.data.settings.sound).onChange((v) => { p.data.settings.sound = v; configureSound({ enabled: v, sfxVol: 0.6, musicVol: 0.4 }); p.requestSave(); }));
		new Setting(el).setName("Konfeti saat skor sempurna").addToggle((t) => t.setValue(p.data.settings.confetti).onChange((v) => { p.data.settings.confetti = v; p.requestSave(); }));
		new Setting(el).setName("Folder catatan MedPro").setDesc("Untuk catatan penyakit/resep yang disimpan dan file cadangan.").addText((t) => t.setValue(p.data.settings.noteFolder).onChange((v) => { p.data.settings.noteFolder = v.trim() || "MedPro"; p.requestSave(); }));
		new Setting(el).setHeading().setName("Data");
		new Setting(el).setName("Impor dari Flashcard Hafalan").setDesc("Gabungkan data Medis lama (pasien CPPT, favorit, catatan pribadi, obat sendiri, progres pemeriksaan fisik). Aman diulang — tidak menimpa data yang sudah ada.").addButton((b) => b.setButtonText("Impor sekarang").setCta().onClick(() => void p.importFromFlashcard(true)));
		new Setting(el).setName("Cadangkan data").setDesc("Simpan seluruh data MedPro sebagai file JSON di vault. File ini berisi data pasien — jaga kerahasiaannya.").addButton((b) => b.setButtonText("Buat cadangan").onClick(() => void p.backup()));
		let armed = 0;
		new Setting(el).setName("Hapus semua data pasien").setDesc("Menghapus semua pasien CPPT, catatan, dan tugas jaga dari perangkat ini. Tidak bisa dibatalkan.").addButton((b) => b.setButtonText("Hapus data pasien").setWarning().onClick(async () => {
			if (Date.now() - armed > 4000) { armed = Date.now(); new Notice("Ketuk sekali lagi dalam 4 detik untuk menghapus semua data pasien."); return; }
			const mm = med(p) as Record<string, any>;
			if (mm.cppt) { mm.cppt.patients = []; mm.cppt.notes = []; }
			if (mm.jaga) mm.jaga.tasks = [];
			await p.saveNow(); p.refreshViews(); new Notice("Data pasien dihapus.");
		}));
		el.createDiv({ cls: "setting-item-description", text: "🔒 Data pasien tersimpan di data plugin (.obsidian/plugins/medpro-all-in-one/data.json) pada perangkat ini. Jangan unggah file tersebut ke GitHub atau tempat umum." });
	}
}
