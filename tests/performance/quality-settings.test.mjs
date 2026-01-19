import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const htmlPath = resolve(__dirname, '../../index.html');
const html = readFileSync(htmlPath, 'utf8');

test('Quality config function exists', () => {
  assert.match(html, /const getQualityConfig\s*=\s*\(\)/, 'getQualityConfig function should exist');
});

test('Quality config has particle counts', () => {
  assert.match(html, /particleCount:\s*{/, 'Quality config should have particle counts');
});

test('Low quality has fewer engine particles', () => {
  assert.match(html, /low:\s*{[^}]*engine:\s*60/, 'Low quality should have 60ms engine particle interval');
});

test('High quality has more engine particles', () => {
  assert.match(html, /high:\s*{[^}]*engine:\s*25/, 'High quality should have 25ms engine particle interval');
});

test('Quality config has enemy max count', () => {
  assert.match(html, /enemyMaxCount:\s*{/, 'Quality config should have enemy max counts');
});

test('Quality config has bullet max size', () => {
  assert.match(html, /bulletMaxSize:\s*{/, 'Quality config should have bullet max sizes');
});

test('Quality config has vision update rate', () => {
  assert.match(html, /visionUpdateRate:\s*{/, 'Quality config should have vision update rates');
});

test('Low quality has slower vision updates', () => {
  assert.match(html, /low:\s*3,.*visionUpdateRate/s, 'Low quality vision should update every 3 frames');
});

test('High quality has faster vision updates', () => {
  assert.match(html, /high:\s*1,.*visionUpdateRate/s, 'High quality vision should update every 1 frame');
});

test('PERF_CONFIG uses quality config', () => {
  assert.match(html, /const qualityConfig\s*=\s*getQualityConfig\(\)/, 'Quality config should be retrieved');
  assert.match(html, /PERF_CONFIG/, 'PERF_CONFIG constant should exist');
});

test('Scene reads quality config', () => {
  assert.match(html, /const qualityConfig\s*=\s*getQualityConfig\(\)/s, 'Scene should get quality config');
});

test('Bullets use quality-based max size', () => {
  assert.match(html, /maxSize:\s*qualityConfig\.bulletMaxSize/, 'Bullets should use quality-based max size');
});

test('Enemies use quality-based max count', () => {
  assert.match(html, /maxSize:\s*qualityConfig\.enemyMaxCount/, 'Enemies should use quality-based max count');
});

test('Particles use quality-based frequency', () => {
  assert.match(html, /frequency:\s*particleConfig\.engine/, 'Particles should use quality-based frequency');
});

test('Quality change event is handled', () => {
  assert.match(html, /addEventListener\(['"]quality-change['"],\s*\(e\)\s*=>\s*this\.onQualityChange/, 'Quality change event should be handled');
});

test('onQualityChange method exists', () => {
  assert.match(html, /onQualityChange\(quality\)\s*{/, 'onQualityChange method should exist');
});

test('onQualityChange updates vision rate', () => {
  assert.match(html, /this\.visionUpdateRate\s*=\s*config\.visionUpdateRate/, 'Vision rate should update on quality change');
});

test('onQualityChange updates bullet max size', () => {
  assert.match(html, /this\.bullets\.maxSize\s*=\s*config\.bulletMaxSize/, 'Bullet max size should update on quality change');
});

test('onQualityChange updates enemy max count', () => {
  assert.match(html, /this\.enemies\.maxSize\s*=\s*config\.enemyMaxCount/, 'Enemy max count should update on quality change');
});

test('onQualityChange updates particle settings', () => {
  assert.match(html, /this\.engineEmitter\.setFrequency\(config\.particleCount\.engine\)/, 'Engine frequency should update on quality change');
});

test('Low-end device detection exists', () => {
  assert.match(html, /const isLowEnd\s*=\s*isMobile\s*\|\|/, 'Low-end detection should exist');
});

test('Hardware concurrency is checked', () => {
  assert.match(html, /navigator\.hardwareConcurrency\s*<=\s*2/, 'Hardware concurrency should be checked');
});

test('Mobile device detection exists', () => {
  assert.match(html, /const isMobile\s*=\s*\/Android/, 'Mobile detection regex should exist');
});
