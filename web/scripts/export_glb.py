import bpy
import os

output = os.path.join(os.path.dirname(__file__), "..", "public", "models", "box.glb")
output = os.path.abspath(output)
# Only export Box_Base and Box_Lid (and Logo_Plane as child) — exclude lights/cam
for obj in bpy.data.objects:
    obj.select_set(obj.name in {"Box_Base", "Box_Lid", "Logo_Plane"})
bpy.context.view_layer.objects.active = bpy.data.objects.get("Box_Base")
# GLTF export settings — PBR, no animation baked
bpy.ops.export_scene.gltf(
    filepath=output,
    export_format='GLB',
    export_apply=True,
    export_texcoords=True,
    export_normals=True,
    export_materials='EXPORT',
    export_colors=True,
    export_cameras=False,
    export_lights=False,
    export_animations=False,  # pivot animé en code (PRD §18.2)
    export_force_sampling=False,
    export_selected=True,
)
print(f"[VELMIRYS] Exported GLB → {output} ({os.path.getsize(output)} bytes)")
