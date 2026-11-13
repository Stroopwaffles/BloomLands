# Bloom Lands

A cozy fairy clicker about healing the land. You start as a lone fairy with nothing, gather flowers and plants across seven regions, brew potions, cast spells, perform rituals, and grow a grand court full of helpers.

**Play:** https://stroopwaffles.github.io/BloomLands/

## Release 0.1 "Meadow"

The first playable slice: the Meadow, your home, and everything that grows from them.

- Gather in a living scene: tap plants, clear aphids, shoo the rabbit, outwit pirate fairies
- Brew and research: refine plants, mix components, brew potions, learn spells and rites
- Grow your court: traders and villagers, lodging upgrades, court ranks, helpers who work while you're away
- Heal the land: bloom, stories with Pip and Marigold, Sorrel the spirit, the secret Fairy Ring
- Befriend and ride the bumblebee; create and dress your own fairy

Progress saves in your browser. Back it up from **Saves** on the welcome screen (copy the text or save a file), and restore it the same way.

## Documents

- [Design](docs/design.md): every system and rule
- [Content](docs/content.md): regions, characters, recipes, curios, relics and the asset list
- [Development plan](docs/dev-plan.md): architecture and milestones

## Development

Requires Node.js 22+.

```bash
npm install
npm run dev        # local dev server with instant reload
npm run verify     # type check, lint, format check, tests and build
```

Pushing to `main` runs the same checks on GitHub and publishes the game to GitHub Pages.

Built with Svelte, Vite and TypeScript.
