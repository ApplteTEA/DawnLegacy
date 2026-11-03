"""Reproducible, pinned field-only asset import. Requires Pillow; no runtime CDN."""
import concurrent.futures, hashlib, io, json, pathlib, re, urllib.request, xml.etree.ElementTree as ET
from PIL import Image, ImageDraw
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/field'; OUT.mkdir(parents=True,exist_ok=True)
REV='00423e7fdecbba4ae1c2ec2feafcb27431e8a54b'
BASE=f'https://raw.githubusercontent.com/PMDCollab/SpriteCollab/{REV}/'
CACHE=ROOT/'.asset-cache'; CACHE.mkdir(exist_ok=True)
def get(path):
 dest=CACHE/path; dest.parent.mkdir(parents=True,exist_ok=True)
 if not dest.exists():
  for attempt in range(3):
   try:
    dest.write_bytes(urllib.request.urlopen(BASE+path,timeout=40).read());break
   except Exception:
    if attempt==2: raise
 return dest.read_bytes()
game=(ROOT/'game.js').read_text()
names=json.loads(re.search(r'const POKEMON_DEX=(\{.*?\});',game).group(1))
manifest={'version':1,'tileSize':24,'sourceRevision':REV,'names':names,'humans':{},'pokemon':{}}
# Openmon uses 18x26 cells: down, left, right, up; each is an independently drawn row.
source=Image.open(OUT/'source/OpenmonSpriteSet1.png').convert('RGBA')
for name,col,row in [('hero',0,0),('researcher',3,0),('ranger',2,0),('leader',3,1),('traveler',2,1)]:
 sheet=Image.new('RGBA',(24*3,32*4))
 for outrow,inrow in enumerate([3,2,0,1]): # up,right,down,left
  for frame in range(3):
   cell=source.crop(((col*3+frame)*18,(row*4+inrow)*26,(col*3+frame+1)*18,(row*4+inrow+1)*26))
   # Remove the exported solid cell backdrop only, never repaint the character.
   colors=cell.getcolors(468); bg=max(colors)[1]
   if bg[3] and bg[:3] not in [(0,0,0),(255,255,255)]:
    cell.putdata([(0,0,0,0) if p==bg else p for p in cell.getdata()])
   # The original editor sheet has isolated white border markers.
   pix=cell.load()
   for y in [0,25]:
    for x in range(18):
     if pix[x,y][:3]==(255,255,255):pix[x,y]=(0,0,0,0)
   sheet.alpha_composite(cell,(frame*24+3,outrow*32+4))
 sheet.save(OUT/(name+'.png'))
 manifest['humans'][name]={'src':f'assets/field/{name}.png','width':24,'height':32,'frames':3,'anchor':[12,29],'idle':1,'sequence':[1,0,1,2]}
# Keep every cardinal direction from PMD's 8-direction walk animation. No flips or battle sprites.
def pokemon(dex):
 path=f'sprite/{dex:04d}/'
 root=ET.fromstring(get(path+'AnimData.xml'))
 anim=next(a for a in root.find('Anims') if a.findtext('Name')=='Walk')
 w,h=int(anim.findtext('FrameWidth')),int(anim.findtext('FrameHeight'))
 durations=[int(d.text) for d in anim.find('Durations')]
 im=Image.open(io.BytesIO(get(path+'Walk-Anim.png'))).convert('RGBA')
 frames=len(durations); rows=[4,2,0,6]
 cells=[im.crop((f*w,r*h,(f+1)*w,(r+1)*h)) for r in rows for f in range(frames)]
 boxes=[c.getbbox() for c in cells if c.getbbox()]
 box=(min(b[0] for b in boxes),min(b[1] for b in boxes),max(b[2] for b in boxes),max(b[3] for b in boxes))
 bw,bh=box[2]-box[0],box[3]-box[1]
 scale=min(1,44/bw,36/bh); dw,dh=max(1,round(bw*scale)),max(1,round(bh*scale))
 cw,ch=dw+4,dh+4; sheet=Image.new('RGBA',(cw*frames,ch*4))
 for i,c in enumerate(cells):
  crop=c.crop(box)
  if scale<1:crop=crop.resize((dw,dh),Image.Resampling.NEAREST)
  sheet.alpha_composite(crop,((i%frames)*cw+2,(i//frames)*ch+2))
 target=OUT/'pokemon'/f'{dex:04d}.png';target.parent.mkdir(exist_ok=True);sheet.save(target)
 credit=get(path+'credits.txt').decode()
 return str(dex),{'src':f'assets/field/pokemon/{dex:04d}.png','width':cw,'height':ch,'frames':frames,'anchor':[cw//2,ch-2],'idle':0,'durations':durations,'scale':scale,'source':BASE+path+'Walk-Anim.png','sha256':hashlib.sha256(get(path+'Walk-Anim.png')).hexdigest(),'credits':credit}
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
 for dex,entry in pool.map(pokemon,sorted(set(names.values()))):
  manifest['pokemon'][dex]=entry;print('Imported',dex,flush=True)
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
(ROOT/'field-manifest.js').write_text("'use strict';\nconst FIELD_MANIFEST="+json.dumps(manifest,ensure_ascii=False,separators=(',',':'))+';\n')
for name in ['LICENSE.md','credit_names.txt']:(OUT/'source'/name).write_bytes(get(name))
shadow=Image.new('RGBA',(24,8));d=ImageDraw.Draw(shadow);d.ellipse((1,1,22,6),fill=(31,49,43,64));shadow.save(OUT/'shadow.png')
print('Imported all',len(manifest['pokemon']),'species')
