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
  - Tap a place for a card with the flight time, its "via" route and a breakdown (each leg's time, weather, open water, mounts, wing speed, curios). Tap Fly, or tap the place again.
  - "Fly home" stays one tap away, and the map can be hidden.
- **Travel screen:** a route strip of the regions you cross with your fairy moving along it, an "Over the Forest" line, a "Crossing into…" note at each border, and the scenery of the region below, which fades as you cross.

### Backlog (asked for, not scheduled yet)

- Nothing waiting.

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
