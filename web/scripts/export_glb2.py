import bpy, os
output = os.path.abspath(os.path.join("public","models","box.glb"))
for o in bpy.data.objects:
    o.select_set(o.name in {"Box_Base","Box_Lid","Logo_Plane"})
bpy.context.view_layer.objects.active = bpy.data.objects.get("Box_Base")
bpy.ops.export_scene.gltf(
    filepath=output,
    export_format='GLB',
    export_apply=True,
    export_texcoords=True,
    export_normals=True,
    export_materials='EXPORT',
    export_cameras=False,
    export_lights=False,
    export_selected=True,
)
print(f"[VELMIRYS] Exported {output} {os.path.getsize(output)} bytes")
# Also save .blend for future edits
blend = os.path.abspath(os.path.join("public","models","box.blend"))
bpy.ops.wm.save_mainfile(filepath=blend)
print(f"[VELMIRYS] Saved blend {blend} {os.path.getsize(blend)} bytes")
