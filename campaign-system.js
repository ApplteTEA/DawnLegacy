'use strict';
/**
 * DawnLegacy campaign data & deterministic progress state.
 * No DOM, world rendering, network access, or field coordinates.
 * Design source: docs/WORLD_MAP.md and docs/STORY_EVENTS.md.
 *
 * NEW campaign flags are independent from legacy badge-count / npc-name wins.
 */
const CAMPAIGN = (() => {
  const MAPS = Object.freeze([
    ['M00','새벽마을','town',['R01']],
    ['R01','1번도로','route',['M00','M01']],
    ['M01','푸른잎시티','city',['R01','D01','R02','P02']],
    ['D01','이슬숲','dungeon',['M01','R02']],
    ['R02','숲빛길','route',['M01','D01','M02']],
    ['M02','은빛항구','city',['R02','D02','F01','R03']],
    ['D02','항구 창고','dungeon',['M02']],
    ['F01','등대','facility',['M02']],
    ['R03','해안도로','route',['M02','M03']],
    ['M03','번개시티','city',['R03','D03','R04']],
    ['D03','발전소','dungeon',['M03']],
    ['R04','바람언덕길','route',['M03','M04']],
    ['M04','안개마을','city',['R04','D04','F02','R05','P01']],
    ['D04','고대 유적','dungeon',['M04']],
    ['F02','안개 기록관','facility',['M04']],
    ['R05','붉은계곡로','route',['M04','M05']],
    ['M05','홍염시티','city',['R05','D05','R06']],
    ['D05','폐쇄 연구동','dungeon',['M05']],
    ['R06','눈마루길','route',['M05','M06']],
    ['M06','설화시티','city',['R06','D06','R07']],
    ['D06','설산 기록관','dungeon',['M06']],
    ['R07','철빛협곡','route',['M06','M07']],
    ['M07','철벽시티','city',['R07','D07','R08']],
    ['D07','이클립스단 본거지','dungeon',['M07']],
    ['R08','하늘오름길','route',['M07','M08']],
    ['M08','천공시티','city',['R08','D08','R09']],
    ['D08','구름 협곡','dungeon',['M08','D09']],
    ['D09','하늘신전','dungeon',['D08']],
    ['R09','챔피언로드','route',['M08','M09']],
    ['M09','포켓몬리그','city',['R09','L01','P03']],
    ['L01','리그 경기장','facility',['M09']],
    ['P01','봉인서고','postgame',['M04']],
    ['P02','라이벌 광장','postgame',['M01']],
    ['P03','배틀탑','postgame',['M09']]
  ].map(([id,name,kind,links]) => Object.freeze({id,name,kind,links:Object.freeze(links)})));

  const GYMS = Object.freeze([
    ['GYM_01','M01','솔비','풀','새싹배지',12,['모다피','치코리타']],
    ['GYM_02','M02','해진','물','조류배지',21,['우파','마릴','리아코']],
    ['GYM_03','M03','도윤','전기','전광배지',28,['메리프','피카츄','코일']],
    ['GYM_04','M04','연우','고스트','그림자배지',36,['고오스','무우마','고우스트']],
    ['GYM_05','M05','화린','불꽃','잿불배지',44,['식스테일','델빌','마그마그','윈디']],
    ['GYM_06','M06','서리','얼음','설원배지',50,['꾸꾸리','포푸니','루주라','쥬레곤']],
    ['GYM_07','M07','준철','강철','철성배지',56,['코일','쏘콘','무장조','강철톤']],
    ['GYM_08','M08','승천','드래곤','창공배지',62,['미뇽','신뇽','킹드라','망나뇽']]
  ].map(([id,mapId,leader,type,badge,level,team],i) => Object.freeze({
    id,mapId,leader,type,badge,level,number:i+1,team:Object.freeze(team)
  })));

  function e(id,mapId,requiresAll,grants,description) {
    return Object.freeze({id,mapId,requiresAll:Object.freeze(requiresAll),grants:Object.freeze(grants),description});
  }

  // Compact event dependency graph; flags/cutscenes may be refined without changing IDs.
  const EVENTS = Object.freeze([
    e('EV_00_CHOOSE_STARTER','M00',[],['STARTER_CHOSEN','RIVAL_STARTER_FIXED'],'첫 파트너를 받고 여행 시작'),
    e('RIV_01','M00',['STARTER_CHOSEN'],['RIV_01_WON'],'라이벌 시온 첫 대결'),
    e('EV_01_ROAD_TUTORIAL','R01',['STARTER_CHOSEN'],['ROAD_TUTORIAL_DONE'],'1번도로의 포획과 탐험'),
    e('EV_02_CITY_01','M01',['ROAD_TUTORIAL_DONE'],['CITY_01_VISITED'],'푸른잎시티에서 숲 소식 듣기'),
    e('GYM_01','M01',['CITY_01_VISITED'],['GYM_1_WON'],'솔비에게 도전'),
    e('EV_03_FOREST_PERMIT','M01',['GYM_1_WON'],['FOREST_PERMIT'],'숲 조사 허가'),
    e('EV_04_FOREST_RESCUE','D01',['FOREST_PERMIT'],['FOREST_RESCUED'],'이슬숲 포켓몬 구조'),
    e('EV_05_RING_FOUND','D01',['FOREST_RESCUED'],['CLUE_RING'],'수상한 금속 고리'),
    e('EV_06_PORT_CARGO','M02',['CLUE_RING'],['CARGO_INVESTIGATION'],'은빛항구 화물 수색'),
    e('EV_07_WAREHOUSE','D02',['CARGO_INVESTIGATION'],['CLUE_CARGO','WAREHOUSE_SAFE'],'창고의 단서 확보'),
    e('GYM_02','M02',['WAREHOUSE_SAFE'],['GYM_2_WON'],'해진에게 도전'),
    e('RIV_02','F01',['GYM_2_WON'],['RIV_02_WON'],'시온 등대 재대결'),
    e('EV_08_PORT_EXIT','M02',['GYM_2_WON','CLUE_CARGO'],['R03_OPEN'],'해안도로 개방'),
    e('EV_09_POWER_ALERT','M03',['R03_OPEN'],['POWER_ALERT'],'발전소 정전'),
    e('EV_10_RESTORE_POWER','D03',['POWER_ALERT'],['POWER_RESTORED'],'발전소 안전 복구'),
    e('EV_11_POWER_LOG','D03',['POWER_RESTORED'],['CLUE_POWER','POWER_LOG_SAVED'],'발전 기록 확보'),
    e('GYM_03','M03',['POWER_RESTORED'],['GYM_3_WON'],'도윤에게 도전'),
    e('EV_12_FOG_ACCESS','M03',['GYM_3_WON','CLUE_POWER'],['R04_OPEN'],'안개마을 진입'),
    e('EV_13_RUINS_INVITE','M04',['R04_OPEN'],['RUINS_RESEARCH_STARTED'],'루나와 유적 조사'),
    e('GYM_04','M04',['RUINS_RESEARCH_STARTED'],['GYM_4_WON'],'연우에게 도전'),
    e('EV_14_DAWN_STONE','D04',['GYM_4_WON'],['DAWN_STONE_OBTAINED'],'여명석 확보'),
    e('RIV_03','D04',['DAWN_STONE_OBTAINED'],['RIV_03_WON'],'시온 유적 재대결'),
    e('EV_15_OPEN_R05','M04',['DAWN_STONE_OBTAINED'],['R05_OPEN'],'홍염시티로 출발'),
    e('EV_16_HEAT_ALERT','M05',['R05_OPEN'],['HEAT_ALERT'],'홍염시티의 이상 현상'),
    e('EV_17_FACTORY_SAFE','M05',['HEAT_ALERT'],['FACTORY_SAFE'],'시민 안전 확보'),
    e('GYM_05','M05',['FACTORY_SAFE'],['GYM_5_WON'],'화린에게 도전'),
    e('EV_18_LAB_REPORT','D05',['GYM_5_WON'],['CLUE_RESEARCH','LAB_SHUTDOWN_SAFE'],'카이론의 연구 기록'),
    e('EV_19_SNOW_ROUTE','M05',['CLUE_RESEARCH'],['R06_OPEN'],'설산 이동'),
    e('EV_20_SNOW_RESCUE','R06',['R06_OPEN'],['SNOW_RESCUED'],'봉화와 주민 구조'),
    e('GYM_06','M06',['SNOW_RESCUED'],['GYM_6_WON'],'서리에게 도전'),
    e('EV_21_HISTORY','D06',['GYM_6_WON'],['CLUE_HISTORY','ECLIPSE_TRUTH_KNOWN'],'긴 밤의 진실'),
    e('RIV_04','D06',['CLUE_HISTORY'],['RIV_04_WON'],'시온 설산 재대결'),
    e('EV_22_STEEL_ROAD','M06',['CLUE_HISTORY'],['R07_OPEN'],'철벽시티로'),
    e('EV_23_STEEL_REPORT','M07',['R07_OPEN'],['STEEL_REPORT'],'조직 본거지 조사'),
    e('GYM_07','M07',['STEEL_REPORT'],['GYM_7_WON'],'준철에게 도전'),
    e('EV_24_BASE','D07',['GYM_7_WON','CLUE_RING','CLUE_CARGO','CLUE_POWER'],['ECLIPSE_BASE_DISABLED','CONTROL_KEY'],'이클립스단 본거지 제압'),
    e('EV_25_CHAMP_CONFESSION','M07',['ECLIPSE_BASE_DISABLED'],['CHAMP_CONFESSED'],'윤하의 고백'),
    e('EV_26_OPEN_R08','M07',['CONTROL_KEY','CHAMP_CONFESSED'],['R08_OPEN'],'천공시티로'),
    e('EV_27_WIND_TRIAL','M08',['R08_OPEN'],['WIND_TRIAL_DONE'],'고산 바람길'),
    e('GYM_08','M08',['WIND_TRIAL_DONE'],['GYM_8_WON'],'승천에게 도전'),
    e('RIV_05','M08',['GYM_8_WON'],['RIV_05_WON'],'시온 천공 재대결'),
    e('EV_28_SHRINE_APPROACH','D08',['GYM_8_WON','CONTROL_KEY','DAWN_STONE_OBTAINED'],['D09_OPEN','SHRINE_PREPARED'],'신전으로 진입'),
    e('EV_29_ECLIPSE','D09',['D09_OPEN'],['ECLIPSE_STARTED'],'길어진 밤'),
    e('EV_30_NODE_FOREST','D09',['ECLIPSE_STARTED'],['NODE_FOREST_OFF'],'숲 공명기 분리'),
    e('EV_31_NODE_POWER','D09',['NODE_FOREST_OFF'],['NODE_POWER_OFF'],'전력 공명기 분리'),
    e('EV_32_NODE_SKY','D09',['NODE_POWER_OFF'],['NODE_SKY_OFF'],'하늘 공명기 분리'),
    e('EV_33_KAIRON','D09',['NODE_SKY_OFF'],['KAIRON_DEFEATED','RESONANCE_NETWORK_OFF'],'카이론 결전'),
    e('EV_34_ARCEUS','D09',['KAIRON_DEFEATED'],['ARCEUS_TRIAL_COMPLETE'],'아르세우스의 시련'),
    e('EV_35_DAWN','D09',['ARCEUS_TRIAL_COMPLETE'],['ECLIPSE_RESOLVED'],'새로운 아침'),
    e('EV_36_LEAGUE_ROAD','R09',['GYM_8_WON','ECLIPSE_RESOLVED'],['LEAGUE_REGISTERED'],'챔피언로드와 리그'),
    e('RIV_06','R09',['LEAGUE_REGISTERED'],['RIV_06_WON'],'시온 챔피언로드 승부'),
    e('E4_01','L01',['LEAGUE_REGISTERED'],['E4_1_CLEAR'],'사천왕 유담'),
    e('E4_02','L01',['E4_1_CLEAR'],['E4_2_CLEAR'],'사천왕 소미'),
    e('E4_03','L01',['E4_2_CLEAR'],['E4_3_CLEAR'],'사천왕 해령'),
    e('E4_04','L01',['E4_3_CLEAR'],['E4_4_CLEAR'],'사천왕 가온'),
    e('EV_37_CHAMPION','L01',['E4_4_CLEAR'],['CHAMPION_WON'],'챔피언 윤하'),
    e('EV_38_CREDITS','L01',['CHAMPION_WON'],['CREDITS_SEEN','POSTGAME_UNLOCKED'],'명예의 전당과 크레딧'),
    e('PG_01_ARCHIVE','P01',['POSTGAME_UNLOCKED'],['ARCHIVE_RESTORED'],'봉인서고 기록 복원'),
    e('PG_02_RIVAL_FINAL','P02',['ARCHIVE_RESTORED'],['RIVAL_EPILOGUE_WON'],'시온 최종 승부'),
    e('PG_03_SHRINE_RETURN','D09',['POSTGAME_UNLOCKED','ARCHIVE_RESTORED','RESONANCE_NETWORK_OFF'],['ARCEUS_RETURN_VISITED'],'신전 재방문')
  ]);

  const byId = Object.freeze(Object.fromEntries(EVENTS.map(event => [event.id,event])));
  const mapById = Object.freeze(Object.fromEntries(MAPS.map(map => [map.id,map])));
  const gymById = Object.freeze(Object.fromEntries(GYMS.map(gym => [gym.id,gym])));

  function ensure(save) {
    if (!save || typeof save !== 'object') throw new Error('저장 데이터가 올바르지 않습니다.');
    if (!save.campaign || typeof save.campaign !== 'object') {
      save.campaign = {
        schemaVersion:1, flags:{},rewards:{},events:{},cutscenes:{},
        legacySnapshot:{
          badges:Number.isFinite(save.badges)?save.badges:0,
          champion:save.champion===true,
          defeated:Array.isArray(save.defeated)?save.defeated.slice():[]
        }
      };
    }
    const p=save.campaign;
    p.schemaVersion=1;
    for (const key of ['flags','rewards','events','cutscenes']) {
      if (!p[key] || typeof p[key] !== 'object' || Array.isArray(p[key])) p[key]={};
    }
    if(!p.legacySnapshot)p.legacySnapshot={badges:save.badges||0,champion:!!save.champion,defeated:Array.isArray(save.defeated)?save.defeated.slice():[]};
    return p;
  }

  function eligible(save,id) {
    const ev=byId[id];if(!ev)return false;
    const p=ensure(save);
    return !p.events[id] && ev.requiresAll.every(flag=>p.flags[flag]===true);
  }
  function complete(save,id) {
    const ev=byId[id];
    if(!ev)throw new Error('알 수 없는 이벤트: '+id);
    const p=ensure(save);
    if(p.events[id])return false;
    if(!eligible(save,id))throw new Error('선행 조건 미충족: '+id);
    p.events[id]=true;
    for(const flag of ev.grants)p.flags[flag]=true;
    return true;
  }

  function claim(save,rewardId,grant) {
    if(typeof rewardId!=='string'||!rewardId||typeof grant!=='function')throw new Error('보상 ID/지급 함수가 올바르지 않습니다.');
    const p=ensure(save);
    if(p.rewards[rewardId])return false;
    grant(save);
    p.rewards[rewardId]=true;
    return true;
  }

  function next(save) {
    const p=ensure(save);
    return EVENTS.find(event=>!p.events[event.id] && event.requiresAll.every(flag=>p.flags[flag]===true) && !event.id.startsWith('PG_') && !event.id.startsWith('RIV_'))||null;
  }

  function check() {
    const errors=[];
    const knownMaps=new Set(MAPS.map(map=>map.id));
    const knownEvents=new Set(EVENTS.map(ev=>ev.id));
    const knownFlags=new Set(EVENTS.flatMap(ev=>ev.grants));
    if(knownMaps.size!==MAPS.length)errors.push('중복 맵 ID');
    if(knownEvents.size!==EVENTS.length)errors.push('중복 이벤트 ID');
    for(const map of MAPS){
      for(const link of map.links) {
        if(!knownMaps.has(link))errors.push('존재하지 않는 연결 '+map.id+'→'+link);
        else if(!mapById[link].links.includes(map.id))errors.push('역방향 연결 누락 '+map.id+'→'+link);
      }
    }
    for(const gym of GYMS)if(!knownMaps.has(gym.mapId)||!knownEvents.has(gym.id))errors.push('체육관 참조 오류 '+gym.id);
    for(const ev of EVENTS){
      if(!knownMaps.has(ev.mapId))errors.push('이벤트 맵 누락 '+ev.id);
      for(const flag of ev.requiresAll)if(!knownFlags.has(flag))errors.push('선행 플래그 누락 '+ev.id+':'+flag);
    }
    return errors;
  }

  return Object.freeze({ MAPS,GYMS,EVENTS,mapById,gymById,ensure,eligible,complete,claim,next,check });
})();
if (typeof module!=='undefined' && module.exports) module.exports=CAMPAIGN;
