import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const htmlPath = resolve(__dirname, '../../index.html');
const html = readFileSync(htmlPath, 'utf8');

test('Enemy group is created with max size', () => {
  assert.match(html, /this\.enemies\s*=\s*this\.physics\.add\.group/, 'Enemies should be in a physics group');
  assert.match(html, /enemyMaxCount/, 'Enemy group should have maxSize configuration');
});

test('Enemy spawning happens on edges', () => {
  assert.match(html, /spawnEnemy\(\)/, 'spawnEnemy method should exist');
  assert.match(html, /edge\s*=\s*Phaser\.Math\.Between\(0,\s*3\)/, 'Should spawn on random edge (0-3)');
});

test('Enemy spawn positions cover all four edges', () => {
  // Top edge
  assert.match(html, /y\s*=\s*-40/, 'Should spawn above top edge');
  // Right edge
  assert.match(html, /x\s*=\s*width\s*\+\s*40/, 'Should spawn beyond right edge');
  // Bottom edge
  assert.match(html, /y\s*=\s*height\s*\+\s*40/, 'Should spawn below bottom edge');
  // Left edge
  assert.match(html, /x\s*=\s*-40/, 'Should spawn beyond left edge');
});

test('Enemy pool is implemented', () => {
  assert.match(html, /class EnemyPool/, 'EnemyPool class should be defined');
  assert.match(html, /this\.pool\s*=\s*\[\]/, 'EnemyPool should have a pool array');
  assert.match(html, /this\.active\s*=\s*\[\]/, 'EnemyPool should track active enemies');
});

test('Enemy pool has get and release methods', () => {
  assert.match(html, /get\(\)/, 'EnemyPool should have get method');
  assert.match(html, /release\(/, 'EnemyPool should have release method');
});

test('Enemy speed increases with elapsed time', () => {
  assert.match(html, /enemy\.speed\s*=\s*Phaser\.Math\.Between\(70,\s*130\)\s*\+\s*Math\.min\(80,\s*this\.elapsed\s*\/\s*1000\)/, 'Enemy speed should scale with elapsed time');
});

test('Spawn delay decreases over time (difficulty scaling)', () => {
  assert.match(html, /updateDifficulty\(\)/, 'updateDifficulty method should exist');
  assert.match(html, /Math\.max\(500,\s*1400\s*-\s*tier\s*\*\s*140\)/, 'Minimum spawn delay should be 500ms');
  assert.match(html, /1400\s*-\s*tier\s*\*\s*140/, 'Initial spawn delay should decrease with tier');
});

test('Spawn event uses timer', () => {
  assert.match(html, /this\.spawnEvent\s*=\s*this\.time\.addEvent/, 'Spawn should use Phaser timer event');
  assert.match(html, /loop:\s*true/, 'Spawn event should loop');
});

test('Enemies chase player', () => {
  assert.match(html, /updateEnemies\(\)/, 'updateEnemies method should exist');
  assert.match(html, /body\.velocity\.x\s*=\s*\(dx\s*\/\s*dist\)\s*\*\s*speed/, 'Enemy velocity should move toward player X');
  assert.match(html, /body\.velocity\.y\s*=\s*\(dy\s*\/\s*dist\)\s*\*\s*speed/, 'Enemy velocity should move toward player Y');
});
