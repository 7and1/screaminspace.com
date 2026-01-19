# Scream In Space

A sci-fi horror top-down survival shooter built with Phaser 3. Fight through the dark, feel the CRT glitch, and survive the void.

## Overview

Scream In Space is a single-page HTML5 game that runs entirely in the browser. Players control a spaceship with a limited-vision flashlight, fighting off waves of enemies in a dark, atmospheric environment with retro CRT effects.

- **Genre**: Survival Shooter / Sci-Fi Horror
- **Tech Stack**: Phaser 3, Vanilla JavaScript, HTML5 Canvas
- **Deployment**: Cloudflare Pages
- **License**: See [assets/kenney-license.txt](assets/kenney-license.txt) for asset licensing

## Quick Start

### Play the Game

Visit [https://screaminspace.com](https://screaminspace.com) and click "Initialize Mission" to start.

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd screaminspace.com
   ```

2. **Serve locally**
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js
   npx serve .

   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**
   Navigate to `http://localhost:8000`

## Game Controls

| Action | Desktop | Mobile |
|--------|---------|--------|
| Move Ship | W, A, S, D or Arrow Keys | Left Joystick |
| Aim Flashlight | Mouse | Tap/Drag on screen |
| Fire Weapon | Click or Spacebar | Right Button (FIRE) |
| Pause | ESC or P | - |

## Project Structure

```
screaminspace.com/
├── index.html          # Main game file (all game code inline)
├── 404.html            # Custom 404 page
├── robots.txt          # SEO robots file
├── sitemap.xml         # SEO sitemap
├── og-image.png        # Open Graph preview image
├── assets/             # Game assets
│   ├── player.png      # Player spaceship
│   ├── enemy.png       # Enemy sprites
│   ├── bullet.png      # Projectile
│   └── kenney-license.txt
└── tests/              # Test suites
    ├── unit/           # Unit tests
    └── integration/    # Integration tests
```

## Development Setup

### Prerequisites

- Node.js 18+ (for running tests)
- Any local web server (for development)

### Running Tests

```bash
# Run all tests
node --test tests/**/*.test.mjs

# Run specific test suite
node --test tests/unit/html-structure.test.mjs
node --test tests/integration/seo-files.test.mjs

# Run with verbose output
node --test --verbose tests/**/*.test.mjs
```

### Game Configuration

Game settings are configurable in the `GameState.settings` object within `index.html`:

```javascript
settings: {
  sound: true,           // Enable audio effects
  crtEffects: true,      // Enable CRT scanline overlay
  reducedMotion: false,  // Disable animations
  quality: 'medium'      // 'low', 'medium', or 'high'
}
```

### Performance Profiles

Quality settings affect:
- **Particle counts** (engine trail, explosions)
- **Max enemy count** (30-80 enemies)
- **Bullet pool size** (25-60 bullets)
- **Vision update rate** (optimizes rendering)

## Deployment

### Cloudflare Pages

The site is configured for Cloudflare Pages deployment:

1. **Connect repository** to Cloudflare Pages
2. **Build settings** (leave empty for static site):
   - Build command: (empty)
   - Build output directory: `/`
3. **Environment variables**: (none required)

### Manual Deployment

```bash
# Deploy to Cloudflare Pages via Wrangler
npm install -g wrangler
wrangler pages deploy . --project-name=screaminspace

# Or simply upload files to any static host
```

## Troubleshooting

### Game won't start

1. Check browser console for errors (F12)
2. Verify assets are loading in Network tab
3. Try clearing browser cache
4. Disable browser extensions that may block scripts

### Poor performance

1. Open settings (gear icon)
2. Set Quality to "Low"
3. Disable CRT effects
4. Enable Reduced Motion

### Audio not playing

1. Click the page first (browsers block auto-play)
2. Check Sound toggle in settings
3. Verify browser is not muted

### Touch controls not appearing

- Touch controls appear automatically on touch devices
- Ensure you're not requesting desktop site

## Asset Credits

Game assets sourced from [Kenney.nl](https://kenney.nl) assets. See `assets/kenney-license.txt` for full licensing information.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on contributing to the project.

## License

Copyright (c) 2025. All rights reserved.
