import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const htmlPath = resolve(__dirname, '../../index.html');
const html = readFileSync(htmlPath, 'utf8');

test('index.html includes core CRT overlay elements', () => {
  assert.match(html, /id="crt-overlay"/);
  assert.match(html, /id="crt-vignette"/);
});

test('index.html includes required Phaser scenes', () => {
  assert.match(html, /class SceneBoot/);
  assert.match(html, /class SceneGame/);
  assert.match(html, /class SceneGameOver/);
});

test('index.html uses Phaser 3 via CDN', () => {
  assert.match(html, /phaser\.min\.js/);
});
