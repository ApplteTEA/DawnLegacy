'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const E=require('../battle-engine.js');
const R=require('../rival-system.js');
const source=fs.readFileSync(path.join(__dirname,'..','game.js'),'utf8');
const {DB,EVOS,TYPES,MATCH}=vm.runInNewContext(
  source.slice(source.indexOf('const TYPES='),source.indexOf('const ZONES='))+'\n({DB,EVOS,TYPES,MATCH})');
const make=(name,level=20,shiny=false)=>E.createMon(name,level,DB,()=>0.6,shiny);
const fixed=()=>0.6;

assert.equal(TYPES.length,17,'Fairy must not be added to selectable challenge types');
assert.ok(DB.length>=105,'All 13 additional final evolution battle species must exist');
assert.equal(new Set(DB.map(p=>p.name)).size,DB.length,'Species names must be unique');
assert.ok(Object.keys(E.MOVES).length>=60,'Battle engine must support more than legacy 18 attacks');
assert.equal(Object.keys(E.CHART).length,18,'Fairy is a defending battle type, not a selectable challenge');
for(const type of TYPES){
  assert.ok(R.poolFor(type,DB,EVOS).length>=1,'Every chosen type needs a starter option');
  assert.ok(E.tiers[type].length>=4,'Each type needs a four-stage move learnset');
}
assert.equal(E.effectiveness('전기',['물','비행']),4,'Both defending types combine');
assert.equal(E.effectiveness('전기',['물','땅']),0,'Ground immunity overrides Water weakness');
assert.equal(E.effectiveness('노말',['고스트']),0);
assert.equal(E.effectiveness('격투',['고스트']),0);
assert.equal(E.effectiveness('드래곤',['페어리']),0);
assert.equal(E.effectiveness('독',['페어리']),2);
assert.equal(E.effectiveness('강철',['페어리']),2);
assert.equal(E.effectiveness('불꽃',['풀','강철']),4);
assert.equal(E.effectiveness('물',['풀','드래곤']),.25);

// Legacy saves retain all identity/level/HP/shiny properties and old PP.
const legacy={id:'persisted',name:'브케인',types:['불꽃'],level:14,max:24,hp:9,xp:15,shiny:true,
  moves:[{name:'몸통박치기',type:'노말',power:40,pp:12,maxpp:35},
         {name:'불꽃세례',type:'불꽃',power:40,pp:6,maxpp:25}]};
const copied=JSON.parse(JSON.stringify(legacy));
E.ensureMon(legacy,DB);
assert.equal(legacy.id,'persisted');assert.equal(legacy.hp,9);
assert.equal(legacy.shiny,true);assert.equal(legacy.moves[1].pp,6);
assert.equal(legacy.moves[1].category,'special');
assert.equal(copied.status,undefined,'Fixture proves old save did not require new status fields');

// Strong type matchups and trainer AI.
const attacker=make('브케인'),defender=make('치코리타');
const ember=E.freshMove('불꽃세례');
const superEffective=E.calculateDamage(attacker,defender,ember,DB,fixed);
assert.equal(superEffective.mult,2);
assert.ok(superEffective.value>0);
assert.equal(E.calculateDamage(attacker,make('무장조'),E.freshMove('진흙뿌리기'),DB,fixed).value,0);
assert.equal(E.calculateDamage(attacker,make('고오스'),E.freshMove('몸통박치기'),DB,fixed).value,0);
const raw=superEffective.value;
attacker.status='burn';
assert.equal(E.calculateDamage(attacker,defender,ember,DB,fixed).value,raw,'Special damage is unaffected by burn');
attacker.status=null;
const tackle=E.freshMove('몸통박치기');
const clean=E.calculateDamage(attacker,defender,tackle,DB,fixed).value;
attacker.status='burn';
assert.ok(E.calculateDamage(attacker,defender,tackle,DB,fixed).value<clean,'Physical damage is reduced by burn');
attacker.status=null;

// Speed-based turn order and priority.
{
  const quick=make('포푸니',30),slow=make('롱스톤',30);
  quick.moves=[E.freshMove('몸통박치기')];slow.moves=[E.freshMove('몸통박치기')];
  const result=E.round(quick,slow,0,DB,{trainer:true,random:fixed});
  assert.equal(result.playerFirst,true);
  assert.equal(result.events.find(e=>e.kind==='move').actorSide,'player');
}
{
  const quick=make('포푸니',30),slow=make('롱스톤',30);
  quick.moves=[E.freshMove('몸통박치기')];slow.moves=[E.freshMove('얼음뭉치')];
  const result=E.round(quick,slow,0,DB,{trainer:true,random:fixed});
  assert.equal(result.playerFirst,false,'Ice Shard priority overrides faster opponent');
}
{
  const player=make('브케인',10),enemy=make('치코리타',10);
  player.moves=[E.freshMove('불꽃세례')];enemy.moves=[E.freshMove('몸통박치기')];
  const result=E.round(player,enemy,0,DB,{trainer:true,random:fixed});
  assert.equal(result.events.some(e=>e.kind==='move'),true);
  assert.equal(player.moves[0].pp,24,'Move PP is consumed once per action');
}
{
  const player=make('브케인',10),target=make('치코리타',10);
  player.moves=[E.freshMove('물대포')];player.moves[0].accuracy=0;
  const result=E.moveResult(player,target,0,DB,{random:fixed});
  assert.equal(result.events[0].missed,true,'Accuracy misses without dealing damage');
  assert.equal(target.hp,target.max);
}

