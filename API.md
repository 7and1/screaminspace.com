# Game Configuration API

This document describes the configuration options and extension points for Scream In Space.

## GameState API

The main game state object, accessible via `window.GameState`.

### Properties

```javascript
GameState = {
  isPlaying: boolean,   // True when game is active
  isPaused: boolean,    // True when game is paused
  settings: {
    sound: boolean,           // Enable/disable audio
    crtEffects: boolean,      // Enable/disable CRT overlay
    reducedMotion: boolean,   // Minimize animations
    quality: string           // 'low' | 'medium' | 'high'
  }
}
```

### Methods

#### `loadSettings()`

Load settings from localStorage.

```javascript
loadSettings(); // Applies saved settings immediately
```

#### `saveSettings()`

Persist current settings to localStorage.

```javascript
GameState.settings.sound = false;
saveSettings(); // Saves to localStorage
```

#### `applySettings()`

Apply settings to DOM elements.

```javascript
applySettings(); // Updates toggles, visibility, etc.
```

## Configuration Constants

### Game Dimensions

```javascript
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
```

### Quality Presets

```javascript
const qualityConfig = {
  particleCount: {
    low: { engine: 60, explosion: 12 },
    medium: { engine: 35, explosion: 16 },
    high: { engine: 25, explosion: 20 }
  },
  enemyMaxCount: {
    low: 30,
    medium: 50,
    high: 80
  },
  bulletMaxSize: {
    low: 25,
    medium: 45,
    high: 60
  },
  visionUpdateRate: {
    low: 3,    // Update every 3 frames
    medium: 2, // Update every 2 frames
    high: 1    // Update every frame
  }
};
```

### Performance Configuration

```javascript
const PERF_CONFIG = {
  targetFPS: 60,
  mobileTargetFPS: 30,
  physicsStep: { high: 1, low: 2 }
};
```

### Vision System

```javascript
this.visionCache = {
  coneLength: 420,        // Distance of flashlight cone
  coneAngle: Math.PI/9,   // ~40 degrees in radians
  baseRadius: 140         // Player glow radius
};
```

## UI API

The UI management object, accessible via `window.UI`.

### Properties

```javascript
UI = {
  startScreen: HTMLElement,
  hud: HTMLElement,
  pauseMenu: HTMLElement,
  settingsPanel: HTMLElement,
  gameOverScreen: HTMLElement,
  scoreValue: HTMLElement,
  killsValue: HTMLElement,
  healthBar: HTMLElement,
  // ... more element references
}
```

### Methods

#### `showStartScreen()`, `hideStartScreen()`

Control start screen visibility.

```javascript
UI.showStartScreen();
UI.hideStartScreen();
```

#### `showPauseMenu()`, `hidePauseMenu()`

Control pause menu visibility.

```javascript
UI.showPauseMenu();
UI.hidePauseMenu();
```

#### `showSettings()`, `hideSettings()`

Control settings panel visibility.

```javascript
UI.showSettings();
UI.hideSettings();
```

#### `showGameOver(score, kills)`

Display game over screen with results.

```javascript
UI.showGameOver(1250, 45); // Score: 1250, Kills: 45
```

#### `updateHUD(score, kills, health)`

Update HUD values.

```javascript
UI.updateHUD(500, 10, 75); // Score: 500, Kills: 10, Health: 75%
```

#### `showDamageEffect()`

Trigger damage flash overlay.

```javascript
UI.showDamageEffect();
```

#### `triggerGlitch()`

Trigger CRT glitch effect.

```javascript
UI.triggerGlitch();
```

#### `createScorePopup(x, y, points)`

Create floating score popup at position.

```javascript
UI.createScorePopup(400, 300, 25); // +25 at screen position
```

## Touch Controls API

Accessible via `window.TouchControls`.

### Properties

```javascript
TouchControls = {
  moveVector: { x: 0, y: 0 },  // Normalized joystick input
  isFiring: boolean,            // Fire button state
  aimPosition: { x: 0.5, y: 0.5 } // Normalized aim position
}
```

### Methods

#### `init()`

Initialize touch controls (called automatically on touch devices).

```javascript
TouchControls.init();
```

## Scene API

### SceneGame Methods

These are accessible via the `gameScene` global when game is running.

#### `pauseGame()`, `resumeGame()`

Control game pause state.

```javascript
gameScene.pauseGame();
gameScene.resumeGame();
```

#### `enableLowPerfMode()`, `disableLowPerfMode()`

Manually control performance mode.

```javascript
gameScene.enableLowPerfMode();
gameScene.disableLowPerfMode();
```

#### `onQualityChange(quality)`

Handle quality preset changes.

```javascript
gameScene.onQualityChange('high');
```

## Custom Events

The game dispatches custom events for state changes.

### `perf-low`

Dispatched when FPS drops below 45.

```javascript
window.addEventListener('perf-low', () => {
  console.log('Low performance detected');
});
```

### `perf-high`

Dispatched when FPS recovers above 55.

```javascript
window.addEventListener('perf-high', () => {
  console.log('Performance recovered');
});
```

### `quality-change`

Dispatched when quality preset changes.

```javascript
window.addEventListener('quality-change', (e) => {
  console.log('Quality changed to:', e.detail);
  // e.detail = 'low' | 'medium' | 'high'
});
```

## Extension Points

### Adding New Enemy Types

1. Add enemy sprite to assets
2. Extend `spawnEnemy()` in SceneGame:

```javascript
spawnEnemy(type = 'basic') {
  // ... existing spawn logic
  if (type === 'fast') {
    enemy.speed = Phaser.Math.Between(150, 200);
  }
}
```

### Adding New Weapons

1. Add bullet sprite to assets
2. Extend `tryShoot()` in SceneGame:

```javascript
tryShoot(time = 0) {
  if (this.weaponType === 'spread') {
    // Fire 3 bullets in spread pattern
  }
}
```

### Adding New Settings

1. Add toggle in HTML settings panel
2. Add to GameState.settings
3. Wire up event handler in UI script

```html
<button id="new-toggle" class="toggle" aria-label="New Setting"></button>
```

```javascript
GameState.settings.newSetting = true;

document.getElementById('new-toggle').addEventListener('click', function() {
  GameState.settings.newSetting = !GameState.settings.newSetting;
  saveSettings();
});
```

### Custom Quality Presets

Modify `getQualityConfig()` function:

```javascript
const getQualityConfig = () => {
  return {
    particleCount: {
      ultra: { engine: 10, explosion: 30 }  // Add new preset
    },
    // ...
  };
};
```
