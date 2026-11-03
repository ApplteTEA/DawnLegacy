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
 sprites.playerDown=sprite(r=>{
   r(7,33,23,4,'#477f55');r(9,25,7,10,'#283d58');r(20,25,7,10,'#283d58');
   r(7,15,23,13,'#244c75');r(11,15,15,13,'#367ab2');
   r(4,17,5,10,'#e7b48c');r(28,17,5,10,'#e7b48c');
   r(11,7,15,11,'#edbc93');r(9,6,19,4,'#453b3a');
   r(6,4,25,6,'#bf4654');r(11,0,15,5,'#d75e63');r(14,2,9,2,'#f4d6ba');
   r(13,12,3,3,'#303843');r(22,12,3,3,'#303843');
 },38,38);
 sprites.playerUp=sprite(r=>{
   r(7,33,23,4,'#477f55');r(9,25,7,10,'#283d58');r(20,25,7,10,'#283d58');
   r(7,15,23,13,'#244c75');r(11,15,15,13,'#367ab2');
   r(4,17,5,10,'#e7b48c');r(28,17,5,10,'#e7b48c');
   r(11,7,15,11,'#604843');r(9,6,19,4,'#453b3a');
   r(6,4,25,6,'#bf4654');r(11,0,15,5,'#d75e63');
   r(14,18,9,7,'#255b8b');
 },38,38);
 sprites.playerLeft=sprite(r=>{
   r(7,33,23,4,'#477f55');r(9,25,7,10,'#283d58');r(20,25,7,10,'#283d58');
   r(7,15,23,13,'#244c75');r(11,15,15,13,'#367ab2');
   r(7,17,5,10,'#e7b48c');r(26,17,5,10,'#e7b48c');
   r(11,7,15,11,'#edbc93');r(9,6,19,4,'#453b3a');
   r(6,4,25,6,'#bf4654');r(11,0,15,5,'#d75e63');
   r(12,12,3,3,'#303843');r(9,16,5,3,'#e0a37f');
 },38,38);
 sprites.playerRight=sprite(r=>{
   r(7,33,23,4,'#477f55');r(9,25,7,10,'#283d58');r(20,25,7,10,'#283d58');
   r(7,15,23,13,'#244c75');r(11,15,15,13,'#367ab2');
   r(7,17,5,10,'#e7b48c');r(26,17,5,10,'#e7b48c');
   r(11,7,15,11,'#edbc93');r(9,6,19,4,'#453b3a');
   r(6,4,25,6,'#bf4654');r(11,0,15,5,'#d75e63');
   r(23,12,3,3,'#303843');r(26,16,5,3,'#e0a37f');
 },38,38);
 sprites.npc=sprite(r=>{
   r(8,31,22,5,'#4d7853');r(10,24,7,10,'#344258');r(20,24,7,10,'#344258');
   r(8,15,22,12,'#57948b');r(4,17,5,10,'#e4b58d');r(28,17,5,10,'#e4b58d');
   r(11,7,15,11,'#e5b58f');r(8,4,22,6,'#476f87');r(12,0,14,5,'#648fa3');
   r(13,12,3,3,'#303843');r(22,12,3,3,'#303843');
 },38,38);
 sprites.follower=sprite(r=>{
   r(6,24,25,4,'#4d7d50');r(9,10,21,17,'#ba865b');
   r(6,3,9,14,'#d5a36e');r(23,3,9,14,'#d5a36e');
   r(13,12,13,10,'#e6b985');r(12,16,3,4,'#2e3740');r(25,16,3,4,'#2e3740');
   r(17,21,6,3,'#8e6148');r(10,25,6,5,'#986b4d');r(24,25,6,5,'#986b4d');
 },38,32);
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
   const img=(key,x,y,w,h)=>{const sp=sprites[key];if(sp)ctx.drawImage(sp,Math.round(x),Math.round(y),w||sp.width,h||sp.height)};
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
   const entities=npcs.map(n=>({x:n.x,y:n.y,key:'npc'}));
   if(state.party&&state.party.length)entities.push({x:state.x,y:state.y+1,key:'follower'});
   const dirs=['playerUp','playerRight','playerDown','playerLeft'];
   entities.push({x:state.x,y:state.y,key:dirs[state.face??2]});
   entities.sort((a,b)=>a.y-b.y);
   for(const a of entities){const [px,py]=P(a.x,a.y);img(a.key,px-7,py-11)}
 };
 return {draw,houseList};
})();