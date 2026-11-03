# Field character assets

## Humans — Openmon NPC Sprites Set-1

- Publisher / commissioning rights holder: **Screen Smith**. The page describes commissioned artwork made by a Fiverr artist; the individual artist is not named there.
- Source: https://screensmith.itch.io/openmon-npc-sprites-set-1
- File: `OpenmonSpriteSet1.png`, preserved in `assets/field/source/`.
- License: **CC0 1.0**, https://creativecommons.org/publicdomain/zero/1.0/
- Verified 2026-11-03. This particular pack is explicitly described by its publisher as **not AI generated**.
- Changes: select five distinct characters; extract the independent down/left/right/up rows and three original poses; remove solid editor-cell backgrounds and isolated border markers; repack with transparent padding and a common foot anchor. No direction is fabricated by flipping, painting over a portrait, or squeezing a front view.
- Roles: brown-haired yellow-shirted hero, white-capped researcher, blue-haired green ranger, lavender-haired leader, dark-haired pink traveler.

## Pokémon — PMDCollab / SpriteCollab

- Source: https://github.com/PMDCollab/SpriteCollab
- Pinned revision: `00423e7fdecbba4ae1c2ec2feafcb27431e8a54b`.
- All **84** species referenced by the game's existing `POKEMON_DEX` are bundled. The game names and progression data are preserved, including existing naming inconsistencies.
- Imported images are `sprite/NNNN/Walk-Anim.png` (field walking animations), **not battle art**. XML frame sizes and frame counts are used. Cardinal source rows are up=4, right=2, down=0, left=6. Every rendered direction has its own source row.
- Per-species source URL, SHA-256 and complete upstream `credits.txt` are preserved in `assets/field/manifest.json`; author identifier lookup is in `assets/field/source/credit_names.txt`.
- The upstream contribution license is **CC BY-NC 4.0** (noncommercial use and attribution). Full text is preserved in `assets/field/source/LICENSE.md`.
- **Rights distinction:** the repository also contains original Chunsoft artwork, credited as CHUNSOFT. Its inclusion does not make Nintendo / Game Freak / The Pokémon Company / Spike Chunsoft rights CC-licensed. This project does not claim ownership or a commercial license to Pokémon or official game artwork. The upstream submission license is not a blanket grant of third-party rights.
- Changes: retain four cardinal walk rows, trim a shared transparent bounding box without shifting individual poses, repack; unusually large creatures are reduced once with nearest-neighbor sampling to a maximum 44×36 visible pixel box. Other images remain native pixel resolution. Runtime rendering uses no rescaling, filters, flips or recoloring.
- The current field pack uses normal palettes; shiny game mechanics and battle display are unchanged.

## Runtime and regeneration

- All field images load from `assets/field/` on the same origin. A visible error replaces silent dummy sprites if an asset fails to load.
- `tools/import-field-assets.py` regenerates normalized atlases and the manifest using Python + Pillow and the preserved Openmon source. Network access is needed only when rebuilding an uncached source, not for playing.
- `tools/validate-field-assets.py` validates dimensions, coverage, nonempty directions and three distinct human poses.
- `field-manifest.js` is the generated browser manifest; `field-actors.js` handles frame selection, anchors, shadows, movement interpolation and path following. `world-v2.js` renders the existing scenery.
- The former embedded trainer PNG, painted direction derivatives, Canvas character fallbacks, generic follower, external field battle sprites and unused `field-art.js` were removed. Existing battle artwork loading is outside this field rebuild and is unchanged.
