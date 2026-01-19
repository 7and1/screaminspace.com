import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const htmlPath = resolve(__dirname, '../../index.html');
const html = readFileSync(htmlPath, 'utf8');

test('HTML lang attribute is set', () => {
  assert.match(html, /<html lang="en">/, 'HTML should have lang="en"');
});

test('Page has descriptive title', () => {
  assert.match(html, /<title>Scream In Space[^<]*<\/title>/, 'Page should have descriptive title');
});

test('Page has meta description', () => {
  assert.match(html, /<meta name="description"[^>]*content="[^"]+"/, 'Page should have meta description');
});

test('sr-only class exists for screen reader text', () => {
  assert.match(html, /\.sr-only[^{]*{[^}]*position:\s*absolute/, 'sr-only class should exist');
  assert.match(html, /\.sr-only[^{]*{[^}]*clip:\s*rect\(0,\s*0,\s*0,\s*0\)/, 'sr-only should use clip pattern');
});

test('Game title is in a heading', () => {
  assert.match(html, /<h1[^>]*id="game-title"/, 'Game title should be in h1 element');
});

test('Pause title is in a heading', () => {
  assert.match(html, /<h2[^>]*id="pause-title"/, 'Pause title should be in h2 element');
});

test('Settings title is in a heading', () => {
  assert.match(html, /<h2[^>]*id="settings-title"/, 'Settings title should be in h2 element');
});

test('Game over title is in a heading', () => {
  assert.match(html, /<h2[^>]*id="game-over-title"/, 'Game over title should be in h2 element');
});

test('Instructions have descriptive labels', () => {
  assert.match(html, /Move ship/, 'Movement instructions should be descriptive');
  assert.match(html, /Aim flashlight/, 'Aim instructions should be descriptive');
  assert.match(html, /Fire weapon/, 'Fire instructions should be descriptive');
});

test('Settings have labels and descriptions', () => {
  assert.match(html, /setting-label">Sound Effects/, 'Sound setting should have label');
  assert.match(html, /setting-desc">Enable audio feedback/, 'Sound setting should have description');
  assert.match(html, /setting-label">CRT Effects/, 'CRT setting should have label');
  assert.match(html, /setting-desc">Retro scanline overlay/, 'CRT setting should have description');
});

test('Score has label', () => {
  assert.match(html, /stat-label[^<]*Score/, 'Score should have visible label');
});

test('Kills has label', () => {
  assert.match(html, /stat-label[^<]*Kills/, 'Kills should have visible label');
});

test('Health has label', () => {
  assert.match(html, /Hull Integrity:/, 'Health should have descriptive label');
});

test('Button text is descriptive', () => {
  assert.match(html, /Initialize Mission/, 'Start button text should be descriptive');
  assert.match(html, /Resume/, 'Resume button text should be clear');
  assert.match(html, /Restart Mission/, 'Restart button text should be clear');
  assert.match(html, /Abort to Main Menu/, 'Quit button text should be clear');
});

test('Final score is announced', () => {
  assert.match(html, /class="final-score"[^<]*Final Score:/, 'Final score should be displayed');
});

test('Final kills is announced', () => {
  assert.match(html, /class="final-kills"[^<]*Enemies Eliminated:/, 'Final kills should be displayed');
});

test('Visual effects have aria-hidden', () => {
  assert.match(html, /id="crt-overlay"/, 'CRT overlay exists');
  assert.match(html, /id="crt-vignette"/, 'CRT vignette exists');
});

test('Canvas has accessible fallback', () => {
  assert.match(html, /role="application"[^>]*aria-label/, 'Canvas area should have accessible label');
});

test('Links have discernible text', () => {
  assert.match(html, /<a[^>]*class="skip-link"/, 'Skip link should exist');
  assert.match(html, /Skip to game/, 'Skip link should have text');
});
