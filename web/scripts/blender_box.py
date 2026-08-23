"""
VELMIRYS Box Asset — Blender 5.2
Génère Box_Base + Box_Lid (2 nœuds séparés), pivot charnière arrière,
matériaux PBR carton premium, bords biseautés, épaisseur Solidify.
Export GLB pour R3F (mutualisé accueil/builder).
PRD §18.2-18.3
"""
import bpy
import math
import os

# --- Clean scene ---
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for mat in list(bpy.data.materials):
    bpy.data.materials.remove(mat)

# --- Params (mètres) ---
W, D, H = 0.30, 0.20, 0.10
THICK = 0.002  # épaisseur carton
BEVEL = 0.0025 # biseautage 2.5mm
LID_CLEAR = 0.003
LID_H = 0.035

# --- Helpers ---
def add_box(name, size, location, bevel=True):
    bpy.ops.mesh.primitive_cube_add(location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (size[0]/2, size[1]/2, size[2]/2)
    bpy.ops.object.transform_apply(scale=True)
    # Bevel
    if bevel:
        mod_bevel = obj.modifiers.new("Bevel", 'BEVEL')
        mod_bevel.width = BEVEL
        mod_bevel.segments = 3
        mod_bevel.limit_method = 'ANGLE'
        mod_bevel.angle_limit = math.radians(60)
    # Solidify for thickness
    mod_solid = obj.modifiers.new("Solidify", 'SOLIDIFY')
    mod_solid.thickness = THICK
    mod_solid.offset = -1  # inward
    bpy.ops.object.modifier_apply(modifier="Bevel")
    bpy.ops.object.modifier_apply(modifier="Solidify")
    # Smooth
    bpy.ops.object.shade_smooth()
    return obj

# Box_Base
box_base = add_box("Box_Base", (W, D, H), (0, 0, H/2))
# Move origin to center of base (already at 0,0,H/2, but PRD wants origin au centre de la base)
# Center of base = (0,0,0). Currently cube centered at H/2, so bottom at 0. Good: origin world 0 is center of base bottom? We want origin at center of base volume center? PRD: "origine au centre de la base" — we interpret as center of bottom face at z=0.
# Our cube is centered at H/2 so bottom at 0, already correct. Origin stays at object center (H/2). Need to move origin to (0,0,0).
bpy.ops.object.select_all(action='DESELECT')
box_base.select_set(True)
bpy.context.view_layer.objects.active = box_base
# Move geometry so origin is at center of base
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.transform.translate(value=(0, 0, -H/2))
bpy.ops.object.mode_set(mode='OBJECT')
# After move, object location should be 0,0,0 and geometry bottom at 0
box_base.location = (0, 0, 0)

# Box_Lid
lid_outer_w = W + LID_CLEAR*2
lid_outer_d = D + LID_CLEAR*2
box_lid = add_box("Box_Lid", (lid_outer_w, lid_outer_d, LID_H), (0, 0, H + LID_H/2))
# Make lid hollow bottom open: remove bottom face via edit
# Instead of complex boolean, we keep as box with solidify inward, but need open bottom
# So delete bottom face
bpy.ops.object.select_all(action='DESELECT')
box_lid.select_set(True)
bpy.context.view_layer.objects.active = box_lid
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='DESELECT')
# Select bottom face (normal -Z)
import bmesh
# Use bmesh to delete bottom face more reliably
bpy.ops.object.mode_set(mode='OBJECT')
me = box_lid.data
bm = bmesh.new()
bm.from_mesh(me)
bm.faces.ensure_lookup_table()
# Find face with most negative Z center
bottom = None
min_z = float('inf')
for f in bm.faces:
    cz = sum(v.co.z for v in f.verts) / len(f.verts)
    if cz < min_z:
        min_z = cz
        bottom = f
if bottom:
    bmesh.ops.delete(bm, geom=[bottom], context='FACES')
bm.to_mesh(me)
bm.free()
me.update()
# Move origin to hinge (arrière, bord haut)
# Hinge at y = -D/2 - LID_CLEAR, z = H
# Move geometry so hinge becomes object origin for rotation
bpy.ops.object.mode_set(mode='OBJECT')
hinge_y = -D/2 - LID_CLEAR
hinge_z = H
# Translate vertices opposite
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.transform.translate(value=(0, -hinge_y, -hinge_z))
bpy.ops.object.mode_set(mode='OBJECT')
box_lid.location = (0, hinge_y, hinge_z)
# Now lid rotation at hinge: closed = 0, open ~105 deg around X

# --- Materials PBR ---
def make_carton(name, color):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    out = nodes.new('ShaderNodeOutputMaterial')
    out.location = (400, 0)
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.location = (0, 0)
    bsdf.inputs['Base Color'].default_value = color
    bsdf.inputs['Roughness'].default_value = 0.85
    bsdf.inputs['Metallic'].default_value = 0.0
    # Subtle grain via Noise (optional, not baked)
    links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    return mat

cream = (0.98, 0.965, 0.945, 1.0)  # #FAF7F2
lid_color = (0.992, 0.98, 0.965, 1.0)  # légèrement plus clair
mat_base = make_carton("Carton_Base", cream)
mat_lid = make_carton("Carton_Lid", lid_color)

box_base.data.materials.clear()
box_base.data.materials.append(mat_base)
box_lid.data.materials.clear()
box_lid.data.materials.append(mat_lid)

# --- Logo plane on lid (placeholder) ---
bpy.ops.mesh.primitive_plane_add(size=0.12, location=(0, hinge_y, hinge_z + LID_H + 0.001))
logo_plane = bpy.context.active_object
logo_plane.name = "Logo_Plane"
# Parent to lid so it follows
logo_plane.parent = box_lid
logo_plane.matrix_parent_inverse = box_lid.matrix_world.inverted()
# Simple material for logo (ink)
mat_logo = bpy.data.materials.new("Logo_Ink")
mat_logo.use_nodes = True
mat_logo.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.11, 0.098, 0.09, 1.0)  # #1C1917
mat_logo.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.9
logo_plane.data.materials.append(mat_logo)
# Rotate plane to be horizontal on lid top
logo_plane.rotation_euler = (0, 0, 0)

# --- Lighting ---
bpy.ops.object.light_add(type='SUN', location=(0.5, 1.0, 1.5))
sun = bpy.context.active_object
sun.data.energy = 2.0
sun.rotation_euler = (math.radians(45), math.radians(15), math.radians(30))
bpy.ops.object.light_add(type='AREA', location=(0, 0, 1.2))
area = bpy.context.active_object
area.data.energy = 150
area.data.size = 1.0
area.data.size_y = 1.0

# --- Camera (for preview, not exported) ---
bpy.ops.object.camera_add(location=(0.5, -0.6, 0.45))
cam = bpy.context.active_object
cam.rotation_euler = (math.radians(65), 0, math.radians(15))
bpy.context.scene.camera = cam

# --- Ensure applied transforms ---
for obj in [box_base, box_lid]:
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

print(f"[VELMIRYS] Box_Base verts={len(box_base.data.vertices)} polys={len(box_base.data.polygons)}")
print(f"[VELMIRYS] Box_Lid verts={len(box_lid.data.vertices)} polys={len(box_lid.data.polygons)}")
print(f"[VELMIRYS] Locations — Base:{tuple(box_base.location)} Lid:{tuple(box_lid.location)} hinge open")
