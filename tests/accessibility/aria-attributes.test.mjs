import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const htmlPath = resolve(__dirname, '../../index.html');
const html = readFileSync(htmlPath, 'utf8');

test('Game container has role="application"', () => {
  assert.match(html, /id="game-container"[^>]*role="application"/, 'Game container should have application role');
});

test('Game container has aria-label', () => {
  assert.match(html, /id="game-container"[^>]*aria-label="Scream In Space game"/, 'Game container should have aria-label');
});

test('Start screen has role="dialog"', () => {
  assert.match(html, /id="start-screen"[^>]*role="dialog"/, 'Start screen should have dialog role');
});

test('Start screen has aria-labelledby', () => {
  assert.match(html, /id="start-screen"[^>]*aria-labelledby="game-title"/, 'Start screen should be labelled by title');
});

test('Start screen has aria-describedby', () => {
  assert.match(html, /id="start-screen"[^>]*aria-describedby="game-subtitle"/, 'Start screen should be described by subtitle');
});

test('Pause menu has role="dialog"', () => {
  assert.match(html, /id="pause-menu"[^>]*role="dialog"/, 'Pause menu should have dialog role');
});

test('Pause menu has aria-labelledby', () => {
  assert.match(html, /id="pause-menu"[^>]*aria-labelledby="pause-title"/, 'Pause menu should be labelled');
});

test('Settings panel has role="dialog"', () => {
  assert.match(html, /id="settings-panel"[^>]*role="dialog"/, 'Settings panel should have dialog role');
});

test('Settings panel has aria-labelledby', () => {
  assert.match(html, /id="settings-panel"[^>]*aria-labelledby="settings-title"/, 'Settings panel should be labelled');
});

test('Game over screen has role="dialog"', () => {
  assert.match(html, /id="game-over-screen"[^>]*role="dialog"/, 'Game over screen should have dialog role');
});

test('Game over screen has aria-labelledby', () => {
  assert.match(html, /id="game-over-screen"[^>]*aria-labelledby="game-over-title"/, 'Game over screen should be labelled');
});

test('Health bar has role="progressbar"', () => {
  assert.match(html, /role="progressbar"[^>]*aria-label="Health"/, 'Health bar should have progressbar role');
});

test('Health bar has aria-valuenow', () => {
  assert.match(html, /aria-valuenow="100"/, 'Health bar should have initial value');
});

test('Health bar has aria-valuemin', () => {
  assert.match(html, /aria-valuemin="0"/, 'Health bar should have min value');
});

test('Health bar has aria-valuemax', () => {
  assert.match(html, /aria-valuemax="100"/, 'Health bar should have max value');
});

test('Toggle buttons have aria-pressed', () => {
  assert.match(html, /id="sound-toggle"[^>]*aria-pressed/, 'Sound toggle should have aria-pressed');
  assert.match(html, /id="crt-toggle"[^>]*aria-pressed/, 'CRT toggle should have aria-pressed');
  assert.match(html, /id="motion-toggle"[^>]*aria-pressed/, 'Motion toggle should have aria-pressed');
});

test('Quality options have role="radio"', () => {
  assert.match(html, /data-quality="low"[^>]*role="radio"/, 'Low quality option should have radio role');
  assert.match(html, /data-quality="medium"[^>]*role="radio"/, 'Medium quality option should have radio role');
  assert.match(html, /data-quality="high"[^>]*role="radio"/, 'High quality option should have radio role');
});

test('Quality options have aria-checked', () => {
  assert.match(html, /aria-checked="true"/, 'Quality options should have aria-checked');
});

test('Quality options group has role="radiogroup"', () => {
  assert.match(html, /class="quality-options"[^>]*role="radiogroup"/, 'Quality group should have radiogroup role');
});

test('Quality group has aria-label', () => {
  assert.match(html, /role="radiogroup"[^>]*aria-label="Quality setting"/, 'Quality group should have label');
});

test('Buttons have aria-label where needed', () => {
  assert.match(html, /id="settings-btn"[^>]*aria-label="Settings"/, 'Settings button should have aria-label');
  assert.match(html, /id="pause-btn"[^>]*aria-label="Pause"/, 'Pause button should have aria-label');
});

test('Decorative elements have aria-hidden', () => {
  assert.match(html, /id="damage-overlay"[^>]*aria-hidden="true"/, 'Damage overlay should be hidden');
  assert.match(html, /id="hud"[^>]*aria-hidden="true"/, 'HUD should be hidden from screen readers');
});

test('Touch controls are hidden from screen readers', () => {
  assert.match(html, /id="touch-controls"[^>]*aria-hidden="true"/, 'Touch controls should be hidden');
});
