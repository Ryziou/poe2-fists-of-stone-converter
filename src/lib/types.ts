export type ModifierType = "Prefix" | "Suffix";

export interface ModifierRule {
  type: ModifierType;
  original: string[];
  fists: string[];
}

export interface ParsedTradeItem {
  itemClass: string;
  rarity: string;
  uniqueName: string;
  quality: string;
  sockets: string;
  itemLevel: string;
  runes: string[];
  mods: string[];
}

export interface ConvertResult {
  text: string;
  unmatched: string[];
}

export interface ConvertModifiersResult {
  converted: string[];
  unmatched: string[];
}
