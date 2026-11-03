'use strict';
// Field actors own visual movement only. Battles, collisions and saves remain in game.js.
const FIELD_ACTORS=(()=>{
 const STEP_MS=140, images=new Map();
 let motion=null, owner=null, walkCount=0;
 const direction=(dx,dy,fallback=2)=>dx>0?1:dx<0?3:dy>0?2:dy<0?0:fallback;
 const adjacent=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y)===1;
 const image=src=>{
  if(!images.has(src)){
   const entry={image:new Image(),status:'loading'};
   entry.image.onload=()=>{entry.status='ready'};
   entry.image.onerror=()=>{entry.status='error';console.error('Field asset unavailable:',src)};
   entry.image.src=src; images.set(src,entry);
  }
  return images.get(src);
 };
 for(const asset of Object.values(FIELD_MANIFEST.humans))image(asset.src);
 image('assets/field/shadow.png');
 function reset(state,canStand=()=>true){
  owner=state;motion=null;walkCount=0;
  const saved=state.fieldFollower;
  const trail=state.followerTrail?.[0];
  if(saved&&adjacent(saved,state)&&canStand(saved.x,saved.y))return;
  const offsets=[[0,1],[-1,0],[0,-1],[1,0]];
  const candidates=[trail,...[state.face??2,0,1,2,3].map(d=>({x:state.x+offsets[d][0],y:state.y+offsets[d][1],face:state.face??2}))];
  const point=candidates.find(p=>p&&adjacent(p,state)&&canStand(p.x,p.y));
  state.fieldFollower=point?{x:point.x,y:point.y,face:point.face??2}:{x:state.x,y:state.y,face:state.face??2};
 }
 function isMoving(now=performance.now()){return !!motion&&now-motion.started<STEP_MS}
 function move(state,from,now=performance.now()){
  if(owner!==state)reset(state);
  const follower=state.fieldFollower;
  const dx=from.x-follower.x,dy=from.y-follower.y;
  // Each accepted player step consumes the immediately preceding path vertex.
  const next={x:from.x,y:from.y,face:direction(dx,dy,follower.face)};
  motion={started:now,from:{...from},to:{x:state.x,y:state.y},followerFrom:{...follower},followerTo:next,walk:walkCount++};
  state.fieldFollower=next;
 }
 function sample(state,now=performance.now()){
  if(owner!==state)reset(state);
  // Healing / old saves may relocate the player outside a normal step.
  if(motion&&(state.x!==motion.to.x||state.y!==motion.to.y))reset(state);
  const t=motion?Math.min(1,Math.max(0,(now-motion.started)/STEP_MS)):1;
  const lerp=(a,b)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
  const moving=t<1;
  const player=moving?lerp(motion.from,motion.to):{x:state.x,y:state.y};
  const follower=moving?lerp(motion.followerFrom,motion.followerTo):{...state.fieldFollower};
  const phase=motion?(motion.walk%2+t)/2:0;
  return {player:{...player,face:state.face??2,moving,phase},follower:{...follower,face:state.fieldFollower.face,moving:moving&&(motion.followerFrom.x!==motion.followerTo.x||motion.followerFrom.y!==motion.followerTo.y),phase}};
 }
 function paint(ctx,asset,actor,x,y){
  const entry=image(asset.src);
  if(entry.status!=='ready')return false;
  const sequence=asset.sequence||Array.from({length:asset.frames},(_,i)=>i);
  const frame=actor.moving?sequence[Math.min(sequence.length-1,Math.floor(actor.phase*sequence.length))]:asset.idle;
  const shadow=image('assets/field/shadow.png');
  const footX=Math.round(x),footY=Math.round(y);
  if(shadow.status==='ready')ctx.drawImage(shadow.image,footX-12,footY-4);
  ctx.drawImage(entry.image,frame*asset.width,actor.face*asset.height,asset.width,asset.height,footX-asset.anchor[0],footY-asset.anchor[1],asset.width,asset.height);
  return true;
 }
 function draw(ctx,state,npcs,project,poses){
  const entities=npcs.map((n,i)=>({...n,face:n.face??2,moving:false,phase:0,asset:FIELD_MANIFEST.humans[n.type==='intro'?'researcher':n.champion?'leader':n.badge?'leader':i%2?'ranger':'traveler'],priority:0}));
  const mon=state.party?.[0],dex=mon&&FIELD_MANIFEST.names[mon.name];
  if(dex&&FIELD_MANIFEST.pokemon[dex])entities.push({...poses.follower,asset:FIELD_MANIFEST.pokemon[dex],priority:1});
  entities.push({...poses.player,asset:FIELD_MANIFEST.humans.hero,priority:2});
  entities.sort((a,b)=>a.y-b.y||a.priority-b.priority);
  let unavailable=false;
  for(const actor of entities){const [x,y]=project(actor.x,actor.y);if(!paint(ctx,actor.asset,actor,x+12,y+21))unavailable=true;}
  // Missing assets are explicit; never substitute an unrelated creature or a drawn dummy.
  const status=document.getElementById('fieldAssetStatus');
  if(status){status.hidden=!unavailable;status.textContent=[...images.values()].some(e=>e.status==='error')?'필드 이미지를 불러오지 못했습니다. 새로고침해 주세요.':'필드 이미지 불러오는 중…'}
 }
 return {reset,move,sample,draw,isMoving,STEP_MS};
})();
if(typeof module!=='undefined')module.exports=FIELD_ACTORS;
