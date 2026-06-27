import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import type { ModifierRule } from "../src/lib/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function parseTSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
    } else if (c === "\t") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      if (row.some((f) => f.trim())) rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }

  if (field || row.length) {
    row.push(field);
    if (row.some((f) => f.trim())) rows.push(row);
  }

  return rows;
}

function splitLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

const raw = readFileSync(join(root, "modifiers.txt"), "utf8");
const rows = parseTSV(raw);
const rules: ModifierRule[] = [];

for (let i = 1; i < rows.length; i++) {
  const [type, original, fists] = rows[i];
  if (!type || !original || !fists) continue;

  rules.push({
    type: type.trim() as ModifierRule["type"],
    original: splitLines(original),
    fists: splitLines(fists),
  });
}

rules.sort((a, b) => b.original.length - a.original.length);

const publicDir = join(root, "public");
mkdirSync(publicDir, { recursive: true });

writeFileSync(
  join(publicDir, "modifiers.json"),
  JSON.stringify(rules, null, 2),
  "utf8"
);

console.log(`Wrote ${rules.length} modifier rules to public/modifiers.json`);
