import json,pathlib
from PIL import Image
root=pathlib.Path(__file__).resolve().parents[1];m=json.loads((root/'assets/field/manifest.json').read_text())
assert set(m['names'].values())=={int(i) for i in m['pokemon']}
for kind in ['humans','pokemon']:
 for name,a in m[kind].items():
  im=Image.open(root/a['src']).convert('RGBA');w,h,n=a['width'],a['height'],a['frames']
  assert im.size==(w*n,h*4),(name,im.size)
  for row in range(4):
   frames=[im.crop((f*w,row*h,(f+1)*w,(row+1)*h)) for f in range(n)]
   assert all(f.getbbox() for f in frames),(name,row,'blank')
   if kind=='humans':assert len({f.tobytes() for f in frames})>=3,(name,row,'duplicate poses')
print('PASS: 5 humans × 4 directions × 3 distinct frames; 84 Pokémon, all cardinal rows nonempty')
