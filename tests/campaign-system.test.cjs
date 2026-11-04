'use strict';

const assert = require('node:assert/strict');
const CAMPAIGN = require('../campaign-system.js');
const {MAPS,GYMS,EVENTS} = CAMPAIGN;

assert.equal(MAPS.length,34);
assert.equal(GYMS.length,8);
assert.equal(EVENTS.length,60);
assert.deepEqual(CAMPAIGN.check(),[],'World links, event dependencies, and gym references must be coherent');
assert.equal(GYMS[0].leader,'솔비');
assert.equal(GYMS.at(-1).leader,'승천');

const saved={
  version:1, type:'물', x:55,y:12, party:[{name:'리아코',shiny:false,id:'s1'}],
  badges:4,champion:true,defeated:['시온','시온 2차전','첫 번째 관장'],
  rival:{type:'풀',starter:'치코리타',support:['구구','캐터피','메리프']},
  box:[],dex:{리아코:2}, money:3000
};
const baseline=JSON.stringify(saved);
const state=CAMPAIGN.ensure(saved);
assert.equal(saved.version,1,'Legacy save version must remain intact');
assert.equal(saved.badges,4,'Legacy badges must not be rewritten');
assert.equal(saved.champion,true);
assert.equal(saved.party[0].name,'리아코');
assert.equal(saved.rival.starter,'치코리타');
assert.equal(state.legacySnapshot.badges,4);
assert.equal(state.legacySnapshot.champion,true);
assert.deepEqual(state.legacySnapshot.defeated,['시온','시온 2차전','첫 번째 관장']);
assert.equal(state.flags.GYM_4_WON,undefined,'Legacy badges cannot silently unlock new official gym');
assert.equal(state.flags.CHAMPION_WON,undefined,'Legacy champion cannot count as new story champion');

const afterEnsure=JSON.stringify(saved);
CAMPAIGN.ensure(saved);
assert.equal(JSON.stringify(saved),afterEnsure,'Migration must be idempotent');

assert.equal(CAMPAIGN.eligible(saved,'GYM_01'),false);
assert.equal(CAMPAIGN.next(saved).id,'EV_00_CHOOSE_STARTER');
assert.throws(()=>CAMPAIGN.complete(saved,'GYM_01'),/선행 조건/);
assert.throws(()=>CAMPAIGN.complete(saved,'MISSING_EVENT'),/알 수 없는/);

assert.equal(CAMPAIGN.complete(saved,'EV_00_CHOOSE_STARTER'),true);
assert.equal(CAMPAIGN.complete(saved,'EV_00_CHOOSE_STARTER'),false,'Event completion must be idempotent');
assert.equal(CAMPAIGN.next(saved).id,'EV_01_ROAD_TUTORIAL');
assert.equal(CAMPAIGN.eligible(saved,'GYM_01'),false);

const restored=JSON.parse(JSON.stringify(saved));
assert.equal(restored.rival.starter,'치코리타');
assert.equal(restored.campaign.legacySnapshot.badges,4);
assert.equal(restored.campaign.flags.STARTER_CHOSEN,true);

const full={version:1,badges:0,champion:false,defeated:[]};
let completed=0;
for(const event of EVENTS){
 assert.equal(CAMPAIGN.eligible(full,event.id),true,'Event must have an attainable prerequisite chain: '+event.id);
 assert.equal(CAMPAIGN.complete(full,event.id),true);
 completed++;
}
assert.equal(completed,EVENTS.length);
assert.equal(full.campaign.flags.GYM_8_WON,true);
assert.equal(full.campaign.flags.ECLIPSE_RESOLVED,true);
assert.equal(full.campaign.flags.CHAMPION_WON,true);
assert.equal(full.campaign.flags.POSTGAME_UNLOCKED,true);
assert.equal(CAMPAIGN.next(full),null);
assert.equal(CAMPAIGN.eligible(full,'EV_00_CHOOSE_STARTER'),false);
assert.deepEqual(GYMS.map(gym=>gym.id),Array.from({length:8},(_,i)=>'GYM_0'+(i+1)));

const money=full.money||0;
assert.equal(CAMPAIGN.claim(full,'GYM_1_REWARD',s=>{s.money=(s.money||0)+800}),true);
assert.equal(CAMPAIGN.claim(full,'GYM_1_REWARD',s=>{s.money+=800}),false);
assert.equal(full.money,money+800,'Reward must only be paid once');
assert.equal(full.campaign.rewards.GYM_1_REWARD,true);

assert.equal(baseline.includes('"campaign"'),false);
console.log('Campaign tests passed: 34 world locations, 8 gyms, 54 event dependencies, legacy saves, duplicate reward protection.');
