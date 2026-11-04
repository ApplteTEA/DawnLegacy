'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const RIVAL_SYSTEM = require('../rival-system.js');

const game = fs.readFileSync(path.join(__dirname, '..', 'game.js'), 'utf8');
const data = vm.runInNewContext(game.slice(game.indexOf('const TYPES='), game.indexOf('const ZONES=')) + '\n({TYPES,DB,EVOS,MATCH})');
const { TYPES, DB, EVOS, MATCH } = data;
const rounds = RIVAL_SYSTEM.ROUNDS;

assert.deepEqual(Array.from(rounds, round => round.badges), [0, 1, 2, 3]);
assert.deepEqual(Array.from(rounds, round => round.level), [5, 15, 24, 32]);
assert.deepEqual(Array.from(rounds, round => round.size), [1, 2, 3, 4]);
assert.equal(new Set(rounds.map(round => round.id)).size, 4, 'Each battle needs a unique save key');
assert.equal(rounds[0].id, '시온', 'Legacy first victory flag must be preserved');

for (const playerType of TYPES) {
  const playerStarter = RIVAL_SYSTEM.poolFor(playerType, DB, EVOS)[0].name;
  const rival = RIVAL_SYSTEM.pick({
    playerType, playerStarter, types: TYPES, dex: DB, evolutions: EVOS, match: MATCH,
    random: () => 0.2
  });
  const prepared = RIVAL_SYSTEM.withSupport(rival, DB, EVOS);
  assert.equal(prepared.starter, rival.starter, 'Base starter must never be replaced');
  assert.equal(prepared.type, rival.type);
  assert.equal(prepared.support.length, 3, 'Team must have three permanent support species');
  assert.equal(new Set([prepared.starter, ...prepared.support]).size, 4);

  const persisted = JSON.parse(JSON.stringify(prepared));
  const restored = RIVAL_SYSTEM.withSupport(persisted, DB, EVOS);
  assert.deepEqual(restored, persisted, 'Save/load must not reroll the rival team');
  assert.equal(rival.support, undefined, 'Migration must not mutate the old saved rival object');
  for (const round of rounds) {
    const team = RIVAL_SYSTEM.teamForRound(restored, round, DB, EVOS);
    assert.equal(team.length, round.size);
    assert.equal(team.at(-1), RIVAL_SYSTEM.evolvedSpecies(rival.starter, round.level, DB, EVOS),
      'Original partner must remain the final team member at every round');
    assert.equal(new Set(team).size, team.length, 'Duplicate species in opponent team');
    for (const name of team) assert.ok(DB.some(p => p.name === name), 'Missing evolved species from actual game DB: ' + name);
  }
  const carried = { badges: 0, defeated: [] };
  for (const round of rounds) {
    assert.equal(RIVAL_SYSTEM.nextRound(carried).id, round.id);
    assert.equal(RIVAL_SYSTEM.canChallenge(carried), carried.badges >= round.badges);
    carried.badges = round.badges;
    assert.equal(RIVAL_SYSTEM.canChallenge(carried), true);
    carried.defeated.push(round.id);
  }
  assert.equal(RIVAL_SYSTEM.nextRound(carried), null);
  assert.equal(RIVAL_SYSTEM.canChallenge(carried), false);
}

assert.equal(RIVAL_SYSTEM.evolvedSpecies('브케인', 5, DB, EVOS), '브케인');
assert.equal(RIVAL_SYSTEM.evolvedSpecies('브케인', 15, DB, EVOS), '마그케인');
assert.equal(RIVAL_SYSTEM.evolvedSpecies('리아코', 24, DB, EVOS), '엘리게이');
assert.equal(RIVAL_SYSTEM.evolvedSpecies('꼬부기', 32, DB, EVOS), '어니부기');
assert.equal(RIVAL_SYSTEM.evolvedSpecies('이브이', 24, DB, EVOS), '부스터');
assert.throws(() => RIVAL_SYSTEM.teamForRound({ type:'물', starter:'리아코' }, { id:'unknown' }, DB, EVOS), /유효하지/);

// Previously completed first battle remains completed after migrating a save.
const legacy = { badges: 1, defeated: ['시온'] };
assert.equal(RIVAL_SYSTEM.nextRound(legacy).id, '시온 2차전');
assert.equal(RIVAL_SYSTEM.canChallenge(legacy), true);
assert.equal(legacy.defeated.length, 1, 'Legacy result must not be changed');

console.log('Rival growth and four battle rounds validated for all 17 challenge types.');
