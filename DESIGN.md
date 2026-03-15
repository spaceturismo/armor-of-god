# Armor of God — Game Design Document

## Overview & Vision

**Armor of God** is a co-op action/strategy game inspired by Ephesians 6:10-18. Players take on the role of spiritual guardians defending a city from waves of darkness. Each guardian wears a piece of the Armor of God, granting unique abilities and roles in battle.

The game blends tower-defense positioning with action-oriented combat, creating a gameplay experience that is both engaging and scripturally grounded. Every mechanic ties back to the spiritual meaning of the armor described by the Apostle Paul.

**Core Scripture:** *"Put on the whole armour of God, that ye may be able to stand against the wiles of the devil."* — Ephesians 6:11 (KJV)

---

## Core Mechanics

### Movement & Controls
- **WASD** — Move the player character in 8 directions (top-down view)
- **Mouse Click** — Attack the nearest enemy within melee range
- **SPACE** — Activate class-specific special ability (cooldown-based)

### Combat
- **Melee attacks** damage the nearest enemy within range
- **Abilities** are unique per class with cooldown timers
- **Damage calculation:** `effective_damage = max(1, base_damage - (target_defense * 0.3))`
- **Scoring:** Points awarded for each enemy killed, bonus for hits

### Objective
Protect the **Church** at the center of the city through 5 waves of enemies. The Church has 200 HP. If the Church or the player reaches 0 HP, the game is lost.

---

## Character Classes

Each class corresponds to a piece of the Armor of God from Ephesians 6.

### 1. Belt of Truth (Support)
- **Color:** White
- **Verse:** Ephesians 6:14a — *"Stand therefore, having your loins girt about with truth"*
- **Stats:** HP 80 | Speed 110 | Attack 12 | Defense 8 | Cooldown 10s
- **Ability — Reveal:** Exposes all hidden (Deception) enemies for 8 seconds
- **Passive:** Nearby allies deal 20% more damage
- **Design Philosophy:** Truth illuminates what is hidden, enabling the team

### 2. Breastplate of Righteousness (Tank)
- **Color:** Silver/Gray
- **Verse:** Ephesians 6:14b — *"having on the breastplate of righteousness"*
- **Stats:** HP 150 | Speed 80 | Attack 10 | Defense 18 | Cooldown 12s
- **Ability — Stand Firm:** Creates a damage-absorbing shield (50 HP buffer)
- **Passive:** Takes 30% reduced damage from all sources
- **Design Philosophy:** Righteousness is our protection, an unyielding guard

### 3. Shoes of Peace (Speed/Healer)
- **Color:** Green
- **Verse:** Ephesians 6:15 — *"your feet shod with the preparation of the gospel of peace"*
- **Stats:** HP 90 | Speed 150 | Attack 8 | Defense 6 | Cooldown 8s
- **Ability — Gospel Sprint:** Dash forward, healing allies passed through
- **Passive:** 25% movement speed increase
- **Design Philosophy:** The gospel of peace brings healing and swift aid

### 4. Shield of Faith (Defender)
- **Color:** Gold
- **Verse:** Ephesians 6:16 — *"taking the shield of faith, wherewith ye shall be able to quench all the fiery darts of the wicked"*
- **Stats:** HP 120 | Speed 90 | Attack 10 | Defense 15 | Cooldown 14s
- **Ability — Faith Barrier:** Blocks all projectiles in a wide area for 5 seconds, pushes back nearby enemies
- **Passive:** 15% chance to deflect incoming attacks
- **Design Philosophy:** Faith is our shield against the enemy's attacks

### 5. Helmet of Salvation (Commander)
- **Color:** Blue
- **Verse:** Ephesians 6:17a — *"take the helmet of salvation"*
- **Stats:** HP 110 | Speed 100 | Attack 12 | Defense 10 | Cooldown 15s
- **Ability — Rally Cry:** All allies gain 30% attack boost for 6 seconds
- **Passive:** Slowly regenerates health (2 HP per second)
- **Design Philosophy:** Salvation gives us hope and confidence to rally others

### 6. Sword of the Spirit (DPS)
- **Color:** Red/Crimson
- **Verse:** Ephesians 6:17b — *"the sword of the Spirit, which is the word of God"*
- **Stats:** HP 85 | Speed 100 | Attack 22 | Defense 5 | Cooldown 6s
- **Ability — Word of Power:** Fires a powerful ranged scripture blast (3x damage)
- **Passive:** All attacks deal 25% bonus damage
- **Design Philosophy:** The Word of God is the only offensive weapon in the armor

---

## Enemy Types

Enemies represent spiritual forces of darkness. Each is visually distinct.

