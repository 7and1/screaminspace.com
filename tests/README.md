# Test Suite for Scream In Space

Comprehensive testing strategy for the Phaser 3 space shooter game using Node.js native test runner.

## Test Structure

```
tests/
├── unit/                    # Unit Tests
│   ├── bullet.test.mjs
│   ├── enemy-spawning.test.mjs
│   ├── collision-detection.test.mjs
│   ├── score-calculation.test.mjs
│   ├── difficulty-scaling.test.mjs
│   └── player-movement.test.mjs
├── integration/             # Integration Tests
│   ├── scene-transitions.test.mjs
│   ├── asset-loading.test.mjs
│   ├── state-persistence.test.mjs
│   ├── pause-resume.test.mjs
│   ├── audio-system.test.mjs
│   ├── seo-files.test.mjs
│   └── smoke.test.mjs
├── e2e/                     # End-to-End Tests
│   ├── game-flow.test.mjs
│   └── settings-persistence.test.mjs
├── performance/             # Performance Tests
│   ├── fps-measurement.test.mjs
│   ├── object-pooling.test.mjs
│   ├── quality-settings.test.mjs
│   └── asset-optimization.test.mjs
└── accessibility/           # Accessibility Tests
    ├── keyboard-navigation.test.mjs
    ├── aria-attributes.test.mjs
    ├── screen-reader.test.mjs
    ├── reduced-motion.test.mjs
    └── color-contrast.test.mjs
```

## Running Tests

### Run All Tests
```bash
npm test
# or
node --test tests/**/*.test.mjs
```

### Run by Category
```bash
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:e2e            # E2E tests only
npm run test:performance    # Performance tests only
npm run test:accessibility  # Accessibility tests only
```

### Using Custom Test Runner
```bash
node tests/test-runner.mjs                    # Run all with categorized output
node tests/test-runner.mjs --category=unit    # Run specific category
```

### With Coverage
```bash
npm run test:coverage
```

## Test Categories

### Unit Tests
Test individual game components in isolation:
- **Bullet class**: Lifespan, velocity, activation/deactivation
- **Enemy spawning**: Edge positions, object pooling, speed scaling
- **Collision detection**: Bullet-enemy, player-enemy, hitboxes
- **Score calculation**: Points, kills, popup animations
- **Difficulty scaling**: Spawn rates, tier progression, heartbeat
- **Player movement**: Keyboard, touch, physics properties

### Integration Tests
Test game systems working together:
- **Scene transitions**: Boot → Game → GameOver flow
- **Asset loading**: Images, audio, texture generation
- **State persistence**: localStorage, settings management
- **Pause/Resume**: Physics pausing, timer management
- **Audio system**: Safe play wrapper, sound triggers

### E2E Tests
Test complete user flows:
- **Game flow**: Start screen → gameplay → game over
- **Settings persistence**: Settings changes persist across sessions

### Performance Tests
Verify performance optimizations:
- **FPS measurement**: PerformanceMonitor, low-end detection
- **Object pooling**: EnemyPool, bullet/enemy reuse
- **Quality settings**: Particle counts, update rates
- **Asset optimization**: Texture generation, rate limiting

### Accessibility Tests
Verify accessibility features:
- **Keyboard navigation**: Focus management, key controls
- **ARIA attributes**: Roles, labels, states
- **Screen reader**: Semantic HTML, headings, descriptions
- **Reduced motion**: Media query support, animation toggles
- **Color contrast**: WCAG compliance, high contrast mode

## CI/CD Integration

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm test

- name: Run coverage
  run: npm run test:coverage

- name: Accessibility audit
  run: npm run test:accessibility
```

## Writing New Tests

Use Node.js native test runner:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('description', () => {
  assert.ok(condition, 'message');
  assert.match(string, /pattern/);
  assert.equal(actual, expected);
});
```

## Notes

- Tests parse the HTML file directly since game logic is embedded
- No browser required for most tests (HTML parsing)
- E2E tests validate structure; actual browser tests would use Playwright
- Performance tests verify code patterns and optimization presence
- Accessibility tests check HTML markup and CSS for compliance
