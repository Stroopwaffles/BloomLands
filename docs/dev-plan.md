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
- *Status:* complete.
  - **Trinkets** are the rare currency: the trinket items you find, spent by count (any kind). They take no storage space.
  - **Traders:** Tumble the snail peddler. Up to 2 requests at once, a new one every 2 minutes, each lasting 15 minutes. Requests ask for raw plants plus anything you can currently craft, and pay 1.5× the items' value in Glimmers, with a 15% chance of a bonus trinket.
  - **Upgrades tab:** Lodging (Storeroom ×3, Press Nook, Spinning Corner, Hearth and Cauldron, Second Cauldron), Gear (gloves, satchel and wing upgrades, 3 tiers each), Comforts (Homing Instinct, Tidy Habits, Round Trips, Big Batches).
  - **Stations:** the mortar and drying rack come with the starting home; the press, spinning wheel and cauldron are built.
  - **Storage:** 100 base space; trinkets are free.
  - **Court ranks:** all seven defined; lodging gives court points (Hearthling at 6). Helpers add points in M5.

**M5. Helpers**
- Recruiting at Thimblewick; field-mouse gatherer and supply helpers.
- Helper trips, minimum stock levels, offline helper work.
- *Done when:* helpers keep gathering and restocking while you play and while the game is closed.
- *Status:* complete.
  - **Thimblewick** is a destination (6s from home); helpers are recruited there with Glimmers (gatherer 50, supply 90, each further one ×1.6).
  - **Lodging:** Mouse Bunks (2 gatherers), Bigger Bunkroom (+2), Supply Nook (1 supply helper), Supply Loft (+2).
  - **Gatherers** work a chosen spot: fly out, gather 4 plants for 45s, fly home, unpack. **Supply helpers** fetch whatever is furthest below its minimum (rarer plants yield less per trip) and don't double up on the same item.
  - Helpers wait at home with their haul if storage is full. Each helper adds 2 court points.
  - Helper flights use base route times; mounts for helpers arrive with M7.

**M6. Challenges, magic and time**
- Day/night cycle; Rite of Turning.
- Meadow weather (sunshine, breeze, light rain).
- Pests (aphids), the rabbit, the Dandelion Drifters (camp and mid-flight ambush), other mid-flight events.
- Spells (Bugbane Whisper, Lullaby, Gust, Tanglevine, Parley) and rituals, cast from components.
- *Done when:* every Meadow challenge appears, can be handled by tapping or a spell, and never causes real loss.
- *Status:* complete.
  - **Day/night:** one in-game day is about 1 real hour (dawn, morning, afternoon, dusk, night). Morning dew only grows in the morning or in rain. Spots look different at night.
  - **Meadow weather** changes every 8–15 minutes: sunshine (plants regrow 1.5× faster), breeze (flights home 25% quicker, flights out 25% slower), light rain (flights 25% slower, dew all day).
  - **Aphids** infest petal plants (3 per plant); each tap clears one before the plant can be tapped.
  - **The rabbit** visits every 8–14 minutes and eats a plant every 15 seconds for up to 3 minutes; 8 taps shoo it.
  - **The Dandelion Drifters** camp at a spot every 20–30 minutes, taking 3 of its 6 slots and halving helper hauls in the Meadow.
  - **Flight events** (35% of player-started flights): ambush (6 taps or Gust, otherwise up to 3 satchel items stolen, never trinkets), dandelion seeds to catch, a lost beetle (+15 Glimmers), gusts (tail- or headwind).
  - **Spells** (Spellcraft branch): Bugbane Whisper, Lullaby, Gust, Tanglevine. **Ritual Circle** (lodging) and the **Rite of Turning** (Rites branch).
  - **Content changes:** Pest Smudge and Tanglevine now use Meadow ingredients (noted in the content doc). **Parley** moves to M7 with the storylines.

**M7. Bloom, story and mounts**
- Bloom meter for the Meadow; settlement requests at Thimblewick.
- Dialogue system; Pip's and Marigold's storylines; curios.
- Sorrel the spirit and its requirements (relic delivery comes with prestige in Phase 2).
- Bumblebee: befriend, Kindred Call, riding, stable, mount levels.
- The Fairy Ring secret area (Rite of Dawn).
- *Done when:* the Meadow can be brought to full bloom through its stories, settlement and spirit.
- *Status:* complete.
  - **Bloom:** six levels (Wilted → Waking 10 → Sprouting 30 → Budding 60 → Blooming 100 → Flourishing 150). Each level: +10% regrowth, +10% rare chance; spots get more colorful. Sources: villager requests (+3), story chapters (+3) and endings (+10), clearing a camp (+2), winning over a crew (+10), awakening the spirit (+15).
  - **Thimblewick villagers** (Hob, Wisteria, Old Tumbleweed) ask for items; filled in person.
  - **Stories:** Pip's lost maps (→ Pip's Compass, flights −10%) and Marigold's festival tart (→ Festival Ribbon, trader pay +10%), 4 chapters each.
  - **Sorrel** at Sunstone Hill: this run needs Sprouting bloom, Pip's story, and 3 Sun Salve. Relics come with prestige (M14).
  - **Bumblebee:** befriend at Buttercup Rise (5 feedings of 5 clover leaves, 2 min apart), tame with Kindred Call, house in the Bumblebee Roost. Riding: flights ×1.25, +10 satchel in the Meadow; levels to 5. Spare mounts are lent to helpers.
  - **The Fairy Ring:** opened by the Rite of Dawn (morning only); Ringcap mushroom; first visit gives the Pocket Sundial (potions +20%) and the Dewdrop outfit (for M8).
  - **Parley:** 3 Parleys win over the Dandelion Drifters (no more camps or ambushes this run, +2 reformed pirate helpers).
  - Built with local checkpoint commits, pushed at the end.

