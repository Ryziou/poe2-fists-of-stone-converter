import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { convertItem } from "../src/lib/convert";
import type { ModifierRule, UniqueRule } from "../src/lib/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const rules = JSON.parse(
  readFileSync(join(root, "public", "modifiers.json"), "utf8")
) as ModifierRule[];
const uniques = JSON.parse(
  readFileSync(join(root, "public", "uniques.json"), "utf8")
) as UniqueRule[];

let failures = 0;

function expectSuccess(label: string, text: string) {
  const { unmatched, error } = convertItem(text, rules, uniques);
  if (error || unmatched.length) {
    failures++;
    console.error(`FAIL: ${label}`);
    if (error) console.error(`  error: ${error}`);
    if (unmatched.length) console.error(`  unmatched:`, unmatched);
    return;
  }
  console.log(`ok: ${label}`);
}

function expectUniqueNotice(label: string, text: string) {
  const { unmatched, error, notice, text: output } = convertItem(text, rules, uniques);
  if (error || unmatched.length || !notice || !output.includes("Rarity: Unique")) {
    failures++;
    console.error(`FAIL: ${label}`);
    console.error(`  error: ${error}`);
    console.error(`  notice: ${notice}`);
    console.error(`  unmatched:`, unmatched);
    return;
  }
  console.log(`ok: ${label}`);
}

function expectItemClassGloves(label: string, text: string) {
  const { error, text: output } = convertItem(text, rules, uniques);
  if (error || !output.startsWith("Item Class: Gloves\n")) {
    failures++;
    console.error(`FAIL: ${label}`);
    console.error(`  error: ${error}`);
    console.error(`  output start:`, output.split("\n").slice(0, 2));
    return;
  }
  console.log(`ok: ${label}`);
}

function expectReject(label: string, text: string) {
  const { error } = convertItem(text, rules, uniques);
  if (!error) {
    failures++;
    console.error(`FAIL: ${label} (expected rejection)`);
    return;
  }
  console.log(`ok: ${label}`);
}

const dragonPaw = `Item Class: Gloves
Rarity: Rare
Dragon Paw
Runeforged Adorned Wraps
--------
Quality: +20% (augmented)
Evasion Rating: 162 (augmented)
Energy Shield: 53 (augmented)
Runic Ward: 47 (augmented)
--------
Requires: Level 60, 41 Dex, 41 Int
--------
Sockets: S 
--------
Item Level: 78
--------
8% increased Attack Speed (rune)
Bonded: 20% reduced Slowing Potency of Debuffs on You (rune)
--------
+2 to Level of all Melee Skills (fractured)
+70 to Evasion Rating
+24 to maximum Energy Shield
Adds 12 to 30 Physical Damage to Attacks
Adds 13 to 27 Fire damage to Attacks
25% increased Critical Damage Bonus (crafted)
10% chance to Gain Arcane Surge when you deal a Critical Hit (desecrated)
--------
Fractured Item
--------
Note: ~b/o 60 divine`;

const tormentHold = `Item Class: Gloves
Rarity: Rare
Torment Hold
Secured Wraps
--------
Quality: +20% (augmented)
Evasion Rating: 242 (augmented)
Energy Shield: 76 (augmented)
--------
Requires: Level 80, 69 (augmented) Dex, 69 (augmented) Int
--------
Sockets: S 
--------
Item Level: 83
--------
18% increased Armour, Evasion and Energy Shield (rune)
--------
{ Prefix Modifier "Flaring" (Tier: 1) - Damage, Physical, Attack }
Adds 16(12-19) to 31(22-32) Physical Damage to Attacks
{ Desecrated Prefix Modifier "Cherub's" (Tier: 1) - Evasion, Energy Shield }
+77(65-78) to Evasion Rating
+25(22-25) to maximum Energy Shield
{ Prefix Modifier "Opalescent" (Tier: 3) - Mana }
+88(80-89) to maximum Mana
{ Fractured Suffix Modifier "of Haast" (Tier: 1) - Elemental, Cold, Resistance }
+45(41-45)% to Cold Resistance
{ Suffix Modifier "of the Volcano" (Tier: 3) - Elemental, Fire, Resistance }
+34(31-35)% to Fire Resistance
{ Suffix Modifier "of Dueling" (Tier: 1) - Attack }
+2 to Level of all Melee Skills
--------
Fractured Item`;

const boots = `Item Class: Boots
Rarity: Rare
Test Boots
--------
+50 to maximum Life`;

const handOfWisdom = `Item Class: Gloves
Rarity: Unique
Hand of Wisdom and Action
--------
+100 to Evasion Rating`;

