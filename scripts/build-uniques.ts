import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import type { UniqueRule } from "../src/lib/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const SOURCE_URL = "https://poe2db.tw/us/Way_of_the_Stonefist";

function stripHtmlMod(raw: string): string {
  return raw
    .replace(/<span class="ndash">—<\/span>/g, "-")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/[—–]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function parseUniquesFromHtml(html: string): UniqueRule[] {
  const start = html.indexOf('id="FistsofStoneUniques"');
  const end = html.indexOf('id="Modifiers"');
  if (start === -1 || end === -1) {
    throw new Error("Could not find Fists of Stone Uniques section in source page");
  }

  const section = html.slice(start, end);
  const cols = section.split('<div class="col">').slice(1);
  const uniques: UniqueRule[] = [];

  for (const col of cols) {
    const nameMatch = col.match(/class="uniqueName">([^<]+)</);
    if (!nameMatch) continue;

    const fists: string[] = [];
    const modPattern =
      /class="(?:explicit|implicit)Mod"[^>]*>([\s\S]*?)<\/div>/g;

    for (const modMatch of col.matchAll(modPattern)) {
      const line = stripHtmlMod(modMatch[1]);
      if (line) fists.push(line);
    }

    uniques.push({ name: nameMatch[1].trim(), fists });
  }

  return uniques;
}

const res = await fetch(SOURCE_URL);
if (!res.ok) {
  throw new Error(`Failed to fetch ${SOURCE_URL}: HTTP ${res.status}`);
}

const html = await res.text();
const uniques = parseUniquesFromHtml(html);

if (uniques.length === 0) {
  throw new Error("No unique glove conversions parsed from source page");
}

const publicDir = join(root, "public");
mkdirSync(publicDir, { recursive: true });

writeFileSync(
  join(publicDir, "uniques.json"),
  JSON.stringify(uniques, null, 2),
  "utf8"
);

console.log(`Wrote ${uniques.length} unique rules to public/uniques.json`);