**M8. Character and wardrobe**
- Character creator (male/female, wings, hair, skin, eyes).
- Wardrobe with the four slots, recoloring, starter set and the Dewdrop outfit.
- *Done when:* you can create and dress your fairy, and it shows large at home and small while gathering.
- *Status:* complete.
  - **Character creator** on a new game: female/male, 10 skin tones (including fantasy tones), 6 hair styles × 10 colors, 3 eye shapes × 8 colors, 4 wing shapes × 8 colors. Changeable any time from the **Wardrobe** tab at home.
  - **Outfits:** four slots (headpiece, outfit, shoes, accessory), each recolorable from 12 colors or left empty. Starter set: flower crown, petal dress, petal tunic, leaf slippers, small satchel. **Dewdrop set** (from the Fairy Ring): circlet, gown, cloak.
  - **The fairy is a layered drawing** built from these choices (placeholder-quality shapes, structured so M9 only redraws them). It's shown large at home, on the flight screen, and small on harvesting spots.
  - Colors come from curated palettes so every combination stays in the storybook style.

**M9. Art and polish: Release 0.1 "Meadow"**
- Replace placeholders with the ~120 P1 SVG assets in the soft storybook style.
- Animations (flutter, sway, tap sparkles, petal bursts); UI panels with natural accents; Fredoka and Nunito.
- Tablet and desktop layout pass; tap and performance testing.
- First balancing pass for the Meadow.
- *Done when:* the Meadow plays start to finish, looks finished, and is live on GitHub Pages.
- *Status:* complete — **Release 0.1 "Meadow"** (version 0.1.0).
  - **Living gathering scene:** painted backdrops for Buttercup Rise, Dandelion Drift and the Fairy Ring with hand-placed plants; the rabbit, camp and wild bumblebee live in the scene; sunshine/breeze/rain/night looks; petal bursts and tap sparkles. Kept short enough for tablets.
  - **Art:** all Meadow plants, every item (template families: bottles, jars, pouches, bowls, cups, spools), trinkets, field-mouse folk (helpers, Pip, Marigold, villagers), Tumble, Sorrel, rabbit, aphids, the Drifters and their camp, the bumblebee, stations, spell sigils, curios and UI icons. Art is SVG stored as data by asset ID (`src/art/library`).
  - **UI:** leafy sprig accents on panels, soft button feedback, a home court scene that grows with rank.
  - **Balancing:** rabbit eats every 30s (was 15s); camps leave on their own after 20 min and first appear at 25 min; morning lasts until 40% of the day; base storage 150.
  - **Checked** at desktop, landscape tablet (1024×768) and phone (375px: usable, no sideways scroll, plant tap targets ≥ 61px).
  - **Not yet art:** upgrade-specific icons (they share family icons), region-to-region map, title screen.

### Added after Release 0.1

**Welcome screen (v0.1.1)**, inspired by Fold Drive Miner's:
- A short, skippable intro (once per visit), then the title over a golden-hour meadow with falling petals.
- Menu: **Continue** (when a save exists), **New game** (asks before replacing a save), **Saves**, **Settings**, **Credits**. A **Menu** button in the game header returns here.
- **The player's fairy** stands beside the menu with their court rank, Meadow bloom and play time; first-time visitors see a faded fairy "waiting to be imagined".
- **Saves:** copy backup text, save a backup file, restore from text or file (confirms before replacing), delete (confirms).
- **Settings** (stored separately from the save): reduced motion, particle effects, interface size, autosave interval, number style (1.2K / 1.2E3).
- Footer: "This game was made entirely with AI."

**Sound (v0.2.1):** every sound is synthesized in the browser (Web Audio), so there are no audio files.
- **Sound effects** in a music-box style, all in the same key as the music: taps climb a little scale, harvests chime (rarer plants get a longer chime), plus trinkets, deposits, crafting, coins, spells, rituals, fanfares for big moments, flights, creatures and button clicks. Repeats are rate-limited so offline catch-up never floods.
- **Background music** composed as it plays (pads, bass and a repeating music-box melody). Each region has its own key, chords and pace, with a calmer night version; it crossfades as you travel. The menu plays the newest unlocked region's music.
- **Settings:** music volume and sound volume (Off–100%), plus a mute button in the game header. Audio starts on the first tap (browser rule) and pauses while the tab is hidden.

### Polish (v0.2.2)

- **Menu background by region:** the title screen shows the newest region the save has unlocked (Meadow: Buttercup Rise with falling petals; Forest: the Mossy Stump Ring with falling leaves). New regions add an entry to `TITLE_SCENES` in TitleScreen.svelte. The engine helper `latestRegion` also picks the menu music.
- **Fix: butterfly and dragonfly wings:** each wing part was tilted the wrong way. Forewings now reach up and out and hindwings droop below.

