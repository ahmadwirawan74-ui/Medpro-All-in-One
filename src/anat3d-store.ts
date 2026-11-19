/**
 * Data atlas anatomi 3D (Z-Anatomy, turunan BodyParts3D — CC BY-SA 4.0).
 * Aset biner `assets/anat3d.bin` dibundel ke main.js lalu didekode bertahap: header saat pertama dipakai,
 * geometri per sistem saat sistem itu ditampilkan, definisi (Wikipedia, CC BY-SA) saat kartu info dibuka.
 */
import { strFromU8, unzlibSync } from "fflate";
import BIN from "../assets/anat3d.bin";
import { NAME_ID } from "./anat3d-names";

export interface APal { m: string; s: string; c: [number, number, number]; alt: [number, number, number] }
export interface AObj {
	i: number;          // indeks global
	n: string;          // nama asli (Inggris, dengan sufiks .l/.r)
	base: string;       // tanpa sufiks sisi
	side: "" | "l" | "r";
	sys: string;        // id sistem
	g: number;          // indeks grup induk (-1 bila tidak ada)
	v0: number; vn: number; t0: number; tn: number; // rentang verteks & segitiga di dalam sistemnya
	c: [number, number, number]; // pusat (koordinat dunia, meter)
	r: number;          // jari-jari kasar (meter)
	curve: boolean;     // berasal dari kurva (pembuluh/saraf)
	defHidden: boolean; // disembunyikan bawaan (fasia, bursa, pleura…) agar struktur di bawahnya terlihat
}
export interface ASys { id: string; name: string; nv: number; nt: number; off: [number, number, number]; objs: AObj[] }
export interface AGroup { i: number; name: string; parent: number; children: number[]; objs: number[] }

interface Head {
	v: number; bmin: [number, number, number]; scale: [number, number, number]; palette: APal[];
	systems: { id: string; name: string; nv: number; nt: number; off: [number, number, number]; objs: (string | number)[][] }[];
	groups: [string, number][]; latin: Record<string, string>; defs: [number, number];
}

let H: Head | null = null;
let GEO0 = 0;
let SYS: ASys[] = [];
let OBJ: AObj[] = [];
let GRP: AGroup[] = [];
let DEFS: Record<string, string> | null = null;

function u32(b: Uint8Array, o: number) { return b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24) >>> 0; }

function load(): Head {
	if (H) return H;
	if (String.fromCharCode(BIN[0], BIN[1], BIN[2], BIN[3]) !== "ZA3D") throw new Error("Aset anatomi 3D rusak");
	const n = u32(BIN, 4);
	H = JSON.parse(strFromU8(unzlibSync(BIN.subarray(8, 8 + n)))) as Head;
	GEO0 = 8 + n;
	const h = H;
	GRP = h.groups.map(([name, parent], i) => ({ i, name, parent, children: [], objs: [] }));
	for (const g of GRP) if (g.parent >= 0) GRP[g.parent].children.push(g.i);
	SYS = h.systems.map((s) => {
		const objs = s.objs.map((r) => {
			const n = r[0] as string;
			const m = /\.([lr])$/.exec(n);
			const o: AObj = {
				i: OBJ.length, n, base: n.replace(/\.[lr]$/, ""), side: (m ? m[1] : "") as AObj["side"], sys: s.id, g: r[1] as number,
				v0: r[2] as number, vn: r[3] as number, t0: r[4] as number, tn: r[5] as number,
				c: [0, 1, 2].map((k) => h.bmin[k] + (r[6 + k] as number) * h.scale[k]) as [number, number, number],
				r: Math.max(0.004, (r[9] as number) / 1000), curve: r[10] === "C", defHidden: r[11] === 1,
			};
			OBJ.push(o);
			if (o.g >= 0) GRP[o.g].objs.push(o.i);
			return o;
		});
		return { id: s.id, name: s.name, nv: s.nv, nt: s.nt, off: s.off, objs };
	});
	return h;
}

export const head = () => load();
export const systems = () => (load(), SYS);
export const objects = () => (load(), OBJ);
export const groups = () => (load(), GRP);
export const palette = () => load().palette;

export interface SysGeo { pos: Float32Array; pal: Uint8Array; idx: Uint32Array; objOfVert: Uint16Array }
const GEO = new Map<string, SysGeo>();

