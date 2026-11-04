'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const CORE=require('../campaign-core.js');
const DATA=require('../campaign-data.js');
const RIVAL=require('../rival-system.js');
const UI=require('../campaign-ui.js');

const game=fs.readFileSync(path.join(__dirname,'..','game.js'),'utf8');
const data=vm.runInNewContext(game.slice(game.indexOf('const TYPES='),game.indexOf('const ZONES='))+'\n({TYPES,DB,EVOS,MATCH})');
assert.equal(DATA.RIVALS.length,7);
assert.deepEqual(DATA.RIVALS.map(x=>x.id),RIVAL.CAMPAIGN_ROUNDS.map(x=>x.id));

for(const type of data.TYPES) {
  const own=RIVAL.poolFor(type,data.DB,data.EVOS)[0];
  const picked=RIVAL.pick({playerType:type,playerStarter:own.name,types:data.TYPES,dex:data.DB,evolutions:data.EVOS,match:data.MATCH,random:()=>.41});
  const roster=RIVAL.fullRoster(picked,data.DB,data.EVOS);
  assert.equal(roster.starter,picked.starter);
  assert.equal(new Set([roster.starter,...roster.support,...roster.reserve]).size,6);
  assert.deepEqual(RIVAL.fullRoster(JSON.parse(JSON.stringify(roster)),data.DB,data.EVOS),roster);
  for(const round of RIVAL.CAMPAIGN_ROUNDS) {
    const team=RIVAL.campaignTeam(roster,round,data.DB,data.EVOS);
    assert.equal(team.length,round.size);
    assert.equal(team.at(-1),RIVAL.evolvedSpecies(roster.starter,round.level,data.DB,data.EVOS));
    assert.equal(new Set(team).size,team.length);
  }
}

const player={
  version:1,type:'불꽃',party:[{name:'브케인',level:5,max:20,hp:20,moves:[]}],
  rival:RIVAL.fullRoster({type:'물',starter:'리아코',level:5},data.DB,data.EVOS),
  badges:4,defeated:['시온','시온 2차전'],champion:true,box:[],dex:{브케인:2}
};
const c=CORE.ensure(player);
assert.equal(c.rivalWins.RIV_01,undefined,'Legacy wins are separate from new story rival wins');
assert.equal(CORE.badgeCount(player),0,'Prototype four badges cannot count as eight story badges');
assert.equal(CORE.canFightRival(player,'RIV_02').ok,false,'Rival cannot be challenged outside lighthouse');

let html='',callbacks={},fights=[],saveCount=0;
function pop(body,setup){html=body;callbacks={};setup?.()}
function btn(id,callback){callbacks[id]=callback}
function acceptDialogue(){
  let count=0;
  while(typeof callbacks.campaignNext==='function'){
    callbacks.campaignNext();
    if(++count>30)throw new Error('Dialogue did not reach confirmation');
  }
  assert.equal(typeof callbacks.campaignAccept,'function');
  callbacks.campaignAccept();
}
const api={
  getState:()=>player,saveGame:()=>{saveCount++},pop,btn,
  back:()=>{},toast:()=>{},startBattle:npc=>{fights.push(npc)},
  createMon:()=>({name:'구구'}),dex:data.DB,evolutions:data.EVOS
};
UI.open(api);
assert.match(html,/라이벌 시온/);
assert.equal(typeof callbacks.campaignRival,'function','Opening town must show first rival');
callbacks.campaignRival();
assert.match(html,/시온에게 도전/);
assert.equal(typeof callbacks.campaignChallenge,'function');
callbacks.campaignChallenge();
assert.equal(fights.length,1);
assert.equal(fights[0].type,'rival');
assert.equal(fights[0].campaignBattleId,'RIV_01');
assert.equal(fights[0].level,5);
assert.deepEqual(fights[0].team,['리아코']);
assert.equal(CORE.completeBattle(player,'RIV_01').ok,true);
assert.equal(CORE.completeBattle(player,'RIV_01').ok,false,'Rival prize must not repeat');
assert.equal(player.campaign.flags.RIV_01_WON,true);
UI.open(api);
assert.equal(callbacks.campaignRival,undefined,'Won rival battle cannot be repeated');

for(const round of DATA.RIVALS.slice(1)){
  c.mapId=round.mapId;
  for(const needed of round.requires)c.flags[needed]=true;
  const allowed=CORE.canFightRival(player,round.id);
  assert.equal(allowed.ok,true,'Rival stage unlock failed: '+round.id+' '+allowed.reason);
  assert.equal(CORE.completeBattle(player,round.id).ok,true);
  assert.equal(CORE.completeBattle(player,round.id).ok,false);
}
assert.equal(Object.keys(c.rivalWins).length,7);

c.mapId='P01';
c.flags.POSTGAME_UNLOCKED=true;
UI.open(api);
assert.equal(typeof callbacks.post_PG_01_ARCHIVE,'function','Archive scene must become available');
callbacks.post_PG_01_ARCHIVE();
acceptDialogue();
assert.equal(c.flags.ARCHIVE_RESTORED,true);
assert.equal(CORE.completePostgame(player,'PG_01_ARCHIVE').ok,false);

c.mapId='D09';
c.flags.RESONANCE_NETWORK_OFF=true;
UI.open(api);
assert.equal(typeof callbacks.post_PG_03_SHRINE_RETURN,'function');
callbacks.post_PG_03_SHRINE_RETURN();
acceptDialogue();
assert.equal(c.flags.ARCEUS_RETURN_VISITED,true);
assert.ok(saveCount>0);

console.log('Campaign rivals: 17 challenge types x seven persistent rounds, first battle UI, rewards & archive/shrine postgame flags passed.');
