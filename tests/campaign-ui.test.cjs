'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const DATA=require('../campaign-data.js');
const CORE=require('../campaign-core.js');
const PUZZLES=require('../campaign-puzzles.js');

const source=fs.readFileSync(path.join(__dirname,'..','campaign-ui.js'),'utf8');
const UI=vm.runInNewContext(source+'\nCAMPAIGN_UI', {CAMPAIGN_CORE:CORE,CAMPAIGN_DATA:DATA,CAMPAIGN_PUZZLES:PUZZLES,console});
const game=fs.readFileSync(path.join(__dirname,'..','game.js'),'utf8');
const {DB}=vm.runInNewContext(game.slice(game.indexOf('const TYPES='),game.indexOf('const ZONES='))+'\n({DB})');

let dialog='',buttons=new Map(),saved=0,battle=null,message='';
const state={
 version:1,type:'불꽃',x:8,y:12,party:[{id:'starter',name:'브케인',level:5,max:22,hp:5,moves:[{name:'몸통박치기',pp:1,maxpp:35}]}],
 rival:{type:'물',starter:'리아코',level:5},badges:2,champion:false,defeated:[],dex:{브케인:2}
};
const api={
 getState:()=>state,
 saveGame:()=>{saved++},
 pop:(h,callback)=>{dialog=h;buttons=new Map();if(callback)callback()},
 btn:(id,callback)=>buttons.set(id,callback),
 back:()=>{message='menu'},
 toast:(m)=>{message=m},
 startBattle:(npc,wild)=>{battle=npc?{npc}: {wild}},
 createMon:(name,level)=>({name,level}),
 dex:DB
};
function button(id){
 const cb=buttons.get(id);
 assert.equal(typeof cb,'function','Expected button '+id+' in dialog: '+dialog.slice(0,140));
 cb();
}
UI.open(api);
assert.match(dialog,/모험 지도/);
assert.match(dialog,/새벽마을/);
assert.equal(CORE.badgeCount(state),0,'Legacy badges are separate');
button('go_R01');
assert.match(dialog,/1번도로/);
button('event_EV_01_ROAD_TUTORIAL');
assert.match(dialog,/첫 여행/);
button('campaignAccept');
assert.equal(CORE.flag(state,'ROAD_TUTORIAL_DONE'),true);
button('go_M01');
button('event_EV_02_CITY_01');
button('campaignAccept');
assert.match(dialog,/체육관 퍼즐 풀기/);
assert.equal(CORE.canFightGym(state,'GYM_01').ok,false);
button('campaignPuzzle');
assert.match(dialog,/숲의 덩굴 수로/);
button('puzzle_roots'); // Mistake resets the sequence without losing other game progress.
assert.match(dialog,/순서가 맞지 않아/);
for(const step of PUZZLES.GYMS.GYM_01.steps)button('puzzle_'+step);
assert.equal(PUZZLES.isSolved(state,'GYM_01'),true);
assert.match(dialog,/관장에게 도전/);
button('gym_GYM_01');
assert.match(dialog,/솔비/);
button('campaignChallenge');
assert.ok(battle?.npc,'Gym battle must start from journal');
assert.equal(battle.npc.campaignBattleId,'GYM_01');
assert.equal(battle.npc.team[0],'모다피');
assert.equal(CORE.badgeCount(state),0,'Opening battle must not award badge');
assert.equal(CORE.completeBattle(state,battle.npc.campaignBattleId).ok,true);
UI.open(api);
assert.equal(CORE.badgeCount(state),1);
button('event_EV_03_FOREST_PERMIT');
button('campaignAccept');
button('go_D01');
assert.match(dialog,/이슬숲/);
button('campaignWild');
assert.ok(battle.wild,'Wild encounter should invoke existing battle entry');
assert.ok(DB.some(x=>x.name===battle.wild.name));
assert.ok(saved>=5);
assert.equal(state.party[0].id,'starter');

// Shrine nodes require an actual safe-disconnect sequence, not a one-click story flag.
const shrineState=JSON.parse(JSON.stringify(state));
const shrineProgress=CORE.ensure(shrineState);
shrineProgress.mapId='D09';
shrineProgress.visited.D09=true;
shrineProgress.flags.ECLIPSE_STARTED=true;
const shrineApi={...api,getState:()=>shrineState};
assert.equal(CORE.completeEvent(shrineState,'EV_30_NODE_FOREST').ok,false);
UI.open(shrineApi);
button('event_EV_30_NODE_FOREST');
assert.match(dialog,/숲의 공명 신호 분리/);
button('puzzle_record');
assert.match(dialog,/순서가 맞지 않아/);
for(const step of PUZZLES.EVENTS.EV_30_NODE_FOREST.steps)button('puzzle_'+step);
assert.match(dialog,/숲의 신호 차단/);
assert.equal(CORE.flag(shrineState,'NODE_FOREST_OFF'),false,'Puzzle alone must not grant event rewards');
button('campaignAccept');
assert.equal(CORE.flag(shrineState,'NODE_FOREST_OFF'),true);
assert.equal(CORE.completeEvent(shrineState,'EV_30_NODE_FOREST').ok,false);

const missing=DATA.GYMS.find(x=>x.id==='GYM_08');
assert.equal(CORE.missingSpecies(missing,DB).length,0,'Late-game opponent species must be available for battle');

// No DOM substitution should modify old movement code or replace sprite renderer.
const bootstrap=fs.readFileSync(path.join(__dirname,'..','bootstrap.js'),'utf8');
const index=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
assert.match(bootstrap,/'campaign-data\.js','campaign-puzzles\.js','campaign-core\.js'/);
assert.match(bootstrap,/'game\.js','campaign-ui\.js'/);
const ver=bootstrap.match(/const version='([^']+)'/)?.[1];
assert.ok(ver&&index.includes('bootstrap.js?v='+ver));
assert.ok(index.includes('rival-system.js?v='+ver));

console.log('Campaign UI smoke tests passed: journal, map travel, story event, gym battle bridge, save and wild encounter.');
