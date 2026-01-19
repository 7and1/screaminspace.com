# Contributing to Scream In Space

Thank you for your interest in contributing! This document outlines the standards and processes for contributing to the project.

## Code Standards

### JavaScript

- **ES6+ syntax**: Use modern JavaScript features
- **Strict mode**: All code runs in strict mode
- **Naming conventions**:
  - Classes: `PascalCase` (e.g., `SceneGame`)
  - Functions/variables: `camelCase` (e.g., `updateEnemies`)
  - Constants: `UPPER_SNAKE_CASE` (e.g., `GAME_WIDTH`)
- **Comments**: Document complex logic, game state changes, and non-obvious optimizations

### HTML/CSS

- **Semantic HTML**: Use proper ARIA labels and roles
- **Accessibility**: All interactive elements must be keyboard accessible
- **CSS organization**: Group related styles with clear section comments

### Code Organization

Since this project uses inline scripts in `index.html`:

1. **Keep sections clearly marked** with comment headers
2. **Don't mix concerns**: UI logic separate from game logic
3. **Maintain order**: Utilities -> Classes -> Scene definitions -> Game instantiation

```javascript
// ============ Section Name ============
```

## Testing Requirements

All changes must pass the existing test suite:

```bash
node --test tests/**/*.test.mjs
```

### Writing New Tests

Tests use Node.js built-in test runner. Create new test files in:
- `tests/unit/` - Unit tests for individual components
- `tests/integration/` - Integration tests for full workflows

Example test structure:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('descriptive test name', () => {
  // Arrange
  const input = 'value';

  // Act
  const result = someFunction(input);

  // Assert
  assert.equal(result, 'expected');
});
```

### Test Coverage

- New features require unit tests
- Bug fixes require regression tests
- UI changes require integration tests

## Pull Request Process

### Before Submitting

1. **Update tests** for any changed behavior
2. **Run full test suite** and ensure all pass
3. **Test manually** in multiple browsers if applicable
4. **Update documentation** if behavior changes

### PR Title Format

```
[type]: brief description

Types: feat, fix, docs, refactor, test, perf, style
```

Examples:
- `feat: add new enemy type with tracking behavior`
- `fix: resolve memory leak in particle system`
- `docs: update deployment instructions`

### PR Description Template

```markdown
## Summary
Brief description of changes

## Changes
- Change 1
- Change 2

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Browser Testing
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if applicable)
```

### Review Process

1. **Automated checks**: Tests must pass
2. **Code review**: Maintainer review required
3. **Testing**: Changes tested in staging/locally
4. **Merge**: Squash and merge to main

## Development Workflow

### Feature Development

1. Create a new branch from `main`
2. Implement feature with tests
3. Update documentation as needed
4. Submit pull request

### Bug Fixes

1. Create issue describing bug (if none exists)
2. Create branch with descriptive name (e.g., `fix/enemy-spawn-crash`)
3. Write failing test demonstrating bug
4. Fix bug, test passes
5. Submit PR with issue reference

## Performance Guidelines

This is a browser game targeting 60 FPS. Follow these guidelines:

- **Object pooling**: Reuse objects instead of creating/destroying
- **Avoid allocations in update loops**: Pre-allocate vectors/objects
- **Throttle expensive operations**: Use frame count checks
- **Quality settings**: Test on Low quality preset

```javascript
// Good - cached values
this.cachedPlayerPos.x = this.player.x;
this.cachedPlayerPos.y = this.player.y;

// Bad - creating new objects in loop
const pos = new Phaser.Math.Vector2(this.player.x, this.player.y);
```

## Accessibility Standards

- **Keyboard navigation**: All actions must be keyboard-accessible
- **ARIA labels**: Screen reader support for UI elements
- **Reduced motion**: Respect `prefers-reduced-motion`
- **High contrast**: Support `prefers-contrast: high`

## Asset Guidelines

When adding new assets:

1. **Optimize images**: Use appropriate formats (PNG for sprites, WebP for photos)
2. **Size limits**: Keep individual assets under 100KB
3. **Licensing**: Only use assets with clear licensing (CC0, CC-BY, etc.)
4. **Credits**: Update asset credits in README.md

## Questions?

Open an issue for discussion before starting significant work.
