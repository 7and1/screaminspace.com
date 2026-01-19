# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Scream In Space is a single-page HTML5 Phaser 3 game deployed on Cloudflare Pages. All game code is embedded inline in `index.html` - this is intentional for simple static deployment.

**Key constraint:** The game logic lives entirely within `index.html`. When modifying game behavior, edit that file directly.

## Commands

### Testing
```bash
npm test                          # Run all tests
npm run test:unit                 # Unit tests only
npm run test:integration          # Integration tests only
npm run test:coverage             # With coverage report
```

### Deployment
```bash
npm run deploy:preview            # Deploy to Cloudflare Pages preview
npm run deploy:production         # Deploy to production
npm run deploy:rollback           # Rollback production deployment
```

### Utilities
```bash
npm run optimize                  # Optimize assets
npm run smoke-test                # Post-deploy smoke tests
npm run health-check              # Check production health
npm run validate                  # Full validation (tests + assets)
```

### Local Development
```bash
npx serve .                       # Serve on localhost:3000
python -m http.server 8000        # Alternative
```

## Architecture

### Single-File Structure
- `index.html` contains ALL game code (Phaser scenes, UI logic, event handlers)
- Asset files in `assets/` (PNG images for sprites)
- Tests parse `index.html` to validate game logic

### Phaser Scene Flow
```
SceneBoot (preload assets, generate textures)
    ↓
SceneGame (main gameplay)
    ↓ (player death)
SceneGameOver (results, restart)
    ↓ (restart)
SceneGame
```

### Key Game Objects (in SceneGame)
- **Player**: Physics-based movement with WASD/arrows, mouse/touch aim
- **EnemyPool**: Object pooling for performance (reuses enemy instances)
- **Bullets**: Object pooled, limited by quality setting
- **Vision System**: Spotlight mask with cone + base radius, updated at throttled rate
- **UI Sync**: DOM HUD updated every 10 frames (throttled)

### Quality Presets (affect performance)
| Quality | Particles | Max Enemies | Bullets | Vision Update |
|---------|-----------|-------------|---------|---------------|
| Low     | 12/60     | 30          | 25      | Every 3 frames |
| Medium  | 16/35     | 50          | 45      | Every 2 frames |
| High    | 20/25     | 80          | 60      | Every frame   |

Configured in `GameState.settings.quality` - changes apply to new spawns only.

### Performance Optimizations
- Object pooling for enemies and bullets
- Throttled updates (vision, UI, enemy AI)
- Cached player position/aim angle
- Auto low-perf mode when FPS < 45

## Edge Middleware

`pages-functions/_middleware.ts` runs on Cloudflare edge before each request:
- Security headers (CSP, HSTS)
- Bot detection headers
- Geographic headers
- Optional analytics (set `ENABLE_ANALYTICS` env var)

## Global Objects

Window-attached for debugging/extending:
- `window.GameState` - Game state, settings, load/save methods
- `window.UI` - UI element references and methods
- `window.TouchControls` - Mobile touch input state
- `window.gameScene` - Active SceneGame instance when playing

## Custom Events

```javascript
window.addEventListener('perf-low', () => {});        // FPS < 45
window.addEventListener('perf-high', () => {});       // FPS > 55
window.addEventListener('quality-change', (e) => {}); // e.detail = 'low'|'medium'|'high'
```

## Deployment Notes

- Cloudflare Pages with GitHub Actions CI/CD
- No build step (static site)
- Preview deployments auto-created on PRs
- Production deploys on main branch push
- Rollback via `npm run deploy:rollback` or Cloudflare dashboard

## Asset Credits

Game sprites from Kenney.nl. See `assets/kenney-license.txt` for licensing.
