# Architecture

This document describes the system architecture, game loop, scene flow, and asset management for Scream In Space.

## System Design

### Technology Stack

```
+-----------------------------------------------------------------------+
|                            Browser Layer                               |
|  +-------------------+    +-------------------+    +-----------------+ |
|  |    DOM UI Layer   |    |    CSS Overlay    |    |  Touch Controls | |
|  |  (HUD, Menus, etc) |    |  (CRT Effects)    |    |   (Mobile)      | |
|  +-------------------+    +-------------------+    +-----------------+ |
+-----------------------------------+-----------------------------------+
                                    |
+-----------------------------------------------------------------------+
|                          Phaser 3 Game Engine                         |
|  +-------------------+    +-------------------+    +-----------------+ |
|  |    SceneBoot      | -> |    SceneGame      | -> |  SceneGameOver  | |
|  |  (Asset Loading)  |    |  (Main Gameplay)  |    |  (Results)      | |
|  +-------------------+    +-------------------+    +-----------------+ |
|                                                                       |
|  +-------------------+    +-------------------+    +-----------------+ |
|  |  Physics (Arcade) |    |   Particles       |    |   Graphics      | |
|  +-------------------+    +-------------------+    +-----------------+ |
+-----------------------------------------------------------------------+
```

### Key Design Principles

1. **Single-file architecture**: All code embedded in `index.html` for simple deployment
2. **Performance-first**: Object pooling, cached values, quality presets
3. **Progressive enhancement**: Works on mobile, desktop, with/without effects
4. **Accessibility-first**: Full keyboard navigation, ARIA support

## Game Loop

The game loop follows the standard Phaser update cycle:

```
+----------------+
|   Start Frame  |
+-------+--------+
        |
        v
+----------------+     +----------------+     +----------------+
| Handle Input   | --> | Update Physics | --> | Update Enemies |
| (Keyboard/     |     | (Arcade)       |     | (AI Movement)  |
|  Mouse/Touch)  |     +----------------+     +----------------+
+----------------+             |
        |                      v
        |             +----------------+
        |             | Update Vision  |
        |             | (Spotlight)    |
        |             +----------------+
        |                      |
        v                      v
+----------------+     +----------------+
| Update Player  |     | Update UI      |
| (Movement,     |     | (DOM HUD)      |
|  Aim, Fire)    |     +----------------+
+----------------+             |
        |                      |
        v                      v
+----------------+     +----------------+
| Render Frame   | <-- | Update Effects |
| (Phaser Render)|     | (Particles,     |
+----------------+     |  Stars, CRT)    |
                       +----------------+
```

### Update Order (per frame)

1. **Input handling** - Keyboard, mouse, touch processed
2. **Physics** - Arcade physics updates
3. **Game logic** - Enemy AI, collisions
4. **Vision system** - Spotlight mask updated (throttled)
5. **UI sync** - DOM HUD updated (throttled)
6. **Rendering** - Phaser draws frame

### Throttled Updates

For performance, some systems update less frequently:

```javascript
// Vision spotlight - every N frames based on quality
if (this.frameCount % this.visionUpdateRate === 0) {
  this.updateSpotlight();
}

// Enemy AI - every 100ms
if (time >= this.lastEnemyUpdate + this.enemyUpdateRate) {
  this.updateEnemies();
}

// UI sync - every 10 frames
if (this.frameCount % 10 === 0) {
  this.updateUI();
}
```

## Scene Architecture

### Scene Flow

```
SceneBoot
    |
    v
SceneGame <-----> SceneGameOver
    |                    |
    +---[Player dies]----+
    |
    +---[Restart]--------+
```

### SceneBoot

**Purpose**: Preload assets and generate procedural textures

**Responsibilities**:
- Display loading bar
- Load external assets (images, audio)
- Generate procedural textures (particles, starfield)
- Handle load errors gracefully
- Transition to SceneGame

**Key Methods**:
- `preload()` - Asset loading with progress tracking
- `create()` - Texture generation, scene transition
- `createTextures()` - Procedural asset creation

### SceneGame

**Purpose**: Main gameplay loop

**Responsibilities**:
- Player movement and physics
- Enemy spawning and AI
- Collision detection
- Vision/spotlight system
- Particle effects
- UI synchronization
- Difficulty progression

**Key Methods**:
- `create()` - Initialize all game objects
- `update(time, delta)` - Main game loop
- `handleMovement()` - Process input
- `updateAim()` - Calculate aim angle
- `tryShoot(time)` - Fire bullets with cooldown
- `updateSpotlight()` - Render vision mask
- `updateEnemies()` - Enemy AI behavior
- `spawnEnemy()` - Create new enemy at edge
- `handleBulletHit()` - Bullet-enemy collision
- `handlePlayerHit()` - Player-enemy collision
- `updateDifficulty()` - Scale spawn rate over time

