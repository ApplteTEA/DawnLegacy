# Field rebuild verification — 2026-11-03

## Automated

- `node tests/field-actors.test.cjs`: accepted-step interpolation, turning-corner path order, idle facing, blocked-turn behavior, legacy save migration and saved follower restoration.
- `python tools/validate-field-assets.py` (Pillow): all 84 species referenced by the existing dex have local images; all four rows are nonempty; all five humans have three distinct frames in each direction.
- `node --check`: bootstrap, manifest, actors, world renderer, game.
- `git diff --check`.

## Rival starter tests — 2026-11-04

- `node tests/rival-system.test.cjs`: 실제 `game.js`의 17개 선택 타입·포켓몬 DB·진화·타입 상성을 읽어 라이벌 후보가 항상 존재하며 2배 이상 공격 상성인지 검사.
- 균등 후보 인덱스 양끝 및 중간 난수, 동일 종 중복 회피, JSON으로 직렬화 가능한 저장 결과, 잘못된 타입·난수 예외를 검사.
- GitHub Pages workflow에서 `node --check rival-system.js`와 함께 실행.
- 이 자동 테스트는 실제 브라우저의 룰렛 표시/터치/저장·복원 전체 흐름이나 실기기 검증을 대신하지 않는다.

## Rival first encounter tests — 2026-11-04

- `node tests/rival-encounter.test.cjs`: 실제 게임의 NPC 목록에 시온이 새벽마을 (10,12)에 단독으로 존재하는지 검증.
- (9,12) 플레이어 기준 A 버튼 대화 생성 및 버튼으로 저장된 '리아코 Lv.5' 팀을 사용한 첫 대결 진입 확인.
- 첫 승부 후에는 같은 보상을 위한 재대결 버튼이 노출되지 않는지 확인.
- 라이벌 정보가 손상되거나 누락됐을 때 전투를 만들지 않는지 검사.
- 자동 테스트는 브라우저/Android/iOS 화면에서 접근성 및 조작을 시각적으로 확인한 것이 아니다.

## New game reset and rival visibility — 2026-11-04
- `node tests/restart-rival-visibility.test.cjs`: 일반 save 정상 동작 확인, 메뉴 → 새 게임 확인 → 삭제 → `beforeunload` 시뮬레이션에서 옛 저장 데이터가 부활하지 않는지 확인.
- `index.html`과 `bootstrap.js`에서 모듈 캐시 버전이 일치하는지 확인해 게임의 옛 버전을 실행하는 문제 회귀 방지.
- 플레이어 위치와 라이벌 NPC의 월드 좌표를 입력한 경우 '라이벌 시온' 이름표가 화면 안에서 표시되고 오프스크린에서는 표시되지 않는지 검사.
- 브라우저 자동 인터랙션/모바일 실기기를 직접 실행한 결과는 아니므로, 실제 사용자가 메뉴 초기화·지도 표시를 확인할 필요가 있다.

## Rival rematch progression — 2026-11-04
- `node tests/rival-growth.test.cjs`: 17개 타입별 최초 랜덤 스타팅 종 고정, 추가 3명 저장·복원, 단계별 1~4명 팀 구성·종 중복 방지·현재 DB 기준 진화/레벨 검증.
- 배지 0/1/2/3개에서 순차 해금, 재대결마다 승리 플래그가 구분되고 최종 완료 시 반복 도전하지 않는지 확인.
- `node tests/rival-encounter.test.cjs`: 새벽마을 시온 NPC와 1차전 및 배지 1개를 획득했을 때 2차전 대화와 저장된 팀 2마리 등장 조건 검사.
- GitHub Pages CI에 해당 테스트를 연결. 이 자동 검사는 **실제 UI를 눌러 플레이한 테스트가 아니다**. 사용자 요청대로 실기기/통합 플레이 테스트는 추후 일괄 진행.

## 8-gym campaign foundation — 2026-11-04
- `node tests/campaign-core.test.cjs`: 기존 4배지 세이브·도감·라이벌 종·위치 보존, 34개 맵 연결/진입 게이트, 39개 메인 사건을 통한 배지1~8→공명기 차단→카이론→아르세우스 이벤트→리그 5연전→엔딩/2회차까지 **상태 시뮬레이션**, 동일 이벤트·보상 이중 지급 차단.
- `node tests/campaign-rival.test.cjs`: 원래 스타팅/지원팀 고정, 7단계 라이벌 재대결과 별도 후일담 플래그 검사.
- `node tests/campaign-ui.test.cjs`: 임시 지도 메뉴 진입, R01/M01 방문, 이벤트 기록, 솔비 관장 배틀 호출, 회복·야생 포켓몬 시작, 캐시 버전과 로더 연계 기본 검사.
- 후반 관장 및 사천왕 팀의 누락 8종은 **배틀 데이터**에 추가되어 현재 DB 기준 8체육관/리그 상대 종 목록 유효성을 검사. 해당 종의 **필드 스프라이트는 미제작**.
- 검증 범위 주의: 캠페인 지도는 메뉴형 임시 이동 UI이며 게임 필드용 맵·충돌/동행·NPC 컷신/퍼즐이 구현됐다는 뜻이 아니다. 자동 상태 검사 또한 실제 16~22시간 플레이/Android 실기기 확인을 대신하지 않는다.

## Browser QA

`tests/mobile.html` embeds the **actual index.html** in a 390×844 viewport. This is a browser portrait viewport, not a physical handset or mobile OS emulation. Run on an isolated preview origin: fixture buttons write disposable localStorage test data on that origin. No test hooks run in index.html itself.

Verified in cloud Chrome against the local preview:

- Up/right/down/left buttons move the player; each independently drawn direction is visually correct.
- Right → up → left → down square: follower takes the previous path segment, remains one tile behind, retains its own heading at corners and when stopped.
- Corrected an initially reversed mapping of PMD left/right rows after screenshot inspection; verified correct cardinal rows after regeneration.
- Original human sheet visually inspected at 3× magnification; five distinct characters share pixel density and foot anchors. Every human direction has three unique poses.
- Cyndaquil, Chikorita and Totodile display as their actual species using directional field art. Cyndaquil's four directions visually inspected in the game.
- Researcher A interaction opens the original laboratory dialog and closes normally.
- Save menu → save → reload retains position, partner and follower position/direction.
- Trainer interaction → challenge → battle → move selection → Ember executes the original turn flow.
- Field canvas uses the same 2× integer scale in X/Y. Portrait header and controls remain accessible.

## Scope and limitations

- No physical Android/iOS device was available; physical touch, OS WebView behavior, and all mobile screen sizes remain unverified.
- All 84 species pass automated atlas checks; not all species or full progression paths were individually played through.
- Field assets use normal palettes. Existing shiny mechanics and battle visuals are unchanged.
- Art licensing and upstream official-art rights are documented in `CHARACTER_ASSET_CREDITS.md`.
