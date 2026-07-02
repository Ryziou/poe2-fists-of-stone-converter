import type { ParsedTradeItem } from "./types";

const SEPARATOR = "--------";

const SKIP_LINE_PATTERNS = [
  /^Requires:/i,
  /^Requirements:?$/i,
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

function gloveClassKind(line: string): string {
  return line.replace(/^Item Class:\s*/i, "").trim();
}

function isGloveClassName(line: string): boolean {
  return /^((Vaal|Ezomyte) )?Gloves$/i.test(gloveClassKind(line));
}

function isHeaderMetaLine(line: string): boolean {
  return (
    /^Quality:/i.test(line) ||
    /^Sockets:/i.test(line) ||
    /^Item Level:/i.test(line) ||
    /^Requires:/i.test(line) ||
    /^Requirements:?$/i.test(line)
  );
}

function findGloveClassLine(lines: string[]): string {
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (isHeaderMetaLine(line) || /^Rarity:/i.test(line)) continue;
    if (isBareItemClassLine(line)) return line;
  }
  return "";
}

function isBareItemClassLine(line: string): boolean {
  return /^Item Class:\s*/i.test(line) || isGloveClassName(line);
}

function normalizeItemClass(line: string): string {
  if (/^Item Class:/i.test(line)) {
    return isGloveClassName(line) ? "Item Class: Gloves" : line;
  }
  if (isGloveClassName(line)) return "Item Class: Gloves";
  return line;
}

export function isGlovesItem(itemClass: string): boolean {
  return isGloveClassName(itemClass);
}

export function isRareItem(rarity: string): boolean {
  return /Rarity:\s*Rare\b/i.test(rarity);
}

export function isUniqueItem(rarity: string): boolean {
  return /Rarity:\s*Unique\b/i.test(rarity);
}

function isModLine(line: string): boolean {
  if (shouldSkipLine(line)) return false;
  if (isRuneLine(line)) return false;
  if (/^Item Class:/i.test(line)) return false;
  if (isBareItemClassLine(line)) return false;
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
    const classLine = findGloveClassLine(header.slice(2));
    if (classLine) itemClass = normalizeItemClass(classLine);
  } else if (header.length >= 2) {
    const classLine = findGloveClassLine(header);
    if (isGloveClassName(classLine)) {
      itemClass = normalizeItemClass(classLine);
      uniqueName = header[0];
    }
  }

  let quality = "";
  let sockets = "";
  let itemLevel = "";

  for (const line of header) {
    if (/^Quality:/i.test(line)) quality = line;
    else if (/^Sockets:/i.test(line)) sockets = line;
    else if (/^Item Level:/i.test(line)) itemLevel = line;
  }

  const runes: string[] = [];
  const mods: string[] = [];
  let inRequirementsBlock = false;

  const bodyStart = firstSep === -1 ? header.length : firstSep + 1;
  for (let i = bodyStart; i < lines.length; i++) {
    const line = lines[i];
    if (line === SEPARATOR) {
      inRequirementsBlock = false;
      continue;
    }

    if (/^Requirements:?$/i.test(line)) {
      inRequirementsBlock = true;
      continue;
    }
    if (inRequirementsBlock) continue;

    if (/^Item Class:/i.test(line)) itemClass = line;
    else if (isBareItemClassLine(line)) itemClass = normalizeItemClass(line);
    else if (/^Rarity:/i.test(line)) rarity = line;
    else if (/^Quality:/i.test(line)) quality = line;
    else if (/^Sockets:/i.test(line)) sockets = line;
    else if (/^Item Level:/i.test(line)) itemLevel = line;
    else if (isRuneLine(line)) runes.push(line);
    else if (isModLine(line)) mods.push(line);
  }

  return {
    itemClass:
      itemClass && isGlovesItem(itemClass)
        ? normalizeItemClass(itemClass)
        : itemClass,
    rarity,
    uniqueName,
    quality,
    sockets,
    itemLevel,
    runes,
    mods,
  };
}
