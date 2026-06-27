# POE2 Fists of Stone Converter

Paste trade-site item text and convert modifiers to the Fists of Stone version for Path of Building.

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

## GitHub Pages

1. Push this repo to GitHub (repo name becomes part of the URL).
2. Go to **Settings → Pages → Build and deployment**.
3. Set **Source** to **GitHub Actions**.
4. Push to the `main` branch — the deploy workflow runs automatically.

Your site will be live at:

`https://<your-username>.github.io/<repo-name>/`

If you rename the repo, the URL updates automatically — no config changes needed.

## Publishing notes

Safe to commit: source code, `modifiers.txt`, `public/modifiers.json`, config files.

Not committed (in `.gitignore`): `node_modules/`, `dist/`, `.env` files.
