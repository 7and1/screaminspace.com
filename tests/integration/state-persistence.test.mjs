import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const htmlPath = resolve(__dirname, '../../index.html');
const html = readFileSync(htmlPath, 'utf8');

test('GameState object is defined', () => {
  assert.match(html, /const GameState\s*=\s*{/, 'GameState object should be defined');
});

test('GameState tracks playing state', () => {
  assert.match(html, /isPlaying:\s*false/, 'GameState should track isPlaying');
});

test('GameState tracks paused state', () => {
  assert.match(html, /isPaused:\s*false/, 'GameState should track isPaused');
});

test('GameState has settings object', () => {
  assert.match(html, /settings:\s*{/, 'GameState should have settings object');
});

test('Sound setting is persisted', () => {
  assert.match(html, /sound:\s*true/, 'Sound setting should default to true');
  assert.match(html, /loadSettings\(\)/, 'loadSettings function should exist');
  assert.match(html, /saveSettings\(\)/, 'saveSettings function should exist');
});

test('Settings are loaded from localStorage', () => {
  assert.match(html, /localStorage\.getItem\(['"]screaminspace-settings['"]\)/, 'Settings should load from localStorage');
});

test('Settings are saved to localStorage', () => {
  assert.match(html, /localStorage\.setItem\(['"]screaminspace-settings['"],\s*JSON\.stringify/, 'Settings should save to localStorage');
});

test('Settings load handles errors gracefully', () => {
  assert.match(html, /const loadSettings\s*=\s*\(\)\s*=>\s*{[\s\S]*try\s*{[\s\S]*}\s*catch\s*\(e\)/, 'Settings load should be wrapped in try-catch');
  assert.match(html, /Could not load settings/, 'Load errors should be warned');
});

test('Settings save handles errors gracefully', () => {
  assert.match(html, /const saveSettings\s*=\s*\(\)\s*=>\s*{[\s\S]*try\s*{[\s\S]*}\s*catch\s*\(e\)/, 'Settings save should be wrapped in try-catch');
  assert.match(html, /Could not save settings/, 'Save errors should be warned');
});

test('CRT effects setting exists', () => {
  assert.match(html, /crtEffects:\s*true/, 'CRT effects setting should default to true');
});

test('Reduced motion setting exists', () => {
  assert.match(html, /reducedMotion:\s*false/, 'Reduced motion setting should default to false');
});

test('Quality setting exists', () => {
  assert.match(html, /quality:\s*['"]medium['"]/, 'Quality setting should default to medium');
});

test('Settings are applied to DOM', () => {
  assert.match(html, /applySettings\(\)/, 'applySettings function should exist');
});

test('Settings are merged on load', () => {
  assert.match(html, /GameState\.settings\s*=\s*{\s*\.\.\.GameState\.settings,\s*\.\.\.JSON\.parse/, 'Settings should be merged with defaults');
});

test('Settings are loaded on page load', () => {
  assert.match(html, /loadSettings\(\);/, 'Settings should be loaded on initialization');
});
