# POE2 Fists of Stone Converter

Paste trade-site item text and convert modifiers to the Fists of Stone version for Path of Building.

I made this quickly as I wanted to convert gloves to fists of stone without opening multiple pages and attempting to convert it slowly.

https://ryziou.github.io/poe2-fists-of-stone-converter/

Built with **React + TypeScript + Vite**.

## Local development

```bash
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
