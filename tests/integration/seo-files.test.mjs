import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '../..');

const htmlPath = resolve(root, 'index.html');
const robotsPath = resolve(root, 'robots.txt');
const sitemapPath = resolve(root, 'sitemap.xml');
const notFoundPath = resolve(root, '404.html');
const ogImagePath = resolve(root, 'og-image.png');
const playerAssetPath = resolve(root, 'assets', 'player.png');
const enemyAssetPath = resolve(root, 'assets', 'enemy.png');
const bulletAssetPath = resolve(root, 'assets', 'bullet.png');

const html = readFileSync(htmlPath, 'utf8');

const mustExist = [
  robotsPath,
  sitemapPath,
  notFoundPath,
  ogImagePath,
  playerAssetPath,
  enemyAssetPath,
  bulletAssetPath
];

for (const filePath of mustExist) {
  test(`${filePath} exists`, () => {
    assert.ok(existsSync(filePath));
  });
}

test('index.html includes core SEO metadata', () => {
  assert.match(html, /meta name="description"/);
  assert.match(html, /property="og:title"/);
  assert.match(html, /property="og:description"/);
  assert.match(html, /og-image\.png/);
  assert.match(html, /rel="canonical"/);
});

test('robots.txt references sitemap', () => {
  const robots = readFileSync(robotsPath, 'utf8');
  assert.match(robots, /Sitemap:/);
});

test('sitemap.xml includes site root', () => {
  const sitemap = readFileSync(sitemapPath, 'utf8');
  assert.match(sitemap, /https:\/\/screaminspace\.com\//);
  assert.match(sitemap, /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
});
