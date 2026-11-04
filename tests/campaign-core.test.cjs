'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const DATA=require('../campaign-data.js');
const CORE=require('../campaign-core.js');
const PUZZLES=require('../campaign-puzzles.js');
const game=fs.readFileSync(path.join(__dirname,'..','game.js'),'utf8');
const tables=vm.runInNewContext(game.slice(game.indexOf('const TYPES='),game.indexOf('const ZONES='))+'\n({DB,TYPES,EVOS})');
const {DB}=tables;

const report=CORE.validate(DB);
assert.deepEqual(report.problems,[],'Campaign registry and flags must be self-consistent');
assert.equal(Object.keys(DATA.MAPS).length,34);
assert.equal(DATA.GYMS.length,8);
assert.equal(DATA.LEAGUE.length,5);
assert.equal(DATA.STORY.length,39);
assert.deepEqual(report.unavailableSpecies,[],'Every planned gym, Elite Four and boss team must have a valid battle species');

function legacySave(){
  return {version:1,type:'불꽃',party:[{id:'saved-starter',name:'브케인',level:9,hp:22,shiny:false}],
    rival:{type:'물',starter:'리아코',level:5,support:['꼬부기','마릴','초라기']},
    x:74,y:13,badges:4,champion:true,defeated:['시온','네 번째 관장'],
    dex:{브케인:2},money:9400};
}
const original=legacySave();
const before=JSON.stringify(original);
const c=CORE.ensure(original);
assert.equal(c.mapId,'M00');
assert.equal(c.legacy.badges,4);
assert.equal(c.legacy.champion,true);
assert.equal(CORE.badgeCount(original),0,'Old four badges must never turn into new eight badges');
assert.equal(CORE.isChampion(original),false,'Old prototype champion flag cannot unlock postgame');
assert.equal(original.x,74);
assert.equal(original.party[0].id,'saved-starter');
assert.equal(original.money,9400);
assert.equal(original.rival.starter,'리아코');
assert.equal(original.campaign.flags.EV_00_CHOOSE_STARTER,true);
assert.strictEqual(CORE.ensure(original),c,'Repeated ensure must be stable');
assert.deepEqual(JSON.parse(JSON.stringify(c)),JSON.parse(JSON.stringify(CORE.ensure(original))));
assert.equal(before.includes('campaign'),false);

