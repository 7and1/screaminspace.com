import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const middlewarePath = resolve(__dirname, '../../pages-functions/_middleware.ts');
const middleware = readFileSync(middlewarePath, 'utf8');

test('Pages middleware uses context.next() (no recursive fetch)', () => {
  assert.match(middleware, /\bcontext\.next\(\)/);
  assert.doesNotMatch(middleware, /\bfetch\s*\(\s*request\s*\)/);
});

test('CSP does not require unsafe-eval', () => {
  assert.doesNotMatch(middleware, /unsafe-eval/);
  assert.match(middleware, /script-src-attr 'none'/);
});

test('Analytics is gated behind ANALYTICS_ENDPOINT', () => {
  assert.match(middleware, /\benv\.ENABLE_ANALYTICS === 'true'/);
  assert.match(middleware, /\benv\.ANALYTICS_ENDPOINT\b/);
});

test('Debug headers are gated (not always on in production)', () => {
  assert.match(middleware, /\bENABLE_DEBUG_HEADERS\b/);
  assert.match(middleware, /\benv\.ENVIRONMENT === 'preview'/);
});