// Status effects and immunity.
{
  const user=make('피카츄'),target=make('리아코');
  user.moves=[E.freshMove('전기자석파')];
  E.moveResult(user,target,0,DB,{random:fixed});
  assert.equal(target.status,'paralysis');
  assert.equal(E.speed(target,DB),Math.floor(E.stat(target,'spe',DB)*.5));
  const ground=make('우파');
  user.moves[0].pp=20;
  E.moveResult(user,ground,0,DB,{random:fixed});
  assert.equal(ground.status,null,'Ground Pokémon ignore Electric status moves');
  const poison=make('모다피');
  user.moves=[E.freshMove('독가루')];
  E.moveResult(user,poison,0,DB,{random:fixed});
  assert.equal(poison.status,null,'Poison Pokémon cannot be poisoned');
}
{
  const user=make('고오스'),target=make('리아코');
  user.moves=[E.freshMove('최면술')];
  E.moveResult(user,target,0,DB,{random:()=>0});
  assert.equal(target.status,'sleep');
  assert.ok(target.statusTurns>=1);
  user.moves=[E.freshMove('몸통박치기')];
  target.status='burn';target.statusTurns=0;
  const before=target.hp;
  const result=E.enemyOnly(user,target,DB,{trainer:false,random:fixed});
  assert.ok(result.events.some(e=>e.kind==='residual'));
  assert.ok(target.hp<before);
}
{
  const user=make('브케인',30),target=make('꼬마돌',30);
  user.moves=[E.freshMove('칼춤')];
  E.moveResult(user,target,0,DB,{random:fixed});
  assert.equal(user.stages.atk,2);
  const before=E.stat(user,'atk',DB);
  user.moves[0].pp=20;
  E.moveResult(user,target,0,DB,{random:fixed});
  assert.ok(E.stat(user,'atk',DB)>before);
}
{
  const user=make('치코리타',20),target=make('브케인',20);
  user.moves=[E.freshMove('HP회복')];user.hp=Math.floor(user.max/3);
  const before=user.hp;
  E.moveResult(user,target,0,DB,{random:fixed});
  assert.ok(user.hp>before&&user.hp<=user.max);
}
{
  const user=make('리아코',40),target=make('브케인',40);
  user.moves=[E.freshMove('물대포'),E.freshMove('파도타기')];
  assert.equal(E.chooseAI(user,target,DB,{trainer:true,random:()=>0}),1);
}
{
  const struggler=make('꼬렛',12),target=make('무우마',12);
  struggler.moves=[E.freshMove('몸통박치기')];
  struggler.moves[0].pp=0;
  const result=E.round(struggler,target,-1,DB,{random:fixed});
  assert.ok(result.events.some(e=>e.message?.includes('발버둥')),'PP depletion must not softlock');
}

// XP and evolution in legacy and newly expanded dex.
assert.equal(E.evolveName('브케인',14,EVOS,'불꽃'),'마그케인');
assert.equal(E.evolveName('브케인',36,EVOS,'불꽃'),'블레이범');
assert.equal(E.evolveName('리아코',35,EVOS,'물'),'장크로다일');
assert.equal(E.evolveName('이브이',20,EVOS,'물'),'샤미드');
assert.equal(E.evolveName('이브이',20,EVOS,'악'),'블래키');
assert.equal(E.evolveName('미뇽',55,EVOS,'드래곤'),'망나뇽');
{
  const mon=make('브케인',13,true);
  mon.xp=E.expNeed(mon)-1;
  const log=E.gain(mon,2,{dex:DB,evos:EVOS,selectedType:'불꽃'});
  assert.equal(mon.level,14);assert.equal(mon.name,'마그케인');
  assert.equal(mon.shiny,true);
  assert.ok(log.some(line=>line.includes('진화')));
  assert.ok(mon.moves.length<=4);
  assert.equal(mon.types[0],'불꽃');
  const saved=JSON.parse(JSON.stringify(mon));
  E.ensureMon(saved,DB);
  assert.equal(saved.name,'마그케인');assert.equal(saved.shiny,true);
}
{
  const mon=make('마그케인',35);
  mon.xp=E.expNeed(mon)-1;
  E.gain(mon,2,{dex:DB,evos:EVOS,selectedType:'불꽃'});
  assert.equal(mon.name,'블레이범');
}
{
  const mon=make('미뇽',54);
  mon.xp=E.expNeed(mon)-1;
  E.gain(mon,2,{dex:DB,evos:EVOS,selectedType:'드래곤'});
  assert.equal(mon.name,'망나뇽');
}
{
  const mon=make('브케인',95);
  mon.xp=0;
  E.gain(mon,999999,{dex:DB,evos:EVOS,selectedType:'불꽃'});
  assert.equal(mon.level,100);assert.equal(mon.xp,0);
}
assert.ok(E.experienceAward(make('치코리타',20),make('브케인',20),{trainer:true})>
 E.experienceAward(make('치코리타',20),make('브케인',20),{trainer:false}));
assert.ok(E.captureChance({hp:1,max:40,status:'sleep'},'great')>
 E.captureChance({hp:40,max:40,status:null},'balls'));

// Explicit Work boundary checks and real production loader order.
const bootstrap=fs.readFileSync(path.join(__dirname,'..','bootstrap.js'),'utf8');
const index=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
assert.match(bootstrap,/'battle-engine\.js','game\.js'/);
const revision=bootstrap.match(/const version='([^']+)'/)?.[1];
assert.ok(revision&&index.includes('bootstrap.js?v='+revision));
assert.ok(index.includes('rival-system.js?v='+revision));
assert.match(source,/BATTLE_ENGINE\.round\(p,e,i,DB/);
assert.match(source,/BATTLE_ENGINE\.gain\(p,amount/);
assert.match(source,/BATTLE_ENGINE\.experienceAward/);
console.log('Battle engine CI: 17 challenges, 18 defending types, 67 moves, speed/priority, statuses, AI, XP, 105 species and legacy saves OK.');
