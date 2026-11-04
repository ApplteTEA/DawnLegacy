'use strict';
const assert=require('node:assert/strict');
const DATA=require('../campaign-data.js');
const CORE=require('../campaign-core.js');
const PUZZLES=require('../campaign-puzzles.js');

assert.equal(Object.keys(PUZZLES.GYMS).length,8);
for(const gym of DATA.GYMS){
  const puzzle=PUZZLES.GYMS[gym.id];
  assert.ok(puzzle,'Missing themed puzzle: '+gym.id);
  assert.equal(puzzle.steps.length,3);
  assert.equal(new Set(puzzle.choices.map(x=>x.id)).size,puzzle.choices.length);
  for(const step of puzzle.steps) assert.ok(puzzle.choices.find(x=>x.id===step));

  const save={version:1,type:'불꽃',party:[{name:'브케인',level:5}],badges:0};
  CORE.ensure(save);
  assert.equal(PUZZLES.isSolved(save,gym.id),false);
  assert.equal(PUZZLES.status(save,gym.id).step,0);
  assert.equal(PUZZLES.attempt(save,gym.id,'INVALID').ok,false);
  assert.equal(PUZZLES.status(save,gym.id).step,0);
  const wrong=puzzle.choices.find(x=>x.id!==puzzle.steps[0]).id;
  const incorrect=PUZZLES.attempt(save,gym.id,wrong);
  assert.equal(incorrect.ok,false);
  assert.equal(incorrect.step,0);
  assert.equal(PUZZLES.attempt(save,gym.id,puzzle.steps[0]).step,1);

  const restored=JSON.parse(JSON.stringify(save));
  assert.equal(PUZZLES.status(restored,gym.id).step,1,'Puzzle progress must survive saves');
  assert.equal(PUZZLES.reset(restored,gym.id),true);
  assert.equal(PUZZLES.status(restored,gym.id).step,0);
  for(let index=0;index<puzzle.steps.length;index++){
    const attempt=PUZZLES.attempt(restored,gym.id,puzzle.steps[index]);
    assert.equal(attempt.ok,true);
    assert.equal(attempt.step,index+1);
    assert.equal(attempt.solved,index===puzzle.steps.length-1);
  }
  assert.equal(PUZZLES.isSolved(restored,gym.id),true);
  assert.equal(PUZZLES.reset(restored,gym.id),false,'Solved progress is immutable');
  const serialized=JSON.parse(JSON.stringify(restored));
  assert.equal(PUZZLES.isSolved(serialized,gym.id),true);
  assert.equal(PUZZLES.attempt(serialized,gym.id,wrong).solved,true,'A solved puzzle cannot revert');
  assert.equal(PUZZLES.status(serialized,gym.id).step,3);
}

assert.equal(Object.keys(PUZZLES.EVENTS).length,3);
for(const [id,puzzle] of Object.entries(PUZZLES.EVENTS)){
  assert.equal(puzzle.steps.length,3);
  const save={version:1,type:'불꽃',party:[{name:'브케인'}]};
  CORE.ensure(save);
  assert.equal(PUZZLES.isSolved(save,id),false);
  for(const action of puzzle.steps.slice(0,2))assert.equal(PUZZLES.attempt(save,id,action).ok,true);
  const restored=JSON.parse(JSON.stringify(save));
  assert.equal(PUZZLES.status(restored,id).step,2);
  assert.equal(PUZZLES.attempt(restored,id,puzzle.steps[2]).solved,true);
  assert.equal(PUZZLES.isSolved(JSON.parse(JSON.stringify(restored)),id),true);
}

const player={version:1,type:'불꽃',party:[{name:'브케인'}],badges:4};
CORE.ensure(player);
const c=CORE.ensure(player);
c.mapId='M01';
c.flags.CITY_01_VISITED=true;
assert.equal(CORE.canStartGymPuzzle(player,'GYM_01').ok,true);
assert.equal(CORE.canFightGym(player,'GYM_01').ok,false,'Gym must be locked before puzzle');
for(const action of PUZZLES.GYMS.GYM_01.steps)PUZZLES.attempt(player,'GYM_01',action);
assert.equal(CORE.canFightGym(player,'GYM_01').ok,true);
assert.equal(CORE.completeBattle(player,'GYM_01').ok,true);
assert.equal(CORE.completeBattle(player,'GYM_01').ok,false,'Badge and reward are awarded only once');
assert.equal(player.badges,4,'Old four-badge progress must not be overwritten');
assert.equal(CORE.badgeCount(player),1);
assert.equal(PUZZLES.isSolved(player,'GYM_01'),true);
console.log('Eight gym and three shrine puzzles passed: checkpoint, retry, save compatibility and gated rewards.');
