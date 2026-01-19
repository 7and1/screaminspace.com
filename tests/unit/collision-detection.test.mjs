import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const htmlPath = resolve(__dirname, '../../index.html');
const html = readFileSync(htmlPath, 'utf8');

test('Bullet-enemy collision is registered', () => {
  assert.match(html, /physics\.add\.overlap\(this\.bullets,\s*this\.enemies/, 'Should detect bullet-enemy overlap');
  assert.match(html, /handleBulletHit/, 'Should have handleBulletHit callback');
});

test('Player-enemy collision is registered', () => {
  assert.match(html, /physics\.add\.overlap\(this\.player,\s*this\.enemies/, 'Should detect player-enemy overlap');
  assert.match(html, /handlePlayerHit/, 'Should have handlePlayerHit callback');
});

test('Bullet hit destroys both bullet and enemy', () => {
  assert.match(html, /bullet\.setActive\(false\)/, 'Bullet should be deactivated on hit');
  assert.match(html, /bullet\.setVisible\(false\)/, 'Bullet should be hidden on hit');
  assert.match(html, /enemy\.setActive\(false\)/, 'Enemy should be deactivated on hit');
  assert.match(html, /enemy\.setVisible\(false\)/, 'Enemy should be hidden on hit');
});

test('Bullet hit stops physics bodies', () => {
  assert.match(html, /bullet\.body\.stop\(\)/, 'Bullet body should stop on hit');
  assert.match(html, /enemy\.body\.stop\(\)/, 'Enemy body should stop on hit');
});

test('Player hit triggers invulnerability frame', () => {
  assert.match(html, /invulnerableUntil/, 'Should track invulnerability time');
  assert.match(html, /now\s*<\s*this\.invulnerableUntil/, 'Should check invulnerability before applying damage');
  assert.match(html, /invulnerableUntil\s*=\s*now\s*\+\s*500/, 'Invulnerability should last 500ms');
});

test('Player hit reduces health', () => {
  assert.match(html, /this\.health\s*-=\s*Phaser\.Math\.Between\(8,\s*14\)/, 'Player hit should reduce health by 8-14');
});

test('Player hit triggers visual effects', () => {
  assert.match(html, /cameras\.main\.shake\(/, 'Camera should shake on player hit');
  assert.match(html, /showDamageEffect\(\)/, 'Damage overlay should show on player hit');
  assert.match(html, /triggerGlitch\(\)/, 'Glitch effect should trigger on player hit');
});

test('Player hit plays sound', () => {
  assert.match(html, /safePlay\(this,\s*['"]hit['"]/, 'Hit sound should play on player hit');
});

test('Death triggers game over scene', () => {
  assert.match(html, /this\.health\s*<=\s*0/, 'Should check for death condition');
  assert.match(html, /scene\.start\(['"]SceneGameOver['"]/, 'Should transition to game over scene on death');
  assert.match(html, /score:\s*this\.score,\s*kills:\s*this\.kills/, 'Should pass score and kills to game over');
});

test('Player body size is adjusted for hitbox', () => {
  assert.match(html, /body\.setSize\(.*displayWidth.*0\.6/, 'Player hitbox should be 60% of display width');
});

test('Enemy body size is adjusted for hitbox', () => {
  assert.match(html, /enemy\.body\.setSize\(.*displayWidth.*0\.6/, 'Enemy hitbox should be 60% of display width');
});
