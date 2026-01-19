import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const htmlPath = resolve(__dirname, '../../index.html');
const html = readFileSync(htmlPath, 'utf8');

test('Prefers-reduced-motion media query exists', () => {
  assert.match(html, /@media\s*\(prefers-reduced-motion:\s*reduce\)/, 'Reduced motion media query should exist');
});

test('Animations are disabled in reduced motion mode', () => {
  assert.match(html, /prefers-reduced-motion[^}]*animation-duration:\s*0\.01ms/s, 'Animations should be near-instant in reduced motion');
});

test('Transitions are disabled in reduced motion mode', () => {
  assert.match(html, /prefers-reduced-motion[^}]*transition-duration:\s*0\.01ms/s, 'Transitions should be near-instant in reduced motion');
});

test('CRT scanline is hidden in reduced motion', () => {
  assert.match(html, /@media \(prefers-reduced-motion: reduce\)[\s\S]*#crt-scanline[\s\S]*display: none/, 'Scanline should be hidden in reduced motion');
});

test('Reduced motion setting exists', () => {
  assert.match(html, /reducedMotion:\s*false/, 'Reduced motion setting should exist');
});

test('Reduced motion toggle exists in settings', () => {
  assert.match(html, /id="motion-toggle"/, 'Motion toggle button should exist');
  assert.match(html, /setting-label[^<]*Reduced Motion/, 'Motion setting should have label');
  assert.match(html, /setting-desc[^<]*Minimize animations/, 'Motion setting should have description');
});

test('Body class is toggled for reduced motion', () => {
  assert.match(html, /document\.body\.classList\.toggle\(['"]reduced-motion['"],\s*GameState\.settings\.reducedMotion\)/, 'Reduced motion class should be toggled on body');
});

test('Score popup respects reduced motion', () => {
  assert.match(html, /createScorePopup.*GameState\.settings\.reducedMotion.*return/s, 'Score popup should be skipped in reduced motion');
});

test('Damage effect respects reduced motion', () => {
  assert.match(html, /showDamageEffect.*!GameState\.settings\.reducedMotion/s, 'Damage effect should check reduced motion');
});

test('Glitch effect respects reduced motion', () => {
  assert.match(html, /triggerGlitch.*!GameState\.settings\.reducedMotion/s, 'Glitch effect should check reduced motion');
});

test('Camera shake respects low performance mode', () => {
  assert.match(html, /if\s*\(!this\.lowPerfMode\)/s, 'Camera shake should check performance mode');
});

test('Reduced motion toggle has aria-pressed', () => {
  assert.match(html, /id="motion-toggle"[^>]*aria-pressed/, 'Motion toggle should have aria-pressed state');
});

test('Reduced motion setting persists', () => {
  assert.match(html, /reducedMotion:\s*false,.*settings/s, 'Reduced motion should be in settings object');
});

test('Flicker animation has reduced motion override', () => {
  assert.match(html, /prefers-reduced-motion[^}]*animation-iteration-count:\s*1/s, 'Animations should run once in reduced motion');
});
