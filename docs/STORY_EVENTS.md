# DawnLegacy — 이벤트/퀘스트/컷신 구현 명세 v1.0

> **2026-11-04 개발 착수 업데이트:** 사용자의 '최신 Markdown 기획을 기준으로 전체 RPG 구현' 요청에 따라 이 문서의 전체 구조를 개발 기준선으로 채택했다. 기존 '승인 전 제안' 표기는 초안 작성 당시 상태이며, 해당 내용이 게임에 이미 구현되었거나 실기기에서 검증되었다는 뜻은 아니다. 기존 확정 규칙을 변경하지 않고 세부 밸런스·구현 방식을 검증하며 진행한다.
> **상태:** 사용자 승인 전 제안. 모든 EV/RIV/GYM/SQ 플래그·대사·퀘스트는 **신규 구현 대상**이며 현재 `game.js`에 존재하지 않는다.
> **유일한 근거:** [STORY.md](STORY.md) 서사, [WORLD_MAP.md](WORLD_MAP.md) 지도 ID, [GAME_DESIGN.md](GAME_DESIGN.md) 배지·팀·레벨.
> **개발자 계약:** 이 문서를 이벤트 데이터의 단일 기준으로 하고, STORY는 장면 의미, WORLD_MAP은 좌표 없는 맵/포털 계약, GAME_DESIGN은 전투/보상 수치만 담당한다.

## 1. 이벤트 엔진 데이터 모델(제안)
각 이벤트는 최소 다음 필드를 가진다. 이벤트 시스템 자체는 현재 미구현이다.

| 필드 | 값/규칙 |
| --- | --- |
| `id` | 변경 불가 문자열. 예: `EV_04_FOREST_RESCUE` |
| `kind` | `story` / `gym` / `rival` / `side` / `postgame` |
| `mapId` | WORLD_MAP에 실존하는 M/R/D/F/P/L ID |
| `trigger` | `enterMap` / `talkNpc` / `interactObject` / `winBattle` / `onFlagChanged` |
| `requiresAll` | 반드시 참이어야 하는 flag 목록; 전부 만족해야 진입 |
| `requiresAny` | 하나 이상 만족할 때 허용; 없으면 검사 생략 |
| `requiresNot` | 이미 완료/충돌하는 flag가 있으면 실행 금지 |
| `stage` | `locked` → `available` → `active` → `completed` |
| `commands` | 잠금 이동, 대화, NPC 이동, 음악, 조명, 배틀, 아이템 획득 등을 순서화 |
| `outcomes` | `onWin` / `onLoss` / `onSkip` / `onExit` |
| `rewards` | ID로 중복 방지되는 1회 지급 보상 |
| `checkpoint` | 컷신 재진입/재접속 시 재개할 안전한 단계 |
| `fallback` | 비정상 종료·후퇴·전투 패배 시 안전 포털/후속 대사 |

**기본 API 계약:** `canStart(event,save)`, `begin(eventId)`, `commitStage(eventId,stage)`, `complete(eventId,rewardId)`, `replayCutscene(eventId)`. 한 이벤트의 보상이 이미 지급되었으면 `complete` 재호출에도 추가 지급 없음.

**저장 상태 제안:** `progress.eventFlags:{[id]:boolean}`, `progress.questStates:{[id]:{stage,step}}`, `progress.rewardClaims:{[id]:true}`, `progress.cutsceneSeen:{[id]:true}`. 새/구형 세이브에 해당 필드가 없으면 기본 빈 객체로 이관. `s.defeated`, `s.badges`, `s.rival`은 안전하게 보존.

## 2. 에피소드별 필수 메인 이벤트 — 순서/조건/결과

