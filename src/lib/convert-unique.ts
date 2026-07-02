import type { UniqueRule } from "./types";
import { formatFistsLine } from "./match-modifiers";

export function normalizeUniqueName(name: string): string {
  return name.trim().toLowerCase();
}

export function findUniqueRule(
  name: string,
  uniques: UniqueRule[]
): UniqueRule | undefined {
  const key = normalizeUniqueName(name);
  return uniques.find((u) => normalizeUniqueName(u.name) === key);
}

export function convertUniqueMods(
  name: string,
  uniques: UniqueRule[]
): { converted: string[]; error?: string } {
  const rule = findUniqueRule(name, uniques);
  if (!rule) {
    return {
      converted: [],
      error: `Unknown unique glove: "${name}". This unique is not in the conversion table yet.`,
    };
  }

  return {
    converted: rule.fists.map((line) => formatFistsLine(line)),
  };
}
