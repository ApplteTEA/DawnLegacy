'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ENGINE=require('../battle-engine.js');
const CORE=require('../campaign-core.js');
const source=fs.readFileSync(path.join(__dirname,'..','game.js'),'utf8');
const {DB}=vm.runInNewContext(source.slice(source.indexOf('const TYPES='),source.indexOf('const ZONES='))+'\n({DB})');
const begin=source.indexOf('function party(){'),end=source.indexOf('function box(){',begin);
assert.ok(begin>0&&end>begin);

const state={
  version:1,type:'불꽃',party:[ENGINE.createMon('브케인',35,DB,()=>0.7,true)],
  badge:0,defeated:[],box:[],dex:{},x:8,y:12
};
const campaign=CORE.ensure(state);
campaign.gymWins.GYM_05=true;
let displayed='',saved=0;
let elements={};
const context={
  s:state,DB,BATTLE_ENGINE:ENGINE,CAMPAIGN_CORE:CORE,
  card:p=>p.name,
  menu(){},save(){saved++},toast(msg){throw new Error(msg)},
  document:{
    querySelectorAll(selector){
      const attribute=selector.slice(1,-1);
      return elements[attribute]||[];
    }
  },
  btn(){},
  pop(html,setup){
    displayed=html;
    elements={};
    for(const group of ['data-manage','data-learn','data-forget']){
      const matches=[...html.matchAll(new RegExp(group+'="([0-9]+)"','g'))];
      elements[group]=matches.map(m=>({
        dataset:{[group.slice(5)]:m[1]},
        onclick:null
      }));
    }
    setup?.();
  }
};
vm.runInNewContext(source.slice(begin,end)+'\nthis.api={party,manageMoves};',context);
context.api.party();
assert.match(displayed,/기술 관리/);
assert.equal(elements['data-manage'].length,1);
elements['data-manage'][0].onclick();
assert.match(displayed,/기술 관리/);
assert.ok(displayed.includes('도깨비불'),'Fire gym TM should be offered after earning the badge');

const initialPP=state.party[0].moves[1].pp;
const optionNames=ENGINE.availableMoves(state.party[0],['GYM_05'],DB).filter(
  name=>!state.party[0].moves.some(move=>move.name===name));
const index=optionNames.indexOf('도깨비불');
assert.ok(index>=0);
const option=elements['data-learn'].find(item=>+item.dataset.learn===index);
assert.ok(option);
option.onclick();
assert.match(displayed,/도깨비불/);
assert.equal(elements['data-forget'].length,4,'A full moveset asks for a forgotten technique');
const forgotten=state.party[0].moves[0].name;
elements['data-forget'][0].onclick();
assert.equal(state.party[0].moves[0].name,'도깨비불');
assert.notEqual(forgotten,'도깨비불');
assert.equal(state.party[0].moves[1].pp,initialPP);
assert.equal(state.party[0].shiny,true);
assert.equal(saved,1,'Teaching a technique should save exactly once');
assert.deepEqual(JSON.parse(JSON.stringify(state.party[0])).moves[0].name,'도깨비불');

// A new save with an old four-badge prototype record must not inherit campaign TMs.
const other={
  version:1,type:'불꽃',party:[ENGINE.createMon('브케인',35,DB,()=>.7,false)],
  badges:4,champion:true
};
CORE.ensure(other);
const oldGymIds=CORE.DATA.GYMS.filter(g=>CORE.flag(other,g.id)).map(g=>g.id);
assert.deepEqual(oldGymIds,[]);
assert.equal(ENGINE.availableMoves(other.party[0],oldGymIds,DB).includes('도깨비불'),false);

console.log('Move management UI passed: earned badge TM, chosen forgotten slot, PP/shiny/legacy-save preservation.');