### 1. Doubt (Dark Gray Circles)
- **HP:** 40 | **Speed:** 50 | **Damage:** 8 | **Points:** 100
- **Behavior:** Slow, steady advance toward the Church
- **Represents:** The lingering uncertainty that erodes faith

### 2. Fear (Dark Purple Triangles)
- **HP:** 20 | **Speed:** 100 | **Damage:** 5 | **Points:** 75
- **Behavior:** Fast rushers that quickly close distance
- **Represents:** Fear that strikes swiftly and without warning

### 3. Deception (Semi-transparent Red Diamonds)
- **HP:** 35 | **Speed:** 60 | **Damage:** 10 | **Points:** 150
- **Behavior:** Nearly invisible until within 120px of the player; hard to spot
- **Represents:** The hidden lies that approach unseen
- **Countered by:** Belt of Truth's Reveal ability

### 4. Division (Orange Squares)
- **HP:** 30 | **Speed:** 55 | **Damage:** 6 | **Points:** 120
- **Behavior:** Splits into two smaller, weaker copies when destroyed
- **Split stats:** 50% HP, 120% speed, 60% damage
- **Represents:** Discord that multiplies when not properly addressed

---

## Wave Progression

| Wave | Enemies | Notes |
|------|---------|-------|
| 1 | 5 Doubt | Tutorial wave — learn controls |
| 2 | 4 Doubt, 4 Fear | Introduces speed enemies |
| 3 | 5 Doubt, 4 Fear, 3 Deception | Hidden enemies appear |
| 4 | 6 Doubt, 5 Fear, 3 Deception, 3 Division | Full roster |
| 5 | 8 Doubt, 7 Fear, 4 Deception, 5 Division | Final onslaught |

Between each wave:
- 3-second intermission with scripture verse displayed
- Player can reposition
- Brief respite to prepare

---

## Scoring System

| Action | Points |
|--------|--------|
| Kill Doubt | 100 |
| Kill Fear | 75 |
| Kill Deception | 150 |
| Kill Division | 120 |
| Kill Division (split child) | ~36 |
| Landing a hit | 10 |

**End-of-game rating:**
- **Gold Guardian:** Church at 90%+ HP
- **Silver Guardian:** Church at 70-89% HP
- **Bronze Guardian:** Church below 70% HP

---

## Scripture Integration Philosophy

Scripture is woven into every aspect of the game:

1. **Character selection** — each armor piece shows its Ephesians 6 verse
2. **Between waves** — armor-category scriptures are displayed for reflection
3. **Victory screen** — 1 Corinthians 15:57 celebration verse
4. **Defeat screen** — Ephesians 6:10 encouragement verse
5. **Scripture Library** — accessible from the main menu for study
6. **Enemy design** — each enemy type represents a real spiritual struggle

The goal is not just entertainment but spiritual edification. Players should come away with a deeper understanding of what each piece of armor represents and why Paul urged believers to put on the full armor.

---

## Technical Details

- **Engine:** Phaser 3 (Canvas renderer)
- **Resolution:** 1024x768
- **Physics:** Arcade (top-down, no gravity)
- **Assets:** All generated programmatically — zero external images required
- **Shared library:** Uses `@faith-games/shared` for UI components, scripture database, save management, and constants

---

## Future Features

### Multiplayer Co-op
- 2-4 players online, each choosing a different armor piece
- Team composition matters — covering all roles makes the team stronger
- Shared church health pool

### Additional Levels
- **Desert Campaign** — wider open maps, sandstorm visibility reduction
- **Mountain Fortress** — vertical defense with elevation advantages
- **City of Refuge** — escort missions protecting fleeing civilians

### Boss Enemies
- **Goliath** — massive HP, ground-pound AOE attacks; requires team coordination
- **Pharaoh** — summons minion waves, hardened heart mechanic (damage phases)
- **Legion** — swarm boss that splits into many smaller enemies
- **The Accuser** — debuffs players, reduces stats; countered by truth and righteousness

### Upgrade System
- Between levels, spend points to upgrade stats
- Unlock advanced abilities for each armor class
- Armor enhancement visual progression (basic -> polished -> radiant)

### Prayer Power Mechanic
- Cooperative prayer action where two players channel together
- Builds a shared "prayer meter" that triggers powerful scripture-based AOE attacks
- Encourages teamwork and mirrors the power of communal prayer

### Achievement System
- "Full Armor" — complete a game with each class
- "Not a Scratch" — finish with church at 100% HP
- "Word Warrior" — defeat 100 enemies with Sword of the Spirit ability
- "Faithful Shield" — block 50 projectiles with Faith Barrier
