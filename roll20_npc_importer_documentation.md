# Roll20 5e NPC Importer

A lightweight Roll20 API script that allows Game Masters to instantly import NPC and monster stat blocks directly into the official D&D 5e character sheet using a single chat command. 

This script listens for the `!importnpc` command followed by a JSON payload. It automatically creates a new character sheet (or updates an existing one with the same name), populates the core stats, and builds the repeating trait and action rows.

## Features
* **One-Click Import:** Paste a single line into the Roll20 chat to build an entire NPC sheet.
* **Auto-Update:** If a sheet with the NPC's name already exists, the script will update it rather than creating a duplicate.
* **Auto-XP Calculation:** If you provide the Challenge Rating (CR) but forget the XP, the script automatically calculates standard 5e XP.
* **VTT Optimized:** Perfectly maps to the attributes of the official Roll20 D&D 5e character sheet.

---

## Installation

1. Go to your Roll20 game's **API Scripts** page (Requires a Roll20 Pro subscription).
2. Click **New Script** and name it `NPC_Importer.js`.
3. Paste the provided JavaScript code into the editor. 
4. Click **Save Script** and ensure the API sandbox restarts successfully.

---

## Usage

To import an NPC, paste the `!importnpc` command followed by a JSON string into the Roll20 chat. 

**Important:** The entire command *must* be on a single line. Roll20's chat will break the API command if there are line breaks.

### JSON Data Structure Template
Your JSON payload should match this structure exactly:

```json
{
  "name": "Goblin Boss",
  "type": "Small humanoid (goblinoid), neutral evil",
  "ac": "17 (chain shirt, shield)",
  "hp": "21 (6d6)",
  "speed": "30 ft.",
  "strength": 10,
  "dexterity": 14,
  "constitution": 10,
  "intelligence": 10,
  "wisdom": 8,
  "charisma": 10,
  "senses": "darkvision 60 ft., passive Perception 9",
  "languages": "Common, Goblin",
  "challenge": "1 (200 XP)",
  "traits": [
    {
      "name": "Nimble Escape",
      "desc": "The goblin can take the Disengage or Hide action as a bonus action on each of its turns."
    }
  ],
  "actions": [
    {
      "name": "Multiattack",
      "desc": "The goblin makes two attacks with its scimitar."
    },
    {
      "name": "Scimitar",
      "desc": "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage."
    }
  ]
}
```

---

## Generating Payloads with AI

The easiest way to use this script is to have an AI model (like ChatGPT, Claude, or Gemini) generate the single-line payload for you from any stat block or homebrew concept. Use the provided `ai_prompt_template.txt` file in this repository to instantly generate valid import commands!