const agonyGrip = `Rarity: Rare
Agony Grip
Vaal Wraps
Gloves
--------
Quality: +20% (augmented)
--------
Requires: Level 75, 52 Dex, 52 Int
--------
Item Level: 81
--------
Sockets: S 
--------
+1 Suffix Modifier allowed (rune)
--------
+2 to Level of all Melee Skills (fractured)
88% increased Evasion and Energy Shield
Adds 8 to 17 Physical Damage to Attacks
Adds 19 to 28 Fire damage to Attacks
+39% to Cold Resistance
11% chance to Gain Arcane Surge when you deal a Critical Hit (desecrated)
--------
Fractured Item
--------
Note: 70 divine`;

const agonyGripScript = `Item Class: Gloves
Rarity: Rare
Agony Grip
Vaal Wraps
--------
Quality: +20% (augmented)
Evasion Rating: 203 (augmented)
Energy Shield: 61 (augmented)
--------
Requirements:
Level: 75
Dex: 52
Int: 52
--------
Sockets: S
--------
Item Level: 81
--------
+1 Suffix Modifier allowed (rune)
--------
+2 to Level of all Melee Skills (fractured)
27% increased Critical Damage Bonus (crafted)
88% increased Evasion and Energy Shield
Adds 8 to 17 Physical Damage to Attacks
Adds 19 to 28 Fire damage to Attacks
+39% to Cold Resistance
11% chance to Gain Arcane Surge when you deal a Critical Hit (desecrated)
--------
Note: ~b/o 70 divine`;

expectSuccess("Dragon Paw (trade site)", dragonPaw);
expectSuccess("Torment Hold (in-game copy)", tormentHold);
expectSuccess("Agony Grip (trade site, rarity first)", agonyGrip);
expectSuccess("Agony Grip (trade site script)", agonyGripScript);
expectSuccess("Hand of Wisdom and Action (unique)", handOfWisdom);

const demonStitcher = `Rarity: Unique
Demon Stitcher
Intricate Gloves
Vaal Gloves
--------
Requires: Level 33, 42 Int
--------
Item Level: 80
--------
+44 to maximum Energy Shield
+114 to maximum Life
11% increased Cast Speed
Sacrifice 13% of maximum Life to gain that much Energy Shield when you Cast a Spell
--------
Note: 1 regal`;

expectSuccess("Demon Stitcher (Vaal Gloves class)", demonStitcher);

const snakebite = `Snakebite
Spined Bracers
Vaal Gloves
--------
Requires: Level 33, 42 Dex
--------
Item Level: 65
--------
Sockets: S S 
--------
47% increased Evasion Rating
+9% to Chaos Resistance
7 Life Regeneration per second
22% chance to Poison on Hit
Targets can be affected by +1 of your Poisons at the same time
--------
Corrupted
--------
Note: 99 exalted`;

expectSuccess("Snakebite (compact trade header)", snakebite);

const facebreaker = `Rarity: Unique
Facebreaker
Stocky Mitts
Ezomyte Gloves
Item Level: 83
--------
Has 8 to 12 Physical damage, +3 to +4 per Boss's Face Broken
50% increased Stun Buildup
1% more Unarmed Damage per 5 Strength
+0.3 metres to Melee Strike Range while Unarmed
+1 to Armour per Strength
Can Attack as though using a One Handed Mace while both of your hand slots are empty
Unarmed Attacks that would use an Equipped One Hand Mace's damage use this Item's damage
--------
Note: 99 exalted`;

const deathblow = `Rarity: Unique
Deathblow
Doubled Gauntlets
Ezomyte Gloves
--------
Requires: Level 33, 24 Str, 24 Dex
--------
Item Level: 81
--------
Sockets: S 
--------
+100 to Stun Threshold (rune)
Bonded: +20 to maximum Life (rune)
Bonded: +20 to maximum Mana (rune)
--------
149% increased Armour and Evasion
9% increased Attack Speed
Gain 21 Life per enemy killed
Gain 22 Mana per enemy killed
Culling Strike
--------
Note: 99 exalted`;

expectSuccess("Facebreaker (Ezomyte Gloves, inline item level)", facebreaker);
expectSuccess("Deathblow (Ezomyte Gloves)", deathblow);

const snakebiteMislabeledRare = `Rarity: Rare
Snakebite
Spined Bracers
Vaal Gloves
--------
+10 to maximum Life`;

const vaalGlovesClassFirst = `Item Class: Vaal Gloves
Rarity: Unique
Snakebite
Spined Bracers
--------
Item Level: 65`;

expectUniqueNotice("Snakebite mislabeled as Rare", snakebiteMislabeledRare);
expectItemClassGloves("Item Class Vaal Gloves normalized in output", vaalGlovesClassFirst);
expectReject("Boots (rejected)", boots);

if (failures) {
  console.error(`\n${failures} test(s) failed`);
  process.exit(1);
}

console.log("\nAll tests passed");
