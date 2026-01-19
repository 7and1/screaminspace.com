import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const htmlPath = resolve(__dirname, '../../index.html');
const html = readFileSync(htmlPath, 'utf8');

test('game logic hooks exist', () => {
  assert.match(html, /safePlay/);
  assert.match(html, /triggerGlitch/);
  assert.match(html, /GeometryMask/);
  assert.match(html, /Arcade/);
});

test('audio placeholders are present', () => {
  assert.match(html, /scream\.mp3/);
  assert.match(html, /heartbeat\.mp3/);
});
