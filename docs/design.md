# Bloom Lands — Design Document

*Status: Design complete. No code until the implementation phase begins.*
*Last updated: 2026-11-13*

---

## 1. Overview

- **Title:** **Bloom Lands** (working title)
- **Repository:** https://github.com/Stroopwaffles/BloomLands

- **Genre:** Clicker / incremental game
- **Platform:** Web browser. **Primary targets: tablet and desktop** (see Section 8: UI and Devices).
- **Hosting:** GitHub Pages (static files only)
- **Backend:** None. Everything runs in the player's browser.

**Concept:** Fairies collect flowers and plants the way astronauts mine meteors (inspired by the user's previous asteroid-mining clicker).

**Theme (decided):** You are a fairy (male or female, the player's choice) building your court. You start with nothing. **The goal of the game is to build a grand lodging filled with helpers.** Your presence is a positive force: **the land improves because you are there** (see 3.9).

**Original brief (as received):**
- Fairies collect flowers and plants by clicking, like mining asteroids.
- Travel to different locations: forests, meadows, swamps, caves, gardens, etc.
- Upgrade wing speed and rideable creatures.
- Find unique trinkets and curios; use them to trade and upgrade lodging, storage, carrying capacity.
- Challenges: large creatures, pirate fairies, bugs, weather.
- Pick outfits and character design.
- Art: whimsical, colourful, cute.

**Design pillars (from the brief):**
1. Core loop: gathering by clicking
2. Locations / biomes
3. Travel and mounts (wing speed, rideable creatures)
4. Economy: plants, trinkets and curios, trading
5. Home base: lodging, storage, carrying capacity
6. Challenges and hazards
7. Character customization
8. Art direction
9. Brewing and crafting (added after the brief)
10. Magic: potions, spells, rituals (added after the brief)
11. Research (added after the brief)
12. Traders and location characters (added after the brief)
13. Economy: currency, trinkets, curios
14. Land improvement (from the court theme)
15. Goal and progression: building the court
16. World structure: regions and sublocations
17. Prestige, relics and the ending
18. Secret areas (see 3.12)
20. Day, night and moon (see 3.16)
19. UI and devices (see Section 8)

---

## 2. Technical Stack (decided)

| Area | Decision | Notes |
|---|---|---|
| UI framework | **Svelte** | Reactive UI suits fast-changing numbers and upgrade lists; SVG art can be Svelte components. |
| Build tool | **Vite** | Local dev server with instant refresh; builds static files for GitHub Pages. |
| Language | **TypeScript** | Catches mistakes before the game runs. |
| Art format | **SVG** (inline, as components) | Allows CSS animation, recoloring, state-driven visuals, crisp at any size. |
| Particles / effects | Optional small canvas layer | Only for high-count effects (e.g., click sparkles) to avoid too many SVG elements in the page. |
| Saves | Browser storage (localStorage) | See Section 6. |
| Developer setup | Node.js required | Needed to run Vite. |

**Hosting note:** GitHub Pages serves from a subpath, here `/BloomLands/` (expected URL: `https://stroopwaffles.github.io/BloomLands/`), so the Vite build's `base` path must be set to `/BloomLands/`.

**Rejected alternatives:**
- React: more boilerplate and more care needed for frequent updates.
- Angular: workable (signals suit clickers), but heavier than needed. The user knows it, but Claude does all coding, so that advantage doesn't apply.
- Phaser / PixiJS: they convert SVGs into flat images, which loses the benefits of SVG art.

---

## 3. Gameplay

### 3.1 Core Loop (decided: trip-based)

1. **Depart:** choose a location and fly there. Travel time depends on distance, wing speed and mount.
2. **Gather:** click plants and mushrooms to harvest them. Harvested items go into the satchel.
3. **Satchel full (or player chooses):** fly home.
4. **Home:** deposit into storage, then brew, trade and buy upgrades.
5. Repeat, reaching farther and richer locations over time.

**Travel (decided):** travel is a **timer**, but **events can happen to the player mid-flight** (encounters, hazards; see 3.15).

### 3.2 Gathering (decided: multi-click)

- Each plant or mushroom takes **several clicks**, depending on its type, like an asteroid with health.
- Each plant type has a **toughness** value (clicks needed). Upgrades (tools, gloves, etc.) raise **click power**, reducing clicks needed. Values per plant are in `content.md`.
- Plants **regrow** in each harvesting spot over time.
- A harvested plant can sometimes drop a **bonus**: extra materials or a trinket.

### 3.3 Idle Helpers (decided: yes, multiple types)

Different types of helpers do work without clicks.

**Decided:**
- Helpers **go on their own trips** to unlocked locations, independent of the player. Their trips continue while the game is closed (see Section 5).
- **Research helpers** speed up research.
- **Supply helpers** keep the home stocked: the player sets **minimum stock levels** for chosen items, and these helpers go out and gather to keep stock at or above those levels.

- **Gatherers:** go on trips and bring back materials from a chosen harvesting spot.
- **Brewers:** run the stations (refining and cauldron) automatically.
- **Scouts:** find trinkets and hidden places (e.g., the Caves' Sunken Geode).
- **Reformed pirates:** recruited by winning over pirate crews (see 3.15).

**Acquiring helpers (decided):**
- Helpers are **recruited at locations** using **currency**, then **sent back to your home**.
- **Lodging upgrades** control helpers:
  - An upgrade **unlocks a helper type** (e.g., building a study unlocks research helpers).
  - Further upgrades **raise capacity** for that type.

### 3.4 Brewing and Crafting (new system)

Plants are refined and/or combined into components, which can be refined further. The results are used to brew potions and cast spells.

**Tiers:**
1. **Raw materials:** gathered plants and mushrooms (petals, roots, caps, dew).
2. **Refined materials:** one raw input processed (e.g., petals → paste, caps → spore dust).
3. **Components:** combinations of refined materials, possibly refined again.
4. **Magic:** the end products, in three categories (below).

- Brewing and refining **take real time**, and **cauldron slots can be upgraded**. This adds an idle element at home.
- Full recipe tree, stations and material tags: `content.md` → Recipe Tree.

### 3.5 Magic: Potions, Spells and Rituals (decided: three separate categories)

| Category | Purpose | Examples |
|---|---|---|
| **Potions** | Mostly **buffs** and **tradable items** | Faster gathering, bigger satchel for a trip, faster wings; valuable potions sold to traders |
| **Spells** | **Encounters:** taming creatures, dealing with pirate fairies and other challenges | Tame a dragonfly, repel a pirate fairy, shoo away bugs |
| **Rituals** | **Effects on the land** | Unlock new areas, raise rare flower chances, (possibly) improve plant respawn in a location |

**Potions (decided):**
- Buffs last on a **timer**.
- Potions (and plants) are traded through:
  - **Traders** who visit the player's home with **requests** for specific plants and potions.
  - **Characters at locations** the player can bring potions to.

**Spells (decided):**
- Each **cast costs components**.
- Spells must first be **researched** (see 3.6), which also costs components.

**Rituals (decided): a mix.**
- Some are **permanent** (e.g., unlocking an area).
- Some are **temporary** boosts that wear off (e.g., raised rare flower chances), giving reasons to perform them again.

### 3.6 Research (decided)

- Research is **where all recipes are unlocked**: refining, components, potions, spells and rituals. It's the game's main progression tree.
- Research **costs components** and **takes real time**.
- **Research helpers** speed it up.
- **Layout (decided):** four branches: **Refining, Brewing, Spellcraft, Rites**. Each region's recipes appear as that region unlocks.

### 3.7 Traders and Location Characters (decided)

- **Home traders:** visit with requests for plants and potions.
- **Location characters:** live at specific locations; the player brings them potions.
- **Rewards:** basic currency and trinkets.
- **Storylines:** each location character has a small storyline. Completing it rewards a **curio**.
- **Trader requests expire** (decided).

### 3.8 Economy (decided)

| Item | Role |
|---|---|
| **Glimmers** (basic currency) | Everyday trading and purchases. |
| **Trinkets** | Rare currency for special purchases. |
| **Curios** | Special collectibles that give **ongoing bonuses**. Earned by completing character storylines (possibly other sources too). |

### 3.9 Land Improvement (new, from theme)

The player's presence makes the land better. This is a core part of the game's tone.

**What raises bloom (decided):**
- **Rituals**
- **Completing character storylines**
- **Settlement requests:** completing requests helps the region's settlement **thrive**, which raises bloom.
- **Spirit of the land:** each region has a spirit with a set of **requirements** to fulfil; meeting them raises bloom.
- **Removing pirate fairies**

Gathering itself does **not** raise bloom (for now).

- **Design rule:** gathering is framed as **tending**, never harm: picking ripe flowers, pruning, collecting fallen caps. Nothing is destroyed.
- **Higher bloom** means more plants, faster regrowth, better rare chances, and sometimes new characters appearing.

**Scope (decided):** bloom is tracked **per region**.
**Decline (decided, for now):** bloom **never goes down**.
- **Visible change:** locations start dull or wilted and grow lush and colorful as bloom rises. SVG art makes this practical (layers and colors shift with bloom level).
- The **home and court** also grow visibly as lodging upgrades are built.

### 3.10 Goal and Progression (from theme)

- **Goal:** build a grand lodging with lots of helpers.
- **Court ranks (decided):** milestones reached through lodging size and helper count. Each rank can unlock new locations or features.
  1. Wanderer
  2. Hearthling
  3. Hedge Court
  4. Bramble Court
  5. Blossom Court
  6. Moon Court
  7. Grand Court (final rank)

  *Exact thresholds are set during balancing in the implementation phase.*

### 3.11 Prestige (decided)

**Lore:** the player performs a ritual that gives **Root Song** to the land, making it healthier. That healthier land is why the permanent bonuses exist in later runs.

**Mechanics:**
- Resetting earns **Root Song** (decided name), the prestige currency.
- Root Song buys **permanent upgrades** that last across all future runs.
- **Curios reset** each run. They are rewards for finishing stories, and stories replay each run.
- **Bloom starts a bit higher** in each new run, reflecting the healthier land.

**What resets and what stays (summary):**

| Stays forever | Resets each run |
|---|---|
| Root Song and Root Song upgrades | Glimmers, trinkets and stored materials |
| Relics | Curios |
| Outfits (including unique ones) | Mounts and mount levels |
| Quality-of-life upgrades | Secret areas (re-lock) |
| | Bloom (but starts higher) |
| | Lodging, helpers and court rank (Root Song "Old Friends" softens this) |
| | Research and recipes (Root Song "Remembered Recipes" softens this) |
| | Character storylines and pirate crews (replay) |

**Quality-of-life upgrades (decided):** any QoL upgrade only needs to be **unlocked once** and stays **permanently** unlocked, including through prestige.

**QoL upgrades:**
- **Crafting queue:** line up several refining/brewing jobs.
- **Bulk crafting:** craft ×10 / ×max in one tap.
- **Auto-deposit:** satchel contents go into storage automatically on arriving home.
- **Auto-return:** fly home automatically when the satchel is full.
- **Repeat last trip:** one tap to fly back to the last harvesting spot.
- **Helper presets:** save and reuse helper assignments.
- **Recipe favorites and search** in the recipe book.
- **Request tracker:** pin trader requests and see which items are still needed.

**When the player can prestige (decided):**
- Prestige is performed as the **Root Song Ritual**, which must be **unlocked through research**, **and**
- the court must reach a **required court rank**: **Blossom Court** (rank 5 of 7).

**Root Song earned** is based on total bloom across all regions, plus bonuses for court rank and completed storylines. Exact numbers are set during balancing.

**Relics (decided):**
- Permanent upgrades found **during a run**, kept through prestige.
- Given by each region's **spirit of the land** when its requirements are fulfilled.
- Each spirit has **5 relics** to give, one per run.

**Ending (decided):** the game has a **real ending after 5 prestiges**, by which point every spirit has given all 5 of its relics.
1. The **5th prestige triggers the ending** (ending sequence plays).
2. The player may then do **one more run for fun** (a bonus run).
3. When that run ends, the **hard ending** hits.

- **The bonus run ends** when the court reaches the **final court rank** (decided).
- **Hard ending (decided):** a final screen shows the finished court and the player's stats, with an option to start a **brand-new game** from scratch.

**Ending sequence (decided outline):**
1. After the 5th prestige, the **seven spirits gather at the player's court**.
2. A slow pan across the map shows **every region in full bloom**.
3. The **pirate captain and the player's helpers celebrate**.
4. The spirits **thank the player for healing the land**.
5. It ends on the player's **finished court**.

*Details to be written alongside the storylines.*

### 3.12 World Structure: Regions and Sublocations (decided)

The world is made of **regions**, each containing **sublocations**.

**Example: the Swamp region**
- **Toad Village** — the region's **settlement**.
- **Reeds Hollow** — a **harvesting spot** where the player gathers resources.

**Each region has (decided):**
- One **settlement** whose requests make it thrive (raising bloom).
- One or more **harvesting spots**.
- A **spirit of the land** with requirements to fulfil.

- **Location characters** (with storylines) live in the region's settlement.
- **Helpers are recruited** at settlements.
- Each spirit has its own sublocation (e.g., Sunstone Hill, the Elder Oak).
- Harvesting spots within a region differ in what grows there, toughness and rare finds.

**Travel (decided):**
- **Between sublocations** in the same region: a **short flight**.
- **Between regions:** a **long flight**.
- **Mounts** shorten both, and each mount has **region-specific bonuses** (e.g., a frog mount is better in the Swamp).

**Region list (decided):**
- **Meadow:** starting region; gentle, easy plants.
- **Forest:** mushrooms, ferns, berries.
- **Swamp:** Toad Village (settlement), Reeds Hollow (harvesting).
- **Caves:** glowing fungi and crystals; needs light (potion or ritual) to enter.
- **Blossom Orchard:** fruit-tree blossoms, honey, bees; a grumpy badger as a hazard; possible beehive-town settlement.
- **Moonlit Glade:** night-blooming flowers, moonpetals, glowworms; moths as a challenge.
- **Sky Isles:** **final region**; floating islands of cloud flowers, reached with a strong flying mount.

(Human's Garden was dropped.)

With 7 regions, there are **7 spirits × 5 relics = 35 relics** in total.

**Secret areas (decided):**
- Each region has **ways to unlock secret areas**.
- **Unlock requirements differ per region**, for example:
  - finishing a character's quest line
  - raising the region's bloom to a certain level
  - other conditions (rituals, mounts, scout discoveries, court rank, later runs)

Every secret area and its unlock requirement is listed in `content.md`.

**Details (decided):**
- **1–3 secret areas per region.**
- **Every secret area contains a curio.** They can also hold **exclusive plants** and **unique outfits**.
- Secret areas **do not give relics**. Relics come only from spirits (35 total).
- Secret areas **re-lock on prestige** and must be unlocked again each run.

- **Unique outfits stay unlocked after prestige** (decided).

**How regions unlock (decided):** each region requires **both** a **court rank** and its **unlock ritual** (Sky Isles requires the blue jay mount instead of a ritual). Mapping in `content.md` → Recipe Tree.

**Constraint:** Sky Isles must be reachable **in every run** so its spirit can give all 5 relics. Reaching it should get faster in later runs (via Root Song upgrades and relics).

---

### 3.13 Character Customization

**Decided:**
- The player can pick **outfits** and customize their **character design**.
- The player's fairy can be **male or female** (player's choice).
- **Outfits are cosmetic only.** No stat bonuses.
- **Outfit pieces can be recolored** by the player.
- **All outfits stay unlocked through prestige**, so the wardrobe grows across runs.
- **Unique outfits** come from secret areas.
- **Display:** the character is shown **large on the home screen** and **smaller while gathering**. Home-screen art needs the most detail.
- **Not for now:** customizing helpers or home décor.

**Character appearance** (set at game start, changeable later at home):
- **Wings:** a few shapes (e.g., butterfly, dragonfly, moth, petal), any color.
- **Hair:** several styles, any color.
- **Skin tone:** a broad, inclusive palette, including fantasy tones (lavender, mint, etc.).
- **Eyes:** color, maybe a few shapes.

Colors are cheap with SVG (one drawing, many colors). Each **shape** variant is a separate drawing, so the number of shapes sets the art workload.

**Outfit slots:**
- **Headpiece** (flower crowns, hats, acorn caps)
- **Outfit** (one-piece: dress, tunic, robe)
- **Shoes**
- **Accessory** (satchel, scarf, wand, wing charms)

**Where outfits come from:**
- Secret areas (unique outfits)
- Buying with basic currency or trinkets
- Storyline rewards
- Court rank milestones
- Prestige milestones

Outfits are designed to fit both male and female fairies where practical, so one drawing serves both.

### 3.14 Mounts and Taming

**Decided:**
- Mounts **shorten travel**, both between sublocations and between regions.
- Each mount has **region-specific bonuses**.
- Creatures are **tamed with spells** (spells must be researched; each cast costs components).
- **Wing speed** is a separate upgrade for the player's fairy.
- **Sky Isles** is reached with a strong flying mount.

- **One mount per region** (7 total).
- **Taming flow:** encounter → **befriend** (bring favorite plants over several visits, filling a friendship meter) → **cast the taming spell**.
- **Mounts can level up** by feeding them plants. Levels raise travel speed and strengthen the region bonus.
- **Helpers can use spare mounts** to speed up their own trips.
- **Blue jay** is befriended at the **edge of the Moonlit Glade** (it can't live in Sky Isles, since it's needed to get there).
- **Mounts reset on prestige** and are re-tamed each run (mount levels reset too). The **Kind Heart** Root Song upgrade makes befriending faster in later runs.
- **Speed formula:** wing speed sets the player's base travel speed; a mount multiplies it.

**Mount roster (decided, one per region):**

| Region | Mount | Region bonus / special |
|---|---|---|
| Meadow | **Bumblebee** | Starter mount; extra carrying capacity in Meadow |
| Forest | **Flying squirrel** | Glides between trees; faster sublocation hops in Forest |
| Swamp | **Frog** | Faster gathering in Swamp; crosses water |
| Blossom Orchard | **Hummingbird** | Very fast; better rare chances on blossoms |
| Caves | **Glowworm** | Gives light in Caves |
| Moonlit Glade | **Luna moth** | Night bonus; better moonpetal finds |
| Sky Isles | **Blue jay** | Strong flyer; required to reach Sky Isles |

**Stabling:** a **lodging upgrade** (a stable or roost) houses mounts, following the same pattern as helpers (one upgrade unlocks it, more upgrades raise capacity). The player rides **one mount at a time**.

### 3.15 Challenges and Hazards

**Decided:**
- Challenge types: **large creatures**, **pirate fairies**, **bugs**, **weather**.
- **Spells** handle encounters, including dealing with pirate fairies.
- **Removing pirate fairies raises bloom.**
- **Events can happen mid-flight.**
- Bloom never goes down.
- **Tone rule:** challenges are **setbacks, never failures**. The worst outcome is losing part of the current satchel or some time. Stored items, upgrades and progress are never lost. Creatures are **shooed, calmed or outwitted**, never hurt.
- **Small challenges are solved by tapping** (e.g., tapping pests off plants, shooing a creature). **Big challenges need a spell** (e.g., driving off a pirate camp, calming a large creature).
- **Ignoring a challenge** has a mild cost (lower yields, a blocked spot, a stolen item or two).
- **Helpers are affected:**
  - If a location is **blocked**, helpers can't go there until it's cleared; they wait or are reassigned.
  - If **pirates are present** in a region, helpers' **yields are reduced** there.
- **Pirate fairies can be won over**, using a mix:
  - Each region has its **own pirate crew** with a small storyline. Winning a crew over lets the player **recruit reformed pirates as helpers**.
  - A **pirate captain** has a larger storyline that ties the regional crews together across the game.
  - Winning over a crew **clears its camp for the rest of the run** (decided).
- **Weather is per region** and can have **upsides, downsides, or both**.

**The four challenge types** (per-region details in `content.md`):

**1. Large creatures** (one per region)
| Region | Creature | Effect |
|---|---|---|
| Meadow | Rabbit | Munches through a harvesting spot; shoo it away |
| Forest | Owl | Watches a spot; must be calmed or snuck past |
| Swamp | Heron | Blocks water routes |
| Blossom Orchard | Grumpy badger | Digs up a spot; calm it with a spell |
| Caves | Spider | Webs block passages |
| Moonlit Glade | Moth swarm | Crowds the glowing flowers |
| Sky Isles | Hawk | Circles overhead, delays flights |

**2. Pirate fairies**
- Set up **camps** in regions that block or reduce a harvesting spot. Driving them out (with spells) **raises bloom**.
- **Ambush the player mid-flight**, trying to steal items from the satchel.

**3. Bugs and pests**
- Aphids, beetles and slugs **infest plants**, lowering yields or making plants tougher to harvest.
- Clearing them by tapping is **tending**, which fits the positive tone.
- A repellent spell clears many at once.

**4. Weather** (per region, changing over time)
- **Rain:** slows flight, **but** brings out rare mushrooms.
- **Wind:** lengthens or shortens flights depending on direction.
- **Fog:** hides rare plants, or reveals secret paths.
- **Storms:** flights to Sky Isles grounded until they pass.
- Weather has upsides as well as downsides, so it's interesting rather than just annoying.

**Mid-flight events** (a mix of good and bad)
- Pirate ambush (bad)
- Strong gust (bad, or good with a tailwind)
- Drifting dandelion seeds to tap and catch (good)
- A lost traveler asking for help (good; could start a small quest)

### 3.16 Day, Night and Moon (decided)

- An **in-game day/night cycle** runs across the world: **one in-game day = about 1 real hour** (*exact length tuned during balancing*).
- Times of day matter for some content (e.g., morning dew in the Meadow, the Rite of Dawn).
- The **Moonlit Glade** is always twilight and instead has a **moon cycle** (full moon, new moon, etc.).
- **Rite of Turning:** a short, cheap ritual that switches between day and night, so players aren't stuck waiting.

- The Rite of Turning **does not change the moon phase**, so full moons stay special.
- Moon cycle length is set during balancing.

## 4. Number Scale

**Decided:** **no big-number library.** The largest values in the game stay in the **billions**.

- Standard JavaScript numbers handle this safely.
- **Balancing rule:** growth must stay controlled. No runaway exponential growth; the real ending after 5 prestiges makes this possible.
- Large values are shown abbreviated (e.g., 1.2K, 3.4M, 5.6B).

---

## 5. Offline Progress

**Decided:** yes. Helpers' trips, brewing and research continue while the game is closed. On return, the game calculates elapsed time and applies results.

- **Cap: 4 hours** of offline progress (decided).
- The cap can be **raised through upgrades**: the **Long Rest** Root Song upgrade (permanent) and the **Badger's Pocket Watch** curio (per run). The **Dreamcatcher** curio increases offline gains.

---

## 6. Save System

- Stored in localStorage.
- Save data includes a **version number** so future updates can migrate old saves.
- **Export / import save string** so players can back up and restore saves, since browser storage can be wiped.
- Autosave interval is an implementation detail (e.g., every 30 seconds, plus whenever the tab is closed or hidden).

---

## 7. Art Direction

All art provided by Claude as SVG for now. Art is **swappable**: each asset has a stable ID (e.g., `fairy-tier-1`) so it can be replaced later without changing game logic.

**Decided so far:**
- **Mood:** whimsical, colorful, cute (from the brief).
- **Format:** SVG, animated with CSS where possible.
- **Character display:** large on the home screen, smaller while gathering.
- **Bloom is visible:** regions start dull or wilted and become lush and colorful as bloom rises.
- **Devices:** desktop and landscape tablet; art must read clearly at tablet size.

### 7.1 Style Direction (decided)

**Soft storybook, with touches of glowing magic.**

- **Base style (soft storybook):** rounded shapes, soft gradients, pastel-but-colorful palette, **thin colored outlines** (each shape outlined in a darker shade of its own color, never black), warm and gentle.
- **Glowing magic touches:** soft halos, sparkles and luminous accents, used only for **magic**: potions, spells, rituals, spirits, curios and relics, and the **Moonlit Glade** (and Caves) at night.
- Dark backgrounds are reserved for night or magical scenes, not the whole game.

*Reference:* style samples A ("Soft storybook") and C ("Glowing magic") were shown during brainstorming on 2026-11-13. The fairy in sample A sets the baseline: chibi proportions, big eyes, rosy cheeks, flower crown, translucent pastel wings.

### 7.2 Shape Language

- **Characters (decided, for now):** cute **chibi proportions** (large head, small body, big eyes), which read well at small sizes.
- **Round and soft** everywhere: no sharp corners except for thorns and pirate gear.
- **Plants:** simple, bold silhouettes, so each plant type is recognizable at a glance.

### 7.3 Color (decided)

- **Shared UI palette:** warm cream panels, leafy greens, petal pinks, honey gold for currency and highlights.
- **Each region has its own palette:**

| Region | Palette idea |
|---|---|
| Meadow | Sunny yellows, fresh greens, sky blue |
| Forest | Deep greens, mossy browns, mushroom reds |
| Swamp | Teal, olive, lily-pad green, soft purple |
| Blossom Orchard | Blossom pink, honey gold, leaf green |
| Caves | Deep indigo, crystal cyan, glowing fungus green |
| Moonlit Glade | Midnight blue, silver, lavender, moonlight white |
| Sky Isles | Pale sky blue, cloud white, sunrise peach, blue-jay blue |

- **Low bloom** = the region palette desaturated and grayer; **high bloom** = full color.

### 7.4 Screens and Animation

**How animated each screen is (decided):**
- **Gathering screen:** a living scene. The region background shows its bloom stage, plants sway, the fairy flutters, plants wiggle and burst into petals when tapped.
- **Home screen:** a living court scene, with the player's fairy large in the center and helpers coming and going, plus panels on top for brewing, research and upgrades.
- **Menus** (shop, wardrobe, recipe book, etc.): static panels with small animated touches.

**Animation details (decided):**

- Idle: wing flutter, gentle bobbing, swaying plants.
- Tap feedback: plant wiggles, sparkle burst, floating "+N" numbers.
- Harvest: plant pops into petals that fly to the satchel.
- Glow pulses on magical items, spirits and potions.
- Keep animations light so many can run at once on tablets.

### 7.5 UI Style (decided)

**Clean panels with touches of natural.**
- Simple, rounded panels in the soft palette (e.g., warm cream), prioritizing readability on tablets.
- Natural accents: small leaves, vines, flowers or wood details on corners, edges, headers and buttons.
- Accents stay decorative and light; they never crowd text or numbers.

### 7.6 Typography (decided)

- **Headings:** Fredoka (rounded, friendly).
- **Numbers and body text:** Nunito (highly readable).
- Both from Google Fonts. Fonts should be easy to swap later (defined in one place).

### 7.7 Asset List

The full asset list (about 600 drawings, with stable IDs, templates and P1/P2 priorities) is in `content.md` → Asset List.

---

## 8. UI and Devices

**Decided:** the game will be played **primarily on tablets and desktop computers**. Every screen must be designed to look good and play well on both.

**Design rules (decided):**
- **Touch first:** never rely on mouse hover for important info (tooltips need a tap equivalent).
- **Tap targets** at least ~44px so buttons are easy to hit with a finger.
- **Rapid tapping must work well:** gathering means many fast taps, so double-tap-to-zoom and accidental text selection must be prevented, and multi-finger tapping should count.
- **Responsive layout:** desktop can show more panels side by side; tablet stacks or tabs them.
- **Readable numbers** at tablet size; large counters for key resources.

**Decided:**
- **Tablets: landscape orientation only.** Portrait doesn't need its own layout.
- **Phones: nice to have.** The game must stay **usable** on a phone, but doesn't need to be polished for it.

---

## 9. Status and Remaining Work

**Design phase: complete (2026-11-13).** All systems are decided, and all items once marked *Proposed* were reviewed and approved. Content (regions, characters, recipes, curios, relics, Root Song upgrades, asset list) is in `content.md`.

**First playable build:** the **Meadow + home + core UI**, using the P1 assets from the asset list.

**Left for the implementation phase (balancing):**
- Court rank thresholds
- Root Song formula and amounts
- Spirit requirements per run
- All costs, timers, yields and toughness values
- Day length and moon cycle length

**Left for later writing (not blocking the first build):**
- Full dialogue for character, pirate and captain storylines
- Ending sequence script
- Shop and milestone outfit sets (~10)
- One more traveling trader
