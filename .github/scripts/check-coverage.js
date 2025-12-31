#!/usr/bin/env node

/**
 * Coverage Threshold Checker
 *
 * Validates that code coverage meets minimum thresholds.
 * Reads coverage-summary.json and compares against defined thresholds.
 */

const fs = require('fs');
const path = require('path');

// Coverage thresholds (percentage)
const THRESHOLDS = {
  global: {
    lines: 80,
    branches: 70,
    functions: 80,
    statements: 80,
  },
  perFile: {
    lines: 60, // Minimum per-file coverage
  },
};

/**
 * Check coverage for a specific project
 */
function checkCoverage(projectName, coveragePath) {
  console.log(`\n📊 Checking coverage for ${projectName}...`);

  const summaryPath = path.join(coveragePath, 'coverage-summary.json');

  if (!fs.existsSync(summaryPath)) {
    console.error(`❌ Coverage summary not found: ${summaryPath}`);
    return false;
  }

  const coverage = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
  const total = coverage.total;

  console.log('\n📈 Coverage Summary:');
  console.log(`  Lines:      ${total.lines.pct}%`);
  console.log(`  Branches:   ${total.branches.pct}%`);
  console.log(`  Functions:  ${total.functions.pct}%`);
  console.log(`  Statements: ${total.statements.pct}%`);

  let passed = true;

  // Check global thresholds
  if (total.lines.pct < THRESHOLDS.global.lines) {
    console.error(`❌ Lines coverage (${total.lines.pct}%) below threshold (${THRESHOLDS.global.lines}%)`);
    passed = false;
  }

  if (total.branches.pct < THRESHOLDS.global.branches) {
    console.error(`❌ Branches coverage (${total.branches.pct}%) below threshold (${THRESHOLDS.global.branches}%)`);
    passed = false;
  }

  if (total.functions.pct < THRESHOLDS.global.functions) {
    console.error(`❌ Functions coverage (${total.functions.pct}%) below threshold (${THRESHOLDS.global.functions}%)`);
    passed = false;
  }

  if (total.statements.pct < THRESHOLDS.global.statements) {
    console.error(`❌ Statements coverage (${total.statements.pct}%) below threshold (${THRESHOLDS.global.statements}%)`);
    passed = false;
  }

  // Check per-file coverage for files with low coverage
  const lowCoverageFiles = [];
  for (const [file, metrics] of Object.entries(coverage)) {
    if (file === 'total') continue;

    if (metrics.lines.pct < THRESHOLDS.perFile.lines) {
      lowCoverageFiles.push({
        file: file.replace(process.cwd(), ''),
        coverage: metrics.lines.pct,
      });
    }
  }

  if (lowCoverageFiles.length > 0) {
    console.warn(`\n⚠️  ${lowCoverageFiles.length} file(s) below ${THRESHOLDS.perFile.lines}% line coverage:`);
    lowCoverageFiles
      .sort((a, b) => a.coverage - b.coverage)
      .slice(0, 10) // Show top 10 worst files
      .forEach(({ file, coverage }) => {
        console.warn(`  ${coverage.toFixed(2)}% - ${file}`);
      });
  }

  if (passed) {
    console.log(`\n✅ ${projectName} coverage meets all thresholds!`);
  } else {
    console.error(`\n❌ ${projectName} coverage failed threshold checks`);
  }

  return passed;
}

// Main execution
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: check-coverage.js <project-name> <coverage-path>');
  process.exit(1);
}

const [projectName, coveragePath] = args;
const passed = checkCoverage(projectName, coveragePath);

process.exit(passed ? 0 : 1);
