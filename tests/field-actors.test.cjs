const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
let now=0;
const sandbox={Image:class{},performance:{now:()=>now},console,module:{exports:{}},FIELD_MANIFEST:{humans:{}}};
vm.runInNewContext(fs.readFileSync('field-actors.js','utf8'),sandbox);
const actors=sandbox.module.exports;
const state={x:8,y:12,face:1};actors.reset(state,()=>true);
function step(x,y,face){const from={x:state.x,y:state.y};Object.assign(state,{x,y,face});actors.move(state,from,now);}
step(9,12,1);assert.equal(state.fieldFollower.x,8);assert.equal(state.fieldFollower.y,12);
now=70;let p=actors.sample(state,now);assert.equal(p.player.x,8.5);assert.equal(actors.isMoving(now),true);
now=140;assert.equal(actors.isMoving(now),false);step(9,11,0);
assert.equal(state.fieldFollower.face,1,'follower follows its eastward segment at a northward turn');
now=280;step(8,11,3);assert.equal(state.fieldFollower.face,0,'follower moves north at the next corner');
now=420;p=actors.sample(state,now);assert.equal(p.player.moving,false);assert.equal(p.follower.face,0);
// A blocked player turn changes no follower vertices or facing.
state.face=2;p=actors.sample(state,now);assert.equal(p.follower.face,0);
// A migrated save cannot spawn a follower inside a forbidden tile.
const legacy={x:4,y:4,face:0,followerTrail:[{x:90,y:9}]};actors.reset(legacy,(x,y)=>x===3&&y===4);assert.equal(legacy.fieldFollower.x,3);
const restored=JSON.parse(JSON.stringify(state));actors.reset(restored,()=>true);assert.equal(restored.fieldFollower.face,0);
console.log('PASS: interpolation, corners, idle facing, blocked turns, save migration');
