import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const htmlPath = resolve(__dirname, '../../index.html');
const html = readFileSync(htmlPath, 'utf8');

test('Textures are generated programmatically', () => {
  assert.match(html, /createTextures\(\)/, 'createTextures method should exist');
  assert.match(html, /make\.graphics\(/, 'Graphics should be made for textures');
});

test('Particle texture is generated', () => {
  assert.match(html, /generateTexture\(['"]particle['"],\s*8,\s*8\)/, 'Particle texture should be 8x8');
});

test('Particle texture uses power-of-2 dimensions', () => {
  assert.match(html, /generateTexture\(['"]particle['"],\s*8,\s*8\)/, 'Particle texture dimensions should be power of 2');
});

test('Starfield texture is generated', () => {
  assert.match(html, /generateTexture\(['"]starfield['"],\s*64,\s*64\)/, 'Starfield texture should be generated');
});

test('Starfield texture is tiled', () => {
  assert.match(html, /add\.tileSprite\([^)]*\)[\s\S]*['"]starfield['"]\)/, 'Starfield should be used as tile sprite');
});

test('Graphics object is destroyed after texture generation', () => {
  assert.match(html, /g\.destroy\(\)/, 'Graphics object should be destroyed after use');
});

test('Vision updates are rate-limited', () => {
  assert.match(html, /this\.frameCount\s*%\s*this\.visionUpdateRate\s*===\s*0/, 'Vision updates should be rate-limited');
});

test('Enemy updates are rate-limited', () => {
  assert.match(html, /time\s*>=\s*this\.lastEnemyUpdate\s*\+\s*this\.enemyUpdateRate/, 'Enemy updates should be rate-limited');
});

test('UI updates are rate-limited', () => {
  assert.match(html, /this\.frameCount\s*%\s*10\s*===\s*0/, 'UI updates should be rate-limited to every 10 frames');
});

test('Physics time step varies by device', () => {
  assert.match(html, /timeStep:\s*isLowEnd\s*\?\s*1\s*\/\s*PERF_CONFIG\.mobileTargetFPS/, 'Time step should be larger on low-end');
});

test('Max physics steps vary by device', () => {
  assert.match(html, /maxSteps:\s*isLowEnd\s*\?\s*2\s*:\s*4/, 'Max physics steps should be fewer on low-end');
});

test('Target FPS varies by device', () => {
  assert.match(html, /fps:\s*{\s*target:\s*isLowEnd/s, 'Target FPS should be lower on low-end');
});

test('Canvas has pixelated rendering', () => {
  assert.match(html, /image-rendering:\s*pixelated/, 'Canvas should use pixelated rendering');
});

test('Mipmaps are disabled for pixel art', () => {
  assert.match(html, /disable mipmap/, 'Comment should indicate mipmap disabling');
});

test('Low performance mode reduces starfield alpha', () => {
  assert.match(html, /this\.lowPerfMode\s*\?\s*0\.25\s*:\s*0\.35/, 'Far starfield alpha should be lower in low perf mode');
});

test('Low performance mode reduces explosion particles', () => {
  assert.match(html, /particleCount\s*=\s*this\.lowPerfMode\s*\?\s*12\s*:\s*16/, 'Explosion particles should be fewer in low perf mode');
});

test('Camera shake is disabled in low performance mode', () => {
  assert.match(html, /if\s*\(!this\.lowPerfMode\)/s, 'Camera shake should check low perf mode');
});

test('Explosion particle count varies by quality', () => {
  assert.match(html, /particleCount:\s*{[^}]*explosion:/, 'Explosion particle count should vary by quality');
});

test('Vision cache reduces calculations', () => {
  assert.match(html, /this\.visionCache\s*=\s*{/, 'Vision cache should exist');
  assert.match(html, /coneLength:/, 'Vision cache should store cone length');
});

test('Player position is cached', () => {
  assert.match(html, /this\.cachedPlayerPos\s*=\s*{\s*x:\s*0,\s*y:\s*0\s*}/, 'Player position should be cached');
});

test('Aim angle is cached', () => {
  assert.match(html, /this\.cachedAimAngle/, 'Aim angle should be cached');
});

test('Cached position is updated instead of direct access', () => {
  assert.match(html, /this\.cachedPlayerPos\.x\s*=\s*this\.player\.x/, 'Cache should be updated with player position');
});
