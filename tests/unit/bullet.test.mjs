import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const htmlPath = resolve(__dirname, '../../index.html');
const html = readFileSync(htmlPath, 'utf8');

// Extract Bullet class from the HTML for testing
const bulletClassMatch = html.match(/class Bullet extends Phaser\.Physics\.Arcade\.Image\s*{([^}]+constructor[^}]+{[^}]+}[^}]+fire[^}]+{[^}]+}[^}]*preUpdate[^}]+{[^}]+}[^}]+})/s);
const hasBulletClass = /class Bullet extends Phaser\.Physics\.Arcade\.Image/.test(html);

test('Bullet class is defined', () => {
  assert.ok(hasBulletClass, 'Bullet class should be defined in the game');
});

test('Bullet has required properties', () => {
  assert.match(html, /this\.speed\s*=/, 'Bullet should have speed property');
  assert.match(html, /this\.lifespan\s*=/, 'Bullet should have lifespan property');
});

test('Bullet fire method sets position and rotation', () => {
  assert.match(html, /this\.setPosition\(/, 'Bullet fire method should set position');
  assert.match(html, /this\.setRotation\(/, 'Bullet fire method should set rotation');
  assert.match(html, /physics\.velocityFromRotation/, 'Bullet fire method should set velocity from rotation');
});

test('Bullet preUpdate decrements lifespan', () => {
  assert.match(html, /this\.lifespan\s*-=\s*delta/, 'Bullet preUpdate should decrement lifespan');
  assert.match(html, /this\.lifespan\s*<=\s*0/, 'Bullet preUpdate should check if lifespan expired');
});

test('Bullet deactivates when lifespan expires', () => {
  assert.match(html, /this\.setActive\(false\)/, 'Bullet should deactivate when expired');
  assert.match(html, /this\.setVisible\(false\)/, 'Bullet should hide when expired');
});

test('Bullet group uses object pooling', () => {
  assert.match(html, /this\.bullets\s*=\s*this\.physics\.add\.group/, 'Bullets should be in a physics group');
  assert.match(html, /maxSize/, 'Bullet group should have maxSize for pooling');
});

test('Bullet max size varies by quality', () => {
  assert.match(html, /bulletMaxSize/, 'Bullet max size should be quality-configurable');
});
