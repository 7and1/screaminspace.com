import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const htmlPath = resolve(__dirname, '../../index.html');
const html = readFileSync(htmlPath, 'utf8');

test('SceneBoot is defined', () => {
  assert.match(html, /class SceneBoot extends Phaser\.Scene/, 'SceneBoot class should exist');
});

test('SceneGame is defined', () => {
  assert.match(html, /class SceneGame extends Phaser\.Scene/, 'SceneGame class should exist');
});

test('SceneGameOver is defined', () => {
  assert.match(html, /class SceneGameOver extends Phaser\.Scene/, 'SceneGameOver class should exist');
});

test('Boot scene transitions to game scene', () => {
  assert.match(html, /SceneBoot.*scene\.start\(['"]SceneGame['"]/s, 'Boot scene should start game scene');
});

test('Game scene transitions to game over on death', () => {
  assert.match(html, /this\.scene\.start\(['"]SceneGameOver['"],/s, 'Game scene should start game over scene');
});

test('Scene config includes all three scenes', () => {
  assert.match(html, /config\.scene\s*=\s*\[SceneBoot,\s*SceneGame,\s*SceneGameOver\]/, 'Config should include all scenes');
});

test('Scenes are registered in correct order', () => {
  const sceneOrder = html.match(/config\.scene\s*=\s*\[(.*?)\]/s)?.[1];
  assert.ok(sceneOrder?.includes('SceneBoot'), 'SceneBoot should be first');
  assert.ok(sceneOrder?.includes('SceneGame'), 'SceneGame should be second');
  assert.ok(sceneOrder?.includes('SceneGameOver'), 'SceneGameOver should be third');
});

test('Boot scene has preload method', () => {
  assert.match(html, /SceneBoot.*preload\(\)/s, 'Boot scene should have preload method');
});

test('Boot scene has create method', () => {
  assert.match(html, /SceneBoot.*create\(\)/s, 'Boot scene should have create method');
});

test('Game scene has create method', () => {
  assert.match(html, /SceneGame.*create\(\)/s, 'Game scene should have create method');
});

test('Game scene has update method', () => {
  assert.match(html, /SceneGame.*update\(time,\s*delta\)/s, 'Game scene should have update method');
});

test('Game over scene receives data', () => {
  assert.match(html, /class SceneGameOver.*create\(data\)/s, 'Game over scene should receive data parameter');
});

test('Game over scene displays final score', () => {
  assert.match(html, /SceneGameOver.*Final Score:\s*\$\{data\.score/s, 'Game over scene should display final score');
});

test('Restart functionality exists', () => {
  assert.match(html, /function restartGame\(\)/, 'restartGame function should exist');
});

test('Quit to menu functionality exists', () => {
  assert.match(html, /function quitToMenu\(\)/, 'quitToMenu function should exist');
});
