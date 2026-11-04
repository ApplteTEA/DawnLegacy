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

## Campaign engine, eight gym story and rival endgame — 2026-11-04
- `node tests/campaign-core.test.cjs`: 34개 지역 그래프 및 이동 게이트, 8관장/39 본편 사건/카이론 결전/사천왕·챔피언, 2회차 진입 시뮬레이션. 구형 네 배지/시온 승리·저장 데이터가 새로운 기록으로 오인되지 않는지 검사.
- `node tests/campaign-rival.test.cjs`: 17타입 × 본편 6회+후일담 1회 팀 성장, 저장된 스타팅/6인 구성의 일관성, 7단계 승리 중복 방지, UI 모의 호출, 봉인서고·신전 후일담.
- `node tests/campaign-ui.test.cjs`: 모험 지도/관장·리그 브리지 단위 검사.
- `node --check campaign-data.js`, `campaign-core.js`, `campaign-ui.js`와 기존 필드/라이벌/초기화 단위 테스트를 GitHub Pages CI에서 실행.
- **주의:** 본 테스트는 데이터·상태 전이·모의 UI의 자동 검사이며, 실제 34개 픽셀아트 맵이 구현되었다거나 PC/Android 실기기에서 엔딩까지 플레이한 검증이 아님.
- Work의 이동·충돌/시각 재구축 결과와 통합된 후, 처음부터 엔딩·2회차를 통과하는 실제 입력 기반 E2E를 별도로 구축해야 한다.

## Campaign story pages — 2026-11-04
- `node tests/campaign-scenes.test.cjs`: 39개 메인 사건의 대사 페이지·화자 존재, 선택 타입/스타팅 포켓몬/라이벌 변수 치환, 필수 전설/엔딩 대사 존재 검사.
- `node tests/campaign-ui.test.cjs`: 페이지를 마지막까지 넘긴 뒤에만 이야기 완료 버튼을 제공하고, 실제 최종 확인 후에 사건 플래그가 기록되는지 검사.
- `node tests/campaign-rival.test.cjs`: 엔딩 이후 봉인서고·신전 이벤트의 페이지형 대화 통과를 확인.
- 검증 범위: 데이터/임시 메뉴 UI의 자동 검사. 실제 애니메이션 컷신·Android/iOS 실기기 확인을 대체하지 않음.

## Campaign puzzles and dialogue — 2026-11-04
- `node tests/campaign-puzzles.test.cjs`: 체육관 퍼즐 8개·신전 공명기 퍼즐 3개. 정답/오답→처음부터, 체크포인트 직렬화/복원, 반복 완료/보상 중복 및 관장전 잠금 검사.
- `node tests/campaign-core.test.cjs`: 전체 39개 사건 상태 전이 중 세 공명기 퍼즐을 해결하고 8개 관장 퍼즐 완료 이후에만 배지 획득하는 경로 시뮬레이션.
- `node tests/campaign-ui.test.cjs`: 첫 체육관 퍼즐 실제 버튼 콜백, 틀린 순서·재도전, 신전 공명기 분리 퍼즐 버튼→사건 완료 플래그 연결.
- `node tests/campaign-scenes.test.cjs`: 모든 39개 메인 스토리 사건의 대사 페이지 존재·변수 치환·필수 텍스트 검증. `node tests/campaign-rival.test.cjs`: 스토리 대사 페이지가 추가된 뒤에도 라이벌/2회차 진행 확인.
- GitHub Actions 최신 성공: `41787592989`. 테스트는 Node 기반 자동 검증이며 Android 실기기에서 게임 전체를 플레이한 증거가 아니다.

## Battle, progression and TM system — 2026-11-05
- `node tests/battle-engine.test.cjs`: 17개 챌린지·18개 방어 타입, 상성/면역, 속도와 우선도, 74개 기술, 명중/급소/PP/발버둥, 독/화상/마비/수면 등, 트레이너 기술 선택, 경험치·다단계 진화/이로치/구세이브 데이터 보존, 8배지 TM 적합성.
- `node tests/battle-runtime.test.cjs`: 실제 `game.js`의 `beginBattle`/턴 진행/`win`/포획 함수를 모의 DOM/즉시 완료 애니메이션 환경에서 호출. 트레이너 승리·보상·PP·XP·이로치 포획과 레벨70 이상 애니메이션 상한 코드 검증.
- `node tests/move-management.test.cjs`: 실제 파티 기술관리 메뉴의 버튼 콜백과 배지 TM 선택/4칸 기술 교체/세이브 횟수/PP·이로치 보존, 구형 4배지에서 새 배지 TM을 잘못 얻지 않는지 검사.
- `node --check battle-engine.js`, `node --check game.js` 포함 CI. 기존 이동/필드·라이벌·캠페인·신규게임 테스트는 그대로 유지.
- **검증하지 않은 것:** 실제 PC 브라우저 그래픽 애니메이션/Android 터치·프레임, 전체 8배지 플레이, 105종별 포획/연속 전투/진화 전체 조합. 이 자동 테스트를 사용자 실기기 QA로 표현하지 않는다.

## Real Chromium automated smoke — 2026-11-05
- Workflow: `.github/workflows/browser-smoke.yml`. Code: `node tests/browser-smoke.mjs`, Playwright 1.56.1 + Chromium, production files via local HTTP server.
- First clean start renders 17 starter type choices, then runtime seeded Fire save tests the real party move/one badge TM replacement flow, trainer victory UI, winning money/record, reload persistence, wide screen and reset back to starter choices.
- Viewports: **390×844** portrait (touch-capable Chromium) and **760×680** larger screen. Screenshots for moves, victory, and larger-screen layout are retained as artifact.
- Success evidence: GitHub Actions run `41922407145` and Pages run `41922407113`; 3 screenshots saved in artifact `dawnlegacy-browser-smoke-screenshots`.
- **Important limitation:** The 390px Chromium viewport is not a Galaxy Fold / Android OS browser. The actual handset touch, fold/unfold resize, performance, and 8-gym-to-ending end-to-end gameplay remain outstanding. This test is stronger than Node mock tests but not a substitute for final device QA.

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
