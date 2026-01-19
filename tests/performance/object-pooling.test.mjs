import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const htmlPath = resolve(__dirname, '../../index.html');
const html = readFileSync(htmlPath, 'utf8');

test('EnemyPool class is defined', () => {
  assert.match(html, /class EnemyPool/, 'EnemyPool class should be defined');
});

test('EnemyPool has pool array', () => {
  assert.match(html, /this\.pool\s*=\s*\[\]/, 'EnemyPool should have pool array');
});

test('EnemyPool has active array', () => {
  assert.match(html, /this\.active\s*=\s*\[\]/, 'EnemyPool should have active array');
});

test('EnemyPool has maxSize property', () => {
  assert.match(html, /this\.maxSize\s*=\s*maxSize/, 'EnemyPool should have maxSize');
});

test('EnemyPool has get method', () => {
  assert.match(html, /get\(\)\s*{/, 'EnemyPool should have get method');
});

test('EnemyPool get reuses from pool', () => {
  assert.match(html, /this\.pool\.pop\(\)/, 'EnemyPool should pop from pool when available');
});

test('EnemyPool get adds to active', () => {
  assert.match(html, /this\.active\.push\(enemy\)/, 'EnemyPool should add to active when getting');
});

test('EnemyPool has release method', () => {
  assert.match(html, /release\(enemy\)\s*{/, 'EnemyPool should have release method');
});

test('EnemyPool release removes from active', () => {
  assert.match(html, /this\.active\.splice\(idx,\s*1\)/, 'EnemyPool should remove from active on release');
});

test('EnemyPool release adds back to pool', () => {
  assert.match(html, /this\.pool\.push\(enemy\)/, 'EnemyPool should push back to pool on release');
});

test('EnemyPool has getActive method', () => {
  assert.match(html, /getActive\(\)\s*{/, 'EnemyPool should have getActive method');
  assert.match(html, /return\s*this\.active/, 'getActive should return active array');
});

test('EnemyPool has forEach method', () => {
  assert.match(html, /forEach\(callback\)\s*{/, 'EnemyPool should have forEach method');
});

test('Bullets use object pooling', () => {
  assert.match(html, /this\.bullets\s*=\s*this\.physics\.add\.group\({[^}]*classType:\s*Bullet/s, 'Bullets should use classType for pooling');
  assert.match(html, /maxSize:\s*\w+\.bulletMaxSize/, 'Bullets should have maxSize for pooling');
});

test('Enemies use object pooling', () => {
  assert.match(html, /this\.enemies\s*=\s*this\.physics\.add\.group\({[^}]*maxSize/s, 'Enemies should have maxSize for pooling');
});

test('Bullets reuse inactive instances', () => {
  assert.match(html, /this\.bullets\.get\(\)/, 'Bullets should use get method for pooling');
});

test('Enemies reuse inactive instances', () => {
  assert.match(html, /this\.enemies\.get\(/, 'Enemies should use get method for pooling');
});

test('Game scene creates enemy pool', () => {
  assert.match(html, /this\.enemyPool\s*=\s*new EnemyPool\(/, 'Game scene should create enemy pool instance');
});

test('Max sizes vary by quality level', () => {
  assert.match(html, /bulletMaxSize:\s*{[^}]*low:/, 'Bullet max size should vary by quality');
  assert.match(html, /enemyMaxCount:\s*{[^}]*low:/, 'Enemy max count should vary by quality');
});

test('Particles have maxParticles limit', () => {
  assert.match(html, /maxParticles:/, 'Particle emitters should have maxParticles limit');
});

test('Engine particles are limited on low-end devices', () => {
  assert.match(html, /maxParticles:\s*this\.lowPerfMode\s*\?\s*30\s*:\s*50/, 'Engine particles should be fewer on low-end');
});
