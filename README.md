# Armor of God

A co-op action/strategy tower-defense game based on Ephesians 6:10-18. Defend the church from waves of spiritual darkness by choosing a piece of the Armor of God, each with unique abilities and playstyles.

![Screenshot](screenshot.png)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Then open the URL shown in your terminal (typically `http://localhost:5173`).

### Build for production

```bash
npm run build
npm run preview
```

## Install as PWA on Mobile

1. Open the game URL in your mobile browser (Chrome on Android, Safari on iOS).
2. **Android:** Tap the browser menu (three dots) and select **"Add to Home screen"** or **"Install app"**.
3. **iOS:** Tap the Share button and select **"Add to Home Screen"**.
4. The game will appear as an app icon on your home screen and can be played offline.

## Controls

### Keyboard (Desktop)

| Key | Action |
|-----|--------|
| W / A / S / D | Move |
| Space | Use special ability |
| Mouse click | Attack nearest enemy |

### Touch (Mobile)

- **Virtual joystick** (left side) to move
- **Attack button** to strike enemies
- **Ability button** to use your special ability

## Gameplay

- Choose one of six armor classes, each based on a piece of the Armor of God (Belt of Truth, Breastplate of Righteousness, Shoes of Peace, Shield of Faith, Helmet of Salvation, Sword of the Spirit).
- Defend the Church at the center of the city from 5 waves of enemies.
- Use your unique ability and passive bonuses strategically.
- Earn a rating based on how much church integrity you preserve.

## Tech Stack

- **[Phaser 3](https://phaser.io/)** -- 2D game framework
- **[Vite](https://vitejs.dev/)** -- Dev server and bundler
- **Vanilla JavaScript** (ES modules)

## License

MIT
