import { convertModifiers } from "./match-modifiers";
import { convertUniqueMods, findUniqueRule } from "./convert-unique";
import {
  isGlovesItem,
  isRareItem,
  isUniqueItem,
  parseTradeItem,
} from "./parse-item";
import type { ConvertResult, ModifierRule, ParsedTradeItem, UniqueRule } from "./types";

const SEPARATOR = "--------";

const IMPLICITS = [
  "Has +3 to Evasion Rating per player level",
  "Has +1 to maximum Energy Shield per player level",
];

function buildSection(lines: string[]): string[] {
  if (!lines.length) return [];
  return [...lines, SEPARATOR];
}

function buildOutputHeader(parsed: ReturnType<typeof parseTradeItem>): string[] {
  const output: string[] = [];
  output.push(parsed.itemClass || "Item Class: Unknown");
  output.push(parsed.rarity || "Rarity: Rare");
  if (parsed.uniqueName) output.push(parsed.uniqueName);
  output.push("Fists of Stone");
  output.push(SEPARATOR);
  return output;
}

function appendItemMeta(
  output: string[],
  parsed: ReturnType<typeof parseTradeItem>
): void {
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
}

function resolveRarity(
  parsed: ParsedTradeItem,
  uniques: UniqueRule[]
): { parsed: ParsedTradeItem; notice?: string } {
  let notice: string | undefined;
  let rarity = parsed.rarity;

  if (
    parsed.uniqueName &&
    findUniqueRule(parsed.uniqueName, uniques) &&
    isGlovesItem(parsed.itemClass)
  ) {
    if (isRareItem(parsed.rarity)) {
      rarity = "Rarity: Unique";
      notice = `"${parsed.uniqueName}" is a known unique glove. Treated as Unique instead of Rare.`;
    } else if (!parsed.rarity) {
      rarity = "Rarity: Unique";
    }
  } else if (!parsed.rarity && parsed.itemClass && isGlovesItem(parsed.itemClass)) {
    rarity = "Rarity: Rare";
  }

  return {
    parsed: { ...parsed, rarity },
    notice,
  };
}

export function convertItem(
  text: string,
  rules: ModifierRule[],
  uniques: UniqueRule[] = []
): ConvertResult {
  const { parsed, notice } = resolveRarity(parseTradeItem(text), uniques);

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

  if (isUniqueItem(parsed.rarity)) {
    if (!parsed.uniqueName) {
      return {
        text: "",
        unmatched: [],
        error: "Could not find the unique item name in the pasted text.",
      };
    }

    const { converted, error } = convertUniqueMods(parsed.uniqueName, uniques);
    if (error) {
      return { text: "", unmatched: [], error };
    }

    const output = buildOutputHeader(parsed);
    appendItemMeta(output, parsed);
    output.push(...converted);
    output.push(SEPARATOR);
    output.push("Unmodifiable");

    return { text: output.join("\n"), unmatched: [], notice };
  }

  if (!isRareItem(parsed.rarity)) {
    const kind = parsed.rarity.replace(/^Rarity:\s*/i, "").trim();
    return {
      text: "",
      unmatched: [],
      error: `Only rare and unique gloves are supported. This item is: ${kind || "unknown"}.`,
    };
  }

  const { converted, unmatched } = convertModifiers(parsed.mods, rules);

  const output = buildOutputHeader(parsed);
  appendItemMeta(output, parsed);
  output.push(...IMPLICITS);
  output.push(SEPARATOR);
  output.push(...converted);
  output.push(SEPARATOR);
  output.push("Unmodifiable");

  return {
    text: output.join("\n"),
    unmatched,
    notice,
  };
}
