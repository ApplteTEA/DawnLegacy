'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { runInNewContext } = require('node:vm');
const RIVAL_SYSTEM = require('../rival-system.js');

// Reuse the actual in-game species, evolution, type and effectiveness tables.
const game = fs.readFileSync(path.join(__dirname, '..', 'game.js'), 'utf8');
const start = game.indexOf('const TYPES=');
const end = game.indexOf('const ZONES=');
assert.ok(start >= 0 && end > start, 'Game data tables must be available');
const sandbox = {};
runInNewContext(game.slice(start, end) + '\nthis.data={TYPES,DB,EVOS,MATCH};', sandbox);
const { TYPES, DB, EVOS, MATCH } = sandbox.data;
assert.equal(TYPES.length, 17);

for (const playerType of TYPES) {
  const playerPool = RIVAL_SYSTEM.poolFor(playerType, DB, EVOS);
  assert.ok(playerPool.length, 'No player starter candidates for ' + playerType);
  const playerStarter = playerPool[0].name;
  const rivalType = RIVAL_SYSTEM.counterType(playerType, TYPES, DB, EVOS, MATCH);
  assert.ok((MATCH[rivalType]?.[playerType] ?? 1) > 1, playerType + ' has no type disadvantage');
  const rivalPool = RIVAL_SYSTEM.poolFor(rivalType, DB, EVOS);
  assert.ok(rivalPool.length, 'No rival starter candidates for ' + playerType);
  const allowed = rivalPool.filter(mon => mon.name !== playerStarter);
  const actualPool = allowed.length ? allowed : rivalPool;
  for (const random of [0, 0.01, 0.4999, 0.99, 0.999999]) {
    const first = RIVAL_SYSTEM.pick({ playerType, playerStarter, types: TYPES, dex: DB, evolutions: EVOS, match: MATCH, random: () => random });
    const again = RIVAL_SYSTEM.pick({ playerType, playerStarter, types: TYPES, dex: DB, evolutions: EVOS, match: MATCH, random: () => random });
    assert.deepEqual(first, again, 'Rival selection is not repeatable with the same random value');
    assert.equal(first.type, rivalType);
    assert.equal(first.level, 5);
    assert.ok(actualPool.some(mon => mon.name === first.starter), 'Invalid rival starter: ' + first.starter);
    assert.deepEqual(JSON.parse(JSON.stringify(first)), first, 'Result must be save-compatible JSON');
  }
}

assert.equal(RIVAL_SYSTEM.counterType('불꽃', TYPES, DB, EVOS, MATCH), '물');
assert.equal(RIVAL_SYSTEM.counterType('물', TYPES, DB, EVOS, MATCH), '풀');
assert.equal(RIVAL_SYSTEM.counterType('풀', TYPES, DB, EVOS, MATCH), '불꽃');
assert.throws(() => RIVAL_SYSTEM.counterType('페어리', TYPES, DB, EVOS, MATCH), /지원하지 않는/);
assert.throws(() => RIVAL_SYSTEM.pick({ playerType: '불꽃', playerStarter: '브케인', types: TYPES, dex: DB, evolutions: EVOS, match: MATCH, random: () => 1 }), /유효하지/);
console.log('Rival starter tests passed for all 17 selectable types.');