### 프롤로그와 1막
| ID | 시작 위치·트리거 | 선행 조건 | 실제 진행/전투 | 완료·영구 결과 |
| --- | --- | --- | --- | --- |
| EV_00_CHOOSE_STARTER | M00 연구소, 박사 대화 | 신규 게임 | 17타입 선택 → 플레이어 룰렛 → 라이벌 룰렛 → 도감 튜토리얼 | `STARTER_CHOSEN`, `RIVAL_STARTER_FIXED`, 파티/라이벌 데이터 저장 |
| RIV_01 | M00 시온 대화 | `STARTER_CHOSEN` | 시온의 저장된 1마리 Lv5 대결 | **승패 모두** `RIV_01_FACED`; 승리만 `RIV_01_WON`·상금 1회 |
| EV_01_ROAD_TUTORIAL | R01 안내판 대화 | `STARTER_CHOSEN` | 이동, 풀숲, 포획/도주/센터 안내 | `ROAD_TUTORIAL_DONE`, 일반 볼 보상 1회 |
| EV_02_CITY_01 | M01 솔비/은솔 | R01 도착 | 숲 상태 조언, 체육관 안내 | `CITY_01_VISITED`, G1 도전 허가 |
| GYM_01 | M01 솔비, 관장전 승리 | `CITY_01_VISITED` | 풀 타입 퍼즐+팀 2마리 | `GYM_1_WON`, 새싹배지·TM·상금 각 1회 |
| EV_03_FOREST_PERMIT | M01 숲 보호관 | `GYM_1_WON` | 실종 포켓몬 수색 의뢰 | `FOREST_PERMIT`, D01 출입 |
| EV_04_FOREST_RESCUE | D01 부상 포켓몬 오브젝트 | `FOREST_PERMIT` | 2곳 흔적 찾기→보호관 대화→불법 장치 해제 | `FOREST_RESCUED`, 고정 치료 보상 |
| EV_05_RING_FOUND | D01 금속 고리 | `FOREST_RESCUED` | 장치 기록, 도겸 추적, 증거 회수 | `CLUE_RING`, R02 개방 |
| EV_06_PORT_CARGO | M02 선장/창고 | `CLUE_RING` | 물류 의뢰 수락, 창고 잠금 해제 | `CARGO_INVESTIGATION` |
| EV_07_WAREHOUSE | D02 화물 상자+도겸 | `CARGO_INVESTIGATION` | 단원전 → 상자번호 기록 → 선장 보고 | `CLUE_CARGO`, `WAREHOUSE_SAFE` |
| GYM_02 | M02 해진, 관장전 승리 | `WAREHOUSE_SAFE` | 조수 수위 퍼즐+물 타입 3마리 | `GYM_2_WON`, 조류배지·TM·상금 각 1회 |
| RIV_02 | F01 등대, 시온과 대화 | `GYM_2_WON` | 저장된 라이벌 팀 2마리 재대결 | `RIV_02_FACED`; 승리만 `RIV_02_WON` |
| EV_08_PORT_EXIT | M02 선장 보고 | `GYM_2_WON` + `CLUE_CARGO` | 해안도로 통행 허가 | `R03_OPEN`; 라이벌 승리와 **무관** |

### 2막 — 이상한 징후
| ID | 시작 위치·트리거 | 선행 조건 | 실제 진행/전투 | 완료·영구 결과 |
| --- | --- | --- | --- | --- |
| EV_09_POWER_ALERT | M03 시민 경보 | `R03_OPEN` | 정전, 포켓몬 행동 반복 목격 | `POWER_ALERT`, 발전소 공개 |
| EV_10_RESTORE_POWER | D03 제어실/도윤 | `POWER_ALERT` | 3개 스위치 안전 순서 → 단원전 → 주민 구조 | `POWER_RESTORED` |
| EV_11_POWER_LOG | D03 제어 단말 | `POWER_RESTORED` | 세 거점 좌표 암호 수집 | `CLUE_POWER`, `POWER_LOG_SAVED` |
| GYM_03 | M03 도윤, 관장전 승리 | `POWER_RESTORED` | 전류 방향 퍼즐+전기 팀 | `GYM_3_WON`, 전광배지·TM·상금 |
| EV_12_FOG_ACCESS | M03 경비원 | `GYM_3_WON` + `CLUE_POWER` | 바람언덕길 우회로 열기 | `R04_OPEN` |
| EV_13_RUINS_INVITE | M04 루나/별하 | `R04_OPEN` | 비문 번역, 사라진 문장 확인 | `RUINS_RESEARCH_STARTED` |
| GYM_04 | M04 연우, 관장전 승리 | `RUINS_RESEARCH_STARTED` | 거울 퍼즐+고스트 팀 | `GYM_4_WON`, 그림자배지·TM·상금 |
| EV_14_DAWN_STONE | D04 루나·기록판 | `GYM_4_WON` | 봉인 비문 맞추기 → 기록 재생 → 여명석 핵 수령 | `DAWN_STONE_OBTAINED`, 단일 중요한 아이템 |
| RIV_03 | D04 출구, 시온 대화 | `DAWN_STONE_OBTAINED` | 팀 3마리 재대결, 파트너가 멈추는 연출 | `RIV_03_FACED`(승패), `RIV_03_WON`(승리) |
| EV_15_OPEN_R05 | M04 루나 보고 | `DAWN_STONE_OBTAINED` | 붉은계곡 출입 봉인 해제 | `R05_OPEN`; 라이벌 승리 필수 아님 |

