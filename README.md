# POE2 Fists of Stone Converter

Paste trade-site or in-game glove text and convert modifiers to the Fists of Stone version for Path of Building. Only **rare gloves** are supported, not uniques, magic, or normal items.

I made this quickly as I wanted to convert gloves to fists of stone without opening multiple pages and attempting to convert it slowly.

https://ryziou.github.io/poe2-fists-of-stone-converter/

Built with **React + TypeScript + Vite**.

## Supported paste formats

<details>
<summary>Trade site copy script (Item Class header)</summary>

```
Item Class: Gloves
Rarity: Rare
Agony Grip
Vaal Wraps
--------
Quality: +20% (augmented)
--------
Requirements:
Level: 75
Dex: 52
Int: 52
--------
Sockets: S
--------
Item Level: 81
--------
+2 to Level of all Melee Skills (fractured)
88% increased Evasion and Energy Shield
...
```
</details>

<details>
<summary>Trade site (Rarity first, bare Gloves line)</summary>

```
Rarity: Rare
Agony Grip
Vaal Wraps
Gloves
--------
Requires: Level 75, 52 Dex, 52 Int
--------
+2 to Level of all Melee Skills (fractured)
...
```
</details>

<details>
<summary>In-game copy (Ctrl+C on item)</summary>

```
Item Class: Gloves
Rarity: Rare
Torment Hold
Secured Wraps
--------
{ Prefix Modifier "Flaring" (Tier: 1) - Damage, Physical, Attack }
Adds 16(12-19) to 31(22-32) Physical Damage to Attacks
+77(65-78) to Evasion Rating
...
```
</details>

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
| `npm test` | Run conversion smoke tests |
| `npm run build:modifiers` | Regenerate `public/modifiers.json` from `modifiers.txt` |

After editing `modifiers.txt`, run `npm run build:modifiers`.
