import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const htmlPath = resolve(__dirname, '../../index.html');
const html = readFileSync(htmlPath, 'utf8');
const root = resolve(__dirname, '../..');

test('Player image asset exists', () => {
  const playerPath = resolve(root, 'assets/player.png');
  assert.ok(existsSync(playerPath), 'player.png should exist in assets folder');
});

test('Enemy image asset exists', () => {
  const enemyPath = resolve(root, 'assets/enemy.png');
  assert.ok(existsSync(enemyPath), 'enemy.png should exist in assets folder');
});

test('Bullet image asset exists', () => {
  const bulletPath = resolve(root, 'assets/bullet.png');
  assert.ok(existsSync(bulletPath), 'bullet.png should exist in assets folder');
});

test('Player asset is loaded in preload', () => {
  assert.match(html, /this\.load\.image\(['"]player['"],/, 'Player image should be loaded');
});

test('Enemy asset is loaded in preload', () => {
  assert.match(html, /this\.load\.image\(['"]enemy['"],/, 'Enemy image should be loaded');
});

test('Bullet asset is loaded in preload', () => {
  assert.match(html, /this\.load\.image\(['"]bullet['"],/, 'Bullet image should be loaded');
});

test('Audio assets are defined', () => {
  assert.match(html, /this\.load\.audio\(['"]scream['"],/, 'Scream audio should be loaded');
  assert.match(html, /this\.load\.audio\(['"]heartbeat['"],/, 'Heartbeat audio should be loaded');
  assert.match(html, /this\.load\.audio\(['"]laser['"],/, 'Laser audio should be loaded');
  assert.match(html, /this\.load\.audio\(['"]hit['"],/, 'Hit audio should be loaded');
});

test('Base URL is configured for assets', () => {
  assert.match(html, /this\.load\.setBaseURL\(/, 'Base URL should be configured');
  assert.match(html, /screaminspace\.com/, 'Base URL should point to screaminspace.com');
});

test('CORS is configured for CDN assets', () => {
  assert.match(html, /this\.load\.setCORS\(['"]anonymous['"]\)/, 'CORS should be set to anonymous');
});

test('Load error handler is defined', () => {
  assert.match(html, /this\.load\.on\(['"]loaderror['"],/, 'Load error handler should exist');
  assert.match(html, /console\.warn.*Failed to load/, 'Load errors should be logged');
});

test('Loading progress bar is shown', () => {
  assert.match(html, /this\.load\.on\(['"]progress['"],/, 'Progress callback should be registered');
});

test('Loading complete callback cleans up UI', () => {
  assert.match(html, /this\.load\.on\(['"]complete['"],/, 'Complete callback should be registered');
});

test('Textures are generated for particles', () => {
  assert.match(html, /createTextures\(\)/, 'createTextures method should exist');
  assert.match(html, /generateTexture\(['"]particle['"],/, 'Particle texture should be generated');
});

test('Starfield texture is generated', () => {
  assert.match(html, /generateTexture\(['"]starfield['"],/, 'Starfield texture should be generated');
});

test('Starfield texture is tiled', () => {
  assert.match(html, /add\.tileSprite/, 'tileSprite should be used for starfield');
  assert.match(html, /starfieldFar/, 'Far starfield should exist');
  assert.match(html, /starfieldNear/, 'Near starfield should exist');
});
