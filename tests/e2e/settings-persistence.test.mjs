import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const htmlPath = resolve(__dirname, '../../index.html');
const html = readFileSync(htmlPath, 'utf8');

test('Settings panel element exists', () => {
  assert.match(html, /id="settings-panel"/, 'Settings panel element should exist');
});

test('Settings button exists in HUD', () => {
  assert.match(html, /id="settings-btn"/, 'Settings button should exist');
  assert.match(html, /aria-label="Settings"/, 'Settings button should have aria-label');
});

test('Settings panel has dialog role', () => {
  assert.match(html, /id="settings-panel"[^>]*role="dialog"/, 'Settings panel should have dialog role');
});

test('Settings panel has labelledby', () => {
  assert.match(html, /id="settings-panel"[^>]*aria-labelledby="settings-title"/, 'Settings panel should be labelled');
});

test('Sound toggle exists', () => {
  assert.match(html, /id="sound-toggle"/, 'Sound toggle button should exist');
});

test('Sound toggle has pressed state', () => {
  assert.match(html, /id="sound-toggle"[^>]*aria-pressed/, 'Sound toggle should track pressed state');
});

test('CRT toggle exists', () => {
  assert.match(html, /id="crt-toggle"/, 'CRT toggle button should exist');
});

test('CRT toggle has pressed state', () => {
  assert.match(html, /id="crt-toggle"[^>]*aria-pressed/, 'CRT toggle should track pressed state');
});

test('Reduced motion toggle exists', () => {
  assert.match(html, /id="motion-toggle"/, 'Motion toggle button should exist');
});

test('Quality options exist', () => {
  assert.match(html, /class="quality-options"/, 'Quality options container should exist');
});

test('Quality options have radiogroup role', () => {
  assert.match(html, /class="quality-options"[^>]*role="radiogroup"/, 'Quality options should have radiogroup role');
});

test('Low quality option exists', () => {
  assert.match(html, /data-quality="low"[^>]*role="radio"/, 'Low quality option should exist');
});

test('Medium quality option exists', () => {
  assert.match(html, /data-quality="medium"[^>]*role="radio"/, 'Medium quality option should exist');
});

test('High quality option exists', () => {
  assert.match(html, /data-quality="high"[^>]*role="radio"/, 'High quality option should exist');
});

test('Quality options have aria-checked', () => {
  assert.match(html, /aria-checked="true"/, 'Quality options should have aria-checked state');
});

test('Settings close button exists', () => {
  assert.match(html, /id="settings-close-btn"/, 'Settings close button should exist');
});

test('Sound toggle click handler exists', () => {
  assert.match(html, /sound-toggle.*addEventListener\(['"]click['"]/s, 'Sound toggle should have click handler');
});

test('CRT toggle click handler exists', () => {
  assert.match(html, /crt-toggle.*addEventListener\(['"]click['"]/s, 'CRT toggle should have click handler');
});

test('Motion toggle click handler exists', () => {
  assert.match(html, /motion-toggle.*addEventListener\(['"]click['"]/s, 'Motion toggle should have click handler');
});

test('Quality option click handlers exist', () => {
  assert.match(html, /quality-option.*addEventListener\(['"]click['"]/s, 'Quality options should have click handlers');
});

test('Settings save after change', () => {
  assert.match(html, /GameState\.settings\.\w+\s*=\s*!.*GameState\.settings\.\w+.*saveSettings\(\)/s, 'Settings should save after toggle change');
});

test('Settings apply to UI on change', () => {
  assert.match(html, /this\.classList\.toggle\(['"]active['"],\s*GameState\.settings\.\w+\)/, 'Toggle should update active class');
});

test('CRT overlay visibility is controlled by setting', () => {
  assert.match(html, /crt-overlay.*style\.display\s*=\s*GameState\.settings\.crtEffects/s, 'CRT overlay display should be controlled by setting');
});

test('Settings panel is hidden by default', () => {
  assert.match(html, /#settings-panel[^}]*visibility:\s*hidden/, 'Settings panel should be hidden by default');
});

test('Settings panel has visible class', () => {
  assert.match(html, /#settings-panel\.visible[^}]*visibility:\s*visible/, 'Settings panel should have visible state');
});

test('Settings are loaded on page load', () => {
  assert.match(html, /loadSettings\(\);/, 'Settings should be loaded on initialization');
});
