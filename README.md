# Bloom Lands

A cozy fairy clicker about healing the land. You start as a lone fairy with nothing, gather flowers and plants across seven regions, brew potions, cast spells, perform rituals, and grow a grand court full of helpers.

**Play:** https://stroopwaffles.github.io/BloomLands/

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