### Sky polish (v0.3.1)

- **Weather names fit the time of day.** The sky badge no longer says "Night · Sunny": clear weather reads Sunny by day, Clear skies at dusk and Starry skies at night; "Misty morning" is now just Mist; muggy heat is Muggy after dark. Night descriptions match too. Effects are unchanged.
- **Dandelion Clock** (Comforts, 120 Glimmers and 1 trinket): the sky badge counts down to the next part of the day, and tapping it shows the day's timeline, how long day (37m) and night (23m) last, and the countdown to nightfall or dawn.

### Travel update (v0.3.4)

- **Routes over regions:** regions sit in a chain (Meadow, Forest, Swamp), and a long flight is split into one leg per region it crosses. Each leg uses its own region's weather (toward or away from home). Open water only slows the leg over the water.
- **Spirit Paths:** home and the resting place of every awakened spirit are linked by a 6-second Spirit Path. Flights (and helpers) take it whenever path + hops is quicker. The path has no weather and no flight events.
- **Flight events come from the region below,** at a random point between 20% and 80% of the flight. Each region has its own:
  - Meadow: Dandelion Drifters, drifting seeds, a lost beetle, gusts.
  - Forest: Bramble Corsairs, falling acorns, a lost squirrel courier, bramble snags (half speed until you tap free).
  - Swamp: Bog Buccaneers, drifting lily petals, a lost tadpole, will-o'-wisps (follow one for a 40% shortcut).