### 3막 — 사라진 여명
| ID | 시작 위치·트리거 | 선행 조건 | 실제 진행/전투 | 완료·영구 결과 |
| --- | --- | --- | --- | --- |
| EV_16_HEAT_ALERT | M05 온천 광장 | `R05_OPEN` | 무료 충전시설 홍보 뒤 이상 징후 | `HEAT_ALERT` |
| EV_17_FACTORY_SAFE | M05 조합장/화린 | `HEAT_ALERT` | 시민 대피 + 밸브 2개 고정 | `FACTORY_SAFE` |
| GYM_05 | M05 화린, 관장전 승리 | `FACTORY_SAFE` | 온도 퍼즐+불꽃 팀 | `GYM_5_WON`, 잿불배지·TM·상금 |
| EV_18_LAB_REPORT | D05 연구 로그/세라 | `GYM_5_WON` | 연구동 전원차단→단원전→과거 사고 음성 확인 | `CLUE_RESEARCH`, `LAB_SHUTDOWN_SAFE` |
| EV_19_SNOW_ROUTE | M05 화린과 대화 | `CLUE_RESEARCH` | 산장 구조 호출·눈길 허가 | `R06_OPEN` |
| EV_20_SNOW_RESCUE | R06 구조대 | `R06_OPEN` | 봉화 3개 연결, 길 잃은 주민 호송 | `SNOW_RESCUED` |
| GYM_06 | M06 서리, 관장전 승리 | `SNOW_RESCUED` | 미끄럼 발판 퍼즐+얼음 팀 | `GYM_6_WON`, 설원배지·TM·상금 |
| EV_21_HISTORY | D06 기록판·루나 | `GYM_6_WON` | 300년 전 장치 분리 원문 재생, 하린 거짓 방송 폭로 | `CLUE_HISTORY`, `ECLIPSE_TRUTH_KNOWN` |
| RIV_04 | D06 출구, 시온 대화 | `CLUE_HISTORY` | 팀 4마리 재대결·파트너 돌봄 연출 | `RIV_04_FACED`; 승리만 `RIV_04_WON` |
| EV_22_STEEL_ROAD | M06 구조대장 | `CLUE_HISTORY` | 철빛협곡의 안전 확인 | `R07_OPEN` |

