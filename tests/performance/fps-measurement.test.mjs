import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const htmlPath = resolve(__dirname, '../../index.html');
const html = readFileSync(htmlPath, 'utf8');

test('PerformanceMonitor singleton exists', () => {
  assert.match(html, /const PerformanceMonitor\s*=\s*{/, 'PerformanceMonitor object should be defined');
});

test('PerformanceMonitor tracks FPS', () => {
  assert.match(html, /fps:\s*60/, 'PerformanceMonitor should track FPS');
});

test('PerformanceMonitor tracks frame time', () => {
  assert.match(html, /frameTime:\s*16\.67/, 'PerformanceMonitor should track frame time');
});

test('PerformanceMonitor tracks memory usage', () => {
  assert.match(html, /memory:\s*0/, 'PerformanceMonitor should track memory');
});

test('PerformanceMonitor has update method', () => {
  assert.match(html, /update\(time\)\s*{/, 'PerformanceMonitor should have update method');
});

test('PerformanceMonitor checks FPS from game loop', () => {
  assert.match(html, /this\.game\.loop\.actualFps/, 'PerformanceMonitor should read actual FPS');
});

test('PerformanceMonitor calculates frame time', () => {
  assert.match(html, /this\.frameTime\s*=\s*1000\s*\/\s*fps/, 'Frame time should be calculated from FPS');
});

test('PerformanceMonitor checks memory API', () => {
  assert.match(html, /window\.performance\?\.memory/, 'PerformanceMonitor should check memory API availability');
});

test('PerformanceMonitor detects low-end devices', () => {
  assert.match(html, /fps\s*<\s*45\s*&&\s*!\s*this\.lowMode/, 'PerformanceMonitor should detect low FPS');
  assert.match(html, /this\.lowMode\s*=\s*true/, 'PerformanceMonitor should set low mode');
});

test('PerformanceMonitor detects high-end devices', () => {
  assert.match(html, /fps\s*>\s*55\s*&&\s*this\.lowMode/, 'PerformanceMonitor should detect high FPS');
  assert.match(html, /this\.lowMode\s*=\s*false/, 'PerformanceMonitor should disable low mode');
});

test('PerformanceMonitor dispatches perf-low event', () => {
  assert.match(html, /dispatchEvent\(new CustomEvent\(['"]perf-low['"]\)\)/, 'Should dispatch perf-low event');
});

test('PerformanceMonitor dispatches perf-high event', () => {
  assert.match(html, /dispatchEvent\(new CustomEvent\(['"]perf-high['"]\)\)/, 'Should dispatch perf-high event');
});

test('PerformanceMonitor has check interval', () => {
  assert.match(html, /checkInterval:\s*1000/, 'PerformanceMonitor should check every 1000ms');
});

test('PerformanceMonitor respects check interval', () => {
  assert.match(html, /time\s*-\s*this\.lastCheck\s*<\s*this\.checkInterval.*return/, 'PerformanceMonitor should skip if interval not elapsed');
});

test('Game scene updates performance monitor', () => {
  assert.match(html, /PerformanceMonitor\.update\(time\)/, 'Game scene should call PerformanceMonitor.update');
});

test('PerformanceMonitor has reset method', () => {
  assert.match(html, /reset\(\)\s*{/, 'PerformanceMonitor should have reset method');
});

test('Debug mode shows performance stats', () => {
  assert.match(html, /debug.*perfText/s, 'Performance text should exist in debug mode');
  assert.match(html, /\$\{fps\}\s*FPS/, 'Performance display should show FPS');
  assert.match(html, /\$\{mem\}/, 'Performance display should show memory');
});
