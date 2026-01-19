import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const htmlPath = resolve(__dirname, '../../index.html');
const html = readFileSync(htmlPath, 'utf8');

test('Pause menu element exists', () => {
  assert.match(html, /id="pause-menu"/, 'Pause menu element should exist');
});

test('Pause function exists', () => {
  assert.match(html, /function pauseGame\(\)/, 'pauseGame function should exist');
});

test('Resume function exists', () => {
  assert.match(html, /function resumeGame\(\)/, 'resumeGame function should exist');
});

test('Pause button exists in HUD', () => {
  assert.match(html, /id="pause-btn"/, 'Pause button should exist');
});

test('Resume button exists in pause menu', () => {
  assert.match(html, /id="resume-btn"/, 'Resume button should exist');
});

test('ESC key triggers pause', () => {
  assert.match(html, /e\.key\s*===\s*['"]Escape['"]/, 'ESC key should be handled');
  assert.match(html, /pauseGame\(\)/, 'pauseGame should be called on ESC');
});

test('P key toggles pause', () => {
  assert.match(html, /e\.key\s*===\s*['"]p['"]\s*\|\|\s*e\.key\s*===\s*['"]P['"]/, 'P key should be handled');
});

test('Scene pauseGame method pauses physics', () => {
  assert.match(html, /pauseGame\(\)\s*{[^}]*this\.physics\.pause\(\)/s, 'Physics should pause');
});

test('Scene pauseGame pauses spawn event', () => {
  assert.match(html, /if\s*\(this\.spawnEvent\)\s*this\.spawnEvent\.paused\s*=\s*true/, 'Spawn event should pause');
});

test('Scene pauseGame pauses heartbeat event', () => {
  assert.match(html, /if\s*\(this\.heartbeatEvent\)\s*this\.heartbeatEvent\.paused\s*=\s*true/, 'Heartbeat event should pause');
});

test('Scene resumeGame resumes physics', () => {
  assert.match(html, /resumeGame\(\)\s*{[^}]*this\.physics\.resume\(\)/s, 'Physics should resume');
});

test('Scene resumeGame resumes spawn event', () => {
  assert.match(html, /if\s*\(this\.spawnEvent\)\s*this\.spawnEvent\.paused\s*=\s*false/, 'Spawn event should resume');
});

test('Scene pause skips update loop', () => {
  assert.match(html, /update\(time,\s*delta\)\s*{[^}]*if\s*\(this\.isPaused\)\s*return/s, 'Update should return early when paused');
});

test('Pause menu is hidden by default', () => {
  assert.match(html, /#pause-menu[^}]*visibility:\s*hidden/, 'Pause menu should be hidden by default');
});

test('Pause menu has visible class toggle', () => {
  assert.match(html, /#pause-menu\.visible[^}]*visibility:\s*visible/, 'Pause menu should have visible state');
});

test('UI has showPauseMenu method', () => {
  assert.match(html, /showPauseMenu\(\)/, 'showPauseMenu method should exist');
});

test('UI has hidePauseMenu method', () => {
  assert.match(html, /hidePauseMenu\(\)/, 'hidePauseMenu method should exist');
});

test('Restart button exists in pause menu', () => {
  assert.match(html, /id="restart-btn"/, 'Restart button should exist');
});

test('Quit button exists in pause menu', () => {
  assert.match(html, /id="quit-btn"/, 'Quit button should exist');
});
