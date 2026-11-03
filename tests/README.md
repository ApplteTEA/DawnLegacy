# Field rebuild verification — 2026-11-03

## Automated

- `node tests/field-actors.test.cjs`: accepted-step interpolation, turning-corner path order, idle facing, blocked-turn behavior, legacy save migration and saved follower restoration.
- `python tools/validate-field-assets.py` (Pillow): all 84 species referenced by the existing dex have local images; all four rows are nonempty; all five humans have three distinct frames in each direction.
- `node --check`: bootstrap, manifest, actors, world renderer, game.
- `git diff --check`.

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
