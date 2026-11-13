# Bloom Lands — Development Plan

*Companion to `design.md` (systems) and `content.md` (content and assets).*
*Created: 2026-11-13. Status: draft for review.*

---

## 1. Starting Point

| Item | State |
|---|---|
| Repo | https://github.com/Stroopwaffles/BloomLands, cloned into the project folder; docs live in `docs/` |
| Local tools | Node 22, npm 11, git 2.45 installed. **GitHub CLI (`gh`) not installed.** |
| Stack | Svelte + Vite + TypeScript, static build to GitHub Pages at `/BloomLands/` |
| First release target | **First playable: the Meadow + home + core UI** |

---

## 2. Technical Architecture

### 2.1 Folder layout

```
BloomLands/
├─ docs/                  Design, content and dev plan documents
├─ src/
│  ├─ engine/             Pure TypeScript game logic. No Svelte, no DOM.
│  │  ├─ state.ts         The single game-state object and its types
│  │  ├─ tick.ts          Advances the game by elapsed time
│  │  ├─ systems/         One module per system (gathering, travel, crafting,
│  │  │                   research, helpers, traders, bloom, weather, ...)
│  │  ├─ actions.ts       Everything the player can do (tap plant, start brew, ...)
│  │  └─ save.ts          Save, load, migrate, export/import
│  ├─ data/               Game content as typed data (plants, recipes, regions,
│  │                      characters, curios, relics, ...) taken from the content doc
│  ├─ ui/                 Svelte screens and components
│  ├─ art/                SVG art components, looked up by stable asset ID
│  └─ main.ts
├─ tests/                 Unit tests for the engine
└─ .github/workflows/     Build and deploy to GitHub Pages
```

### 2.2 Key decisions

- **Logic is separate from the UI.** The engine is plain TypeScript that knows nothing about the screen. This keeps the rules testable and makes balancing changes safe.
- **One game-state object.** Everything the save needs lives in one plain, serializable object.
- **Data-driven content.** Plants, recipes, characters and so on live in `src/data`, not scattered through code. Adding a region is mostly adding data.
- **Timers use real timestamps.** Brewing, research, travel and helper trips store start and end times. Offline progress then runs through the **same code** as live play, capped at 4 hours (plus upgrades).
- **Art by stable ID.** Every asset is looked up by its ID (`plant-clover`, `mount-frog`). Features ship with **simple placeholder shapes** first; real art replaces them without code changes.
- **Numbers:** plain JavaScript numbers (max in the billions), shown as 1.2K / 3.4M / 5.6B.
- **Saves:** localStorage, a version number with migrations, autosave every ~30 seconds and when the tab is hidden or closed, and export/import as a text string.
- **Touch first:** rapid tapping without zoom or text selection; multi-touch taps count; no hover-only info; ~44px tap targets; landscape tablet and desktop layouts.

### 2.3 Quality checks

- **Unit tests (Vitest)** for engine rules: click power, toughness, timers, offline progress, save migration, recipe costs, resets on prestige.
- **Type checking** on every build.
- **Browser checks** of each milestone in the app's preview browser, at desktop and tablet sizes.
- **Your playtests** at the end of each milestone.

### 2.4 Deployment

- A GitHub Actions workflow builds the game and publishes it to GitHub Pages on each push to `main`.
- **One-time step for you:** in the repo's Settings → Pages, set the source to "GitHub Actions".

---

## 3. Milestones

Each milestone ends in something you can play or see. Art uses placeholders until Milestone 9, unless we decide otherwise.

### Phase 1: First Playable (the Meadow)

**M0. Project setup**
- ✅ Project folder is the repo working copy; design docs moved into `docs/` (design.md, content.md, dev-plan.md).
- Scaffold Svelte + Vite + TypeScript; add Vitest, formatting and linting.
- Set the `/BloomLands/` base path; add the Pages deploy workflow.
- *Done when:* a "Hello, Bloom Lands" page builds, passes checks and is live on GitHub Pages.
- *Status:* complete; live at https://stroopwaffles.github.io/BloomLands/.

**M1. Engine foundations**
- Game-state object, tick loop, action system.
- Save/load, versioning, autosave, export/import.
- Offline progress with the 4-hour cap.
- Number formatting; asset-ID lookup with placeholder art.
- A debug panel (dev only) to inspect state and skip time.
- *Done when:* state survives reloads, offline time is applied correctly, and tests pass.
- *Status:* complete. The debug panel shows in local development, or on the live site with `?debug` added to the URL.

**M2. Core gathering loop**
- Meadow harvesting spots (Buttercup Rise, Dandelion Drift) with the 7 Meadow plants.
- Toughness, click power, bonus drops, plant regrowth.
- Satchel capacity; travel timer (home ↔ spot, between spots).
- Home: deposit into storage.
- *Done when:* you can fly out, tap plants, fill the satchel, fly home and see your stock.
- *Status:* complete. Starting balance values: satchel 20, click power 1, 6 plants per spot, regrowth 20–25s, flights 4–12s, 10% bonus-material chance, 2% trinket chance. Storage has no limit yet (capacity comes with lodging upgrades in M4).

