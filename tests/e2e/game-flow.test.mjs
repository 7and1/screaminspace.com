import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const htmlPath = resolve(__dirname, '../../index.html');
const html = readFileSync(htmlPath, 'utf8');

// Tests verify the structure and hooks for E2E testing
// Actual E2E tests would run in a browser with Playwright or Puppeteer

test('Start screen element exists', () => {
  assert.match(html, /id="start-screen"/, 'Start screen element should exist');
});

test('Start button exists', () => {
  assert.match(html, /id="start-btn"/, 'Start button should exist');
});

test('Start button has accessible label', () => {
  assert.match(html, /Initialize Mission/, 'Start button should have descriptive text');
});

test('Start screen has game title', () => {
  assert.match(html, /id="game-title"/, 'Game title element should exist');
  assert.match(html, /Scream In Space/, 'Game title should contain game name');
});

test('Start screen has instructions', () => {
  assert.match(html, /class="instructions"/, 'Instructions container should exist');
});

test('Movement instructions are displayed', () => {
  assert.match(html, /Move ship/, 'Movement instructions should be shown');
});

test('Aim instructions are displayed', () => {
  assert.match(html, /Aim flashlight/, 'Aim instructions should be shown');
});

test('Fire instructions are displayed', () => {
  assert.match(html, /Fire weapon/, 'Fire instructions should be shown');
});

test('Pause instructions are displayed', () => {
  assert.match(html, /Pause game/, 'Pause instructions should be shown');
});

test('Game over screen element exists', () => {
  assert.match(html, /id="game-over-screen"/, 'Game over screen element should exist');
});

test('Game over has retry button', () => {
  assert.match(html, /id="retry-btn"/, 'Retry button should exist');
});

test('Game over has menu button', () => {
  assert.match(html, /id="menu-btn"/, 'Menu button should exist');
});

test('Game over displays final score', () => {
  assert.match(html, /Final Score:/, 'Final score should be displayed on game over');
});

test('Game over displays kill count', () => {
  assert.match(html, /Enemies Eliminated:/, 'Kill count should be displayed on game over');
});

test('HUD element exists', () => {
  assert.match(html, /id="hud"/, 'HUD element should exist');
});

test('HUD displays score', () => {
  assert.match(html, /id="score-value"/, 'Score value element should exist in HUD');
});

test('HUD displays kills', () => {
  assert.match(html, /id="kills-value"/, 'Kills value element should exist in HUD');
});

test('HUD displays health bar', () => {
  assert.match(html, /id="health-bar"/, 'Health bar element should exist in HUD');
});

test('Health bar has ARIA role', () => {
  assert.match(html, /role="progressbar"[^>]*aria-label="Health"/, 'Health bar should have progressbar role');
});

test('Health bar has ARIA values', () => {
  assert.match(html, /aria-valuenow="100"/, 'Health bar should have initial value');
  assert.match(html, /aria-valuemin="0"/, 'Health bar should have min value');
  assert.match(html, /aria-valuemax="100"/, 'Health bar should have max value');
});

test('Start function hides start screen', () => {
  assert.match(html, /function startGame\(\)[^}]*UI\.hideStartScreen\(\)/s, 'Starting game should hide start screen');
});

test('Start function shows HUD', () => {
  assert.match(html, /function startGame\(\)[\s\S]*UI\.hideStartScreen\(\)/, 'Starting game should hide start screen');
  assert.match(html, /hideStartScreen\(\)[\s\S]*hud.*visible/s, 'HUD visibility should change');
});

test('Game container has application role', () => {
  assert.match(html, /id="game-container"[^>]*role="application"/, 'Game container should have application role');
});

test('Game container has accessible label', () => {
  assert.match(html, /id="game-container"[^>]*aria-label="Scream In Space game"/, 'Game container should have aria-label');
});