const state=legacySave();
state.badges=0;
state.champion=false;
state.defeated=[];
CORE.ensure(state);
function travel(id){
  const c=CORE.canTravel(state,id);
  assert.equal(c.ok,true, 'Cannot travel '+CORE.ensure(state).mapId+' -> '+id+': '+c.reason);
  const out=CORE.travel(state,id);
  assert.equal(out.ok,true);
  assert.equal(CORE.ensure(state).mapId,id);
}
function event(id){
  const allowed=CORE.canStartEvent(state,id);
  assert.equal(allowed.ok,true,'Cannot start '+id+': '+allowed.reason);
  const out=CORE.completeEvent(state,id);
  assert.equal(out.ok,true);
  assert.equal(CORE.flag(state,id),true);
  assert.equal(CORE.completeEvent(state,id).ok,false,'Event duplicated: '+id);
}
function gym(index){
  const id='GYM_'+String(index).padStart(2,'0');
  assert.equal(CORE.canStartGymPuzzle(state,id).ok,true,'Puzzle prerequisites for '+id);
  assert.equal(CORE.canFightGym(state,id).ok,false,'Gym must require puzzle first: '+id);
  for(const action of PUZZLES.GYMS[id].steps){
    const result=PUZZLES.attempt(state,id,action);
    assert.equal(result.ok,true,'Puzzle action failed for '+id);
  }
  assert.equal(CORE.canFightGym(state,id).ok,true,id);
  const result=CORE.completeBattle(state,id);
  assert.equal(result.ok,true,'Gym battle not applied: '+id);
  assert.equal(CORE.completeBattle(state,id).ok,false,'Gym duplicate credit: '+id);
  assert.equal(CORE.badgeCount(state),index);
  assert.equal(CORE.flag(state,'GYM_'+index+'_WON'),true);
}
assert.equal(CORE.canTravel(state,'D09').ok,false,'Cannot teleport to shrine');
travel('R01');event('EV_01_ROAD_TUTORIAL');
travel('M01');event('EV_02_CITY_01');gym(1);event('EV_03_FOREST_PERMIT');
travel('D01');event('EV_04_FOREST_RESCUE');event('EV_05_RING_FOUND');
travel('R02');travel('M02');event('EV_06_PORT_CARGO');
travel('D02');event('EV_07_WAREHOUSE');travel('M02');gym(2);event('EV_08_PORT_EXIT');
travel('R03');travel('M03');event('EV_09_POWER_ALERT');
travel('D03');event('EV_10_RESTORE_POWER');event('EV_11_POWER_LOG');
travel('M03');gym(3);event('EV_12_FOG_ACCESS');
travel('R04');travel('M04');event('EV_13_RUINS_INVITE');gym(4);
travel('D04');event('EV_14_DAWN_STONE');travel('M04');event('EV_15_OPEN_R05');
travel('R05');travel('M05');event('EV_16_HEAT_ALERT');event('EV_17_FACTORY_SAFE');gym(5);
travel('D05');event('EV_18_LAB_REPORT');travel('M05');event('EV_19_SNOW_ROUTE');
travel('R06');event('EV_20_SNOW_RESCUE');travel('M06');gym(6);
travel('D06');event('EV_21_HISTORY');travel('M06');event('EV_22_STEEL_ROAD');
travel('R07');travel('M07');event('EV_23_STEEL_REPORT');gym(7);
travel('D07');event('EV_24_BASE');travel('M07');event('EV_25_CHAMP_CONFESSION');event('EV_26_OPEN_R08');
travel('R08');travel('M08');event('EV_27_WIND_TRIAL');gym(8);
travel('D08');event('EV_28_SHRINE_APPROACH');travel('D09');
event('EV_29_ECLIPSE');event('EV_30_NODE_FOREST');event('EV_31_NODE_POWER');event('EV_32_NODE_SKY');
assert.equal(CORE.canStartEvent(state,'EV_33_KAIRON').ok,false,'Boss event must require a battle');
assert.equal(CORE.completeBattle(state,'ECL_KAIRON').ok,true);
assert.equal(CORE.completeBattle(state,'ECL_KAIRON').ok,false,'Eclipse boss reward must not repeat');
event('EV_34_ARCEUS');event('EV_35_DAWN');
travel('D08');travel('M08');travel('R09');event('EV_36_LEAGUE_ROAD');
travel('M09');travel('L01');
assert.equal(CORE.canFightLeague(state,'E4_02').ok,false,'League order must be enforced');
for(let index=1;index<=4;index++){
  const id='E4_0'+index;
  assert.equal(CORE.canFightLeague(state,id).ok,true);
  assert.equal(CORE.completeBattle(state,id).ok,true);
}
assert.equal(CORE.canFightLeague(state,'CHAMPION').ok,true);
CORE.completeBattle(state,'CHAMPION');
assert.equal(CORE.isChampion(state),true);
event('EV_38_CREDITS');
assert.equal(CORE.flag(state,'POSTGAME_UNLOCKED'),true);
travel('M09');travel('R09');travel('M08');travel('R08');travel('M07');travel('R07');
travel('M06');travel('R06');travel('M05');travel('R05');travel('M04');travel('P01');
const serialized=JSON.stringify(state);
const restored=JSON.parse(serialized);
assert.equal(CORE.flag(restored,'POSTGAME_UNLOCKED'),true);
assert.equal(CORE.badgeCount(restored),8);
assert.equal(CORE.ensure(restored).mapId,'P01');
assert.equal(CORE.ensure(restored).rewardClaims.EV_05_RING_FOUND,true);
assert.equal(CORE.completeEvent(restored,'EV_05_RING_FOUND').ok,false,'Rewards may not be reissued');
assert.equal(restored.party[0].id,'saved-starter');

// Failed league attempts clear only the attempt-specific flags.
const replay=legacySave();
CORE.ensure(replay);
const rr=CORE.ensure(replay);
rr.mapId='L01';
rr.flags.LEAGUE_REGISTERED=true;
rr.leagueRun.E4_01=true;
rr.flags.E4_1_CLEAR=true;
CORE.defeat(replay);
assert.equal(rr.leagueRun.E4_01,undefined);
assert.equal(rr.flags.E4_1_CLEAR,undefined);
assert.equal(rr.flags.LEAGUE_REGISTERED,true);
assert.equal(replay.party[0].id,'saved-starter');

console.log('Campaign data & state passed: 34 maps, 8 gyms, 39 events, full simulated story/league progression, old-save preservation, no duplicate rewards.');
console.log('All planned campaign opponent species now have battle data; field sprites for new species still need work.');
