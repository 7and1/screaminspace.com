#!/usr/bin/env node

/**
 * Custom test runner with categorized output
 * Run with: node tests/test-runner.mjs
 */

import { execSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const testsDir = join(__dirname);
const rootDir = join(__dirname, '..');

const categories = [
  { name: 'Unit Tests', path: 'unit', pattern: 'tests/unit/**/*.test.mjs' },
  { name: 'Integration Tests', path: 'integration', pattern: 'tests/integration/**/*.test.mjs' },
  { name: 'E2E Tests', path: 'e2e', pattern: 'tests/e2e/**/*.test.mjs' },
  { name: 'Performance Tests', path: 'performance', pattern: 'tests/performance/**/*.test.mjs' },
  { name: 'Accessibility Tests', path: 'accessibility', pattern: 'tests/accessibility/**/*.test.mjs' }
];

function countTests(pattern) {
  const globPath = pattern.replace('**/*.test.mjs', '');
  const fullPath = join(rootDir, globPath);

  if (!existsSync(fullPath)) return 0;

  let count = 0;
  function traverse(dir) {
    const files = readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      if (file.isDirectory()) {
        traverse(join(dir, file.name));
      } else if (file.name.endsWith('.test.mjs')) {
        const content = require('node:fs').readFileSync(join(dir, file.name), 'utf8');
        const matches = content.match(/test\(/g);
        count += matches ? matches.length : 0;
      }
    }
  }
  traverse(fullPath);
  return count;
}

function runCategory(category) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${category.name}`);
  console.log(`${'='.repeat(60)}`);

  const count = countTests(category.pattern);
  console.log(`  Running ${count} tests...\n`);

  try {
    const output = execSync(
      `node --test --reporter=spec ${category.pattern}`,
      { cwd: rootDir, encoding: 'utf8', stdio: 'pipe' }
    );
    console.log(output);
    return { passed: true, count, output };
  } catch (error) {
    console.log(error.stdout || error.stderr);
    return { passed: false, count, output: error.stdout || error.stderr };
  }
}

function runAll() {
  console.log('\n' + '='.repeat(60));
  console.log('  SCREAM IN SPACE - TEST SUITE');
  console.log('='.repeat(60));

  const results = [];
  let totalTests = 0;
  let passedCategories = 0;

  for (const category of categories) {
    const result = runCategory(category);
    results.push({ ...category, ...result });
    totalTests += result.count;
    if (result.passed) passedCategories++;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('  SUMMARY');
  console.log('='.repeat(60));

  for (const result of results) {
    const status = result.passed ? 'PASS' : 'FAIL';
    const symbol = result.passed ? '✓' : '✗';
    console.log(`  ${symbol} ${result.name.padEnd(25)} ${status} (${result.count} tests)`);
  }

  console.log('-'.repeat(60));
  console.log(`  Total: ${totalTests} tests across ${categories.length} categories`);
  console.log(`  Passed: ${passedCategories}/${categories.length} categories`);
  console.log('='.repeat(60) + '\n');

  return results.every(r => r.passed) ? 0 : 1;
}

// CLI args
const args = process.argv.slice(2);
const categoryFlag = args.find(a => a.startsWith('--category='));
const watchFlag = args.includes('--watch');
const helpFlag = args.includes('--help') || args.includes('-h');

if (helpFlag) {
  console.log(`
Test Runner for Scream In Space

Usage:
  node tests/test-runner.mjs [options]

Options:
  --category=<name>    Run only a specific category
                       (unit, integration, e2e, performance, accessibility)
  --watch              Watch mode (re-run on file changes)
  --help, -h           Show this help message

Examples:
  node tests/test-runner.mjs                    # Run all tests
  node tests/test-runner.mjs --category=unit    # Run only unit tests
  npm test                                      # Run all tests via npm
`);
  process.exit(0);
}

if (categoryFlag) {
  const categoryName = categoryFlag.split('=')[1];
  const category = categories.find(c => c.path === categoryName);
  if (category) {
    const result = runCategory(category);
    process.exit(result.passed ? 0 : 1);
  } else {
    console.error(`Unknown category: ${categoryName}`);
    console.error(`Available categories: ${categories.map(c => c.path).join(', ')}`);
    process.exit(1);
  }
}

if (watchFlag) {
  console.log('Watch mode not implemented. Use chokidar-cli or nodemon.');
  process.exit(1);
}

process.exit(runAll());
