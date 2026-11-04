'use strict';
/**
 * DawnLegacy main-campaign content registry.
 * The current field remains a five-zone prototype; these are proposed
 * independent map and story definitions, not already rendered tile maps.
 * IDs are immutable once saves start using them.
 */
const CAMPAIGN_DATA = (() => {
  const rawMaps = [
    ['M00','새벽마을','town',0,'처음 출발하는 마을'],
    ['R01','1번도로','route',0,'첫 포획과 여행'],
    ['M01','푸른잎시티','city',0,'숲을 가꾸는 사람들'],
    ['D01','이슬숲','dungeon',1,'포켓몬이 길을 잃는 숲'],
    ['R02','숲빛길','route',1,'항구로 이어지는 숲길'],
    ['M02','은빛항구','city',1,'등대와 비밀 화물'],
    ['D02','항구 창고','dungeon',1,'의문의 화물 기록'],
    ['F01','은빛 등대','landmark',2,'라이벌의 두 번째 승부'],
    ['R03','해안도로','route',2,'파도가 들리는 길'],
    ['M03','번개시티','city',2,'전력과 안전의 도시'],
    ['D03','발전소','dungeon',2,'공명 실험의 흔적'],
    ['R04','바람언덕길','route',3,'중앙 고원을 향하는 길'],
    ['M04','안개마을','city',3,'기록과 비문이 남은 도시'],
    ['D04','고대 유적','dungeon',4,'여명석이 남긴 메시지'],
    ['F02','안개 기록관','landmark',3,'별하와 루나의 기록'],
    ['R05','붉은계곡로','route',4,'지열이 솟는 협곡'],
    ['M05','홍염시티','city',4,'제련시설과 온천'],
    ['D05','폐쇄 연구동','dungeon',5,'카이론의 오래된 실험'],
    ['R06','눈마루길','route',5,'북부 설원의 시작'],
    ['M06','설화시티','city',5,'구조 봉화와 관측소'],
    ['D06','설산 기록관','dungeon',6,'긴 밤의 진실'],
    ['R07','철빛협곡','route',6,'광산 도시의 경계'],
    ['M07','철벽시티','city',6,'이클립스단 본거지'],
    ['D07','이클립스단 본거지','dungeon',7,'불법 공명망의 핵심'],
    ['R08','하늘오름길','route',7,'고산 도시로 향하는 길'],
    ['M08','천공시티','city',7,'여덟 번째 배지의 도시'],
    ['D08','구름 협곡','dungeon',8,'하늘신전 진입로'],
    ['D09','하늘신전','dungeon',8,'공명기를 해제하는 제단'],
    ['R09','챔피언로드','route',8,'최종 리그 도전의 길'],
    ['M09','포켓몬리그','city',8,'명예의 전당에 이르는 관문'],
    ['L01','리그 경기장','arena',8,'사천왕과 챔피언'],
    ['P01','봉인서고','postgame',8,'역사의 마지막 기록'],
    ['P02','라이벌 광장','postgame',8,'시온과의 마지막 승부'],
    ['P03','배틀탑','postgame',8,'연승에 도전하는 시설']
  ];
  const paths = [
    'M00-R01','R01-M01','M01-D01','D01-R02','R02-M02',
    'M02-D02','M02-F01','M02-R03','R03-M03','M03-D03',
    'M03-R04','R04-M04','M04-D04','M04-F02','M04-R05',
    'R05-M05','M05-D05','M05-R06','R06-M06','M06-D06',
    'M06-R07','R07-M07','M07-D07','M07-R08','R08-M08',
    'M08-D08','D08-D09','M08-R09','R09-M09','M09-L01',
    'M04-P01','M01-P02','M09-P03'
  ];
  const links = Object.fromEntries(rawMaps.map(([id]) => [id, []]));
  for (const value of paths) {
    const [a,b] = value.split('-');
    if (!links[a] || !links[b]) throw new Error('Invalid map edge: '+value);
    links[a].push(b);
    links[b].push(a);
  }
  const MAPS = Object.freeze(Object.fromEntries(rawMaps.map(([id,name,kind,minBadges,description]) => [
    id, Object.freeze({id,name,kind,minBadges,description,neighbors:Object.freeze(links[id])})
  ])));

  // Opponent species are checked against the current DB at runtime.
  // Data-only late bosses with missing species remain explicitly blocked until implemented.
  const GYMS = Object.freeze([
    {id:'GYM_01',mapId:'M01',name:'솔비',type:'풀',badge:'새싹배지',level:12,
      team:['모다피','치코리타'],prize:800,puzzle:'숲의 수로를 열어 덩굴을 올바른 순서로 성장시킨다'},
    {id:'GYM_02',mapId:'M02',name:'해진',type:'물',badge:'조류배지',level:21,
      team:['우파','마릴','리아코'],prize:1200,puzzle:'밀물·썰물 수문 세 개로 부두를 연결한다'},
    {id:'GYM_03',mapId:'M03',name:'도윤',type:'전기',badge:'전광배지',level:28,
      team:['메리프','피카츄','코일'],prize:1800,puzzle:'전류 방향을 바꾸는 스위치 세 개를 맞춘다'},
    {id:'GYM_04',mapId:'M04',name:'연우',type:'고스트',badge:'그림자배지',level:36,
      team:['고오스','무우마','고우스트'],prize:2500,puzzle:'거울에 비친 고대 문장을 올바르게 읽는다'},
    {id:'GYM_05',mapId:'M05',name:'화린',type:'불꽃',badge:'잿불배지',level:44,
      team:['식스테일','델빌','마그마그','윈디'],prize:3200,puzzle:'압력 밸브를 안전 순서로 조정한다'},
    {id:'GYM_06',mapId:'M06',name:'서리',type:'얼음',badge:'설원배지',level:50,
      team:['꾸꾸리','포푸니','루주라','쥬레곤'],prize:4000,puzzle:'빙판과 봉화를 연결해 안전한 길을 만든다'},
    {id:'GYM_07',mapId:'M07',name:'준철',type:'강철',badge:'철성배지',level:56,
      team:['코일','쏘콘','무장조','강철톤'],prize:4800,puzzle:'동력 레일과 전원을 분리한다'},
    {id:'GYM_08',mapId:'M08',name:'승천',type:'드래곤',badge:'창공배지',level:62,
      team:['미뇽','신뇽','킹드라','망나뇽'],prize:6000,puzzle:'바람 종과 상승 기류의 순서를 찾는다'}
  ].map(x => Object.freeze({...x,team:Object.freeze(x.team)})));

  // Full story rival encounters are separate from four existing prototype NPC rematches.
  const RIVALS=Object.freeze([
    {id:'RIV_01',mapId:'M00',requires:['STARTER_CHOSEN'],size:1,level:5,prize:200},
    {id:'RIV_02',mapId:'F01',requires:['GYM_2_WON'],size:2,level:22,prize:520},
    {id:'RIV_03',mapId:'D04',requires:['DAWN_STONE_OBTAINED'],size:3,level:37,prize:980},
    {id:'RIV_04',mapId:'D06',requires:['CLUE_HISTORY'],size:4,level:50,prize:1700},
    {id:'RIV_05',mapId:'M08',requires:['GYM_8_WON'],size:5,level:60,prize:2600},
    {id:'RIV_06',mapId:'R09',requires:['LEAGUE_REGISTERED'],size:5,level:64,prize:3300},
    {id:'PG_02_RIVAL_FINAL',mapId:'P02',requires:['ARCHIVE_RESTORED','POSTGAME_UNLOCKED'],size:6,level:78,prize:6000}
  ].map(x=>Object.freeze({...x,requires:Object.freeze(x.requires)})));

  const LEAGUE = Object.freeze([
    {id:'E4_01',name:'유담',type:'격투',level:64,team:['알통몬','근육몬','헤라크로스','괴력몬']},
    {id:'E4_02',name:'소미',type:'에스퍼',level:65,team:['네이티','에브이','루주라','네이티오']},
    {id:'E4_03',name:'해령',type:'땅',level:66,team:['모래두지','고지','우파','데기라스','코리갑']},
    {id:'E4_04',name:'가온',type:'비행',level:67,team:['구구','피죤','무장조','골뱃','피죤투']},
    {id:'CHAMPION',name:'윤하',type:'혼합',level:70,team:['전룡','헤라크로스','팬텀','윈디','강철톤','망나뇽']}
  ].map(x=>Object.freeze({...x,team:Object.freeze(x.team)})));

  const STORY = Object.freeze([
    {id:'EV_00_CHOOSE_STARTER',mapId:'M00',title:'두 파트너의 출발',require:[],flags:['STARTER_CHOSEN','RIVAL_STARTER_FIXED'],text:'해솔 박사의 제안으로 타입 챌린지를 선택하고 시온과 첫 승부를 준비한다.'},
    {id:'EV_01_ROAD_TUTORIAL',mapId:'R01',title:'첫 여행',require:['STARTER_CHOSEN'],flags:['ROAD_TUTORIAL_DONE'],text:'새벽마을을 떠나 풀숲과 포획의 기초를 배운다.'},
    {id:'EV_02_CITY_01',mapId:'M01',title:'푸른잎시티 도착',require:['ROAD_TUTORIAL_DONE'],flags:['CITY_01_VISITED'],text:'솔비와 은솔이 숲의 이상한 포켓몬 행동을 걱정한다.'},
    {id:'EV_03_FOREST_PERMIT',mapId:'M01',title:'숲 조사 허가',require:['GYM_1_WON'],flags:['FOREST_PERMIT'],text:'첫 배지 획득 후 숲 보호관에게 조사 허가를 받는다.'},
    {id:'EV_04_FOREST_RESCUE',mapId:'D01',title:'이슬숲 구조',require:['FOREST_PERMIT'],flags:['FOREST_RESCUED'],text:'길 잃은 포켓몬을 진정시키고 보호관을 돕는다.'},
    {id:'EV_05_RING_FOUND',mapId:'D01',title:'검은 고리',require:['FOREST_RESCUED'],flags:['CLUE_RING'],text:'이상 행동을 일으킨 검은 금속 고리와 도겸의 흔적을 조사한다.'},
    {id:'EV_06_PORT_CARGO',mapId:'M02',title:'항구의 분실 화물',require:['CLUE_RING'],flags:['CARGO_INVESTIGATION'],text:'은빛항구 선장의 분실 화물 의뢰를 받는다.'},
    {id:'EV_07_WAREHOUSE',mapId:'D02',title:'빈 상자의 번호',require:['CARGO_INVESTIGATION'],flags:['CLUE_CARGO','WAREHOUSE_SAFE'],text:'창고에서 단원들과 충돌하고 연구 장치 부품의 화물번호를 확보한다.'},
    {id:'EV_08_PORT_EXIT',mapId:'M02',title:'항구를 떠나다',require:['GYM_2_WON','CLUE_CARGO'],flags:['R03_OPEN'],text:'선장에게 정보를 전달하고 해안도로의 통행 허가를 받는다.'},
    {id:'EV_09_POWER_ALERT',mapId:'M03',title:'정전의 도시',require:['R03_OPEN'],flags:['POWER_ALERT'],text:'번개시티 주민들이 비정상적인 포켓몬 행동을 목격한다.'},
    {id:'EV_10_RESTORE_POWER',mapId:'D03',title:'발전소 복구',require:['POWER_ALERT'],flags:['POWER_RESTORED'],text:'도윤과 함께 안전 스위치를 차례로 내리고 주민을 대피시킨다.'},
    {id:'EV_11_POWER_LOG',mapId:'D03',title:'숨겨진 파형',require:['POWER_RESTORED'],flags:['CLUE_POWER','POWER_LOG_SAVED'],text:'세 곳에 걸친 공명 거점의 좌표가 기록된 로그를 확보한다.'},
    {id:'EV_12_FOG_ACCESS',mapId:'M03',title:'안개마을의 길',require:['GYM_3_WON','CLUE_POWER'],flags:['R04_OPEN'],text:'관측소의 도움으로 중앙 고원의 우회로를 연다.'},
    {id:'EV_13_RUINS_INVITE',mapId:'M04',title:'사라진 문장',require:['R04_OPEN'],flags:['RUINS_RESEARCH_STARTED'],text:'루나와 별하가 고대 기록에서 지워진 문장을 발견한다.'},
    {id:'EV_14_DAWN_STONE',mapId:'D04',title:'여명석',require:['GYM_4_WON','RUINS_RESEARCH_STARTED'],flags:['DAWN_STONE_OBTAINED'],text:'고대 봉인을 풀고 여명석 원본의 기록을 확인한다.'},
    {id:'EV_15_OPEN_R05',mapId:'M04',title:'붉은계곡의 길',require:['DAWN_STONE_OBTAINED'],flags:['R05_OPEN'],text:'루나가 고대 기록을 정리하고 동부 지역 출입이 허가된다.'},
    {id:'EV_16_HEAT_ALERT',mapId:'M05',title:'밤에도 타오르는 도시',require:['R05_OPEN'],flags:['HEAT_ALERT'],text:'홍염시티의 무료 충전 시설에 이상 징후가 나타난다.'},
    {id:'EV_17_FACTORY_SAFE',mapId:'M05',title:'안전한 제련소',require:['HEAT_ALERT'],flags:['FACTORY_SAFE'],text:'화린과 협력해 작업자와 포켓몬을 대피시킨다.'},
    {id:'EV_18_LAB_REPORT',mapId:'D05',title:'10년 전 사고',require:['GYM_5_WON'],flags:['CLUE_RESEARCH','LAB_SHUTDOWN_SAFE'],text:'폐쇄 연구동에서 카이론과 윤하의 과거 연구 로그를 회수한다.'},
    {id:'EV_19_SNOW_ROUTE',mapId:'M05',title:'눈마루길',require:['CLUE_RESEARCH'],flags:['R06_OPEN'],text:'북부 구조대가 눈길 통행을 허가한다.'},
    {id:'EV_20_SNOW_RESCUE',mapId:'R06',title:'세 개의 봉화',require:['R06_OPEN'],flags:['SNOW_RESCUED'],text:'구조대와 봉화를 연결하고 길을 잃은 주민을 돕는다.'},
    {id:'EV_21_HISTORY',mapId:'D06',title:'긴 밤의 진실',require:['GYM_6_WON'],flags:['CLUE_HISTORY','ECLIPSE_TRUTH_KNOWN'],text:'고대인들이 공명망을 끊어냈던 기록과 방송 조작 증거를 찾는다.'},
    {id:'EV_22_STEEL_ROAD',mapId:'M06',title:'철빛협곡의 입구',require:['CLUE_HISTORY'],flags:['R07_OPEN'],text:'다음 도시의 안전한 길이 열린다.'},
    {id:'EV_23_STEEL_REPORT',mapId:'M07',title:'책임의 기록',require:['R07_OPEN'],flags:['STEEL_REPORT'],text:'준철과 윤하에게 연구 책임 조사 의뢰를 받는다.'},
    {id:'EV_24_BASE',mapId:'D07',title:'이클립스단 본거지',require:['GYM_7_WON','CLUE_RING','CLUE_CARGO','CLUE_POWER'],flags:['ECLIPSE_BASE_DISABLED','CONTROL_KEY'],text:'도겸과 세라를 막고 제어 키를 확보한다.'},
    {id:'EV_25_CHAMP_CONFESSION',mapId:'M07',title:'윤하의 고백',require:['ECLIPSE_BASE_DISABLED'],flags:['CHAMP_CONFESSED'],text:'챔피언 윤하가 과거의 연구와 책임을 공개한다.'},
    {id:'EV_26_OPEN_R08',mapId:'M07',title:'하늘오름길',require:['CONTROL_KEY','CHAMP_CONFESSED'],flags:['R08_OPEN'],text:'마지막 체육관으로 이어지는 고산 도로를 연다.'},
    {id:'EV_27_WIND_TRIAL',mapId:'M08',title:'바람의 시험',require:['R08_OPEN'],flags:['WIND_TRIAL_DONE'],text:'기압과 바람의 흐름을 이해하고 마지막 관장전 입장 자격을 얻는다.'},
    {id:'EV_28_SHRINE_APPROACH',mapId:'D08',title:'하늘신전으로',require:['GYM_8_WON','CONTROL_KEY','DAWN_STONE_OBTAINED'],flags:['D09_OPEN','SHRINE_PREPARED'],text:'여명석의 기록으로 공명기 분리 순서를 확인한다.'},
    {id:'EV_29_ECLIPSE',mapId:'D09',title:'길어진 밤',require:['D09_OPEN'],flags:['ECLIPSE_STARTED'],text:'이클립스단의 증폭 신호가 하늘을 가린다.'},
    {id:'EV_30_NODE_FOREST',mapId:'D09',title:'숲의 신호 차단',require:['ECLIPSE_STARTED'],flags:['NODE_FOREST_OFF'],text:'숲 거점의 공명선을 안전하게 분리한다.'},
    {id:'EV_31_NODE_POWER',mapId:'D09',title:'발전소 신호 차단',require:['NODE_FOREST_OFF'],flags:['NODE_POWER_OFF'],text:'발전소 거점의 공명선을 안전하게 분리한다.'},
    {id:'EV_32_NODE_SKY',mapId:'D09',title:'신전 증폭기 차단',require:['NODE_POWER_OFF'],flags:['NODE_SKY_OFF'],text:'마지막 공명 신호를 끊어 포켓몬의 자유를 되찾는다.'},
    {id:'EV_33_KAIRON',mapId:'D09',title:'카이론과 결전',require:['NODE_SKY_OFF'],flags:['KAIRON_DEFEATED','RESONANCE_NETWORK_OFF'],text:'카이론의 팀을 이기고 증폭장치를 비상 정지한다.',battleId:'ECL_KAIRON'},
    {id:'EV_34_ARCEUS',mapId:'D09',title:'아르세우스의 시련',require:['KAIRON_DEFEATED'],flags:['ARCEUS_TRIAL_COMPLETE'],text:'아르세우스의 의지를 존중하는 비포획 시련에 응한다.'},
    {id:'EV_35_DAWN',mapId:'D09',title:'새벽이 돌아오다',require:['ARCEUS_TRIAL_COMPLETE'],flags:['ECLIPSE_RESOLVED'],text:'신호망을 분리하고 잊힌 기록을 되살린다.'},
    {id:'EV_36_LEAGUE_ROAD',mapId:'R09',title:'리그의 초대',require:['GYM_8_WON','ECLIPSE_RESOLVED'],flags:['LEAGUE_REGISTERED'],text:'사천왕과 챔피언에 도전할 자격을 인정받는다.'},
    {id:'EV_37_CHAMPION',mapId:'L01',title:'명예의 전당',require:['LEAGUE_REGISTERED','E4_4_CLEAR'],flags:['CHAMPION_WON'],text:'챔피언 윤하와 정면 승부를 펼친다.',battleId:'CHAMPION'},
    {id:'EV_38_CREDITS',mapId:'L01',title:'새로운 아침',require:['CHAMPION_WON'],flags:['CREDITS_SEEN','POSTGAME_UNLOCKED'],text:'포켓몬과 사람들이 일상을 되찾는 모습을 보며 엔딩을 맞는다.'}
  ].map(x=>Object.freeze({...x,require:Object.freeze(x.require),flags:Object.freeze(x.flags)})));

  const BOSS = Object.freeze({
    ECL_KAIRON:Object.freeze({id:'ECL_KAIRON',name:'카이론',level:64,prize:8800,
      team:Object.freeze(['강철톤','팬텀','전룡','윈디','데기라스','무장조'])})
  });
  const POSTGAME = Object.freeze([
    {id:'PG_01_ARCHIVE',mapId:'P01',requires:['POSTGAME_UNLOCKED'],text:'봉인서고의 진실을 복원한다.'},
    {id:'PG_02_RIVAL_FINAL',mapId:'P02',requires:['ARCHIVE_RESTORED'],text:'시온의 완성된 팀과 재대결한다.'},
    {id:'PG_03_SHRINE_RETURN',mapId:'D09',requires:['POSTGAME_UNLOCKED','ARCHIVE_RESTORED','RESONANCE_NETWORK_OFF'],text:'아르세우스와의 두 번째 만남. 선택 포획은 별도 승인 필요.'},
    {id:'PG_04_ELITE_REMATCH',mapId:'L01',requires:['POSTGAME_UNLOCKED'],text:'강화된 사천왕과 챔피언 재대결.'},
    {id:'PG_05_TOWER',mapId:'P03',requires:['POSTGAME_UNLOCKED'],text:'배틀탑 연승 기록.'},
    {id:'PG_06_EXPLORATION',mapId:'R01',requires:['POSTGAME_UNLOCKED'],text:'새로운 서식지를 탐험한다.'}
  ].map(x=>Object.freeze({...x,requires:Object.freeze(x.requires)})));

  return Object.freeze({MAPS,GYMS,RIVALS,LEAGUE,STORY,BOSS,POSTGAME,paths:Object.freeze(paths)});
})();
if (typeof module !== 'undefined' && module.exports) module.exports=CAMPAIGN_DATA;