### 4막 — 마지막 밤
| ID | 시작 위치·트리거 | 선행 조건 | 실제 진행/전투 | 완료·영구 결과 |
| --- | --- | --- | --- | --- |
| EV_23_STEEL_REPORT | M07 준철·윤하 | `R07_OPEN` | 연구 책임 조사 의뢰, 보안 지도 수령 | `STEEL_REPORT` |
| GYM_07 | M07 준철, 관장전 승리 | `STEEL_REPORT` | 동력 레일 퍼즐+강철 팀 | `GYM_7_WON`, 철성배지·TM·상금 |
| EV_24_BASE | D07 도겸·세라·서버 | `GYM_7_WON` + `CLUE_RING` + `CLUE_CARGO` + `CLUE_POWER` | 두 간부와 연속전 → 서버 자료 복제 → 통제 키 확보 | `ECLIPSE_BASE_DISABLED`, `CONTROL_KEY` |
| EV_25_CHAMP_CONFESSION | M07 윤하 | `ECLIPSE_BASE_DISABLED` | 과거 사진의 비밀 고백, 공개 사과 | `CHAMP_CONFESSED` |
| EV_26_OPEN_R08 | M07 준철 | `CONTROL_KEY` + `CHAMP_CONFESSED` | 하늘오름길 차단 해제 | `R08_OPEN` |
| EV_27_WIND_TRIAL | M08 관장 안내원 | `R08_OPEN` | 고산 바람 길 표지·보호장구 | `WIND_TRIAL_DONE` |
| GYM_08 | M08 승천, 관장전 승리 | `WIND_TRIAL_DONE` | 바람 타이밍 퍼즐+드래곤 팀 | `GYM_8_WON`, 창공배지·TM·상금 |
| RIV_05 | M08 바람길, 시온 | `GYM_8_WON` | 팀 5마리 승부, 협력 제안 | `RIV_05_FACED`; 승리만 `RIV_05_WON` |
| EV_28_SHRINE_APPROACH | D08 루나 | `GYM_8_WON` + `CONTROL_KEY` + `DAWN_STONE_OBTAINED` | 길 확보, 3개 분리 순서 안내 | `D09_OPEN`, `SHRINE_PREPARED` |
| EV_29_ECLIPSE | D09 입구·카이론 방송 | `D09_OPEN` | 지역 일식 연출, 비상 구조팀 배치 | `ECLIPSE_STARTED` |
| EV_30_NODE_FOREST | D09 분리 콘솔 A | `ECLIPSE_STARTED` | 숲 공명선 분리, 파형 안정화 | `NODE_FOREST_OFF` |
| EV_31_NODE_POWER | D09 분리 콘솔 B | `NODE_FOREST_OFF` | 발전소 공명선 분리, 구조 신호 | `NODE_POWER_OFF` |
| EV_32_NODE_SKY | D09 분리 콘솔 C | `NODE_POWER_OFF` | 신전 증폭기 분리, 전체 주파수 감소 | `NODE_SKY_OFF` |
| EV_33_KAIRON | D09 중앙장치, 카이론 | `NODE_SKY_OFF` | 카이론 팀 결전 → 인공 공명수호기 시련 | `KAIRON_DEFEATED`, `RESONANCE_NETWORK_OFF` |
| EV_34_ARCEUS | D09 제단, 루나·시온 | `KAIRON_DEFEATED` | 아르세우스 등장·비포획 시련 또는 연출형 대체안 | `ARCEUS_TRIAL_COMPLETE` |
| EV_35_DAWN | D09 제단·루나 | `ARCEUS_TRIAL_COMPLETE` | 기록판 복원, 빛 회복, 카이론 수사/복구 시작 | `ECLIPSE_RESOLVED`, R09 개방 |

**주요 잠금 설계:** D09는 **공명기가 분리되기 전**에 입장해야 한다. 세 분리 콘솔 EV_30–EV_32는 모두 D09 내부에 있고, `D09_OPEN`은 그 전제 조건이다. 배지 8개만으로 유적에 들어가면 아이템/컷신을 건너뛰지 못하도록 `CONTROL_KEY`·`DAWN_STONE_OBTAINED` 등도 검사한다.

### 5막 — 리그와 엔딩
| ID | 시작 위치·트리거 | 선행 조건 | 실제 진행/전투 | 완료·영구 결과 |
| --- | --- | --- | --- | --- |
| EV_36_LEAGUE_ROAD | R09 리그 관리소 | `GYM_8_WON` + `ECLIPSE_RESOLVED` | 회복·대회 접수, 챔피언로드 | `LEAGUE_REGISTERED` |
| RIV_06 | R09 시온, 대화 | `LEAGUE_REGISTERED` | 팀 5마리 마지막 본편 승부 | `RIV_06_FACED`; 승리만 `RIV_06_WON` |
| E4_01 | L01 유담 | `LEAGUE_REGISTERED` | 격투 사천왕 | `E4_1_CLEAR`(해당 대회 시도 기록) |
| E4_02 | L01 소미 | `E4_1_CLEAR` | 에스퍼 사천왕 | `E4_2_CLEAR` |
| E4_03 | L01 해령 | `E4_2_CLEAR` | 땅 사천왕 | `E4_3_CLEAR` |
| E4_04 | L01 가온 | `E4_3_CLEAR` | 비행 사천왕 | `E4_4_CLEAR` |
| EV_37_CHAMPION | L01 윤하 | `E4_4_CLEAR` | 챔피언 6마리, 팀 승리 | `CHAMPION_WON` |
| EV_38_CREDITS | L01 승리 연출 | `CHAMPION_WON` | 명예의 전당, 엔딩 크레딧, 주민 일상 컷신 | `CREDITS_SEEN`, `POSTGAME_UNLOCKED` |

