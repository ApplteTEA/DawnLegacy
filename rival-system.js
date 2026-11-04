'use strict';
/**
 * DawnLegacy rival-starter selection.
 * Pure game-data logic; does not read the DOM, save data, or move field entities.
 */
const RIVAL_SYSTEM = (() => {
  // Each choice is a super-effective attacking type against the player's selected challenge type.
  const COUNTER_TYPES = Object.freeze({
    '노말':'격투','불꽃':'물','물':'풀','풀':'불꽃','전기':'땅',
    '얼음':'불꽃','격투':'비행','독':'땅','땅':'물','비행':'전기',
    '에스퍼':'악','벌레':'불꽃','바위':'물','고스트':'악',
    '드래곤':'얼음','악':'격투','강철':'불꽃'
  });

  function poolFor(type, dex, evolutions) {
    if (!type || !Array.isArray(dex) || !evolutions) return [];
    const byName = new Map(dex.map(mon => [mon.name, mon]));
    const evolved = new Set(Object.values(evolutions).map(entry => entry[0]));
    const evolvesIntoType = name => {
      const visited = new Set();
      while (evolutions[name] && !visited.has(name)) {
        visited.add(name);
        name = evolutions[name][0];
        const next = byName.get(name);
        if (next && next.types.includes(type)) return true;
      }
      return false;
    };
    return dex.filter(mon => mon.stage <= 2 &&
      !evolved.has(mon.name) &&
      (mon.types.includes(type) || evolvesIntoType(mon.name)));
  }

  function counterType(playerType, types, dex, evolutions, match) {
    if (!types.includes(playerType)) throw new Error('지원하지 않는 선택 타입: ' + playerType);
    const preferred = COUNTER_TYPES[playerType];
    const order = [preferred, ...types.filter(type => type !== preferred)];
    for (const type of order) {
      if (type && types.includes(type) && (match[type]?.[playerType] ?? 1) > 1 &&
          poolFor(type, dex, evolutions).length > 0) return type;
    }
    throw new Error('라이벌의 유리한 타입 후보가 없습니다: ' + playerType);
  }

  function pick({ playerType, playerStarter, types, dex, evolutions, match, random = Math.random }) {
    const type = counterType(playerType, types, dex, evolutions, match);
    const pool = poolFor(type, dex, evolutions);
    const distinct = pool.filter(mon => mon.name !== playerStarter);
    const options = distinct.length ? distinct : pool;
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error('무작위 값이 유효하지 않습니다.');
    const starter = options[Math.floor(value * options.length)].name;
    return { type, starter, level: 5 };
  }

  // The playable prototype currently has four badges; these meetings follow gym milestones.
  const ROUNDS = Object.freeze([
    Object.freeze({ id: '시온', badges: 0, level: 5, size: 1, prize: 200, title: '첫 대결' }),
    Object.freeze({ id: '시온 2차전', badges: 1, level: 15, size: 2, prize: 480, title: '두 번째 대결' }),
    Object.freeze({ id: '시온 3차전', badges: 2, level: 24, size: 3, prize: 900, title: '세 번째 대결' }),
    Object.freeze({ id: '시온 4차전', badges: 3, level: 32, size: 4, prize: 1500, title: '네 번째 대결' })
  ]);

  /**
   * Supply three stable partner species, retaining preexisting save data.
   * No roulette is repeated on loading, and the original starter never changes.
   */
  function withSupport(rival, dex, evolutions) {
    if (!rival?.starter || !rival.type) throw new Error('라이벌 스타팅 정보가 없습니다.');
    const known = new Set(dex.map(mon => mon.name));
    if (!known.has(rival.starter)) throw new Error('저장된 라이벌 스타팅 종을 찾을 수 없습니다.');
    const evolved = new Set(Object.values(evolutions).map(value => value[0]));
    const base = dex.filter(mon => mon.stage <= 2 && !evolved.has(mon.name)).map(mon => mon.name);
    const preferred = poolFor(rival.type, dex, evolutions).map(mon => mon.name);
    const candidates = [...new Set([...preferred, ...base])].filter(name => name !== rival.starter);
    const support = [];
    for (const name of Array.isArray(rival.support) ? rival.support : []) {
      if (candidates.includes(name) && !support.includes(name)) support.push(name);
      if (support.length >= 3) break;
    }
    const seed = Array.from(rival.starter).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    for (let i = 0; support.length < 3 && i < candidates.length; i++) {
      const name = candidates[(seed + i) % candidates.length];
      if (!support.includes(name)) support.push(name);
    }
    if (support.length < 3) throw new Error('라이벌 지원 포켓몬의 후보가 부족합니다.');
    return { ...rival, support };
  }

  function evolvedSpecies(name, level, dex, evolutions) {
    const known = new Set(dex.map(mon => mon.name));
    if (!known.has(name)) throw new Error('포켓몬 데이터가 없습니다: ' + name);
    const seen = new Set();
    while (evolutions[name] && !seen.has(name)) {
      seen.add(name);
      const [next, threshold] = evolutions[name];
      if (level < threshold || !known.has(next)) break;
      name = next;
    }
    return name;
  }

  function nextRound(state) {
    const defeated = new Set(state?.defeated || []);
    return ROUNDS.find(round => !defeated.has(round.id)) || null;
  }

  function canChallenge(state) {
    const round = nextRound(state);
    return !!round && (state.badges || 0) >= round.badges;
  }

  function teamForRound(rival, round, dex, evolutions) {
    if (!ROUNDS.includes(round)) throw new Error('유효하지 않은 라이벌 대결 단계입니다.');
    const prepared = withSupport(rival, dex, evolutions);
    const names = [
      ...prepared.support.slice(0, round.size - 1),
      prepared.starter
    ];
    return names.map(name => evolvedSpecies(name, round.level, dex, evolutions));
  }

  return Object.freeze({ COUNTER_TYPES, poolFor, counterType, pick, ROUNDS, withSupport, evolvedSpecies, nextRound, canChallenge, teamForRound });
})();
if (typeof module !== 'undefined' && module.exports) module.exports = RIVAL_SYSTEM;