**State Properties**:
```javascript
{
  health: 100,           // Player health (0-100)
  score: 0,              // Current score
  kills: 0,              // Enemies killed
  aimAngle: 0,           // Current aim direction
  invulnerableUntil: 0,  // Damage cooldown timestamp
  spawnDelay: 1400,      // Enemy spawn interval (ms)
  elapsed: 0,            // Total game time (ms)
  lowPerfMode: false,    // Performance mode flag
  isPaused: false        // Pause state
}
```

### SceneGameOver

**Purpose**: Display results and handle restart

**Responsibilities**:
- Display final score
- Play game over sound
- Show retry button
- Handle restart input

**Data Received**:
```javascript
{
  score: number,  // Final score
  kills: number   // Total enemies killed
}
```

## Asset Management

### Asset Types

| Asset | Source | Format | Usage |
|-------|--------|--------|-------|
| player.png | Kenney.nl | PNG | Player spaceship sprite |
| enemy.png | Kenney.nl | PNG | Enemy sprite |
| bullet.png | Kenney.nl | PNG | Projectile sprite |
| starfield | Procedural | Generated | Parallax background |
| particle | Procedural | Generated | Engine trail, explosions |

### Loading Strategy

```javascript
// External assets
this.load.image('player', 'assets/player.png');
this.load.image('enemy', 'assets/enemy.png');
this.load.image('bullet', 'assets/bullet.png');

// Audio (with graceful fallback)
this.load.audio('scream', ['assets/scream.mp3']);
this.load.audio('heartbeat', ['assets/heartbeat.mp3']);
```

### Procedural Textures

To reduce load time and asset size, some textures are generated at runtime:

**Starfield Tile** (64x64):
- Random star positions
- Used with tileSprite for parallax
- Two instances (far/near) at different speeds

**Particle** (8x8):
- Simple circle gradient
- Used for engine trails and explosions
- Reused across multiple emitters

### Object Pooling

To minimize garbage collection:

```javascript
class EnemyPool {
  constructor(maxSize) {
    this.pool = [];      // Inactive objects
    this.active = [];    // Active objects
    this.maxSize = maxSize;
  }

  get() {
    // Reuse from pool or return null
  }

  release(enemy) {
    // Return to pool
  }
}
```

### Resource Limits (by Quality)

| Quality | Particles | Enemies | Bullets | Vision Updates |
|---------|-----------|---------|---------|----------------|
| Low | 12/60 | 30 | 25 | Every 3 frames |
| Medium | 16/35 | 50 | 45 | Every 2 frames |
| High | 20/25 | 80 | 60 | Every frame |

## Performance Optimization

### Techniques Used

1. **Object pooling** - Enemies, bullets reused
2. **Cached calculations** - Player position, aim angle cached
3. **Throttled updates** - Non-critical systems update less frequently
4. **Quality presets** - Adjustable complexity
5. **Auto-detection** - Low-end device detection adjusts settings

### Performance Monitor

```javascript
const PerformanceMonitor = {
  fps: 60,              // Current FPS
  frameTime: 16.67,     // ms per frame
  memory: 0,            // Heap MB (if available)
  lowMode: false,       // Low-perf flag

  update(time) {
    // Check FPS and dispatch events
    if (fps < 45 && !this.lowMode) {
      window.dispatchEvent(new CustomEvent('perf-low'));
    }
  }
};
```

## Vision System

The spotlight effect uses geometry masks:

```
1. Draw full-screen darkness overlay
2. Create vision mask (inverted)
3. Draw mask shape:
   - Circle around player (base radius)
   - Cone extending in aim direction
4. Apply mask to darkness
5. Enemies outside cone have alpha reduced
```

### Vision Cache

To avoid recalculating every frame:
```javascript
this.visionCache = {
  coneLength: 420,        // Distance of flashlight
  coneAngle: Math.PI/9,  // Width of flashlight
  baseRadius: 140        // Player glow radius
};
```

## DOM UI Integration

The game uses a hybrid rendering approach:

- **Game canvas** - Phaser rendering (gameplay)
- **DOM overlay** - HTML/CSS UI (HUD, menus)

### Communication Flow

```
Phaser Scene --[UI.updateHUD()]--> DOM Elements
User Input --[Event Listeners]--> Phaser Scene
Game State --[localStorage]--> Settings Persistence
```

### UI State Object

```javascript
const UI = {
  // Element references
  scoreValue: document.getElementById('score-value'),
  healthBar: document.getElementById('health-bar'),

  // State methods
  showStartScreen(), hideStartScreen(),
  showPauseMenu(), hidePauseMenu(),
  showGameOver(score, kills),
  updateHUD(score, kills, health)
};
```
