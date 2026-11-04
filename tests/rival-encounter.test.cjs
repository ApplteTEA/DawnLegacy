'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'game.js'), 'utf8');
function between(begin, end) {
  const from = source.indexOf(begin);
  const until = source.indexOf(end, from);
  assert.ok(from >= 0 && until > from, 'Missing game source section: ' + begin);
  return source.slice(from, until);
}

const definitions = between('const ZONES=', "const SAVE=");
const world = vm.runInNewContext(definitions + '\n({NPCS,ZONES})');
const npc = world.NPCS.find(actor => actor.type === 'rival');

assert.ok(npc, 'Rival must exist as a field NPC');
assert.equal(npc.name, '시온');
assert.equal(npc.x, 10);
assert.equal(npc.y, 12);
assert.equal(npc.level, 5);
assert.equal(world.NPCS.filter(actor => actor.type === 'rival').length, 1);
assert.equal(world.NPCS.filter(actor => actor.x === npc.x && actor.y === npc.y).length, 1, 'Rival cannot overlap another NPC');

const interactions = between('function nearby()', 'function move(dx,dy)');
const state = {
  x: 9, y: 12, type: '불꽃', rival: { type: '물', starter: '리아코', level: 5 }, defeated: []
};

let lastDialog = '';
let buttons = {};
let battle = null;
let lastToast = '';
const context = {
  NPCS: world.NPCS,
  ZONES: world.ZONES,
  s: state, mode: 'world', dialogOpen: false,
  pop(html, callback) {
    lastDialog = html;
    buttons = {};
    if (callback) callback();
  },
  btn(id, callback) { buttons[id] = callback; },
  toast(message) { lastToast = message; },
  close() {},
  beginBattle(opponent) { battle = opponent; }
};
vm.runInNewContext(interactions + '\nthis.interact=interact', context);

context.interact();
assert.match(lastDialog, /라이벌 시온/);
assert.match(lastDialog, /물 타입/);
assert.match(lastDialog, /리아코 Lv\.5/);
assert.equal(typeof buttons.challenge, 'function');
buttons.challenge();
assert.ok(battle, 'Rival battle must start when the challenge button is used');
assert.equal(battle.name, '시온');
assert.equal(battle.team[0], '리아코', 'Rival must use the saved starter species');
assert.equal(battle.level, 5);

const saved = JSON.parse(JSON.stringify(state));
assert.equal(saved.rival.starter, '리아코', 'Rival must survive serialization');
state.defeated.push('시온');
context.interact();
assert.match(lastDialog, /첫 승부는 네가 이겼지만/);
assert.equal(buttons.challenge, undefined, 'First battle must not repeat after victory');

state.defeated.length = 0;
state.rival = null;
context.interact();
assert.match(lastToast, /라이벌의 포켓몬 정보를 확인할 수 없어/);
assert.equal(buttons.challenge, undefined);

assert.match(source, /npc\.type==='rival'\?npc\.level:npc\.level\+rand\(3\)/, 'The first rival must enter at the advertised level');
console.log('Rival NPC interaction, stored starter, single first battle and Lv.5 checks passed.');
