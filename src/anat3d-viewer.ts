/**
 * Penampil atlas 3D (three.js). Satu mesh gabungan per sistem agar ringan (sedikit draw call):
 * sorot = ubah warna verteks, sembunyikan/isolasi = susun ulang indeks, pilih = GPU picking (ID per verteks).
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { AObj, objects, palette, sysGeo, systems } from "./anat3d-store";

const SEL = new THREE.Color(0.08, 0.78, 0.95);
const MARK = new THREE.Color(1.0, 0.82, 0.18);

interface SysMesh {
	id: string; mesh: THREE.Mesh; pick: THREE.Mesh; geo: THREE.BufferGeometry; col: THREE.BufferAttribute;
	base: Float32Array; idxAll: Uint32Array; objs: AObj[]; hidden: Set<number>; opacity: number; mat: THREE.MeshStandardMaterial;
}

export interface ViewerOpts { onPick?: (o: AObj | null, ev: { x: number; y: number }) => void; onHover?: (o: AObj | null) => void; mobile?: boolean }

const PICK_VS = `
attribute float pid;
varying vec3 vPid;
#include <clipping_planes_pars_vertex>
void main() {
	float id = pid;
	vPid = vec3(mod(id, 256.0), mod(floor(id / 256.0), 256.0), floor(id / 65536.0)) / 255.0;
	#include <begin_vertex>
	#include <project_vertex>
	#include <clipping_planes_vertex>
}`;
const PICK_FS = `
varying vec3 vPid;
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	gl_FragColor = vec4(vPid, 1.0);
}`;

export class Atlas3D {
	readonly canvas: HTMLCanvasElement;
	renderer: THREE.WebGLRenderer | null = null;
	scene = new THREE.Scene();
	pickScene = new THREE.Scene();
	camera: THREE.PerspectiveCamera;
	controls!: OrbitControls;
	sys = new Map<string, SysMesh>();
	visible = new Set<string>();
	selected: AObj | null = null;
	marked = new Set<number>();
	labels: HTMLElement | null = null;
	labelOn = true;
	/** Saat kuis: label disembunyikan agar tidak membocorkan jawaban. */
	quiz = false;
	/** Satu label untuk sekumpulan objek (topik/grup) agar label tidak bertumpuk. */
	groupLabel: { text: string; c: [number, number, number] } | null = null;
	altColors = false;
	clip = { axis: "none" as "none" | "x" | "y" | "z", t: 0.5, flip: false };
	private plane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
	private pickTarget = new THREE.WebGLRenderTarget(1, 1);
	private pickMat: THREE.ShaderMaterial;
	private dirty = true;
	private raf = 0;
	private ro: ResizeObserver | null = null;
	private anim: { from: THREE.Vector3; to: THREE.Vector3; cf: THREE.Vector3; ct: THREE.Vector3; t0: number; dur: number } | null = null;
	private bbox = new THREE.Box3(new THREE.Vector3(-0.35, 0, -0.15), new THREE.Vector3(0.35, 1.72, 0.15));
	opts: ViewerOpts;
	ok = true;

	constructor(opts: ViewerOpts = {}) {
		this.opts = opts;
		this.canvas = document.createElement("canvas");
		this.canvas.className = "mp-a3-canvas";
		this.camera = new THREE.PerspectiveCamera(32, 1, 0.01, 30);
		try {
			this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: !opts.mobile, alpha: true, preserveDrawingBuffer: false, powerPreference: "high-performance" });
		} catch (e) {
			console.warn("MedPro: WebGL tidak tersedia", e); this.ok = false;
		}
		this.pickMat = new THREE.ShaderMaterial({ vertexShader: PICK_VS, fragmentShader: PICK_FS, clipping: true, side: THREE.DoubleSide });
		if (!this.renderer) return;
		const r = this.renderer;
		r.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.mobile ? 1.5 : 2));
		r.localClippingEnabled = true;
		r.outputColorSpace = THREE.SRGBColorSpace;
		this.scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7f78, 1.25));
		const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(0.6, 1, 1.4); this.camera.add(key);
		const rim = new THREE.DirectionalLight(0xffffff, 0.45); rim.position.set(-1, 0.3, -1); this.camera.add(rim);
		this.scene.add(this.camera);
		this.controls = new OrbitControls(this.camera, this.canvas);
		this.controls.enableDamping = true; this.controls.dampingFactor = 0.12;
		this.controls.minDistance = 0.08; this.controls.maxDistance = 8;
		this.controls.zoomToCursor = true;
		this.controls.addEventListener("change", () => (this.dirty = true));
		this.view("depan", false);
		this.bindPointer();
	}

	/** Pasang kanvas ke wadah (dipakai ulang antarhalaman agar konteks WebGL tidak dibuat ulang). */
	attach(host: HTMLElement, labels: HTMLElement) {
		host.prepend(this.canvas);
		this.labels = labels;
		this.ro?.disconnect();
		this.ro = new ResizeObserver(() => this.resize(host));
		this.ro.observe(host);
		this.resize(host);
		this.dirty = true;
		if (!this.raf) this.loop();
	}
	private resize(host: HTMLElement) {
		if (!this.renderer) return;
		const w = Math.max(10, host.clientWidth), h = Math.max(10, host.clientHeight);
		this.renderer.setSize(w, h, false);
		this.canvas.style.width = w + "px"; this.canvas.style.height = h + "px";
		this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
		this.dirty = true;
	}
	private loop = () => {
		if (!this.canvas.isConnected) { this.raf = 0; return; }
		this.raf = window.requestAnimationFrame(this.loop);
		if (this.anim) {
			const k = Math.min(1, (performance.now() - this.anim.t0) / this.anim.dur), e = 1 - Math.pow(1 - k, 3);
			this.controls.target.lerpVectors(this.anim.from, this.anim.to, e);
			this.camera.position.lerpVectors(this.anim.cf, this.anim.ct, e);
			if (k >= 1) this.anim = null;
			this.dirty = true;
		}
		if (this.controls.update()) this.dirty = true;
		if (this.dirty) { this.dirty = false; this.draw(); }
	};
	requestRender() { this.dirty = true; }
	private draw() {
		if (!this.renderer) return;
		this.renderer.render(this.scene, this.camera);
		this.drawLabels();
	}

	// ---------- sistem ----------
	ensureSys(id: string): SysMesh | null {
		if (!this.renderer) return null;
		const ex = this.sys.get(id); if (ex) return ex;
		const s = systems().find((x) => x.id === id); if (!s) return null;
		const g = sysGeo(id);
		const geo = new THREE.BufferGeometry();
		geo.setAttribute("position", new THREE.BufferAttribute(g.pos, 3));
		const base = new Float32Array(s.nv * 3);
		const pal = palette();
		const pid = new Float32Array(s.nv);
		for (let v = 0; v < s.nv; v++) {
			const p = pal[g.pal[v]] ?? pal[0];
			const c = this.altColors ? p.alt : p.c;
			base[v * 3] = c[0]; base[v * 3 + 1] = c[1]; base[v * 3 + 2] = c[2];
			pid[v] = s.objs[g.objOfVert[v]].i + 1;
		}
		const lin = new THREE.Color();
		for (let v = 0; v < s.nv; v++) { lin.setRGB(base[v * 3], base[v * 3 + 1], base[v * 3 + 2], THREE.SRGBColorSpace); base[v * 3] = lin.r; base[v * 3 + 1] = lin.g; base[v * 3 + 2] = lin.b; }
		const col = new THREE.BufferAttribute(base.slice(), 3);
		geo.setAttribute("color", col);
		geo.setAttribute("pid", new THREE.BufferAttribute(pid, 1));
		geo.setIndex(new THREE.BufferAttribute(g.idx.slice(), 1));
		geo.computeVertexNormals();
		geo.computeBoundingSphere();
		const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.62, metalness: 0, side: THREE.DoubleSide, clippingPlanes: [] });
		const mesh = new THREE.Mesh(geo, mat);
		const pick = new THREE.Mesh(geo, this.pickMat);
		mesh.renderOrder = id === "9" ? 10 : 0;
		const sm: SysMesh = { id, mesh, pick, geo, col, base, idxAll: g.idx, objs: s.objs, hidden: new Set(s.objs.map((o, k) => (o.defHidden ? k : -1)).filter((k) => k >= 0)), opacity: 1, mat };
		this.sys.set(id, sm);
		if (sm.hidden.size) this.rebuildIndex(sm);
		this.applyClipTo(sm);
		return sm;
	}
	setVisible(id: string, on: boolean) {
		const sm = on ? this.ensureSys(id) : this.sys.get(id);
		if (!sm) return;
		if (on) { this.visible.add(id); this.scene.add(sm.mesh); this.pickScene.add(sm.pick); }
		else { this.visible.delete(id); this.scene.remove(sm.mesh); this.pickScene.remove(sm.pick); }
		this.dirty = true;
	}
	setOpacity(id: string, a: number) {
		const sm = this.sys.get(id); if (!sm) return;
		sm.opacity = a;
		sm.mat.transparent = a < 0.999; sm.mat.opacity = a; sm.mat.depthWrite = a > 0.6;
		sm.mat.needsUpdate = true;
		this.dirty = true;
	}
	setAltColors(on: boolean) {
		this.altColors = on;
		for (const id of [...this.sys.keys()]) {
			const sm = this.sys.get(id)!; const vis = this.visible.has(id); const op = sm.opacity; const hid = sm.hidden;
			this.scene.remove(sm.mesh); this.pickScene.remove(sm.pick); sm.geo.dispose(); sm.mat.dispose(); this.sys.delete(id);
			const nm = this.ensureSys(id)!; nm.hidden = hid; this.rebuildIndex(nm); this.setOpacity(id, op);
			if (vis) this.setVisible(id, true);
		}
		this.recolor();
	}

	// ---------- sembunyi / isolasi ----------
	private rebuildIndex(sm: SysMesh) {
		if (!sm.hidden.size) { sm.geo.setIndex(new THREE.BufferAttribute(sm.idxAll.slice(), 1)); this.dirty = true; return; }
		let n = 0;
		sm.objs.forEach((o, k) => { if (!sm.hidden.has(k)) n += o.tn * 3; });
		const out = new Uint32Array(n); let p = 0;
		sm.objs.forEach((o, k) => { if (!sm.hidden.has(k)) { out.set(sm.idxAll.subarray(o.t0 * 3, (o.t0 + o.tn) * 3), p); p += o.tn * 3; } });
		sm.geo.setIndex(new THREE.BufferAttribute(out, 1));
		this.dirty = true;
	}
	hide(objs: AObj[]) {
		const touched = new Set<SysMesh>();
		for (const o of objs) { const sm = this.sys.get(o.sys); if (!sm) continue; sm.hidden.add(sm.objs.indexOf(o)); touched.add(sm); }
		touched.forEach((sm) => this.rebuildIndex(sm));
	}
	/** Tampilkan semua (kembali ke bawaan: fasia/bursa/pleura tetap tersembunyi kecuali `all`). */
	showAll(all = false) {
		for (const sm of this.sys.values()) {
			const want = all ? new Set<number>() : new Set(sm.objs.map((o, k) => (o.defHidden ? k : -1)).filter((k) => k >= 0));
			if (want.size === sm.hidden.size && [...want].every((k) => sm.hidden.has(k))) continue;
			sm.hidden = want; this.rebuildIndex(sm);
		}
	}
	show(objs: AObj[]) {
		const touched = new Set<SysMesh>();
		for (const o of objs) { const sm = this.sys.get(o.sys); if (!sm) continue; sm.hidden.delete(sm.objs.indexOf(o)); touched.add(sm); }
		touched.forEach((sm) => this.rebuildIndex(sm));
	}
	isolate(objs: AObj[]) {
		const keep = new Set(objs.map((o) => o.i));
		const sysIds = new Set(objs.map((o) => o.sys));
		for (const id of sysIds) this.setVisible(id, true);
		for (const [id, sm] of this.sys) {
			if (!this.visible.has(id)) continue;
			sm.hidden = new Set(sm.objs.map((o, k) => (keep.has(o.i) ? -1 : k)).filter((k) => k >= 0));
			this.rebuildIndex(sm);
		}
	}
	hiddenCount() { let n = 0; for (const sm of this.sys.values()) n += sm.hidden.size; return n; }
	isHidden(o: AObj) { const sm = this.sys.get(o.sys); return !!sm && sm.hidden.has(sm.objs.indexOf(o)); }

	// ---------- sorot ----------
	select(o: AObj | null, mark: number[] = [], label?: string) {
		this.selected = o; this.marked = new Set(mark);
		this.groupLabel = null;
		if (label && mark.length) {
			const os = mark.map((i) => objects()[i]).filter(Boolean);
			const side = os.filter((x) => x.side === "r");
			const use = side.length ? side : os;
			const c: [number, number, number] = [0, 0, 0];
			for (const x of use) for (let k = 0; k < 3; k++) c[k] += x.c[k] / use.length;
			this.groupLabel = { text: label, c };
		}
		this.recolor();
	}
	private recolor() {
		for (const sm of this.sys.values()) {
			const arr = sm.col.array as Float32Array;
			arr.set(sm.base);
			sm.objs.forEach((o) => {
				const isSel = this.selected?.i === o.i, isMark = this.marked.has(o.i);
				if (!isSel && !isMark) return;
				const c = isSel ? SEL : MARK, k = isSel ? 0.62 : 0.5;
				for (let v = o.v0; v < o.v0 + o.vn; v++) {
					arr[v * 3] = arr[v * 3] * (1 - k) + c.r * k; arr[v * 3 + 1] = arr[v * 3 + 1] * (1 - k) + c.g * k; arr[v * 3 + 2] = arr[v * 3 + 2] * (1 - k) + c.b * k;
				}
			});
			sm.col.needsUpdate = true;
		}
		this.dirty = true;
	}

	// ---------- kamera ----------
	view(v: "depan" | "belakang" | "kiri" | "kanan" | "atas" | "bawah", animate = true) {
		const t = new THREE.Vector3(0, 0.92, 0), d = 3.9;
		const dir = { depan: [0, 0.02, 1], belakang: [0, 0.02, -1], kiri: [1, 0.02, 0], kanan: [-1, 0.02, 0], atas: [0, 1, 0.001], bawah: [0, -1, 0.001] }[v];
		const to = t.clone().add(new THREE.Vector3(dir[0], dir[1], dir[2]).normalize().multiplyScalar(d));
		this.flyTo(t, to, animate);
	}
	focus(objs: AObj[], animate = true) {
		if (!objs.length) return;
		const box = new THREE.Box3();
		const tmp = new THREE.Box3();
		for (const o of objs) box.union(new THREE.Sphere(new THREE.Vector3(...o.c), o.r).getBoundingBox(tmp));
		const c = box.getCenter(new THREE.Vector3()); const r = Math.max(0.03, box.getSize(new THREE.Vector3()).length() / 2);
		const dist = (r / Math.sin(THREE.MathUtils.degToRad(this.camera.fov / 2))) * 1.15;
		const dir = this.camera.position.clone().sub(this.controls.target).normalize();
		this.flyTo(c, c.clone().add(dir.multiplyScalar(Math.min(6, Math.max(0.12, dist)))), animate);
	}
	private flyTo(target: THREE.Vector3, pos: THREE.Vector3, animate: boolean) {
		if (!this.controls) { this.camera.position.copy(pos); this.camera.lookAt(target); return; }
		if (!animate) { this.controls.target.copy(target); this.camera.position.copy(pos); this.controls.update(); this.dirty = true; return; }
		this.anim = { from: this.controls.target.clone(), to: target, cf: this.camera.position.clone(), ct: pos, t0: performance.now(), dur: 520 };
	}
	zoom(f: number) {
		const d = this.camera.position.clone().sub(this.controls.target);
		this.camera.position.copy(this.controls.target.clone().add(d.multiplyScalar(f))); this.dirty = true;
	}

	// ---------- potongan ----------
	setClip(axis: "none" | "x" | "y" | "z", t = this.clip.t, flip = this.clip.flip) {
		this.clip = { axis, t, flip };
		const b = this.bbox;
		if (axis !== "none") {
			const k = { x: 0, y: 1, z: 2 }[axis];
			const n = new THREE.Vector3(); n.setComponent(k, flip ? 1 : -1);
			const v = b.min.getComponent(k) + (b.max.getComponent(k) - b.min.getComponent(k)) * t;
			this.plane.set(n, flip ? -v : v);
		}
		for (const sm of this.sys.values()) this.applyClipTo(sm);
		this.pickMat.clippingPlanes = axis === "none" ? [] : [this.plane];
		this.pickMat.needsUpdate = true;
		this.dirty = true;
	}
	private applyClipTo(sm: SysMesh) {
		sm.mat.clippingPlanes = this.clip.axis === "none" ? [] : [this.plane];
		sm.mat.needsUpdate = true;
	}

	// ---------- pilih ----------
	pickAt(x: number, y: number): AObj | null {
		const r = this.renderer; if (!r) return null;
		const rect = this.canvas.getBoundingClientRect();
		const pr = r.getPixelRatio();
		const W = rect.width * pr, H = rect.height * pr;
		const px = (x - rect.left) * pr, py = (y - rect.top) * pr;
		// lewati sistem transparan (mis. kulit tembus pandang) agar struktur di baliknya bisa diketuk
		const skipped: THREE.Object3D[] = [];
		for (const sm of this.sys.values()) if (this.visible.has(sm.id) && sm.opacity < 0.55) { this.pickScene.remove(sm.pick); skipped.push(sm.pick); }
		this.camera.setViewOffset(W, H, px, py, 1, 1);
		const prevAlpha = r.getClearAlpha(); const prevCol = r.getClearColor(new THREE.Color());
		r.setRenderTarget(this.pickTarget); r.setClearColor(0x000000, 1); r.clear();
		r.render(this.pickScene, this.camera);
		const buf = new Uint8Array(4); r.readRenderTargetPixels(this.pickTarget, 0, 0, 1, 1, buf);
		r.setRenderTarget(null); r.setClearColor(prevCol, prevAlpha);
		this.camera.clearViewOffset();
		skipped.forEach((p) => this.pickScene.add(p));
		const id = buf[0] + buf[1] * 256 + buf[2] * 65536;
		this.dirty = true;
		return id > 0 ? objects()[id - 1] ?? null : null;
	}
	private bindPointer() {
		let down: { x: number; y: number; t: number } | null = null;
		this.canvas.addEventListener("pointerdown", (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
		this.canvas.addEventListener("pointerup", (e) => {
			if (!down) return;
			const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y), dt = performance.now() - down.t;
			down = null;
			if (moved < 7 && dt < 600) this.opts.onPick?.(this.pickAt(e.clientX, e.clientY), { x: e.clientX, y: e.clientY });
		});
		this.canvas.addEventListener("dblclick", (e) => { const o = this.pickAt(e.clientX, e.clientY); if (o) this.focus([o]); });
	}

	// ---------- label ----------
	labelText: (o: AObj) => string = (o) => o.base;
	private drawLabels() {
		const L = this.labels; if (!L) return;
		L.empty();
		if (!this.labelOn || this.quiz) return;
		const items: { o: AObj; sel: boolean }[] = [];
		const rect = this.canvas.getBoundingClientRect();
		const v = new THREE.Vector3();
		if (this.groupLabel) {
			v.set(...this.groupLabel.c).project(this.camera);
			if (v.z <= 1 && v.z >= -1) {
				const d = L.createDiv({ cls: "mp-a3-label is-group" });
				d.style.left = (v.x * 0.5 + 0.5) * rect.width + "px"; d.style.top = (-v.y * 0.5 + 0.5) * rect.height + "px";
				d.createSpan({ cls: "mp-a3-dot" }); d.createSpan({ cls: "mp-a3-ltext", text: this.groupLabel.text });
			}
		}
		if (this.selected) items.push({ o: this.selected, sel: true });
		if (!this.groupLabel && this.marked.size <= 6) {
			const seen = new Set<string>();
			[...this.marked].forEach((i) => { const o = objects()[i]; if (!o || o.i === this.selected?.i || seen.has(o.base)) return; seen.add(o.base); items.push({ o, sel: false }); });
		}
		for (const { o, sel } of items) {
			if (this.isHidden(o) || !this.visible.has(o.sys)) continue;
			v.set(...o.c).project(this.camera);
			if (v.z > 1 || v.z < -1) continue;
			const x = (v.x * 0.5 + 0.5) * rect.width, y = (-v.y * 0.5 + 0.5) * rect.height;
			if (x < -20 || y < -20 || x > rect.width + 20 || y > rect.height + 20) continue;
			const d = L.createDiv({ cls: "mp-a3-label" + (sel ? " is-sel" : "") });
			d.style.left = x + "px"; d.style.top = y + "px";
			d.createSpan({ cls: "mp-a3-dot" });
			d.createSpan({ cls: "mp-a3-ltext", text: this.labelText(o) });
		}
	}

	dispose() {
		window.cancelAnimationFrame(this.raf); this.raf = 0;
		this.ro?.disconnect();
		for (const sm of this.sys.values()) { sm.geo.dispose(); sm.mat.dispose(); }
		this.sys.clear();
		this.pickMat.dispose(); this.pickTarget.dispose();
		this.controls?.dispose();
		this.renderer?.dispose();
		this.renderer?.forceContextLoss?.();
		this.canvas.remove();
	}
}
