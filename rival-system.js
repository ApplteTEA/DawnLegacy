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

  return Object.freeze({ COUNTER_TYPES, poolFor, counterType, pick });
})();
if (typeof module !== 'undefined' && module.exports) module.exports = RIVAL_SYSTEM;
