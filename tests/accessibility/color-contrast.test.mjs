import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const htmlPath = resolve(__dirname, '../../index.html');
const html = readFileSync(htmlPath, 'utf8');

test('CSS variables for colors are defined', () => {
  assert.match(html, /:root[^}]*--bg:\s*#05060a/, 'Background color should be defined');
  assert.match(html, /--cyan:\s*#00f5ff/, 'Cyan color should be defined');
  assert.match(html, /--red:\s*#ff2d55/, 'Red color should be defined');
  assert.match(html, /--text:\s*#d9e6ff/, 'Text color should be defined');
});

test('Text color provides good contrast', () => {
  assert.match(html, /--text:\s*#d9e6ff/, 'Text color should be light (#d9e6ff) on dark background');
});

test('Muted text color exists', () => {
  assert.match(html, /--muted:\s*#6c7b9d/, 'Muted text color should be defined');
});

test('Focus outline color provides contrast', () => {
  assert.match(html, /outline:\s*2px\s*solid\s*var\(--cyan\)/, 'Focus outline should use cyan for visibility');
});

test('High contrast media query exists', () => {
  assert.match(html, /@media\s*\(prefers-contrast:\s*high\)/, 'High contrast media query should exist');
});

test('Button borders increase in high contrast mode', () => {
  assert.match(html, /prefers-contrast[^}]*\.btn[^}]*border-width:\s*2px/s, 'Button borders should be thicker in high contrast');
});

test('Health bar border increases in high contrast', () => {
  assert.match(html, /prefers-contrast[\s\S]*\.health-bar-fill[\s\S]*border:\s*1px\s*solid\s*currentColor/, 'Health bar border should be visible in high contrast');
});

test('Health bar color changes with value', () => {
  assert.match(html, /\.health-bar-fill\.low[^}]*background:\s*var\(--red\)/, 'Low health should use red');
  assert.match(html, /\.health-bar-fill\.medium[^}]*background:\s*#ffaa00/, 'Medium health should use orange');
});

test('Game title has text shadow for visibility', () => {
  assert.match(html, /\.game-title[^}]*text-shadow:/, 'Game title should have text shadow');
});

test('Stat values have text shadow', () => {
  assert.match(html, /\.stat-value[^}]*text-shadow:/, 'Stat values should have text shadow for visibility');
});

test('Buttons have hover state with increased contrast', () => {
  assert.match(html, /\.btn:hover[^}]*background:\s*rgba\(0,\s*245,\s*255,\s*0\.2\)/, 'Button hover should increase background');
});

test('Key badges have good contrast', () => {
  assert.match(html, /\.key-badge[^}]*background:\s*rgba\(0,\s*245,\s*255,\s*0\.1\)/, 'Key badges should have visible background');
  assert.match(html, /\.key-badge[^}]*color:\s*var\(--cyan\)/, 'Key badges should use cyan text');
});

test('Touch hints have muted color but remain readable', () => {
  assert.match(html, /\.touch-hint[^}]*display:\s*none/s, 'Touch hints should be hidden on desktop');
  assert.match(html, /@media.*hover:\s*none.*touch-hint[^}]*display:\s*inline/s, 'Touch hints should show on touch devices');
});

test('CRT overlay has low opacity to not interfere', () => {
  assert.match(html, /#crt-overlay[^}]*opacity:\s*0\.4/, 'CRT overlay should have low opacity');
});

test('Darkness overlay allows visibility in light cone', () => {
  assert.match(html, /0\.75|0\.82/, 'Darkness alpha should allow some visibility');
});