- **Acorn Post** (Comforts, 250 Glimmers and 2 trinkets): from any settlement, send the whole satchel home for 1 Glimmer per 4 items (at least 3). It arrives after 1.5× the base flight home (at least 10 seconds), also while offline, and waits at the door if storage is full.
- **World map** (replaces the list of flights):
  - Regions are islands in a chain, with the next closed region in fog (tap it for what it needs).
  - Places show creatures, camps and helpers at work. Spirit Paths are drawn in gold.
  - Tap a place for a card with the flight time, its "via" route and a breakdown (each leg's time, weather, open water, mounts, wing speed, curios), then press Fly. (v0.3.5: places are chosen on press, so taps are never lost, and only the Fly button flies.)
  - "Fly home" stays one tap away, and the map can be hidden.
- **Travel screen:** a route strip of the regions you cross with your fairy moving along it, an "Over the Forest" line, a "Crossing into…" note at each border, and the scenery of the region below, which fades as you cross.

### Composed music (v0.3.8)

- The generated music (random motifs and sparkles) is replaced by **six composed tracks** in `src/audio/tracks.ts`, written as chords and melody per bar. Each is a 16-bar A–B tune that loops and plays the same every time:
  - Meadow: "Buttercup Morning" (C, 84 bpm) and "Dandelion Lullaby" (3/4, 60).
  - Forest: "Under the Old Oak" (D minor, 72) and "Owl Hour" (3/4, 56).
  - Swamp: "Lily-Pad Regatta" (F, 66) and "Still Water" (3/4, 54).
- **Arrangement:** a soft pad, a bass, and either a broken-chord accompaniment (day), a waltz "oom-pah-pah" (night) or a lazy two-step (Swamp day), under a music-box lead with a lighter echo.
- **New regions:** each adds a day and a night entry. Tests check that every bar adds up.

### Settlement shops (v0.3.9)

- Every settlement has a shop: The Thimble Shop (Hob), The Acorn Exchange (Chestnut) and Lily-Pad Market (Madame Lilywhite).
- **Buying:** a shop sells only the **common** plants of its own region (from its open, non-secret spots) at 2× their worth, into the satchel (×1, ×5, ×10, within satchel space).
- **Selling:** a shop buys **anything** in the satchel at half its worth, with Sell 1, All and Sell everything. Trinkets are worth 40 to a shop. Traders pay 1.5× and villagers grow bloom, so requests stay the better deal. Selling is always cheaper than buying, so there's no buy-and-sell loop.
- Rates are in `SHOP_RULES` (economy.ts).

### Night theme (v0.3.10)

- While it's night in the game, the whole interface switches to soft night colors (`<html data-theme="night">`): indigo panels and cards, lavender text, muted purple borders, dim disabled buttons. It fades in and out with the clock.
- **How it works:** components use palette variables (`--cream`, `--cream-deep`, `--surface`, `--ink`, `--honey`, `--disabled`, `--screen-bg`), so nothing is hard-coded white any more. The night values live in one block in `app.css`.
- **Map at night:** a darker sea, dimmed islands and pins, and dark label pills with light text.
- **Court scene:** shown in moonlight.
- **Setting:** "Night colors: At night / Never". The title menu always uses day colors.

### Satchel, storage and peddlers (v0.3.11 to v0.3.12)

- **At home:** every satchel item has Store 1 / All (plus "Put everything in storage"), and every stored item has +1 / Pack to put it back in the satchel (for example, to sell at a shop).
- **Storage limits** (Helpers tab): set the most of any item to keep in storage, where 0 means no limit.
- **Peddler helper** (Market Stall lodging: 300 Glimmers, 3 Petal Paste, needs Mouse Bunks): takes whatever is furthest over its limit, up to 20 at a time, to the nearest open village shop. They sell it at the shop's price (half its worth) and bring the Glimmers home. They keep working offline.

### Supply helpers search instead of fetch (v0.3.13)

- **Searching:** each supplier trip searches 6 plants at the best open spot, using the same odds as plant growth (`plantWeights`: rarity, luck potions, bloom, weather, curios). The wanted plant counts double. They keep only what they were sent for, so commons come home in good numbers, uncommons usually, and rares occasionally.
- **Growing conditions:** morning-only plants can't be found outside the morning (unless it rains), and mist and fog lower the odds of rares.
- **Unlocking rares:** suppliers can't search for rare plants at first. **Seed Catalogue** (lodging, 400 Glimmers and 2 trinkets) allows it at normal odds, about 1 lucky leaf every 9 trips. **Botanist's Library** (1,200 Glimmers, 4 trinkets, 2 lucky leaves) doubles their eye for rares too.
- **Minimum stock panel:** shows the expected haul ("about 6 per trip", "about 1 every 9 trips"), or why an item can't be fetched now. Suppliers don't set out for items they can't find.
- Tuning is in `SUPPLY_RULES` (helpers.ts).

### Rites: finished rites hidden, full-screen scene (v0.3.14)

- **Finished rites:** one-time rites whose work is done (their region is open, or the Fairy Ring revealed) are no longer offered at the Ritual Circle. They're listed under "Completed" (`ritualDone`), and repeating one is blocked without cost. Turning and Plenty stay repeatable.
- **Full-screen scene:** every rite plays one. A glowing circle draws itself, with spinning runes, a star and rising sparkles, then the rite's name and what it did. Region and Fairy Ring rites are "grand": longer, larger, and in the region's colors. Tap to skip, and reduced motion shows a still version.

### Over-full satchel (v0.3.15)

- **When it happens:** the satchel can shrink while full. The bumblebee only adds space in the Meadow, and a Deep Pockets Draught can wear off. Items are never lost, but gathering is blocked until you make room.
- **What shows:** the header counter gets an "over-full!" tag, and both the satchel popup and the harvesting screen explain why and what to do.
- **Before flying:** the map card warns when a flight would leave the satchel over-full there, for example "(30 / 20): the bumblebee only carries extra in the Meadow". This uses `satchelCapacity(state, placeId)`, `satchelOverload` and `satchelMountAway`.

### Backlog (asked for, not scheduled yet)

- **Revisit the prestige requirements.** The Glade and the Root Song Ritual both need a Blossom Court, so a player can prestige before ever seeing the Glade.

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

#### M10 status: complete — Release 0.2 "Forest" (version 0.2.0)

- **Regions are now general.** Each region opens with a court rank plus its rite (the Forest: a Hearthling court and the Rite of the Open Path, 2 Sun Salve). Weather, pests, large creatures, pirate crews, mount bonuses and research are all per region. Closed regions show what they need in the flight list.
- **Travel:** short hops (5s) inside a region, long flights (18s per region) between regions.
- **Forest content:** 7 plants plus 2 secret-area plants, 3 trinkets, Spore Dust, Acorn Flour, Golden Spore, Earth Loam, Swiftroot Elixir (+50% regrowth), Rite of Plenty (+50% regrowth everywhere for 10 minutes), Hush Step. Six new research nodes appear once the Forest is open.
- **Challenges:** the owl *watches* a spot: no gathering there and helpers stay away, until it's calmed with Lullaby or you sneak with Hush Step (2 minutes). Beetles infest mushrooms. The Bramble Corsairs camp and ambush in the Forest.
- **Magic costs:** Parley and Kindred Call use the local region's signature component (Earth Loam in the Forest), as in the content doc.
- **People:** Hazel Quickpaw (Forgotten Acorn: trinkets 50% more often) and Old Burdock (Burdock's Field Guide: +1 cap per mushroom); Bramblebeard; three Acornhollow villagers.
- **Mount:** the flying squirrel (befriended with acorns at Mossy Stump Ring) makes hops inside the Forest 40% quicker instead of adding satchel space.
- **Secret areas:** the Hollow Log Library (finish Old Burdock's story; Pressed-Flower Bookmark: research 15% faster; Scholar's set) and the Lost Grove (Forest bloom Budding; Heartwood Charm: +25% Forest bloom; Acorn set).
- **Lodging:** Squirrel Drey (+1 mount), Root Cellar (+300 storage), Hedgehog Hollow (+2 gatherers), Second Mortar Bench.
- **Art:** Forest backdrops for all four spots, mist, rain and falling-leaf weather, squirrels and hedgehogs, Bramblebeard, the owl, beetles, the Corsairs and their thorn camp, the flying squirrel, curios, Hush Step and the new outfits.
- *Simplification to review:* the Rite of Plenty speeds up every open region rather than one chosen region.

#### M11 status: complete — Release 0.3 "Swamp" (version 0.3.0)

- **Opening the Swamp:** a Hedge Court plus the Rite of the Reed Gate (2 Earth Loam and 1 Sun Salve), researched in the Forest.
- **Places:** Toad Village, Reeds Hollow, the Lilypad Pools (open water), the Sunken Willow, and the secret Wisp Hollow.
- **Open water:** flights to and from water spots take 40% longer, unless you ride the frog or have drunk a Waterstride Philter.
- **Swamp content:**
  - 7 plants plus the wisp lily, and 3 trinkets (bottle cap, fishing fly, tiny bell).
  - Reed Fiber, and Dew Water pressed from duckweed.
  - Lily Oil, Orchid Essence and Lily Balm. Lily Balm is the Swamp's signature, so Parley and Kindred Call use it there.
  - The Waterstride Philter (5 minutes: no water slowdown, and the heron ignores you).
  - Five new research nodes appear once the Swamp is open.
- **Weather:**
  - Fog: rare plants hide.
  - Drizzle: slower flights, but petal plants grow twice as often.
  - Muggy heat: plants regrow 40% faster, but helpers' flights take 30% longer.
- **Challenges:**
  - The heron watches only the Lilypad Pools. Lullaby calms it, Hush Step sneaks past it, and Waterstride lets you gather under its nose. Helpers still stay home while it watches.
  - Slugs infest petal plants.
  - The Bog Buccaneers camp in the Swamp and ambush flights there.
- **People:**
  - Mayor Gubbins (Mayor's Chain of Office: helping villagers raises 50% more bloom).
  - Wren Mudwhistle (Reed Pipe: helpers' flights 15% quicker).
  - Mirebelle at the Sunken Willow.
  - Three Toad Village villagers.
- **Mount:** the frog, befriended with duckweed at the Lilypad Pools. In the Swamp it adds click power (+1, rising to +3 at level 5), and it swims, so open water doesn't slow it.
- **Secret area:** Wisp Hollow opens at Swamp bloom Budding. It holds the Wisp Lantern curio (rarer plants twice as likely in fog) and the Lantern-Bug set (cloak and lily-pad hat).
- **New helpers:**
  - **Brewers** stay home and repeat a recipe you choose until storage holds the amount you pick (5, 10, 25 or 50). They take a station slot while they work, and they keep working offline.
  - **Scouts** search a spot you choose and bring home its trinkets: a 60% chance per trip, with a 20% chance of a second one. Trinket curios help them too.
  - Trinkets that helpers bring home never need storage space.
- **Lodging:** Lily Pond (+1 mount), Brewer's Corner and Brewing Loft (brewers), Scout's Perch (scout), Reed Loft (+300 storage).
- **Art and sound:**
  - Swamp backdrops for all three spots, fog, drizzle and muggy-heat weather, toads, a newt and a tadpole, Mirebelle, the heron, slugs, the Buccaneers and their leaf-boat camp, the frog, curios, and brewer and scout helpers.
  - Swamp day and night music in F.
  - The menu shows the Lilypad Pools once the Swamp is open.
- **Simplifications to review:**
  - Fog's will-o'-wisp path is decoration only; Wisp Hollow opens by bloom, as the content doc says.
  - Scouts don't discover hidden places yet. That arrives with the Caves' Sunken Geode (M13).
  - Helpers are still drawn as field mice everywhere, rather than as each region's own folk.

#### M12 status: complete — Release 0.4 "Blossom Orchard" (version 0.4.0)

- **Opening the Orchard:** a Bramble Court plus the Rite of First Blossom (2 Lily Balm and 2 Sun Salve), researched in the Swamp.
- **Places:** Combhaven (bee town, with The Honey Pot shop), Petalfall Rows, The Old Pear, and The Grafted Tree (Grandmother Pome).
- **Plants and items:**
  - Honey drip, apple, cherry and quince blossom, bee balm, fallen crabapple and golden pollen, plus royal jelly and truffle in the secret areas.
  - Honey Syrup and Pollen Gold.
  - The Beeswax Candle (Honey Syrup and Reed Fiber), the Orchard's signature, so Parley and Kindred Call use it there. It's also the "light" the Caves will need.
  - Three trinkets: copper coin, sewing needle, seed packet.
- **Weather:**
  - Blossom wind: every petal harvest gives one extra.
  - Spring shower: slower flights, faster regrowth.
  - Late frost: slower regrowth.
- **Challenges:**
  - The grumpy badger digs up a plant every 20 seconds and can only be calmed (Lullaby), never shooed. Calming it 3 times opens Badger's Tunnel.
  - Caterpillars infest blossoms.
  - The Nectar Nabbers ambush flights over the Orchard and steal honey and pollen first.
- **People:**
  - Waxwick (Honeycomb Brooch: +150 storage).
  - Sir Bumbleton (Knight's Pennant: mounts 10% faster, helpers' borrowed mounts too).
  - Grandmother Pome.
  - Three Combhaven villagers.
- **Mount:** the hummingbird (bee balm, at Petalfall Rows). It's very fast (1.6×), and while you ride it in the Orchard, rarer plants there are 1.5× likelier, plus 0.1 per level.
- **Secret areas:**
  - **The Royal Cell** opens after helping Combhaven's villagers 5 times. It holds the Queen's Seal (traders offer trinkets twice as often), royal jelly, and the Honeycomb set (crown, gown, doublet).
  - **Badger's Tunnel** holds the Badger's Pocket Watch (+2 hours of offline progress), truffles, and the Burrower's waistcoat.
- **Lodging:** Hummingbird Feeder (+1 mount), Honeycomb Bunks (+2 gatherers), Wax Cellar (+400 storage).
- **Art and sound:**
  - Orchard backdrops for all four spots, with blossom trees, drifting petals, a honeycomb hall and an earthy tunnel.
  - Bees, Pome, the badger, caterpillars, the Nabbers and their hive camp, the hummingbird, the curios and the new outfits.
  - Orchard day ("Honey and Blossom", G, 92 bpm) and night ("Moonlit Blossom", a waltz) music.
  - The menu shows Petalfall Rows once the Orchard is open.
- **New rules, reusable later:** secret areas can unlock by villager requests or by calming a creature; creatures can be `calmOnly`; weather can add `tagYield`; mounts can give `regionLuck`; crews can have favorite `steals`; and there are curio effects for storage, mount speed, trader trinkets and the offline cap.
- **Simplifications to review:**
  - Heart Nectar and the Glowlight Potion are left for M13, where the Caves give them a use.
  - Pome's relics come with prestige (M14).

#### M13 status: complete — Release 0.5 "Caves" (version 0.5.0)

- **Light to enter:** a Bramble Court plus the **Lantern Rite** (2 Beeswax Candles and 1 Lily Balm) lights the Caves for good. Before that, a **Glowlight Potion** (Beeswax Candle and Dew Water, 10 minutes) or riding the glowworm lets a Bramble Court visit (`regionReachable`). The region is set up on first arrival (`ensureRegion`). Glowlight, the Lantern Rite and Heart Nectar are researched in the Orchard.
- **Places:** Glimmerdeep (moles, with The Lantern Store), the Fungus Gallery, the Crystal Seam, and the Echo Pool (Old Quartz, who echoes).
- **Plants and items:**
  - Cave moss, pale root, glowcap, ghost orchid, crystal shard, starfungus and geode, plus star crystal and sunshaft fern in the secret areas.
  - Glow Spores and Crystal Powder (any crystals).
  - **Glow Ink,** the Caves' signature, so Parley and Kindred Call use it there.
  - Crystal Focus, Heart Nectar, and the Glowlight Potion.
  - Three trinkets: an old iron key, a glass lens, a silver ring.
- **Underground events instead of weather:**
  - Drip season: crystals 2.5× likelier.
  - Still air: rare finds 1.6× likelier.
  - Rumbles: rockfalls can block a spot. The rubble is dug through with 8 taps and clears by itself after 90 seconds.
- **Challenges:**
  - **The spider** webs over a spot. Gathering and helpers stop, and Hush Step can't get you past. Clear it with 10 taps, the new **Web Unweave** spell (Glow Ink) or Lullaby. Lullaby doesn't work on rubble.
  - Silverfish infest fungi.
  - The Stalactite Smugglers go for your crystals first.
  - The interface uses night colors whenever you're in the Caves.
- **People:**
  - Digby Loamsworth, building a lift to the surface (Brass Spyglass: scouts find trinkets 50% more often).
  - Lumen, a shy glowworm (Nightlight Jar: the Caves' spiders, rockfalls and smugglers turn up half as often). Finishing Lumen's story brings the wild glowworm.
  - Old Quartz.
  - Three Glimmerdeep villagers.
- **Mount:** the glowworm (cave moss, at the Fungus Gallery). It counts as light, and adds click power in the Caves.
- **Secret areas:**
  - **The Sunken Geode** is found by a **scout**: a 12% chance on each search of a Caves spot, or very rarely from a rare harvest there. It has the Heartstone (+10% bloom everywhere), star crystal, and the Crystal set (diadem and geode mantle).
  - **The Surface Lift** opens when Digby's story is finished. It has the Miner's Lamp (+1 click power in the Caves), sunshaft fern, and the Miner's set (overalls and lamp helmet).
- **Lodging:** Glowworm Lantern (+1 mount), Lookout Tower (+1 scout), Crystal Vault (+500 storage).
- **Art and sound:**
  - Cave backdrops for all four spots, with stalactites, glowing fungi, crystal walls, dripping water and the lift's sunbeam.
  - Moles and Lumen, Old Quartz, the spider, the rockfall, silverfish, the Smugglers and their stalactite camp, the glowworm, curios, the spell, and the new outfits.
  - "Glimmerdeep" (A minor) and "Echoes" (a waltz) music.
  - A dark menu scene.

#### M14 status: complete — Release 0.6 "Root Song" (version 0.6.0)

- **The Root Song Ritual** (researched in the Caves' Rites branch: 2 Glow Ink, Heart Nectar and Crystal Focus) needs a **Blossom Court** and a **Harmony Blend** (cauldron: Sun Salve, Earth Loam, Lily Balm, Beeswax Candle and Glow Ink; the Moon Draught and Wind Silk join when the Glade and Sky Isles arrive). Performing it asks first, shows the Root Song it will give, plays the full-screen rite, and begins the next run.
- **Root Song earned:** 1 per 10 bloom across all regions, 3 per court rank, 2 per finished story, 5 per awakened spirit, 3 per crew won over (`PRESTIGE_RULES`).
- **What stays:** the fairy, outfits, Comforts, supply minimums and storage limits, stats, relics and Root Song. **Everything else starts over** (design doc 3.11).
- **Root Song upgrades** (all 15 from the content doc, 1 to 5 tiers each): Deep Roots, Glimmer Purse, Seasoned Hands, Swift Wings, Roomy Satchel, Old Friends, Kind Heart, Quick Study, Remembered Recipes, Second Cauldron, Long Rest, Trader's Favor, Spirit's Ear, Warm Welcome, Steady Hearth. Start-of-run gifts bought on a new run before leaving home still count for that run.
- **Relics:** 25, five for each spirit so far (Selenne's and Aeris's come with their regions). A waking spirit gives its **next** relic, at most one per run, so a spirit skipped in one run isn't lost. Each relic it has given raises its bloom requirement by a level and multiplies its offering (Spirit's Ear takes some off).
  - All effects work: head starts, truces (the creature never turns up), kinship (the mount is tamed when its region opens), the five specialties, and the five hearts. Riddle Shell's fog part is "fog no longer hides rare plants" (simpler than a guaranteed wisp).
- **Relics, Root Song upgrades and curios share one effect system** (`bonusEffects` in `modifiers.ts`), so every rule that reads a curio also reads relics and upgrades.
- **Screens:** a Root Song tab at home (balance, upgrades with tier pips, a relic shelf per spirit), the gift on each spirit's screen, the run number beside the court rank, and relic art in spirit-colored frames.
- **Not yet:** the ending after the 5th prestige and the bonus run (M17).

#### M15 status: complete — Release 0.7 "Moonlit Glade" (version 0.7.0)

- **To enter:** a Blossom Court plus the **Rite of Long Twilight** (Crystal Focus and 2 Lily Balm, researched in the Caves). The Glade is always twilight, so the interface uses its night colors there, as in the Caves (`RegionDef.dark`).
- **Places:** Emberglow (fireflies, with The Willow Lantern shop), Moonpetal Meadow, Silverbrook, and the Moon Pool (Selenne).
- **Plants and items:**
  - Starmoss, night jasmine, evening primrose, moonpetal, moonbeam, silverleaf fern and midnight rose, plus stardust bloom and sleepy poppy in the secret areas.
  - Moonpetal Oil (press, from any "moonflowers": moonpetals or jasmine), Moonlight Tincture, **Moon Draught** (the Glade's signature) and the **Starlight Lens**.
  - Three trinkets: a pearl, a silver spoon, a music-box key. Harmony Blend now takes Moon Draught too.
- **The moon cycle** replaces weather: waxing, full, waning and new, in order (`MOON_CYCLE`). A waxing or waning moon may be a **starfall** instead (35%).
  - Full moon: rare finds 1.6× likelier, and the Moonrise Rite works.
  - New moon: slower flights, rare finds a little harder, twice the ambushes, and the Moonshadow Crew camps.
  - Starfall: stars fall through the scene; tapping one gives 8–20 Glimmers, or now and then moonlight or stardust (one every 2.5 seconds).
  - The Rite of Turning doesn't change the moon.
- **Challenges:** the **moth swarm** munches spots (10 taps; half as often once Vesper's story is done). Earwigs on petals. **The Moonshadow Crew** camps only under a new moon. The new **Shadowlight** spell (Glow Ink and Moon Draught) ends a new moon early and clears their camp.
- **People:** Old Nox, a fading firefly lamplighter (Lamplighter's Wick: potions last 25% longer), and Vesper, a moth poet (Moth-Wing Quill: a 25% chance a spell costs nothing), plus three Emberglow villagers. **Selenne** wants a Sprouting Glade, Nox's story finished, 3 Moon Draught and a Starlight Lens.
- **Mounts:**
  - **The luna moth** (night jasmine, at Moonpetal Meadow): better rare finds in the Glade, and the only way into the Starwell.
  - **The blue jay** nests at Silverbrook and is only seen at dawn and in the morning. It eats acorns, and its Kindred Call costs Moon Draught and a Starlight Lens. It's the fastest flyer (1.8×); carrying you to the Sky Isles comes in M16.
- **Secret areas:** **the Starwell** (open only while riding the luna moth: Fallen Star, rarer plants 15% likelier everywhere; the Starlit set) and **the Dream Hollow** (the Moonrise Rite under a full moon: Dreamcatcher, offline time counts 10% more; Sleepwear: nightgown, nightshirt and nightcap).
- **Relics:** Selenne's five, including the **Moon-Phase Locket** (once a day, choose the moon at the Moon Pool) and the Moonsilver Tear (potions last 50% longer).
- **Lodging:** Lantern Loft (+2 gatherers), Moth Roost (+1 mount), Moonlit Pantry (+600 storage).
- **Art and sound:** Glade backdrops whose moon follows the cycle, with fireflies, shooting stars in a starfall, the brook, the Starwell and the Dream Hollow. All the new plants, items, people, creatures, mounts and curios, the two outfits, a dark menu scene, and two tracks ("Emberglow" and "The Moon Pool").

#### M16 status: complete — Release 0.8 "Sky Isles" (version 0.8.0)

- **To enter:** no rite. The Sky Isles open for good once the court **owns the blue jay** and reaches the **Moon Court** (`RegionDef.unlock.mountId`, `advanceMountRegions`). The closed island's card on the map says so.
- **Places:** Nimbusrest (wind sprites, with The Weathervane shop), Cloudbloom Terraces, Windharp Cliffs, and the Sun Spire (Aeris).
- **Plants and items:**
  - Skybell, rainbow moss, cloudbloom, sunpetal, wind thistle, thunder lily and aurora blossom, plus prism blossom and whisperleaf in the secret areas.
  - Cloud Silk (spinning wheel), Storm Vial (press), Aurora Dye (mortar) and **Wind Silk** (the signature).
  - Three trinkets: a golden feather, a kite string, a brass gear. **Harmony Blend now takes all seven signatures**, as designed.
- **Weather:**
  - **Storm:** grounds every flight to or from the isles, the player's and helpers' alike, and thunder lilies grow 4× as often. The new **Stormward** spell (Wind Silk and Crystal Focus) lets you fly for 10 minutes; the Storm Bell relic ends grounding for good. The map card warns, disables Fly, and offers Stormward.
  - **Rainbow:** every harvest gives one extra.
  - **Updraft:** flights to and from the isles are 40% quicker.
- **Challenges:** **the hawk** watches a spot (like the owl) and makes flights there 50% longer. Gnats on fluffy plants. **The Stormchasers**, the captain's elite crew, need five Parleys instead of three.
- **People:** Professor Cumulus, an astronomer whose star maps blew away (Star Chart: 15% more Root Song), and Twill, who weaves a giant sail (Windwoven Shawl: flights 10% faster), plus three Nimbusrest villagers. **Aeris** wants a Sprouting Sky Isles, Cumulus's story, 3 Wind Silk and an Aurora Dye.
- **Relics:** Aeris's five. The Jay-Blue Feather tames the blue jay as soon as the Glade opens.
- **Secret areas:**
  - **The Aurora Garden** opens at the Moon Court: Aurora Prism (potions 25% stronger) and the Sunrise Regalia.
  - **The Cloud Archive** appears from run 2: Windbound Tome (research costs 25% less) and the Sky Scholar's set.
- **Lodging:** Cloud Loft (+2 gatherers), Wind-Chime Tower (+1 scout), Sky Vault (+800 storage).
- **Polish:** long routes now read "via the Forest, the Swamp and the Caves".
- **Art and sound:** isle backdrops whose sky follows the weather (storm clouds, rain and lightning, a rainbow, rising updrafts, an aurora, drifting cloud-scrolls), all the new plants, items, people, creatures, curios and both outfits, a bright menu scene, and two tracks ("Nimbusrest" and "Above the Clouds").
- The content doc's leftover extras came in v0.8.1 (below).

#### Content-doc extras (v0.8.1)

The recipes and rites the content doc lists that M15 and M16 left out:

- **Everbloom Essence** (cauldron: Sun Salve, Earth Loam and Moon Draught), researched in the Glade.
- **Rite of Renewal:** a region you choose gains 20 bloom. It needs Everbloom plus that region's signature, one more each time it's done in a run (`state.renewals`).
- **Bloomcall:** rare plants twice as likely in a region you choose for 10 minutes (Lucky Charm Dust and Everbloom). A note shows on that region's spots while it rings.
- **Rite of Clear Skies:** choose a region's weather for 15 minutes (Wind Silk and Crystal Focus). Not the Glade: the moon keeps its own time.
- **Moonsight Potion** (Moon Draught and Crystal Focus, 10 minutes): fog, mist and new-moon darkness lose their downsides, and it counts as light for the Caves.
- **Featherfall Tonic** (Wind Silk and Fluff Thread, 10 minutes): weather never slows a flight (it can still speed one up), and every gust is a tailwind.
- Region rites have a region picker (and a weather picker for Clear Skies) at the Ritual Circle, with costs that update as you choose.
- **Fix:** route breakdowns now leave out a slowdown a relic has lifted (Mist-Walker's Moss).

#### M17 status: complete — Release 0.9 "The Ending" (version 0.9.0)

- **Captain Mallow's arc** (`data/ending.ts`):
  - She sends a letter the first time each pirate crew is won over, in any run: seven letters that go from curious, to doubtful, to hopeful.
  - The letters live in a panel on the Court tab, with a "new" badge, and are kept through prestige (`prestige.crewsEverWon`).
  - After the seventh, she comes in person and **joins the court**: she appears in the court picture and adds 5 court points, forever.
- **The ending:** the **fifth** Root Song Ritual plays a five-scene ending:
  1. The seven spirits gather around the court.
  2. A pan across every region.
  3. The captain, the fairy and the helpers dance.
  4. Each spirit says thank you.
  5. The finished court.

  It shows the court as it was when the Root Song was sung (`prestige.endingCourt`).
- **The bonus run:** after the ending, the Root Song Ritual is closed (`bonus-run`). The Root Song tab says to grow the court to the Grand Court.
- **The final screen:** reaching the Grand Court in the bonus run shows "The End" with the finished court and lifetime stats (time, runs, Root Song, relics, crews, outfits, plants, crafting, villagers, Glimmers, rites).
  - **Stay a while** keeps playing.
  - **Start a brand-new game** (asks first) wipes everything, prestige included.
  - The Root Song tab can replay the ending and reopen the final screen.

#### Wider scenes, more plants (v0.9.1)

- The harvesting scene is a wide **21:10 panorama** (up to 1400px, still capped by screen height). Plants, creatures, camps, mounts and helpers are sized as a share of its width, so they stay the same size as before.
- Every spot grows **9 plants** instead of 6 (`SLOTS_PER_SPOT`). Each spot's hand-placed front and back rows are spread evenly across the wider scene (`spread` in `scenes.ts`). Spots from older saves grow the extra plants in as usual.

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
