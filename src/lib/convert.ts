import { convertModifiers } from "./match-modifiers";
import { parseTradeItem } from "./parse-item";
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
