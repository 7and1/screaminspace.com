import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const htmlPath = resolve(__dirname, '../../index.html');
const html = readFileSync(htmlPath, 'utf8');

test('Skip link exists', () => {
  assert.match(html, /class="skip-link"/, 'Skip link should exist for keyboard navigation');
});

test('Skip link points to main content', () => {
  assert.match(html, /href="#main-content"/, 'Skip link should point to main content');
});

test('Skip link is visually hidden until focused', () => {
  assert.match(html, /\.skip-link[^}]*top:\s*-40px/, 'Skip link should be hidden above viewport');
  assert.match(html, /\.skip-link:focus[^}]*top:\s*0/, 'Skip link should appear on focus');
});

test('All buttons are keyboard focusable', () => {
  assert.match(html, /<button[^>]*id="start-btn"/, 'Start button should exist');
  assert.match(html, /<button[^>]*id="pause-btn"/, 'Pause button should exist');
  assert.match(html, /<button[^>]*id="settings-btn"/, 'Settings button should exist');
});

test('Game controls support keyboard', () => {
  assert.match(html, /this\.keys\s*=\s*this\.input\.keyboard\.addKeys/, 'Game should support keyboard input');
  assert.match(html, /['"]W,A,S,D,SPACE,ESC,P['"]/, 'All game keys should be registered');
});

test('Focus visible styles are defined', () => {
  assert.match(html, /:focus-visible[^}]*outline:/, 'Focus visible styles should be defined');
});

test('Focus outline has sufficient contrast', () => {
  assert.match(html, /outline:\s*2px\s*solid\s*var\(--cyan\)/, 'Focus outline should be 2px solid');
});

test('Tap highlight is disabled on mobile', () => {
  assert.match(html, /-webkit-tap-highlight-color:\s*transparent/, 'Tap highlight should be transparent');
});

test('Pause can be toggled with keyboard', () => {
  assert.match(html, /e\.key\s*===\s*['"]p['"]\s*\|\|\s*e\.key\s*===\s*['"]P['"]/, 'P key should toggle pause');
  assert.match(html, /e\.key\s*===\s*['"]Escape['"]/, 'Escape key should toggle pause');
});

test('Game can be restarted with keyboard', () => {
  assert.match(html, /keydown-R['"]/, 'R key should trigger restart');
});

test('Dialogs can be closed with Escape', () => {
  assert.match(html, /Escape.*settings.*hideSettings/s, 'Escape should close settings');
});

test('Arrow keys are supported for movement', () => {
  assert.match(html, /createCursorKeys\(\)/, 'Arrow keys should be supported via cursor keys');
});

test('Space key is supported for firing', () => {
  assert.match(html, /addKeys\(['"]W,A,S,D,SPACE,ESC,P['"]\)/, 'All game keys should be registered including SPACE');
});

test('Touch controls have aria-hidden', () => {
  assert.match(html, /id="touch-controls"[^>]*aria-hidden="true"/, 'Touch controls should be hidden from screen readers');
});

test('Game instructions show keyboard controls', () => {
  assert.match(html, /key-badge.*W.*A.*S.*D/, 'WASD keys should be shown in instructions');
  assert.match(html, /key-badge.*ESC/, 'ESC key should be shown in instructions');
});