/** Dekode geometri satu sistem (posisi float32 meter, palet per verteks, indeks global dalam sistem). */
export function sysGeo(id: string): SysGeo {
	const g = GEO.get(id); if (g) return g;
	const h = load();
	const s = SYS.find((x) => x.id === id); if (!s) throw new Error("sistem tidak dikenal " + id);
	const [off, len, rawLen] = s.off;
	const raw = unzlibSync(BIN.subarray(GEO0 + off, GEO0 + off + len), { out: new Uint8Array(rawLen) });
	const nv = s.nv, nt = s.nt;
	const pos = new Float32Array(nv * 3);
	let p = 0;
	for (let c = 0; c < 3; c++) {
		const lo = raw.subarray(p, p + nv), hi = raw.subarray(p + nv, p + 2 * nv); p += 2 * nv;
		const b = h.bmin[c], sc = h.scale[c];
		for (const o of s.objs) {
			let q = 0;
			for (let k = o.v0; k < o.v0 + o.vn; k++) {
				const z = lo[k] | (hi[k] << 8);
				const d = (z >>> 1) ^ -(z & 1);
				q = (q + d) & 0xffff;
				pos[k * 3 + c] = b + q * sc;
			}
		}
	}
	const pal = raw.slice(p, p + nv); p += nv;
	const ni = nt * 3;
	const lo = raw.subarray(p, p + ni), hi = raw.subarray(p + ni, p + 2 * ni);
	const idx = new Uint32Array(ni);
	const objOfVert = new Uint16Array(nv);
	s.objs.forEach((o, oi) => {
		let hw = 0;
		for (let k = o.t0 * 3; k < (o.t0 + o.tn) * 3; k++) {
			const code = lo[k] | (hi[k] << 8);
			const v = hw - code;
			if (code === 0) hw++;
			idx[k] = o.v0 + v;
		}
		objOfVert.fill(oi, o.v0, o.v0 + o.vn);
	});
	const out = { pos, pal, idx, objOfVert };
	GEO.set(id, out);
	return out;
}

/** Definisi singkat (Wikipedia, bahasa Inggris) untuk nama dasar struktur/grup. */
export function definition(base: string): string | undefined {
	const h = load();
	if (!DEFS) DEFS = JSON.parse(strFromU8(unzlibSync(BIN.subarray(GEO0 + h.defs[0], GEO0 + h.defs[0] + h.defs[1])))) as Record<string, string>;
	return DEFS[base] ?? DEFS[base.replace(/\s*\(.*?\)\s*/g, " ").trim()];
}

export const latinOf = (base: string) => load().latin[base] ?? "";
const SIDE_ID = { l: " kiri", r: " kanan", "": "" };
const ABBR: [RegExp, string][] = [
	[/^Musculus /, "M. "], [/^Musculi /, "Mm. "], [/^Arteria /, "A. "], [/^Arteriae /, "Aa. "], [/^Vena /, "V. "], [/^Venae /, "Vv. "],
	[/^Nervus /, "N. "], [/^Nervi /, "Nn. "], [/^Ligamentum /, "Lig. "], [/^Ligamenta /, "Ligg. "], [/^Ramus /, "R. "], [/^Rami /, "Rr. "],
	[/^Nodus /, "Nl. "], [/^Nodi /, "Nll. "], [/^Tendo /, "Tendo "], [/^Articulatio /, "Art. "], [/^Articulationes /, "Artt. "],
];
/** Nama Latin TA2 versi singkat (M./A./V./N./Lig.), seperti di buku anatomi Indonesia. */
export function latinShort(base: string): string {
	let l = latinOf(base).replace(/^\((.*)\)$/, "$1");
	for (const [re, r] of ABBR) if (re.test(l)) { l = l.replace(re, r); break; }
	return l;
}
export const cleanEn = (base: string) => base.replace(/^\((.*)\)$/, "$1").replace(/^\[(.*)\]$/, "$1").replace(/\*/g, "").replace(/\s+/g, " ").trim();
/** Nama tampilan: nama Indonesia (kamus) → Latin singkat → Inggris, plus sisi kiri/kanan. */
export function nameOf(o: AObj | string): string {
	const base = typeof o === "string" ? o : o.base;
	const side = typeof o === "string" ? "" : o.side;
	const id = NAME_ID[base] ?? NAME_ID[cleanEn(base)];
	return (id ?? (latinShort(base) || cleanEn(base))) + SIDE_ID[side];
}
export const hasIdName = (base: string) => base in NAME_ID;
export const groupName = (g: AGroup) => NAME_ID[g.name] ?? (latinShort(g.name) || g.name);

/** Rantai grup dari akar ke grup terdekat. */
export function groupChain(gi: number): AGroup[] {
	const out: AGroup[] = []; const G = groups();
	let g = gi; let guard = 0;
	while (g >= 0 && guard++ < 40) { out.unshift(G[g]); g = G[g].parent; }
	return out;
}
/** Semua objek di bawah grup (rekursif). */
export function objsUnder(gi: number): number[] {
	const G = groups(); const out: number[] = []; const st = [gi];
	while (st.length) { const g = G[st.pop()!]; out.push(...g.objs); st.push(...g.children); }
	return out;
}
