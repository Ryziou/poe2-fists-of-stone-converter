import type { ParsedTradeItem } from "./types";

const SEPARATOR = "--------";

const SKIP_LINE_PATTERNS = [
  /^Requires:/i,
  /^Evasion Rating:/i,
  /^Energy Shield:/i,
  /^Armour:/i,
  /^Runic Ward:/i,
  /^Ward:/i,
  /^Note:/i,
  /^Fractured Item$/i,
  /^Corrupted$/i,
  /^Synthesised Item$/i,
  /^Mirrored$/i,
  /^Split$/i,
  /^Influences:/i,
  /^Crusader Item$/i,
  /^Hunter Item$/i,
  /^Redeemer Item$/i,
  /^Warlord Item$/i,
  /^Shaper Item$/i,
  /^Elder Item$/i,
];

function isRuneLine(line: string): boolean {
  return /\(rune\)\s*$/i.test(line) || /^Bonded:/i.test(line);
}

function shouldSkipLine(line: string): boolean {
  return SKIP_LINE_PATTERNS.some((p) => p.test(line));
}

function isModLine(line: string): boolean {
  if (shouldSkipLine(line)) return false;
  if (isRuneLine(line)) return false;
  if (/^Item Class:/i.test(line)) return false;
  if (/^Rarity:/i.test(line)) return false;
  if (/^Quality:/i.test(line)) return false;
  if (/^Sockets:/i.test(line)) return false;
  if (/^Item Level:/i.test(line)) return false;
  if (/^\{/.test(line)) return false;
  return true;
}

export function parseTradeItem(text: string): ParsedTradeItem {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const firstSep = lines.indexOf(SEPARATOR);
  const header = firstSep === -1 ? lines.slice(0, 4) : lines.slice(0, firstSep);

  let itemClass = "";
  let rarity = "";
  let uniqueName = "";

  if (header[0]?.startsWith("Item Class:")) {
    itemClass = header[0];
    rarity = header[1] || "";
    uniqueName = header[2] || "";
  } else if (header[0]?.startsWith("Rarity:")) {
    rarity = header[0];
    uniqueName = header[1] || "";
  }

  let quality = "";
  let sockets = "";
  let itemLevel = "";
  const runes: string[] = [];
  const mods: string[] = [];

  const bodyStart = firstSep === -1 ? header.length : firstSep + 1;
  for (let i = bodyStart; i < lines.length; i++) {
    const line = lines[i];
    if (line === SEPARATOR) continue;

    if (/^Item Class:/i.test(line)) itemClass = line;
    else if (/^Rarity:/i.test(line)) rarity = line;
    else if (/^Quality:/i.test(line)) quality = line;
    else if (/^Sockets:/i.test(line)) sockets = line;
    else if (/^Item Level:/i.test(line)) itemLevel = line;
    else if (isRuneLine(line)) runes.push(line);
    else if (isModLine(line)) mods.push(line);
  }

  return {
    itemClass,
    rarity,
    uniqueName,
    quality,
    sockets,
    itemLevel,
    runes,
    mods,
  };
}
