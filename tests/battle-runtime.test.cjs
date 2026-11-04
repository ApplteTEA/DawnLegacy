'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ENGINE=require('../battle-engine.js');

const source=fs.readFileSync(path.join(__dirname,'..','game.js'),'utf8');
const {DB,EVOS}=vm.runInNewContext(
  source.slice(source.indexOf('const TYPES='),source.indexOf('const ZONES='))+'\n({DB,EVOS})');
const start=source.indexOf('function beginBattle(');
const end=source.indexOf('const BATTLE_STYLE_TEXT',start);
assert.ok(start>0&&end>start,'Real in-game combat section must be available');
const combat=source.slice(start,end).replace(
  'function battleWait(ms){return new Promise(resolve=>setTimeout(resolve,ms))}',
  'function battleWait(){return Promise.resolve()}'
);
assert.match(combat,/BATTLE_ENGINE\.round/);
assert.match(combat,/BATTLE_ENGINE\.enemyOnly/);
assert.match(combat,/BATTLE_ENGINE\.experienceAward/);

function createState(player='블레이범',level=90){
  const p=ENGINE.createMon(player,level,DB,()=>.7,false);
  return {type:'불꽃',party:[p],box:[],money:3000,balls:12,great:2,
    potions:5,wins:0,defeated:[],dex:{},x:8,y:12,badges:0,champion:false};
}
function harness(state,forcedRandom=null){
  let saves=0,draws=0,lastToast='',lastModal='';
  const math=forcedRandom===null?Math:Object.assign(Object.create(Math),{random:()=>forcedRandom});
  const context={
    s:state,DB,EVOS,BATTLE_ENGINE:ENGINE,Math:math,
    rand:()=>0,lookup:name=>DB.find(p=>p.name===name),
    eligible:p=>!!(p.shiny||p.types.includes(state.type)),
    tag:p=>p.types.join('/'),
    createMon:(name,level,shiny)=>ENGINE.createMon(name,level,DB,()=>.7,shiny),
    gain:(p,amount)=>ENGINE.gain(p,amount,{dex:DB,evos:EVOS,selectedType:state.type}),
    expNeed:ENGINE.expNeed,
    document:{querySelector:()=>null},
    toast:m=>{lastToast=m},close(){},pop:h=>{lastModal=h},
    save:()=>{saves++},battleUI:()=>{draws++},btn(){},requestAnimationFrame(){},setTimeout(){},
    console
  };
  const script=['let fight=null,mode="world",dialogOpen=false;',combat,
    'this.api={beginBattle,attack,enemyTurn,capture,swap,getFight:()=>fight,getMode:()=>mode};'].join('\n');
  vm.runInNewContext(script,context);
  return {api:context.api,saves:()=>saves,draws:()=>draws,
    lastToast:()=>lastToast,lastModal:()=>lastModal};
}
async function main(){
  const state=createState();
  const runner=harness(state);
  state.party[0].stages.atk=6;
  runner.api.beginBattle({name:'테스트 트레이너',team:['치코리타'],level:5,prize:600});
  assert.equal(runner.api.getMode(),'battle');
  assert.equal(state.party[0].stages.atk,0,'Combat stat stages reset at a new battle');
  assert.equal(runner.api.getFight()?.enemies?.length,1);
  const originalPP=state.party[0].moves[0].pp;
  await runner.api.attack(0);
  assert.equal(state.party[0].moves[0].pp,originalPP-1);
  assert.equal(state.wins,1);
  assert.ok(state.defeated.includes('테스트 트레이너'));
  assert.equal(state.money,3600);
  assert.ok(runner.saves()>0);
  assert.equal(runner.api.getFight()?.index,1,'Victory advances to the end of the enemy team');
  assert.ok(state.party[0].xp>=0);
  assert.equal(state.party[0].stages.atk,0);

  const caughtState=createState('브케인',5);
  const captured=harness(caughtState,0);
  const wild=ENGINE.createMon('메리프',4,DB,()=>.7,true);
  captured.api.beginBattle(null,wild);
  assert.equal(captured.api.getMode(),'battle');
  captured.api.capture('balls');
  assert.equal(caughtState.balls,11,'Pokéball consumed exactly once');
  assert.equal(caughtState.party.length,2);
  assert.equal(caughtState.party[1].shiny,true,'Shiny remains after capture');
  assert.equal(caughtState.dex['메리프'],2);
  assert.equal(captured.api.getFight(),null,'Capture must end the battle');
  assert.equal(caughtState.party[1].name,'메리프');

  assert.match(source,/if\(currentXP>=need&&level<100\)/,
    'Lv.70+ EXP animation must not hang at the old cap');
  assert.match(source,/function manageMoves\(index,selected=null\)/);
  assert.match(source,/BATTLE_ENGINE\.captureChance/);
  console.log('Game combat bridge passed: victory, PP, XP, stage resets, shiny capture and Lv.100 animation guard.');
}
main().catch(error=>{console.error(error);process.exitCode=1});
