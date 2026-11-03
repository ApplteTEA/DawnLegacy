'use strict';
// New overworld renderer. No dependency on legacy FIELD_ART or SVG loading.
const WORLD_V2=(()=>{
 const T=24;
 const palette={grass:'#8cbe78',grass2:'#96c983',grass3:'#78b46e',shade:'#5d9b5c',path:'#d9bd8b',pathLight:'#ead3a2',pathEdge:'#aa8e63',water:'#4a9eb2',waterLight:'#89d4d1'};
 const hash=(x,y)=>Math.abs((x*73856093^y*19349663)>>>0)%101;
 const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h)};
 const sprite=(paint,w,h)=>{
   const cv=document.createElement('canvas');cv.width=w;cv.height=h;
   const c=cv.getContext('2d');c.imageSmoothingEnabled=false;
   const r=(x,y,w,h,col)=>rect(c,x,y,w,h,col);
   paint(r);return cv;
 };
 const sprites={};
 const trainerImage=new Image();let trainerReady=false;
 trainerImage.onload=()=>{trainerReady=trainerImage.naturalWidth>0};
 trainerImage.src='data:image/png;base64,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';
 const pokemonIds={'치코리타':152,'베이리프':153,'메가니움':154,'브케인':155,'마그케인':156,'블레이범':157,'리아코':158,'엘리게이':159,'장크로다일':160,'이상해씨':1,'이상해풀':2,'이상해꽃':3,'파이리':4,'리자드':5,'리자몽':6,'꼬부기':7,'어니부기':8,'거북왕':9,'피카츄':25,'라이츄':26,'이브이':133,'구구':16,'꼬렛':19,'우파':194,'델빌':228,'식스테일':37,'가디':58,'미뇽':147,'고오스':92};
 const pokemonCache=new Map();
 const getPokemonImage=(name,back)=>{
   const id=pokemonIds[name];if(!id)return null;
   const key=id+':'+(back?'back':'front');
   if(!pokemonCache.has(key)){
     const image=new Image();const entry={image,ready:false,failed:false};
     image.onload=()=>{entry.ready=image.naturalWidth>0};
     image.onerror=()=>{entry.failed=true};
     image.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/'+(back?'back/':'')+id+'.png';
     pokemonCache.set(key,entry);
   }
   return pokemonCache.get(key);
 };
 // Local, authored chibi sprite assets; no external image dependency.
 const drawLpc=()=>false;
 sprites.tree=sprite(r=>{
   r(17,41,15,20,'#66503a');r(21,42,7,18,'#9c7850');
   r(3,21,43,28,'#244e39');r(6,13,37,31,'#347447');r(12,6,28,29,'#478d51');
   r(16,2,20,27,'#5da663');r(10,20,11,9,'#77bd71');r(26,9,10,7,'#8bcb81');
   r(8,37,35,5,'#275e3e');r(17,46,16,4,'#204a35');
   r(6,49,39,3,'#3e7d4b');
 },50,62);
 sprites.bush=sprite(r=>{
   r(2,12,30,11,'#285f42');r(5,6,25,15,'#438a55');
   r(10,2,17,14,'#5ca969');r(8,10,6,5,'#91cd83');r(21,6,5,4,'#a1d88e');
 },34,24);
 sprites.flower=sprite(r=>{
   r(2,12,21,11,'#418c54');r(5,8,17,12,'#5ea667');
   r(5,5,6,7,'#f4b8c5');r(14,3,7,7,'#ffe2a1');
   r(7,7,2,2,'#fff2ce');r(16,5,2,2,'#f9f4d1');
 },25,24);
 sprites.sign=sprite(r=>{
   r(10,16,5,20,'#705b42');r(3,3,21,17,'#b1875a');
   r(5,5,17,13,'#eedcb2');r(8,9,11,3,'#6e9d87');
 },27,36);
 sprites.lamp=sprite(r=>{
   r(12,13,5,25,'#655845');r(7,3,15,15,'#425b4d');
   r(9,5,11,11,'#ffdf93');r(6,1,17,4,'#314e44');
 },28,38);
 sprites.fence=sprite(r=>{
   r(0,11,32,4,'#ddc79a');r(0,20,32,4,'#c8ad7f');
   r(5,3,5,27,'#b89a70');r(24,3,5,27,'#b89a70');
 },32,32);
 // Original chibi pixel-art sprites: four directions and three walking poses.
 const colors={
  hero:{X:'#253044',H:'#483b3c',C:'#d44452',c:'#f37c80',W:'#fff3e5',S:'#f2c69e',s:'#dca17e',E:'#273747',B:'#376ca9',b:'#79b5e4',N:'#35466d',n:'#647fa8',K:'#403b49',k:'#e7e0d5',P:'#e6c77d'},
  npc:{X:'#283b48',H:'#59453b',C:'#406989',c:'#83a6c1',W:'#e6e2d3',S:'#e9bb91',s:'#d39475',E:'#293845',B:'#4b998c',b:'#92c5b0',N:'#4a6172',n:'#718c9e',K:'#383f4b',k:'#dfd6c4',P:'#c4ac85'},
  npc2:{X:'#3a3941',H:'#8b5e43',C:'#8c624a',c:'#cda27d',W:'#f2e7c8',S:'#f0c39b',s:'#d99b78',E:'#343c42',B:'#a77b65',b:'#d2a48b',N:'#605a68',n:'#8c8293',K:'#4c4142',k:'#eee0c7',P:'#c2ad76'}
 };
 const fronts=[
 '................',
 '.....XXXXXX.....',
 '....XCCCCCCX....',
 '...XCCccccCCX...',
 '..XCCcWWWWcCCX..',
 '..XCCCCCCCCCCX..',
 '...XHHHHHHHHX...',
 '....HSSSSSSH....',
 '...XSSSEESSX....',
 '...XSSSSSSSX....',
 '....SSsSSsSS....',
 '.....XSSSSX.....',
 '....XXBBBBXX....',
 '...XSBBbbBBSX...',
 '...XSBBBBBBSX...',
 '...XSBBBBBBSX...',
 '....XNNNNNNX....',
 '....XNNNNNNX....',
 '....XNNXXNNX....',
 '....XKKXXKKX....',
 '....XkkXXkkX....',
 '................'
 ];
 const backs=[
 '................',
 '.....XXXXXX.....',
 '....XCCCCCCX....',
 '...XCCccccCCX...',
 '..XCCCCCCCCCCX..',
 '..XCCCCCCCCCCX..',
 '...XHHHHHHHHX...',
 '....HHHHHHHH....',
 '...XHHHHHHHHX...',
 '...XHHHHHHHHX...',
 '....HHHHHHHH....',
 '.....XSSSSX.....',
 '....XXBBBBXX....',
 '...XSBBBBBBSX...',
 '...XSBBbbBBSX...',
 '...XSBBBBBBSX...',
 '....XNNNNNNX....',
 '....XNNNNNNX....',
 '....XNNXXNNX....',
 '....XKKXXKKX....',
 '....XkkXXkkX....',
 '................'
 ];
 const profiles=[
 '................',
 '.....XXXXXX.....',
 '....XCCCCCCX....',
 '...XCCccccCCX...',
 '..XCCcWWWWcCCX..',
 '..XCCCCCCCCCCX..',
 '....XHHHHHHHX...',
 '.....HSSSSSSX...',
 '....XSSSESSSX...',
 '....XSSSSSSSX...',
 '.....SSsSSsS....',
 '......XSSSX.....',
 '.....XXBBBBX....',
 '....XSBBbbBBSX..',
 '....XSBBBBBBSX..',
 '....XSBBBBBBSX..',
 '.....XNNNNNNX...',
 '.....XNNNNNNX...',
 '.....XNNXXNNX...',
 '.....XKKXXKKX...',
 '.....XkkXXkkX...',
 '................'
 ];
 const paint=(r,rows,palette)=>{
   rows.forEach((row,y)=>[...row].forEach((pixel,x)=>{
     if(pixel!=='.'&&palette[pixel])r(x*2,y*2,2,2,palette[pixel]);
   }));
 };
 const variantRows=(base,variant,direction,step)=>{
   const rows=base.slice();
   if(variant==='npc'){
     rows[1]='......XXXX......';
     rows[2]='.....XCCCCX.....';
     rows[3]='....XCCccCCX....';
     rows[4]='...XCCCCCCCCX...';
     rows[14]=rows[14].replace(/b/g,'W');
   }
   if(variant==='npc2'){
     rows[1]='.....XHHHHX.....';
     rows[2]='....XHHHHHHX....';
     rows[3]='...XHHHHHHHHX...';
     rows[4]='...XHHHHHHHHX...';
     rows[5]='....XHHHHHHX....';
   }
   if(step===1){
     rows[18]='....XNN..NNX....';
     rows[19]='...XKK....KKX...';
     rows[20]='...Xkk....kkX...';
   }else if(step===2){
     rows[18]='.....XNNNNX.....';
     rows[19]='.....XKKKKX.....';
     rows[20]='.....XkkkkX.....';
   }
   if(direction==='right')return rows.map(row=>[...row].reverse().join(''));
   return rows;
 };
 const human=(direction,variant,step)=>sprite(r=>{
   const base=direction==='up'?backs:direction==='down'?fronts:profiles;
   paint(r,variantRows(base,variant,direction,step),colors[variant]);
 },32,44);
 for(const [suffix,direction] of [['Down','down'],['Up','up'],['Left','left'],['Right','right']]){
   for(const kind of ['player','npc','npc2']){
     const variant=kind==='player'?'hero':kind;
     sprites[kind+suffix]=human(direction,variant,0);
     sprites[kind+suffix+'Walk']=human(direction,variant,1);
     sprites[kind+suffix+'Walk2']=human(direction,variant,2);
   }
 }
 sprites.npc=sprites.npcDown;
 const follower=(direction,frame=0)=>sprite(r=>{
   const up=direction==='up',left=direction==='left',right=direction==='right';
   r(3,27,22,3,'#4b7b50');
   r(7,21,6,7,'#a46d46');r(17,21+(frame?1:0),6,7,'#a46d46');
   r(5,11,21,14,'#b98454');r(7,13,17,10,'#e3b782');
   if(left||right){
     r(left?3:21,13,6,8,'#d6a16e');
     r(left?8:19,16,3,3,'#2c3941');
     r(left?13:15,22,5,3,'#976747');
   }else{
     r(5,3,7,13,'#cf9969');r(19,3,7,13,'#cf9969');
     r(7,6,3,6,'#edc18b');r(21,6,3,6,'#edc18b');
     if(!up){r(10,16,3,4,'#303941');r(20,16,3,4,'#303941');r(15,22,4,3,'#936144')}
     else{r(10,14,12,7,'#ab794e')}
   }
 },31,31);
 for(const [suffix,direction] of [['Down','down'],['Up','up'],['Left','left'],['Right','right']]){
   sprites['follower'+suffix]=follower(direction);
   sprites['follower'+suffix+'Walk']=follower(direction,1);
 }
 sprites.follower=sprites.followerDown;
 const makeHouse=(roof,trim,sign)=>{
   return sprite(r=>{
     r(6,67,119,8,'#4c7654');
     r(7,33,116,39,'#826e55');r(11,29,108,41,'#eadcc1');
     r(11,58,108,12,'#b7a07b');r(8,69,114,6,'#76684f');
     r(0,21,130,17,trim);r(7,7,116,20,roof);
     r(15,2,100,8,'#f0b18b');r(11,26,108,7,'#f6e1b2');
     for(let i=0;i<9;i++){r(11+i*12,15+(i%2)*3,8,3,trim)}
     for(const wx of [20,90]){
       r(wx-3,38,23,24,'#a88e6a');r(wx,41,17,18,'#f6e9cb');
       r(wx+2,43,13,14,'#5a9eb0');r(wx+4,44,5,5,'#b2dfd7');
     }
     r(53,49,25,23,'#5a453c');r(56,52,19,20,'#a8765c');r(71,61,3,3,'#f5d68b');
     r(49,72,32,5,'#d8c59e');
     if(sign){r(45,9,42,16,'#f7e8c7');r(49,12,34,10,sign);r(55,15,22,4,'#f5e7c8')}
   },130,78);
 };
 sprites.home=makeHouse('#c86568','#8d4a4e',null);
 sprites.home2=makeHouse('#b5815f','#7e573f',null);
 sprites.lab=makeHouse('#4d8fa6','#2d657a','#5d9eac');
 sprites.shop=makeHouse('#6da181','#3b735e','#b87664');
 const isTownPath=(x,y)=>y===11||y===12||(x>=8&&x<=9&&y>=5&&y<=18)||(y===18&&x>=8&&x<=17);
 const isTownPond=(x,y)=>x>=2&&x<=6&&y>=18&&y<=21;
 const path=(x,y)=>x<20?isTownPath(x,y):y===11||y===12||(x%20>=7&&x%20<=9&&y>=6&&y<=12);
 const pond=(x,y)=>x<20&&isTownPond(x,y);
 const houseList=[{x:2,y:5,kind:'home'},{x:12,y:5,kind:'lab'},{x:2,y:15,kind:'home2'},{x:13,y:15,kind:'shop'}];
 const trees=[];
 for(let y=1;y<=23;y+=2)for(let x=0;x<=19;x+=2){
   if((y<=3||y>=22||x===0||x===18)&&hash(x,y)%5!==0)trees.push([x,y]);
 }
 trees.push([5,4],[6,4],[16,4],[17,4],[1,9],[18,9],[1,14],[18,15],[7,20],[16,20]);
 const flowers=[[3,10],[4,10],[5,10],[12,10],[13,10],[14,10],[3,14],[5,14],[12,14],[15,14],[9,19],[11,19]];
 const draw=(ctx,canvas,state,npcs,isGrass)=>{
   const W=canvas.width,H=canvas.height;
   ctx.imageSmoothingEnabled=false;
   const camX=state.x*T-W/2+T/2,camY=state.y*T-H/2+T/2;
   const P=(x,y)=>[Math.round(x*T-camX),Math.round(y*T-camY)];
   const img=(key,x,y,w,h)=>{
     const sp=sprites[key],dw=w||(sp?sp.width:32),dh=h||(sp?sp.height:44);
     if(key.startsWith('player')&&trainerReady&&key.includes('Down')){
       ctx.save();ctx.imageSmoothingEnabled=false;
       const bob=key.includes('Walk')?Math.floor(Date.now()/100)%2:0;
       ctx.drawImage(trainerImage,Math.round(x),Math.round(y)+bob,dw,dh);ctx.restore();return;
     }
     if(key.startsWith('follower')){
       const name=state.party&&state.party[0]&&state.party[0].name;
       const back=key.includes('Up');
       const entry=getPokemonImage(name,back);
       if(entry&&entry.ready){
         ctx.save();ctx.imageSmoothingEnabled=false;
         const flip=key.includes('Left');
         if(flip){ctx.translate(Math.round(x+dw),0);ctx.scale(-1,1);ctx.drawImage(entry.image,0,Math.round(y)-2,dw,dh)}
         else ctx.drawImage(entry.image,Math.round(x),Math.round(y)-2,dw,dh);
         ctx.restore();return;
       }
     }
     if(drawLpc(ctx,key,x,y,dw,dh))return;
     if(sp)ctx.drawImage(sp,Math.round(x),Math.round(y),dw,dh);
   };
   rect(ctx,0,0,W,H,palette.grass);
   const minX=Math.max(0,Math.floor(camX/T)-2),maxX=Math.min(99,Math.ceil((camX+W)/T)+2);
   const minY=Math.max(0,Math.floor(camY/T)-2),maxY=Math.min(23,Math.ceil((camY+H)/T)+2);
   for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
     const [px,py]=P(x,y),n=hash(x,y),road=path(x,y),lake=pond(x,y),wild=x>=20&&isGrass(x,y);
     rect(ctx,px,py,T,T,road?palette.path:lake?palette.water:wild?palette.grass3:n%5===0?palette.grass2:palette.grass);
     if(road){
       if(!path(x,y-1)){rect(ctx,px,py,24,4,palette.pathEdge);rect(ctx,px,py+4,24,2,palette.pathLight)}
       if(!path(x,y+1))rect(ctx,px,py+21,24,3,palette.pathEdge);
       if(!path(x-1,y))rect(ctx,px,py,3,24,palette.pathEdge);
       if(!path(x+1,y))rect(ctx,px+21,py,3,24,palette.pathEdge);
       if(n%3===0)rect(ctx,px+8,py+13,5,2,'#c4a779');
     }else if(lake){
       rect(ctx,px+2,py+2,20,20,n%2?'#56adbc':'#69b8c1');
       if(!pond(x,y-1))rect(ctx,px,py,24,4,'#b2cc91');
       if(!pond(x,y+1))rect(ctx,px,py+20,24,4,'#b2cc91');
       if(!pond(x-1,y))rect(ctx,px,py,4,24,'#b2cc91');
       if(!pond(x+1,y))rect(ctx,px+20,py,4,24,'#b2cc91');
       rect(ctx,px+7,py+10,9,2,palette.waterLight);
     }else if(wild){
       for(let i=0;i<3;i++){rect(ctx,px+3+i*7,py+9,4,12,'#3f8754');rect(ctx,px+5+i*7,py+5,3,9,'#62aa68')}
     }else if(n<20){
       rect(ctx,px+6,py+15,2,5,'#69ab6b');rect(ctx,px+15,py+12,2,5,'#76b978');
     }
   }
   if(state.x<22){
     for(const [x,y] of trees){const [px,py]=P(x,y);img('tree',px-12,py-38)}
     for(const [x,y] of [[6,8],[10,8],[16,8],[6,16],[11,16],[17,17]]){
       const [px,py]=P(x,y);img('bush',px-5,py+2);
     }
     for(const h of houseList){const [px,py]=P(h.x,h.y);img(h.kind,px-8,py-49,104,81)}
     for(const [x,y] of flowers){const [px,py]=P(x,y);img('flower',px,py)}
     for(const [x,y] of [[3,9],[4,9],[5,9],[12,9],[13,9],[14,9],[2,13],[3,13],[14,13],[15,13]]){
       const [px,py]=P(x,y);img('fence',px,py);
     }
     for(const [x,y] of [[6,10],[16,10],[7,17]]){const [px,py]=P(x,y);img('lamp',px,py-12)}
     {const [px,py]=P(17,11);img('sign',px,py-12)}
   }else{
     for(let y=minY;y<=maxY;y+=2)for(let x=minX;x<=maxX;x+=2){
       if((y<=4||y>=20||hash(x,y)<14)&&!path(x,y)){const [px,py]=P(x,y);img('tree',px-12,py-38)}
     }
     for(let x=26;x<=95;x+=20){const [px,py]=P(x,5);img('lab',px-8,py-49,104,81)}
   }
   const directions=['Up','Right','Down','Left'];
   const direction=directions[state.face??2];
   const moving=Date.now()-(state.lastMoveAt||0)<260;
   const step=moving?(Math.floor(Date.now()/95)%2===0?'Walk':'Walk2'):'';
   const entities=npcs.map((n,i)=>({x:n.x,y:n.y,key:(i%3===0?'npc2':'npc')+directions[n.face??2],priority:0}));
   if(state.party&&state.party.length){
     const trail=state.followerTrail&&state.followerTrail.length?state.followerTrail[0]:null;
     const opposite=[[0,1],[-1,0],[0,-1],[1,0]][state.face??2];
     const fx=trail?trail.x:state.x+opposite[0],fy=trail?trail.y:state.y+opposite[1];
     const dx=state.x-fx,dy=state.y-fy;
     const followDirection=dx>0?'Right':dx<0?'Left':dy>0?'Down':dy<0?'Up':direction;
     entities.push({x:fx,y:fy,key:'follower'+followDirection+(moving?'Walk':''),priority:1});
   }
   entities.push({x:state.x,y:state.y,key:'player'+direction+step,priority:2});
   entities.sort((a,b)=>a.y-b.y||a.priority-b.priority);
   for(const a of entities){const [px,py]=P(a.x,a.y);img(a.key,px-4,py-17,32,44)}
 };
 return {draw,houseList};
})();