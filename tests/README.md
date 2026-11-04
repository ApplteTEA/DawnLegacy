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
