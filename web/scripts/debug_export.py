import bpy
# List export ops
print("ops:", [a for a in dir(bpy.ops.export_scene) if 'gltf' in a.lower()])
# Try to inspect rna
try:
    props = bpy.ops.export_scene.gltf.get_rna_type().properties
    for k in props.keys():
        print(k)
except Exception as e:
    print("inspect fail", e)
# Try generic gltf export without selected
import os, inspect
print(inspect.getsource(bpy.ops.export_scene.gltf)[:1000] if hasattr(bpy.ops.export_scene.gltf, '__doc__') else "no doc")
print(bpy.ops.export_scene.gltf.__doc__)
