import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const htmlPath = resolve(__dirname, '../../index.html');
const html = readFileSync(htmlPath, 'utf8');

test('Difficulty scales with elapsed time', () => {
  assert.match(html, /updateDifficulty\(\)/, 'updateDifficulty method should exist');
  assert.match(html, /this\.elapsed/, 'Elapsed time should be tracked');
});

test('Difficulty has 7 tiers (0-6)', () => {
  assert.match(html, /Math\.min\(6,\s*Math\.floor\(this\.elapsed\s*\/\s*20000\)\)/, 'Difficulty tier should be capped at 6');
  assert.match(html, /20000/, 'Each difficulty tier should last 20 seconds');
});

test('Spawn delay decreases with difficulty tier', () => {
  assert.match(html, /1400\s*-\s*tier\s*\*\s*140/, 'Spawn delay should decrease by 140ms per tier');
});

test('Minimum spawn delay is 500ms (maximum difficulty)', () => {
  assert.match(html, /Math\.max\(500,\s*1400/, 'Minimum spawn delay should be 500ms');
});

test('Spawn event resets with new delay', () => {
  assert.match(html, /this\.spawnEvent\.reset\(/, 'Spawn event should reset when delay changes');
});

test('Enemy speed increases with elapsed time', () => {
  assert.match(html, /Phaser\.Math\.Between\(70,\s*130\)\s*\+\s*Math\.min\(80,\s*this\.elapsed\s*\/\s*1000\)/, 'Enemy speed should increase over time');
});

test('Maximum enemy speed increase is capped', () => {
  assert.match(html, /Math\.min\(80,\s*this\.elapsed\s*\/\s*1000\)/, 'Speed bonus should be capped at 80');
});

test('Heartbeat rate increases as health decreases', () => {
  assert.match(html, /heartbeatDelay\s*=\s*Phaser\.Math\.Linear\(300,\s*1200,\s*healthRatio\)/, 'Heartbeat should be linearly interpolated');
  assert.match(html, /300/, 'Minimum heartbeat delay should be 300ms (low health)');
  assert.match(html, /1200/, 'Maximum heartbeat delay should be 1200ms (full health)');
});

test('Initial spawn delay is 1400ms', () => {
  assert.match(html, /this\.spawnDelay\s*=\s*1400/, 'Initial spawn delay should be 1400ms');
});

test('Quality settings affect enemy max count', () => {
  assert.match(html, /enemyMaxCount:\s*{[^}]*low:\s*30/, 'Low quality should limit enemies to 30');
  assert.match(html, /enemyMaxCount:\s*{[^}]*medium:\s*50/, 'Medium quality should limit enemies to 50');
  assert.match(html, /enemyMaxCount:\s*{[^}]*high:\s*80/, 'High quality should limit enemies to 80');
});