**리그 시도 상태:** `E4_n_CLEAR`는 시도(run)별 진행 플래그. 리그 도중 패배/포기 시 해당 회차만 초기화하고 본편 영구 플래그는 건드리지 않는다. 챔피언 승리는 영구 보존.

## 3. 엔딩 후 이벤트
| ID | 발동 위치 | 선행 조건 | 완료 보상/후속 |
| --- | --- | --- | --- |
| PG_01_ARCHIVE | P01 봉인서고 | `POSTGAME_UNLOCKED` | `ARCHIVE_RESTORED`, 가문의 진실 복원 |
| PG_02_RIVAL_FINAL | P02 푸른잎 광장 | `ARCHIVE_RESTORED` | 시온 6마리 팀 최종전, `RIVAL_EPILOGUE_WON` |
| PG_03_SHRINE_RETURN | D09 제단 | `POSTGAME_UNLOCKED` + `ARCHIVE_RESTORED` + `RESONANCE_NETWORK_OFF` | 선택형 아르세우스 포획 도전/존중 연출, 영구 재도전 방지 설계는 별도 승인 |
| PG_04_ELITE_REMATCH | M09 리그 접수 | `POSTGAME_UNLOCKED` | 강화 E4/챔피언 승리 기록 |
| PG_05_TOWER | P03 배틀탑 | `POSTGAME_UNLOCKED` | 연승 기록 및 교환 보상 |
| PG_06_EXPLORATION | 이전 루트/숨은 출구 | `POSTGAME_UNLOCKED` | 새 서식지·도감 임무 |

2회차는 `CHAMPION_WON`을 해제하거나 기존 월드·파티를 초기화하는 새 게임이 아니다.

## 4. 서브퀘스트 — 수락/목표/보상/재방문 대사
> 중요: 아래 보상 수치는 **제안**. 아이템 이름을 실제 게임 데이터에 추가해야 하며 보상은 `SQ_*_CLAIMED`로 중복 방지.

| ID / 이름 | NPC·시작 | 목표 | 수락 조건/진행 | 보상과 지역 변화 |
| --- | --- | --- | --- | --- |
| SQ_01_DELIVERY / 첫 우편 | R01 배달부 준 | 푸른잎 주민에게 편지 전달 | `STARTER_CHOSEN`, 제한 시간 없음 | 몬스터볼 3개·배달부 감사 대사 |
| SQ_02_LIVING_FOREST / 숲의 소리 | M01 은솔 | D01 풀숲에서 상처 난 포켓몬 진정 | `GYM_1_WON` | 상처약 2개·보호관 순찰 |
| SQ_03_SAILOR / 등대 편지 | M02 호준 | 등대지기에게 안전 항로 기록 전달 | R02 진입 | 슈퍼볼 2개·등대 불 켜짐 |
| SQ_04_LATE_TIDE / 늦은 밀물 | M02 해진 | 수로 물길을 복구해 작은 배 이동 | `WAREHOUSE_SAFE` | 700원·부두 NPC 이동 |
| SQ_05_LIGHTS / 꺼진 창문 | M03 민재 | 전력 복구 후 주민 3명 방문 | `POWER_RESTORED` | 기술 PP 회복 아이템 |
| SQ_06_RUIN_INK / 보존된 글씨 | F02 별하 | 비문 탁본 3개 수집 | `RUINS_RESEARCH_STARTED` | 고대 기록 페이지·추가 대사 |
| SQ_07_HOT_SPRING / 따뜻한 길 | M05 화린 | 작업자/포켓몬을 안전 통로로 안내 | `FACTORY_SAFE` | 무료 회복 통로 열림 |
| SQ_08_BONFIRES / 세 개의 봉화 | M06 구조대 | 산장 불빛 3개 연결 | `SNOW_RESCUED` | 회복 아이템·북부 단축길 |
| SQ_09_OLD_PHOTO / 낡은 사진 | M07 윤하 | 세 장소의 사고 기록 모으기 | `CLUE_RESEARCH` | 추가 고백 대사·도감 등록 힌트 |
| SQ_10_WIND_CHIMES / 바람 종 | M08 승천 | 종 4개의 울림 순서 찾기 | `WIND_TRIAL_DONE` | 용의숨결 재사용권/기념품(보상안 조정) |
| SQ_11_AFTER_DAWN / 복구 자원봉사 | M00 은솔 | 복구 주민 5명에게 물자 전달 | `ECLIPSE_RESOLVED` | 지역별 개별 감사 대사 |
| SQ_12_LONG_WALK / 다시 걷는 길 | M01 시온(후일담) | 과거 대결 장소 3곳 방문 | `POSTGAME_UNLOCKED` | 라이벌 추가 컷신·최종전 힌트 |

