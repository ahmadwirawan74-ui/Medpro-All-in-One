"""Tahap 1: buka Startup.blend Z-Anatomy, ambil semua mesh/kurva (sistem 1,3-9) dalam koordinat dunia,
triangulasi, simpan mentah ke raw/ (npz per sistem) + meta.json (hierarki grup, definisi, warna material).
Lisensi model: CC BY-SA 4.0 (Z-Anatomy, turunan BodyParts3D)."""
import os as _os
WORK = _os.environ.get("ZA_WORK", _os.path.expanduser("~/z-anatomy"))  # folder kerja: Z-Anatomy/Startup.blend, raw/, build/
MEDPRO = _os.path.dirname(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))

import bpy, numpy as np, json, re, os, sys
OUT = WORK + "/raw"; os.makedirs(OUT, exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=WORK + "/Z-Anatomy/Startup.blend", load_ui=False)
sc = bpy.context.scene.collection
SYS = {}
for c in sc.children:
    m = re.match(r'(\d): (.*)', c.name)
    if m and m.group(1) != '2': SYS[c.name] = m.group(1)

# kurangi resolusi kurva (pembuluh & saraf) agar tidak jutaan poligon
for cu in bpy.data.curves:
    if hasattr(cu, 'resolution_u'):
        cu.resolution_u = min(cu.resolution_u, 3)
        if cu.bevel_mode == 'ROUND': cu.bevel_resolution = min(cu.bevel_resolution, 1)
        if hasattr(cu, 'render_resolution_u'): cu.render_resolution_u = 0
dg = bpy.context.evaluated_depsgraph_get(); dg.update()

def mat_color(m):
    """Ambil warna dasar dari node: Base Color / Color pada Principled, Gamma, atau grup."""
    if m is None: return None
    if m.use_nodes and m.node_tree:
        prio = []
        for n in m.node_tree.nodes:
            for inp in n.inputs:
                if inp.is_linked or not hasattr(inp, 'default_value'): continue
                dv = inp.default_value
                if not hasattr(dv, '__len__') or len(dv) != 4: continue
                if inp.name in ('Base Color', 'Color', 'Color1', 'Color2'):
                    rank = {'BSDF_PRINCIPLED': 0, 'GAMMA': 1, 'GROUP': 2}.get(n.type, 3)
                    prio.append((rank, tuple(round(x, 3) for x in dv[:3])))
        if prio: return sorted(prio)[0][1]
    return tuple(round(x, 3) for x in m.diffuse_color[:3])

def chain(o):
    out = []; p = o.parent
    while p is not None:
        out.append(p.name); p = p.parent
    return out

meta = {"systems": {}, "groups": {}, "materials": {}, "texts": {}}
for cname, sid in SYS.items():
    col = sc.children[cname]
    objs = []; V = []; T = []; M = []
    voff = 0
    for o in col.all_objects:
        if o.type not in ('MESH', 'CURVE'): continue
        if o.hide_get() or o.hide_viewport: continue
        ev = o.evaluated_get(dg)
        try:
            me = ev.to_mesh()
        except Exception as e:
            print("skip", o.name, e); continue
        if me is None or len(me.polygons) == 0:
            ev.to_mesh_clear(); continue
        me.calc_loop_triangles()
        n = len(me.vertices)
        co = np.empty(n * 3, np.float32); me.vertices.foreach_get('co', co); co = co.reshape(-1, 3)
        mw = np.array(o.matrix_world, np.float32)
        co = co @ mw[:3, :3].T + mw[:3, 3]
        nt = len(me.loop_triangles)
        tri = np.empty(nt * 3, np.int32); me.loop_triangles.foreach_get('vertices', tri); tri = tri.reshape(-1, 3)
        mi = np.empty(nt, np.int32); me.loop_triangles.foreach_get('material_index', mi)
        mats = [ (s.material.name if s.material else '') for s in ev.material_slots ] or ['']
        for mn in mats:
            if mn and mn not in meta["materials"]: meta["materials"][mn] = mat_color(bpy.data.materials.get(mn))
        mi = np.clip(mi, 0, len(mats) - 1)
        objs.append({"name": o.name, "type": o.type, "parents": chain(o), "mats": mats,
                     "v": [voff, n], "t": [sum(len(x) for x in T), nt]})
        V.append(co); T.append(tri + voff); M.append(mi); voff += n
        ev.to_mesh_clear()
    np.savez_compressed(f"{OUT}/sys{sid}.npz", V=np.concatenate(V), T=np.concatenate(T), M=np.concatenate(M))
    meta["systems"][sid] = {"name": cname, "objects": objs}
    print(cname, len(objs), "obj", sum(len(t) for t in T), "tris", flush=True)

for o in bpy.data.objects:
    if o.name.endswith('.g'):
        meta["groups"][o.name] = o.parent.name if o.parent else None
for t in bpy.data.texts:
    s = t.as_string().strip()
    if len(s) > 20: meta["texts"][t.name] = s
json.dump(meta, open(f"{OUT}/meta.json", "w"))
print("done")