**M3. Crafting and research**
- Stations: mortar, press, drying rack, spinning wheel, cauldron (with slots).
- Material tags; refined materials; components; potions with timed buffs.
- Research tree (four branches) with real-time research.
- *Done when:* Meadow plants can be refined, combined and brewed into a working potion, all unlocked through research.
- *Status:* complete. 14 research nodes (Refining and Brewing; Spellcraft and Rites wait for M6), 15 recipes (6 refined, 5 components, 4 potions). Early research costs raw materials so the tree can start. All five stations are available from the start for now; M4 moves them behind lodging upgrades. Potions: Greenthumb Brew (+1 click power), Quickwing Tonic (flights 50% faster), Deep Pockets Draught (+10 satchel), Lucky Dew (rarer plants twice as often). Drinking an active potion again adds to its time.

**M4. Home economy**
- Glimmers, trinkets.
- Visiting traders (snail peddler first) with expiring requests.
- Lodging upgrades; court ranks 1–2 (Wanderer, Hearthling).
- QoL upgrade framework (permanent unlocks), with the first few QoL upgrades.
- *Done when:* you can fill requests, earn Glimmers and grow your court a rank.

**M5. Helpers**
- Recruiting at Thimblewick; field-mouse gatherer and supply helpers.
- Helper trips, minimum stock levels, offline helper work.
- *Done when:* helpers keep gathering and restocking while you play and while the game is closed.

**M6. Challenges, magic and time**
- Day/night cycle; Rite of Turning.
- Meadow weather (sunshine, breeze, light rain).
- Pests (aphids), the rabbit, the Dandelion Drifters (camp and mid-flight ambush), other mid-flight events.
- Spells (Bugbane Whisper, Lullaby, Gust, Tanglevine, Parley) and rituals, cast from components.
- *Done when:* every Meadow challenge appears, can be handled by tapping or a spell, and never causes real loss.

**M7. Bloom, story and mounts**
- Bloom meter for the Meadow; settlement requests at Thimblewick.
- Dialogue system; Pip's and Marigold's storylines; curios.
- Sorrel the spirit and its requirements (relic delivery comes with prestige in Phase 2).
- Bumblebee: befriend, Kindred Call, riding, stable, mount levels.
- The Fairy Ring secret area (Rite of Dawn).
- *Done when:* the Meadow can be brought to full bloom through its stories, settlement and spirit.

**M8. Character and wardrobe**
- Character creator (male/female, wings, hair, skin, eyes).
- Wardrobe with the four slots, recoloring, starter set and the Dewdrop outfit.
- *Done when:* you can create and dress your fairy, and it shows large at home and small while gathering.

**M9. Art and polish: Release 0.1 "Meadow"**
- Replace placeholders with the ~120 P1 SVG assets in the soft storybook style.
- Animations (flutter, sway, tap sparkles, petal bursts); UI panels with natural accents; Fredoka and Nunito.
- Tablet and desktop layout pass; tap and performance testing.
- First balancing pass for the Meadow.
- *Done when:* the Meadow plays start to finish, looks finished, and is live on GitHub Pages.

### Phase 2: The Full Game

Each region milestone adds that region's content, art, mount, creature, pirate crew, characters, secret areas, recipes and unlock ritual, all following the content doc.

| Milestone | Scope |
|---|---|
| **M10. Forest** | Acornhollow, Bramblebeard, flying squirrel, owl, Bramble Corsairs; court rank 3 |
| **M11. Swamp** | Toad Village, Mirebelle, frog, heron, Bog Buccaneers; brewer and scout helpers |
| **M12. Blossom Orchard** | Combhaven, Grandmother Pome, hummingbird, badger, Nectar Nabbers; beeswax and light |
| **M13. Caves** | Glimmerdeep, Old Quartz, glowworm, spider, Stalactite Smugglers; underground events, Lantern Rite |
| **M14. Prestige** | Root Song Ritual, Root Song upgrades, relics from spirits, reset rules, spirit requirements per run, Blossom Court requirement |
| **M15. Moonlit Glade** | Emberglow, Selenne, luna moth, moth swarm, Moonshadow Crew; moon cycle; blue jay befriending |
| **M16. Sky Isles** | Nimbusrest, Aeris, blue jay riding, hawk, Stormchasers; Cloud Archive (run 2+) |
| **M17. The captain and the ending** | Captain Mallow's full arc, the ending sequence after the 5th prestige, the bonus run, the hard ending and new game |
| **M18. Balancing and release 1.0** | Full balancing across five runs, playtesting, performance, remaining QoL upgrades, final art pass |

---

## 4. How We Work Each Milestone

1. I build the milestone, with tests for the engine rules.
2. I check it in the preview browser at desktop and tablet sizes.
3. You playtest and give feedback; I adjust.
4. It's committed and pushed, and GitHub Pages updates.
5. The design and content docs are updated if anything changed along the way.

---

## 5. Open Questions

1. **Repo setup (decided):** the project folder is the repo working copy; docs are in `docs/`.
2. **Git workflow (decided):** commit **straight to `main`** after each milestone (no branches or pull requests).
3. **Art timing (decided):** **placeholders first**. Features ship with simple placeholder shapes; M9 replaces them with the real P1 art in one consistent pass.
