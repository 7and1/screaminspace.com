import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const htmlPath = resolve(__dirname, '../../index.html');
const html = readFileSync(htmlPath, 'utf8');

test('Score is initialized to zero', () => {
  assert.match(html, /this\.score\s*=\s*0/, 'Score should initialize at 0');
});

test('Kills counter is initialized to zero', () => {
  assert.match(html, /this\.kills\s*=\s*0/, 'Kills should initialize at 0');
});

test('Enemy kill adds 25 points', () => {
  assert.match(html, /this\.score\s*\+=\s*25/, 'Each enemy kill should add 25 points');
});

test('Enemy kill increments kills counter', () => {
  assert.match(html, /this\.kills\s*\+=\s*1/, 'Each enemy kill should increment kills counter');
});

test('Score is passed to game over scene', () => {
  assert.match(html, /SceneGameOver.*score:\s*this\.score/, 'Score should be passed to game over scene');
  assert.match(html, /UI\.showGameOver\(.*score/s, 'Score should be displayed in UI on game over');
});

test('Kills is passed to game over scene', () => {
  assert.match(html, /SceneGameOver.*kills:\s*this\.kills/, 'Kills should be passed to game over scene');
  assert.match(html, /UI\.showGameOver\(.*kills/s, 'Kills should be displayed in UI on game over');
});

test('HUD updates with score values', () => {
  assert.match(html, /UI\.updateHUD\(this\.score,\s*this\.kills/, 'HUD should update with score and kills');
  assert.match(html, /score-value/, 'Score should be displayed in DOM');
  assert.match(html, /kills-value/, 'Kills should be displayed in DOM');
});

test('Score popup is created on enemy kill', () => {
  assert.match(html, /createScorePopup\(/, 'Score popup function should be called');
  assert.match(html, /25/, 'Score popup should show 25 points');
});

test('Final score is displayed in game over', () => {
  assert.match(html, /final-score-value/, 'Final score element should exist');
  assert.match(html, /final-kills-value/, 'Final kills element should exist');
});

test('Score popup animates and removes itself', () => {
  assert.match(html, /@keyframes scoreFloat/, 'Score popup should have float animation');
  assert.match(html, /popup\.remove\(\)/, 'Score popup should remove itself after animation');
});