서브퀘스트 미수행이 메인 관장/최종 아르세우스/리그를 막지 않도록 한다. 복구형 의뢰에는 **무제한 재도전** 제공.

## 5. 컷신 스크립트 — 필수 장면 샘플 전문
대사에서 `{playerName}`, `{starterName}`, `{rivalStarter}`, `{chosenType}`은 현재 세이브에서 치환되는 문자열이다. 기본 이름 미입력 시 '트레이너'를 사용. 컷신 내 카메라 좌표는 추후 맵 구조에 맞춰 편집.

### CS_00 — 연구소, 두 파트너
- 조건: `EV_00_CHOOSE_STARTER`, 위치 M00 연구소 실내.
- 순서: ① 박사에게 접근 ② 타입 선택 ③ 플레이어 룰렛 ④ 라이벌 룰렛 ⑤ 결과 저장 ⑥ 도감/이동 안내.
- 해솔: "내가 알려 줄 수 있는 건 이 포켓몬의 이름뿐이야. 어떤 친구가 될지는 너희가 정하는 거지."
- 시온: "넌 {chosenType} 타입이구나? 그럼 난 거기에 강한 타입을 고를래."
- 룰렛 고정 후 시온: "{rivalStarter}. 좋아! 상대를 잘 골랐으니 이제 절반은 이긴 셈이지."
- 해솔: "승부 전에 둘 다 준비가 됐는지 먼저 확인하렴."
- **중단 처리:** 룰렛 결과가 이미 저장됐다면 재진입 시 새로 뽑지 않고 기존 결과 재표시.

### CS_01 — 이슬숲, 금속 고리
- 조건: `EV_05_RING_FOUND`, D01 작은 공터.
- 플레이어가 상처 난 포켓몬에게 천천히 접근 → 보호관이 진정시킴 → 땅에 검은 금속 고리가 떨어짐.
- 보호관: "밀렵꾼의 줄은 아닌데… 포켓몬이 같은 방향으로만 걸으려 했어."
- 도겸(멀리서): "장비를 회수해. 서둘러."
- 은솔: "이걸 어디에 쓰려고 만든 걸까?"
- **선택:** '쫓아간다 / 보호관을 돕는다'. 두 선택 모두 보호관을 먼저 안전하게 하는 공통 결과, 이후 도겸은 달아남. 부수는 선택으로 고리 증거를 소실시키지 않는다.

### CS_02 — 은빛항구, 빈 화물
- 조건: `EV_07_WAREHOUSE`, D02 창고.
- 창고 천막이 걷히고 비어 있는 케이스와 번호가 보임.
- 도겸: "그 상자엔 애초에 네가 찾는 보물이 없어."
- 플레이어가 번호를 사진으로 남긴다 → 도겸 단원전.
- 해진(복귀 후): "화물이 없어도 장부는 거짓말을 못 하지. 이 번호를 번개시티에 보내자."
- **중단 처리:** 단원전에서 패배한 경우 케이스 번호는 아직 완료 플래그를 얻지 못하지만 다음 입장 때 다시 조사 가능.

