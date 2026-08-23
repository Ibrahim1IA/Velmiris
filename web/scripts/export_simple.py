import bpy, os
output = os.path.abspath(os.path.join("public","models","box.glb"))
# Ensure only wanted objects visible, delete others
for o in list(bpy.data.objects):
    if o.name not in {"Box_Base","Box_Lid","Logo_Plane"}:
        bpy.data.objects.remove(o, do_unlink=True)
bpy.ops.export_scene.gltf(
    filepath=output,
    export_format='GLB',
    export_apply=True,
    export_yup=True,
    export_texcoords=True,
    export_normals=True,
    export_materials='EXPORT',
    export_cameras=False,
    export_lights=False,
)
print(f"[VELMIRYS] Exported {output} {os.path.getsize(output)} bytes")
blend = os.path.abspath(os.path.join("public","models","box.blend"))
bpy.ops.wm.save_mainfile(filepath=blend)
print(f"[VELMIRYS] Saved blend {blend} {os.path.getsize(blend)} bytes")
