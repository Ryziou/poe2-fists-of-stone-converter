import { convertModifiers } from "./match-modifiers";
import { isGlovesItem, isRareItem, parseTradeItem } from "./parse-item";
import type { ConvertResult, ModifierRule } from "./types";

const SEPARATOR = "--------";

const IMPLICITS = [
  "Has +3 to Evasion Rating per player level",
  "Has +1 to maximum Energy Shield per player level",
];

function buildSection(lines: string[]): string[] {
  if (!lines.length) return [];
  return [...lines, SEPARATOR];
}

export function convertItem(text: string, rules: ModifierRule[]): ConvertResult {
  const parsed = parseTradeItem(text);

  if (!parsed.itemClass) {
    return {
      text: "",
      unmatched: [],
      error:
        "Could not find Item Class. Paste a full item from the trade site or in-game (Ctrl+C on the item).",
    };
  }

  if (!isGlovesItem(parsed.itemClass)) {
    const kind = parsed.itemClass.replace(/^Item Class:\s*/i, "").trim();
    return {
      text: "",
      unmatched: [],
      error: `Only gloves can be converted to Fists of Stone. This item is: ${kind || "unknown"}.`,
    };
  }

  if (!isRareItem(parsed.rarity)) {
    const kind = parsed.rarity.replace(/^Rarity:\s*/i, "").trim();
    return {
      text: "",
      unmatched: [],
      error: `Only rare gloves are supported — uniques and other rarities are not converted. This item is: ${kind || "unknown"}.`,
    };
  }

  const { converted, unmatched } = convertModifiers(parsed.mods, rules);

  const output: string[] = [];

  output.push(parsed.itemClass || "Item Class: Unknown");
  output.push(parsed.rarity || "Rarity: Rare");
  if (parsed.uniqueName) output.push(parsed.uniqueName);
  output.push("Fists of Stone");
  output.push(SEPARATOR);

  if (parsed.quality) {
    output.push(parsed.quality);
    output.push(SEPARATOR);
  }

  if (parsed.sockets) {
    output.push(parsed.sockets);
    output.push(SEPARATOR);
  }

  if (parsed.itemLevel) {
    output.push(parsed.itemLevel);
    output.push(SEPARATOR);
  }

  output.push(...buildSection(parsed.runes));
  output.push(...IMPLICITS);
  output.push(SEPARATOR);
  output.push(...converted);
  output.push(SEPARATOR);
  output.push("Unmodifiable");

  return {
    text: output.join("\n"),
    unmatched,
  };
}