### CS_03 — 발전소, 세라의 설명
- 조건: `EV_10_RESTORE_POWER`, D03 제어실.
- 세라: "위험한 행동을 하는 포켓몬을 미리 알아내는 거야. 잘못된 일일까?"
- 도윤: "예방이라면 왜 포켓몬들이 스스로 움직이지 못하지?"
- 경보음 → 시민 대피 → 플레이어가 스위치 3개를 안전한 순서로 내림.
- 세라: "안전이란, 통제할 수 있는 범위 안에 두는 거야." (즉시 도주)
- **다음 정보:** EV_11 로그에 거점 3개 암호 남음.

### CS_04 — 안개 유적, 여명석
- 조건: `EV_14_DAWN_STONE`, D04 기록실.
- 별하가 봉인된 문장 3줄을 낭독. 마지막 문장은 흐릿함.
- 루나: "우리 가문은 지켜야 한다고 했어. 그런데 지키는 동안 무엇을 숨겼는지 모르겠어."
- 기계에서 빛 잔상이 켜지고 긴 밤의 기록이 나타남.
- 비문: "여명은 명령하지 않는다. 서로 다른 숨이 이어질 때 아침이 온다."
- 루나: "여명석은 지배의 열쇠가 아니야. 그럼 조직이 찾는 건… 그 기록을 거꾸로 이용하는 법일지도."
- **획득:** 단일 `DAWN_STONE` 중요 아이템. 중복 지급 금지.

### CS_05 — 연구동, 카이론의 과거
- 조건: `EV_18_LAB_REPORT`, D05 관측실.
- 영상: 10년 전 카이론과 윤하가 안전 실험에 참여. 화면 뒤 경보와 급정거 소리, 기록 일부가 검게 가려짐.
- 카이론(녹음): "그날 난 그 아이를 지키지 못했어. 다음 번에는 누구도 위험해질 수 없도록 하겠어."
- 세라: "이 기록이 아직 남아 있었어?"
- 루나(통신): "그의 두려움은 진짜일 거야. 그렇다고 지금의 실험을 멈추지 않을 이유가 되지는 않아."

### CS_06 — 설산, 긴 밤의 문장
- 조건: `EV_21_HISTORY`, D06 문서실.
- 별하의 번역본과 고대 문서 원본을 대조. 고대인들이 장치를 연결했던 이유, 스스로 연결을 끊었던 이유 차례로 공개.
- 하린의 허위 방송이 전파를 타지만 플레이어가 공개 자료로 반박.
- 시온: "내가 계속 이겨야만 우리가 안전하다고 생각했는데… 그럴 필요는 없었어."
- 루나: "선택할 기회를 지키는 게, 우리가 물려받은 유산인가 봐."

### CS_07 — 철벽시티, 챔피언의 고백
- 조건: `EV_25_CHAMP_CONFESSION`, M07 대형 광장.
- 윤하: "카이론과 연구를 시작한 건 나였어. 위험을 알면서도 끝까지 막지 못했지."
- 준철: "그 책임을 오늘부터 어떻게 질 건데?"
- 윤하: "기록을 공개하겠어. 그리고 네가 선택할 수 있게, 우리가 만든 장치도 설명하겠어."
- 플레이어가 비상 차단 절차를 배움.

### CS_08 — 하늘신전, 마지막 밤
- 조건: `EV_29_ECLIPSE` → `EV_35_DAWN`.
- **순서:** 입구 일식 경보 → 시온/루나 구조팀 분담 → 공명선 A/B/C 안전 분리 → 카이론의 최종 대사 → 카이론 팀 배틀 → 인공 수호기 → 카이론의 비상 정지 협력 → 아르세우스 등장 및 시련 → 해가 돌아옴.
- 카이론: "통제하지 못한 힘 때문에 얼마나 많은 것을 잃었는지, 너는 모를 거야."
- 시온: "그래도 내 파트너가 스스로 멈추겠다고 하면, 난 그 말을 들어."
- 카이론: "…두렵다고 모두 묶어두는 것이 지키는 일은 아니었군."
- 루나: "여명은 누군가가 명령해서 오는 게 아니야."
- **카메라:** 인물 클로즈업보다 비문/공명 파형/하늘색 변화 중심. 아르세우스는 스스로 나타나고 사라짐. **메인 포획 불가**.
- **패배/재접속:** 카이론전 패배 시 안전한 입구로, A/B/C 분리 플래그는 보존. 카이론 재도전/아르세우스 시련 재도전 허용. `ECLIPSE_RESOLVED` 전까지 일반 일식 텍스처를 모든 지역에 영구 적용하지 않는다.

