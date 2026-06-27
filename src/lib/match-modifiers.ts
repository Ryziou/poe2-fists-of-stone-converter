import type { ConvertModifiersResult, ModifierRule } from "./types";

const TAG_PATTERN =
  /\s*\((?:fractured|crafted|desecrated|augmented|mutated|enchanted|synthesised|elder|shaper|crusader|hunter|redeemer|warlord|veiled)\)\s*$/i;

interface NumericRange {
  min: number;
  max: number;
}

interface Matcher {
  regex: RegExp;
  ranges: NumericRange[];
}

export function stripModTags(line: string): string {
  return line.replace(TAG_PATTERN, "").trim();
}

export function normalizeModText(line: string): string {
  return stripModTags(line)
    .replace(/\bdamage\b/gi, "Damage")
    .replace(/\s+/g, " ")
    .trim();
}

function buildMatcher(template: string): Matcher {
  const ranges: NumericRange[] = [];
  let regex = "^";
  let i = 0;

  while (i < template.length) {
    const rest = template.slice(i);

    const doubleDashRange = rest.match(/^\((-?\d+)--(-?\d+)\)/);
    if (doubleDashRange) {
      ranges.push({
        min: Number(doubleDashRange[1]),
        max: Number(doubleDashRange[2]),
      });
      regex += "(-?\\d+)";
      i += doubleDashRange[0].length;
      continue;
    }

    const rangeMatch = rest.match(/^\((-?\d+)-(-?\d+)\)/);
    if (rangeMatch) {
      ranges.push({
        min: Number(rangeMatch[1]),
        max: Number(rangeMatch[2]),
      });
      regex += "(-?\\d+)";
      i += rangeMatch[0].length;
      continue;
    }

    const numMatch = rest.match(/^(-?\d+)/);
    if (numMatch) {
      regex += numMatch[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      i += numMatch[0].length;
      continue;
    }

    const ch = template[i];
    if (/[a-z]/i.test(ch)) {
      regex += ch + "+";
    } else {
      regex += ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    i++;
  }

  regex += "$";
  return { regex: new RegExp(regex, "i"), ranges };
}

function matchesTemplate(template: string, input: string): boolean {
  const normalizedTemplate = normalizeModText(template);
  const normalizedInput = normalizeModText(input);
  const { regex, ranges } = buildMatcher(normalizedTemplate);
  const match = normalizedInput.match(regex);
  if (!match) return false;

  for (let i = 0; i < ranges.length; i++) {
    const value = Number(match[i + 1]);
    const { min, max } = ranges[i];
    if (value < min || value > max) return false;
  }

  return true;
}

function matchesRule(rule: ModifierRule, lines: string[]): boolean {
  if (lines.length !== rule.original.length) return false;
  return rule.original.every((template, idx) =>
    matchesTemplate(template, lines[idx])
  );
}

/** Strip PoB-style range notation for plain Path of Building import. */
export function formatFistsLine(line: string): string {
  return line
    .replace(/(\d+(?:\.\d+)?)\(\d+(?:\.\d+)?-\d+(?:\.\d+)?\)/g, "$1")
    .replace(/\(([\d.]+)-([\d.]+)\)/g, "$1");
}

export function convertModifiers(
  modLines: string[],
  rules: ModifierRule[]
): ConvertModifiersResult {
  const converted: string[] = [];
  const unmatched: string[] = [];
  let i = 0;

  while (i < modLines.length) {
    let matched = false;

    for (const rule of rules) {
      const slice = modLines.slice(i, i + rule.original.length);
      if (slice.length < rule.original.length) continue;
      if (!matchesRule(rule, slice)) continue;

      for (const fistsLine of rule.fists) {
        converted.push(formatFistsLine(fistsLine));
      }

      i += rule.original.length;
      matched = true;
      break;
    }

    if (!matched) {
      unmatched.push(modLines[i]);
      converted.push(`⚠ UNMATCHED: ${modLines[i]}`);
      i++;
    }
  }

  return { converted, unmatched };
}
