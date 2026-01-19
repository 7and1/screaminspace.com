import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const htmlPath = resolve(__dirname, '../../index.html');
const html = readFileSync(htmlPath, 'utf8');

test('Safe play wrapper function exists', () => {
  assert.match(html, /const safePlay\s*=\s*\(scene,\s*key,\s*config\)/, 'safePlay function should exist');
});

test('Safe play respects sound setting', () => {
  assert.match(html, /safePlay.*GameState\.settings\.sound.*return/s, 'safePlay should return early if sound is disabled');
});

test('Safe play checks if audio exists in cache', () => {
  assert.match(html, /scene\.cache\.audio\.exists\(key\)/, 'safePlay should check if audio exists before playing');
});

test('Safe play plays sound with config', () => {
  assert.match(html, /scene\.sound\.play\(key,\s*config\)/, 'safePlay should play sound with provided config');
});

test('Laser sound plays on shoot', () => {
  assert.match(html, /safePlay\(this,\s*['"]laser['"]/, 'Laser sound should play on shoot');
});

test('Hit sound plays on player damage', () => {
  assert.match(html, /safePlay\(this,\s*['"]hit['"]/, 'Hit sound should play on player damage');
});

test('Scream sound plays on game over', () => {
  assert.match(html, /safePlay\(this,\s*['"]scream['"]/, 'Scream sound should play on game over');
});

test('Heartbeat sound loops during gameplay', () => {
  assert.match(html, /heartbeatEvent.*loop:\s*true/s, 'Heartbeat event should loop');
  assert.match(html, /safePlay\(this,\s*['"]heartbeat['"]/, 'Heartbeat sound should play');
});

test('All sounds stop on game over', () => {
  assert.match(html, /this\.sound\.stopAll\(\)/, 'All sounds should stop on game over');
});

test('Heartbeat event exists and is timed', () => {
  assert.match(html, /this\.heartbeatEvent\s*=\s*this\.time\.addEvent/, 'Heartbeat event should be a timed event');
  assert.match(html, /delay:\s*1200/, 'Heartbeat initial delay should be 1200ms');
});

test('Sound toggle button exists in settings', () => {
  assert.match(html, /id="sound-toggle"/, 'Sound toggle button should exist');
  assert.match(html, /aria-pressed/, 'Sound toggle should have aria-pressed attribute');
});

test('Heartbeat rate varies with health', () => {
  assert.match(html, /heartbeatEvent\.delay\s*=\s*heartbeatDelay/, 'Heartbeat delay should be variable');
});

test('Audio files are loaded with array fallback', () => {
  assert.match(html, /this\.load\.audio\(['"]scream['"],\s*\[/, 'Audio should be loaded with array format for fallbacks');
});