### CS_09 — 명예의 전당과 엔딩
- 조건: `EV_37_CHAMPION` 승리.
- 윤하: "이 자리는 네가 세상을 구했기 때문에 주는 게 아니야. 오늘 여기서 네가 이겼기 때문이지."
- 시온: "다음엔 상성만 계산하지 않을 거야. 네가 어떤 선택을 하는지 볼 거야."
- 해솔: "다녀왔구나. 떠날 때랑 같은 곳에 서 있는데, 너는 다른 사람이 됐네."
- 배경: 1번도로의 바람 → 항구의 재개항 → 설산의 봉화 → 어린 트레이너들이 새벽마을을 떠나는 장면.
- 명예의 전당에 파티 스냅샷 저장 → `POSTGAME_UNLOCKED` → 기존 세이브에서 자유 탐험.

## 6. 이벤트 연동 규칙·분기 실패 처리
- 대화는 `s.type`/라이벌 고정 종/진화 계열을 치환. 라이벌을 물타입으로 고정 발언하지 않는다.
- 필수 이벤트 대사 중 희귀 포켓몬 획득/스타팅 타입별 특별 엔딩 요구 금지.
- `RIV_*_FACED`는 전투 시작/완료 구분 주의: 전투 **종료 후 승패가 확정**되어야 완료. 시작 버튼 클릭만으로 승리 플래그를 적지 않는다. 중간 종료 후 재대결 가능.
- `GYM_*_WON`은 실제 배틀 승리에서만 설정. 보상 지급/루트 개방과 한 번의 원자적 트랜잭션으로 묶는다.
- 퀘스트 컷신 선택지에 '관찰/도움/질문'은 허용하되, 완료 플래그 또는 필수 단서를 영구히 잃는 선택지 금지.
- 캐릭터가 충돌 타일/닫힌 문 안에 저장된 경우 대화 종료/재접속 후 가장 가까운 안전 스폰에 복원. NPC와 좌표 겹침 금지.
- 컷신 도중 앱을 닫으면 마지막 체크포인트에서 다시 재생. 음악/조명/카메라 제어는 중단 시 항상 초기화한다.
- 메인 사건 완료 뒤 NPC들의 인사 대사/경로 장식은 개선해도 전투/퀘스트 보상 반복은 불가.
- 기존 `s.defeated`는 레거시 트레이너 승리 기록으로 보존. 신규 이벤트 플래그와 **구별**하고 같은 이벤트를 서로 다른 이름으로 중복 지급하지 않는다.

## 7. 데이터/품질 수용 테스트
1. 모든 이벤트 ID와 NPC/객체 ID가 유일하고, 모든 `mapId`가 WORLD_MAP에 존재.
2. `requiresAll`의 모든 flag가 실제 생성 이벤트 또는 안전한 초기 상태로 정의.
3. 메인 0배지→8배지→신전→리그→2회차까지 플레이 가능한 비순환 토폴로지.
4. 매 단계에서 회복·후퇴·재접속·재시도 가능하고 영구 소프트락 없음.
5. 컷신 처음/재생/스킵/중단/복귀 때 보상 횟수는 항상 1.
6. 모든 관장전·라이벌전·카이론전 패배에서 전투 자원 이외 스토리 손실 없음.
7. 라이벌 스타팅/포켓몬 지원 팀 재추첨 없음. 기존 4회 프로토타입 데이터가 새 7회 기획에 잘못 매핑되지 않음.
8. 배지 8개가 여명석 작동 조건이라는 로직 없음. 리그 도전 조건에서만 8개 사용.
9. 메인 아르세우스 시련은 볼 비활성화. 2회차 재회는 별도 플래그/권리 검토 후 구현.
10. 리그 패배/중단 후 기존 챔피언 플래그, 파티, 도감·세계의 사건 해결 상태 보존.
