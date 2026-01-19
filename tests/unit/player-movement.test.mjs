import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const htmlPath = resolve(__dirname, '../../index.html');
const html = readFileSync(htmlPath, 'utf8');

test('Player has WASD keyboard support', () => {
  assert.match(html, /this\.keys\s*=\s*this\.input\.keyboard\.addKeys\(['"]W,A,S,D/, 'WASD keys should be registered');
});

test('Player has arrow key support', () => {
  assert.match(html, /this\.cursors\s*=\s*this\.input\.keyboard\.createCursorKeys\(\)/, 'Arrow keys should be supported');
});

test('Player has movement acceleration', () => {
  assert.match(html, /handleMovement\(\)/, 'handleMovement method should exist');
  assert.match(html, /const accel\s*=\s*420/, 'Movement acceleration should be 420');
});

test('Player movement uses physics acceleration', () => {
  assert.match(html, /this\.player\.setAcceleration\(ax,\s*ay\)/, 'Player should use setAcceleration for movement');
});

test('Player has drag for smooth stopping', () => {
  assert.match(html, /this\.player\.setDrag\(0\.9\)/, 'Player should have drag of 0.9');
});

test('Player has max velocity cap', () => {
  assert.match(html, /this\.player\.setMaxVelocity\(280\)/, 'Player max velocity should be 280');
});

test('Player is constrained to world bounds', () => {
  assert.match(html, /this\.player\.setCollideWorldBounds\(true\)/, 'Player should collide with world bounds');
});

test('Player rotation follows aim direction', () => {
  assert.match(html, /this\.player\.setRotation\(this\.aimAngle\s*\+\s*Math\.PI\s*\/\s*2\)/, 'Player should rotate to aim angle');
});

test('Touch joystick controls are available', () => {
  assert.match(html, /TouchControls\.moveVector/, 'Touch joystick vector should exist');
  assert.match(html, /joystick-zone/, 'Joystick zone element should exist');
});

test('Joystick input contributes to acceleration', () => {
  assert.match(html, /TouchControls\.moveVector\.x.*accel/, 'Joystick X input should affect acceleration');
  assert.match(html, /TouchControls\.moveVector\.y.*accel/, 'Joystick Y input should affect acceleration');
});

test('Player has physics enabled', () => {
  assert.match(html, /this\.player\s*=\s*this\.physics\.add\.sprite/, 'Player should be a physics sprite');
});
