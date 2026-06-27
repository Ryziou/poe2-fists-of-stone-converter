# POE2 Fists of Stone Converter

Paste trade-site item text and convert modifiers to the Fists of Stone version for Path of Building.

Built with **React + TypeScript + Vite**.

## Setup (first time)

```bash
cd poe2-fists-of-stone-converter
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## Scripts

| Command | What it does |
|---------|----------------|
| `npm install` | Install dependencies (first time only) |
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run the Dragon Paw smoke test |
| `npm run build:modifiers` | Regenerate `public/modifiers.json` from `modifiers.txt` |

After editing `modifiers.txt`, run `npm run build:modifiers`.