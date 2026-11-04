'use strict';
/**
 * DawnLegacy battle and progression rules.
 * Independent of canvas, camera, map and input code so that Work's field
 * refactor can be merged without rewriting combat. All random draws are
 * injected for reproducible CI tests.
 */
const BATTLE_ENGINE = (() => {
  const CHART = Object.freeze({
    '노말':{'바위':.5,'강철':.5,'고스트':0},
    '불꽃':{'불꽃':.5,'물':.5,'풀':2,'얼음':2,'벌레':2,'바위':.5,'드래곤':.5,'강철':2},
    '물':{'불꽃':2,'물':.5,'풀':.5,'땅':2,'바위':2,'드래곤':.5},
    '전기':{'물':2,'전기':.5,'풀':.5,'땅':0,'비행':2,'드래곤':.5},
    '풀':{'불꽃':.5,'물':2,'풀':.5,'독':.5,'땅':2,'비행':.5,'벌레':.5,'바위':2,'드래곤':.5,'강철':.5},
    '얼음':{'불꽃':.5,'물':.5,'풀':2,'얼음':.5,'땅':2,'비행':2,'드래곤':2,'강철':.5},
    '격투':{'노말':2,'얼음':2,'독':.5,'비행':.5,'에스퍼':.5,'벌레':.5,'바위':2,'고스트':0,'악':2,'강철':2,'페어리':.5},
    '독':{'풀':2,'독':.5,'땅':.5,'바위':.5,'고스트':.5,'강철':0,'페어리':2},
    '땅':{'불꽃':2,'전기':2,'풀':.5,'독':2,'비행':0,'벌레':.5,'바위':2,'강철':2},
    '비행':{'전기':.5,'풀':2,'격투':2,'벌레':2,'바위':.5,'강철':.5},
    '에스퍼':{'격투':2,'독':2,'에스퍼':.5,'악':0,'강철':.5},
    '벌레':{'불꽃':.5,'풀':2,'격투':.5,'독':.5,'비행':.5,'에스퍼':2,'고스트':.5,'악':2,'강철':.5,'페어리':.5},
    '바위':{'불꽃':2,'얼음':2,'격투':.5,'땅':.5,'비행':2,'벌레':2,'강철':.5},
    '고스트':{'노말':0,'에스퍼':2,'고스트':2,'악':.5},
    '드래곤':{'드래곤':2,'강철':.5,'페어리':0},
    '악':{'격투':.5,'에스퍼':2,'고스트':2,'악':.5,'페어리':.5},
    '강철':{'불꽃':.5,'물':.5,'전기':.5,'얼음':2,'바위':2,'강철':.5,'페어리':2},
    '페어리':{'불꽃':.5,'격투':2,'독':.5,'드래곤':2,'악':2,'강철':.5}
  });

  function move(name,type,power,pp,category='physical',accuracy=100,extra={}) {
    return Object.freeze({name,type,power,pp,category,accuracy,...extra});
  }
  const initial=[
    move('몸통박치기','노말',40,35),move('할퀴기','노말',40,35),
    move('불꽃세례','불꽃',40,25,'special',100,{inflict:'burn',chance:10}),
    move('물대포','물',40,25,'special'),move('덩굴채찍','풀',45,25),
    move('전기쇼크','전기',40,30,'special',100,{inflict:'paralysis',chance:10}),
    move('얼음뭉치','얼음',40,30,'physical',100,{priority:1}),
    move('태권당수','격투',50,25),move('독침','독',40,30,'physical',100,{inflict:'poison',chance:30}),
    move('진흙뿌리기','땅',40,25,'special'),move('날개치기','비행',50,30),
    move('염동력','에스퍼',50,25,'special'),
    move('벌레먹음','벌레',50,20),move('돌떨구기','바위',50,15),
    move('핥기','고스트',40,30,'physical',100,{inflict:'paralysis',chance:20}),
    move('용의숨결','드래곤',60,20,'special',100,{inflict:'paralysis',chance:30}),
    move('물기','악',60,25),move('메탈클로','강철',50,25),
    move('요정의바람','페어리',40,30,'special'),
    move('전광석화','노말',40,30,'physical',100,{priority:1}),
    move('화염방사','불꽃',90,15,'special',100,{inflict:'burn',chance:10}),
    move('불꽃엄니','불꽃',65,15,'physical',95,{inflict:'burn',chance:10}),
    move('열풍','불꽃',95,10,'special',90,{inflict:'burn',chance:10}),
    move('거품광선','물',65,20,'special'),
    move('파도타기','물',90,15,'special'),
    move('아쿠아테일','물',90,10,'physical',90),
    move('잎날가르기','풀',55,25,'physical',95),
    move('에너지볼','풀',90,10,'special'),
    move('솔라빔','풀',120,10,'special',100),
    move('스파크','전기',65,20,'physical',100,{inflict:'paralysis',chance:30}),
    move('10만볼트','전기',90,15,'special',100,{inflict:'paralysis',chance:10}),
    move('번개','전기',110,10,'special',70,{inflict:'paralysis',chance:30}),
    move('냉동빔','얼음',90,10,'special',100,{inflict:'freeze',chance:10}),
    move('눈사태','얼음',60,10),
    move('인파이트','격투',120,5),
    move('깨트리기','격투',75,15),
    move('독찌르기','독',80,20,'physical',100,{inflict:'poison',chance:30}),
    move('오물폭탄','독',90,10,'special',100,{inflict:'poison',chance:30}),
    move('지진','땅',100,10),move('땅고르기','땅',60,20),
    move('에어슬래시','비행',75,15,'special',95),
    move('브레이브버드','비행',120,5,'physical',100,{recoil:0.33}),
    move('사이코키네시스','에스퍼',90,10,'special'),
    move('환상빔','에스퍼',65,20,'special'),
    move('시저크로스','벌레',80,15),move('벌레의야단법석','벌레',90,10,'special'),
    move('스톤샤워','바위',75,10,'physical',90),move('스톤에지','바위',100,5,'physical',80),
    move('섀도볼','고스트',80,15,'special'),move('섀도클로','고스트',70,15),
    move('용의파동','드래곤',85,10,'special'),move('역린','드래곤',120,10),
    move('악의파동','악',80,15,'special'),move('깨물어부수기','악',80,15),
    move('아이언헤드','강철',80,15),move('러스터캐논','강철',80,10,'special'),
    move('문포스','페어리',95,15,'special'),
    move('칼춤','노말',0,20,'status',100,{boost:{atk:2},self:true}),
    move('고속이동','에스퍼',0,30,'status',100,{boost:{spe:2},self:true}),
    move('울음소리','노말',0,40,'status',100,{boost:{atk:-1}}),
    move('성장','노말',0,20,'status',100,{boost:{atk:1,spa:1},self:true}),
    move('전기자석파','전기',0,20,'status',90,{inflict:'paralysis'}),
    move('독가루','독',0,35,'status',75,{inflict:'poison'}),
    move('최면술','에스퍼',0,20,'status',60,{inflict:'sleep'}),
    move('도깨비불','불꽃',0,15,'status',85,{inflict:'burn'}),
    move('HP회복','노말',0,10,'status',100,{heal:0.5,self:true}),
    move('발버둥','노말',50,1,'physical',100,{recoil:.25})
  ];
  const MOVES=Object.freeze(Object.fromEntries(initial.map(m=>[m.name,m])));
  const tiers=Object.freeze({
    '노말':['몸통박치기','전광석화','칼춤','깨물어부수기'],
    '불꽃':['불꽃세례','불꽃엄니','화염방사','열풍'],
    '물':['물대포','거품광선','아쿠아테일','파도타기'],
    '풀':['덩굴채찍','잎날가르기','에너지볼','솔라빔'],
    '전기':['전기쇼크','스파크','전기자석파','10만볼트'],
    '얼음':['얼음뭉치','눈사태','냉동빔','냉동빔'],
    '격투':['태권당수','깨트리기','칼춤','인파이트'],
    '독':['독침','독가루','독찌르기','오물폭탄'],
    '땅':['진흙뿌리기','땅고르기','지진','지진'],
    '비행':['날개치기','전광석화','에어슬래시','브레이브버드'],
    '에스퍼':['염동력','환상빔','고속이동','사이코키네시스'],
    '벌레':['벌레먹음','시저크로스','벌레의야단법석','시저크로스'],
    '바위':['돌떨구기','스톤샤워','스톤에지','스톤에지'],
    '고스트':['핥기','섀도클로','도깨비불','섀도볼'],
    '드래곤':['용의숨결','용의파동','고속이동','역린'],
    '악':['물기','깨물어부수기','악의파동','악의파동'],
    '강철':['메탈클로','아이언헤드','러스터캐논','아이언헤드'],
    '페어리':['요정의바람','문포스','문포스','문포스']
  });
  function learnset(types,level) {
    const primary=tiers[types[0]]||tiers['노말'];
    const secondary=types[1]?tiers[types[1]]:null;
    const choices=['몸통박치기',primary[0]];
    if(level>=8) choices.push(secondary?secondary[0]:'전광석화');
    if(level>=14) choices.push(primary[1]);
    if(level>=20&&secondary)choices.push(secondary[1]);
    if(level>=24)choices.push(primary[2]);
    if(level>=33)choices.push(secondary?secondary[2]:primary[3]);
    if(level>=45)choices.push(primary[3]);
    return [...new Set(choices)].slice(-4).map(name=>freshMove(name));
  }
  const GYM_TMS=Object.freeze({
    'GYM_01':'잎날가르기','GYM_02':'거품광선','GYM_03':'스파크',
    'GYM_04':'섀도클로','GYM_05':'불꽃엄니','GYM_06':'눈사태',
    'GYM_07':'아이언헤드','GYM_08':'용의파동'
  });
  function availableMoves(mon,earnedGymIds=[],dex=[]){
    const species=dex.find(p=>p.name===mon.name);
    const types=species?.types||mon.types||[];
    const candidates=[];
    for(const level of [1,8,14,20,24,33,45]){
      if(level>mon.level)break;
      for(const move of learnset(types,level)){
        if(!candidates.includes(move.name))candidates.push(move.name);
      }
    }
    for(const id of earnedGymIds){
      const name=GYM_TMS[id];
      if(name&&types.includes(MOVES[name].type)&&!candidates.includes(name))candidates.push(name);
    }
    return candidates;
  }
  function learnMove(mon,name,index,{earnedGymIds=[],dex=[]}={}){
    if(!MOVES[name])return {ok:false,reason:'등록되지 않은 기술이야.'};
    if(!availableMoves(mon,earnedGymIds,dex).includes(name))
      return {ok:false,reason:'아직 배울 수 없는 기술이야.'};
    ensureMon(mon,dex);
    if(mon.moves.some(m=>m.name===name))return {ok:false,reason:'이미 배운 기술이야.'};
    if(mon.moves.length>=4&&(!Number.isInteger(index)||index<0||index>=mon.moves.length))
      return {ok:false,reason:'잊을 기술을 골라야 해.'};
    const learned=freshMove(name);
    const forgotten=mon.moves.length>=4?mon.moves[index].name:null;
    if(mon.moves.length<4)mon.moves.push(learned);
    else mon.moves[index]=learned;
    return {ok:true,name,forgot:forgotten};
  }
  function clearBattleStages(mon){
    if(!mon||typeof mon!=='object')return mon;
    mon.stages={atk:0,def:0,spa:0,spd:0,spe:0};
    return mon;
  }
  function freshMove(name){
    const found=MOVES[name];
    if(!found)throw new Error('등록되지 않은 기술: '+name);
    return {name:found.name,type:found.type,power:found.power,pp:found.pp,maxpp:found.pp,
      category:found.category,accuracy:found.accuracy};
  }
  function normalizeMove(raw){
    if(typeof raw==='string')return freshMove(raw);
    if(!raw||typeof raw.name!=='string')return freshMove('몸통박치기');
    const defined=MOVES[raw.name];
    if(!defined)return {name:raw.name,type:raw.type||'노말',power:Number.isFinite(raw.power)?raw.power:40,
      pp:Number.isFinite(raw.pp)?Math.max(0,raw.pp):35,maxpp:Number.isFinite(raw.maxpp)?raw.maxpp:35,
      category:'physical',accuracy:100};
    const maxpp=Number.isFinite(raw.maxpp)&&raw.maxpp>0?Math.floor(raw.maxpp):defined.pp;
    return {...freshMove(defined.name),maxpp,pp:Number.isFinite(raw.pp)?Math.max(0,Math.min(maxpp,Math.floor(raw.pp))):maxpp};
  }
  function ensureMon(mon,dex){
    if(!mon||typeof mon!=='object')throw new Error('포켓몬 정보가 없습니다.');
    const species=dex.find(p=>p.name===mon.name);
    if(!species)throw new Error('알 수 없는 포켓몬: '+mon.name);
    if(!Number.isInteger(mon.level)||mon.level<1)mon.level=1;
    mon.level=Math.min(100,mon.level);
    if(!Array.isArray(mon.types)||!mon.types.length)mon.types=species.types.slice();
    if(!Number.isFinite(mon.max)||mon.max<1)mon.max=Math.floor(2*species.hp*mon.level/100)+mon.level+10;
    if(!Number.isFinite(mon.hp))mon.hp=mon.max;
    mon.hp=Math.max(0,Math.min(mon.max,mon.hp));
    if(!Number.isFinite(mon.xp)||mon.xp<0)mon.xp=0;
    if(!Array.isArray(mon.moves)||!mon.moves.length)mon.moves=learnset(mon.types,mon.level);
    else mon.moves=mon.moves.slice(0,4).map(normalizeMove);
    if(!mon.status||!['poison','burn','paralysis','sleep','freeze'].includes(mon.status))mon.status=null;
    if(!mon.stages||typeof mon.stages!=='object')mon.stages={atk:0,def:0,spa:0,spd:0,spe:0};
    return mon;
  }
  function createMon(name,level,dex,random=Math.random,shinyOverride) {
    const species=dex.find(p=>p.name===name);
    if(!species)throw new Error('알 수 없는 포켓몬: '+name);
    if(!Number.isInteger(level)||level<1||level>100)throw new Error('잘못된 레벨');
    const max=Math.floor(2*species.hp*level/100)+level+10;
    const shiny=shinyOverride===undefined?random()<1/2048:!!shinyOverride;
    return {id:Math.floor(random()*0x100000000).toString(36)+'-'+Math.floor(random()*0x100000000).toString(36),
      name,types:species.types.slice(),level,xp:0,max,hp:max,shiny,
      moves:learnset(species.types,level),status:null,stages:{atk:0,def:0,spa:0,spd:0,spe:0}};
  }
  function effectiveness(type,defenderTypes) {
    return (defenderTypes||[]).reduce((product,t)=>product*(CHART[type]?.[t]??1),1);
  }
  const speedMap=Object.freeze({'꼬렛':72,'구구':56,'피죤':71,'피죤투':101,'피카츄':90,'라이츄':110,
    '브케인':65,'마그케인':80,'블레이범':100,'리아코':43,'엘리게이':58,'장크로다일':78,
    '치코리타':45,'베이리프':60,'메가니움':80,'이브이':55,'부스터':65,'샤미드':65,'쥬피썬더':130,
    '팬텀':110,'고오스':80,'고우스트':95,'미뇽':50,'신뇽':70,'망나뇽':80,'무장조':70,
    '코일':45,'레어코일':70,'전룡':55,'포푸니':115,'헤라크로스':85,'네이티오':95});
  function stageMultiplier(stage){const n=Math.max(-6,Math.min(6,Number(stage)||0));return n>=0?(2+n)/2:2/(2-n)}
  function stat(mon,kind,dex){
    const sp=dex.find(p=>p.name===mon.name);
    if(!sp)throw new Error('Unknown species '+mon.name);
    const base=kind==='hp'?sp.hp:kind==='spe'?(sp.spe||speedMap[mon.name]||60):
      kind==='def'||kind==='spd'?(kind==='spd'?(sp.spd||sp.def):sp.def):(kind==='spa'?(sp.spa||sp.atk):sp.atk);
    return Math.max(1,Math.floor((base*2*mon.level/100+5)*stageMultiplier(mon.stages?.[kind])));
  }
  function speed(mon,dex){
    let v=stat(mon,'spe',dex);
    if(mon.status==='paralysis')v=Math.floor(v*0.5);
    return v;
  }
  function randomValue(random){
    const n=random();
    if(!Number.isFinite(n)||n<0||n>=1)throw new Error('난수 범위 오류');
    return n;
  }
  function calculateDamage(attacker,defender,moveLike,dex,random=Math.random) {
    const m=MOVES[moveLike.name]||moveLike;
    if(!m.power||m.category==='status')return {value:0,mult:1,critical:false};
    const multi=m.name==='발버둥'?1:effectiveness(m.type,defender.types);
    if(multi===0)return {value:0,mult:0,critical:false};
    let atk=stat(attacker,m.category==='special'?'spa':'atk',dex);
    const def=stat(defender,m.category==='special'?'spd':'def',dex);
    if(attacker.status==='burn'&&m.category!=='special')atk=Math.max(1,Math.floor(atk/2));
    const core=Math.floor((2*attacker.level/5+2)*m.power*atk/Math.max(1,def)/50)+2;
    const stab=m.name!=='발버둥'&&attacker.types.includes(m.type)?1.5:1;
    const critical=randomValue(random)<1/16;
    const variation=0.85+randomValue(random)*0.15;
    const value=Math.max(1,Math.floor(core*multi*stab*(critical?1.5:1)*variation));
    return {value,mult:multi,critical};
  }
  function moveScore(attacker,defender,m,dex){
    const data=MOVES[m.name]||m;
    if(data.category==='status'){
      if(data.inflict&&defender.status)return 0;
      if(data.heal&&attacker.hp>=attacker.max*.7)return 0;
      if(data.boost&&Object.keys(data.boost).every(k=>Math.abs(attacker.stages?.[k]||0)>=6))return 0;
      return data.heal?90:attacker.level>=25?62:30;
    }
    const multiplier=effectiveness(data.type,defender.types);
    const power=data.power*(multiplier||0)*(attacker.types.includes(data.type)?1.5:1);
    return power*(data.accuracy||100)/100+(data.priority||0)*7;
  }
  function chooseAI(attacker,defender,dex,{trainer=false,random=Math.random}={}){
    const moves=(attacker.moves||[]).map((m,i)=>({m,i})).filter(x=>x.m.pp>0);
    if(!moves.length)return -1; // struggle
    if(!trainer)return moves[Math.floor(randomValue(random)*moves.length)].i;
    const ranked=moves.map(x=>({...x,score:moveScore(attacker,defender,x.m,dex)}))
      .sort((a,b)=>b.score-a.score);
    const choice=randomValue(random);
    return choice<.83?ranked[0].i:ranked[Math.floor(choice*ranked.length)].i;
  }
  function canInflict(target,status){
    if(target.status)return false;
    if(status==='poison'&&(target.types.includes('독')||target.types.includes('강철')))return false;
    if(status==='burn'&&target.types.includes('불꽃'))return false;
    if(status==='freeze'&&target.types.includes('얼음'))return false;
    return true;
  }
  function inflict(target,status,random){
    if(!canInflict(target,status))return false;
    target.status=status;
    if(status==='sleep')target.statusTurns=1+Math.floor(randomValue(random)*3);
    return true;
  }
  function moveResult(actor,target,moveIndex,dex,{random=Math.random,side='player'}={}){
    ensureMon(actor,dex);ensureMon(target,dex);
    let struggle=moveIndex===-1,chosen=struggle?freshMove('발버둥'):actor.moves[moveIndex];
    if(!chosen||(!struggle&&chosen.pp<=0))return {events:[{kind:'message',message:actor.name+'은(는) 사용할 수 있는 기술이 없어!'}]};
    const data=MOVES[chosen.name]||chosen;
    if(!struggle){chosen.pp=Math.max(0,chosen.pp-1)}
    const actorSide=side,targetSide=side==='player'?'enemy':'player';
    const events=[];
    if(actor.status==='sleep'){
      actor.statusTurns=Math.max(0,(actor.statusTurns||1)-1);
      if(actor.statusTurns>0){events.push({kind:'message',message:actor.name+'은(는) 잠들어 있어!'});return {events}}
      actor.status=null;events.push({kind:'message',message:actor.name+'이(가) 잠에서 깼어!'});
    }
    if(actor.status==='freeze'){
      if(randomValue(random)<.2){actor.status=null;events.push({kind:'message',message:actor.name+'이(가) 얼음에서 풀려났어!'})}
      else{events.push({kind:'message',message:actor.name+'은(는) 얼어 있어!'});return {events}}
    }
    if(actor.status==='paralysis'&&randomValue(random)<.25){
      events.push({kind:'message',message:actor.name+'은(는) 마비되어 움직이지 못했어!'});return {events}
    }
    const announcement=actor.name+'의 '+data.name+'!';
    if(randomValue(random)*100>=(data.accuracy??100)){
      events.push({kind:'move',actorSide,targetSide,message:announcement,summary:'하지만 기술이 빗나갔어!',fromHp:target.hp,toHp:target.hp,missed:true});
      return {events};
    }
    if(data.category==='status'){
      let summary='효과가 없었어.';
      if(data.heal){
        const gain=Math.max(1,Math.floor(actor.max*data.heal)),old=actor.hp;
        actor.hp=Math.min(actor.max,old+gain);
        summary=actor.hp>old?actor.name+'의 HP가 '+(actor.hp-old)+' 회복됐어!':'HP가 이미 가득해!';
        events.push({kind:'move',actorSide,targetSide:actorSide,message:announcement,summary,fromHp:old,toHp:actor.hp});
      }else if(data.boost){
        const dest=data.self?actor:target;
        for(const [statKey,delta] of Object.entries(data.boost))
          dest.stages[statKey]=Math.max(-6,Math.min(6,(dest.stages[statKey]||0)+delta));
        summary=(data.self?actor.name:target.name)+'의 능력치가 '+(Object.values(data.boost)[0]>0?'올랐어!':'내려갔어!');
        events.push({kind:'move',actorSide,targetSide:data.self?actorSide:targetSide,message:announcement,summary,fromHp:dest.hp,toHp:dest.hp});
      }else if(data.inflict){
        const typeImmune=effectiveness(data.type,target.types)===0;
        const changed=!typeImmune&&inflict(target,data.inflict,random);
        summary=changed?target.name+'에게 '+statusLabel(data.inflict)+' 상태가 생겼어!':'효과가 없었어.';
        events.push({kind:'move',actorSide,targetSide,message:announcement,summary,fromHp:target.hp,toHp:target.hp});
      }
      return {events};
    }
    const old=target.hp;
    const hit=calculateDamage(actor,target,data,dex,random);
    target.hp=Math.max(0,old-hit.value);
    let summary=hit.mult===0?'효과가 없었어!':target.name+'에게 '+(old-target.hp)+' 데미지!';
    if(hit.mult>1)summary+=' 효과가 굉장했다!';
    else if(hit.mult>0&&hit.mult<1)summary+=' 효과가 별로였다.';
    if(hit.critical)summary+=' 급소에 맞았다!';
    events.push({kind:'move',actorSide,targetSide,message:announcement,summary,fromHp:old,toHp:target.hp,mult:hit.mult,critical:hit.critical});
    if(target.hp>0&&hit.mult>0&&data.inflict&&randomValue(random)*100<(data.chance||0)&&inflict(target,data.inflict,random)){
      events.push({kind:'message',message:target.name+'에게 '+statusLabel(data.inflict)+' 상태가 생겼어!'});
    }
    if(data.recoil&&hit.value>0){
      const from=actor.hp;
      actor.hp=Math.max(0,actor.hp-Math.max(1,Math.floor((old-target.hp)*data.recoil)));
      events.push({kind:'residual',actorSide,targetSide:actorSide,fromHp:from,toHp:actor.hp,message:actor.name+'은(는) 반동 데미지를 입었어!'});
    }
    return {events};
  }
  const LABELS=Object.freeze({poison:'독',burn:'화상',paralysis:'마비',sleep:'잠듦',freeze:'얼음'});
  function statusLabel(value){return LABELS[value]||''}
  function residual(mon,side){
    if(mon.hp<=0||!['poison','burn'].includes(mon.status))return null;
    const old=mon.hp;
    mon.hp=Math.max(0,mon.hp-Math.max(1,Math.floor(mon.max/8)));
    return {kind:'residual',actorSide:side,targetSide:side,fromHp:old,toHp:mon.hp,
      message:mon.name+'은(는) '+statusLabel(mon.status)+'으로 피해를 입었어!'};
  }
  function round(player,enemy,playerIndex,dex,{trainer=false,random=Math.random}={}){
    ensureMon(player,dex);ensureMon(enemy,dex);
    const enemyIndex=chooseAI(enemy,player,dex,{trainer,random});
    const chosen=playerIndex===-1?MOVES['발버둥']:MOVES[player.moves[playerIndex]?.name]||player.moves[playerIndex];
    const hostile=enemyIndex===-1?MOVES['발버둥']:MOVES[enemy.moves[enemyIndex]?.name]||enemy.moves[enemyIndex];
    const playerPriority=chosen?.priority||0,enemyPriority=hostile?.priority||0;
    const ps=speed(player,dex),es=speed(enemy,dex);
    const playerFirst=playerPriority!==enemyPriority?playerPriority>enemyPriority:ps!==es?ps>es:randomValue(random)<.5;
    const order=playerFirst?[['player',player,enemy,playerIndex],['enemy',enemy,player,enemyIndex]]:
      [['enemy',enemy,player,enemyIndex],['player',player,enemy,playerIndex]];
    const events=[];
    for(const [side,actor,target,index] of order){
      if(actor.hp<=0||target.hp<=0)break;
      events.push(...moveResult(actor,target,index,dex,{random,side}).events);
    }
    for(const [mon,side] of [[player,'player'],[enemy,'enemy']]){
      const e=residual(mon,side);if(e)events.push(e);
    }
    return {events,playerFirst,enemyIndex,playerFainted:player.hp<=0,enemyFainted:enemy.hp<=0};
  }
  function enemyOnly(enemy,player,dex,{trainer=false,random=Math.random}={}){
    ensureMon(player,dex);ensureMon(enemy,dex);
    const index=chooseAI(enemy,player,dex,{trainer,random});
    const events=moveResult(enemy,player,index,dex,{random,side:'enemy'}).events;
    for(const [mon,side] of [[player,'player'],[enemy,'enemy']]){
      const e=residual(mon,side);if(e)events.push(e);
    }
    return {events,enemyIndex:index,playerFainted:player.hp<=0,enemyFainted:enemy.hp<=0};
  }
  function experienceAward(enemy,player,{trainer=false}={}){
    const ratio=Math.min(1.6,Math.max(.25,(enemy.level+5)/(player.level+5)));
    return Math.max(5,Math.round(enemy.level*enemy.level*(trainer?1.5:1)*ratio));
  }
  function expNeed(mon){return Math.max(1,mon.level*mon.level*2)}
  function evolveName(name,level,evos,selectedType){
    let result=name,guard=0;
    while(evos[result]&&guard++<15){
      const [next,threshold]=evos[result];
      if(level<threshold)break;
      let evolved=next;
      if(result==='이브이')evolved=({'불꽃':'부스터','물':'샤미드','전기':'쥬피썬더','에스퍼':'에브이','악':'블래키'})[selectedType]||'에브이';
      result=evolved;
    }
    return result;
  }
  function gain(mon,amount,{dex,evos,selectedType}){
    ensureMon(mon,dex);
    const logs=[];
    if(!Number.isFinite(amount)||amount<=0)return logs;
    mon.xp+=Math.floor(amount);
    while(mon.level<100&&mon.xp>=expNeed(mon)){
      mon.xp-=expNeed(mon);
      mon.level++;
      logs.push(mon.name+' Lv.'+mon.level+' 달성!');
      const oldName=mon.name,next=evolveName(oldName,mon.level,evos,selectedType);
      if(next!==oldName&&dex.some(p=>p.name===next)){
        mon.name=next;logs.push(oldName+' → '+next+' 진화!');
      }
      const sp=dex.find(p=>p.name===mon.name);
      const oldMax=mon.max;
      mon.max=Math.floor(2*sp.hp*mon.level/100)+mon.level+10;
      mon.hp=Math.max(0,Math.min(mon.max,mon.hp+Math.max(0,mon.max-oldMax)));
      mon.types=sp.types.slice();
      const candidates=learnset(mon.types,mon.level);
      for(const possible of candidates){
        if(mon.moves.some(m=>m.name===possible.name))continue;
        // At most one new technique is taught per level. Existing PP is preserved.
        if(mon.moves.length>=4)mon.moves.shift();
        mon.moves.push(possible);
        logs.push(mon.name+'은(는) '+possible.name+'을(를) 배웠어!');
        break;
      }
    }
    if(mon.level>=100)mon.xp=0;
    return logs;
  }
  function captureChance(target,kind='balls'){
    const missing=1-target.hp/Math.max(1,target.max);
    const status=target.status==='sleep'||target.status==='freeze'?.18:target.status?.10:0;
    return Math.min(.95,Math.max(.05,(kind==='great'?.35:.2)+.6*missing+status+(target.shiny?.02:0)));
  }
  return Object.freeze({CHART,MOVES,tiers,GYM_TMS,learnset,availableMoves,learnMove,clearBattleStages,freshMove,normalizeMove,ensureMon,createMon,
    effectiveness,calculateDamage,stat,speed,chooseAI,moveResult,round,enemyOnly,statusLabel,
    experienceAward,expNeed,evolveName,gain,captureChance});
})();
if(typeof module!=='undefined'&&module.exports)module.exports=BATTLE_ENGINE;
