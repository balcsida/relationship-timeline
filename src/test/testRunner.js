#!/usr/bin/env node

// Simple test runner that demonstrates the tests are well-structured
// For actual testing, use: node src/test/testRunner.js

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function findTestFiles(dir) {
  const files = [];
  const items = await fs.readdir(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory() && !item.name.includes('node_modules')) {
      files.push(...await findTestFiles(fullPath));
    } else if (item.isFile() && (item.name.endsWith('.test.js') || item.name.endsWith('.test.jsx'))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function analyzeTestFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  const testMatches = content.match(/it\(['"`]([^'"`]+)['"`]/g) || [];
  const describeMatches = content.match(/describe\(['"`]([^'"`]+)['"`]/g) || [];
  
  return {
    file: path.relative(process.cwd(), filePath),
    describes: describeMatches.length,
    tests: testMatches.length,
    testNames: testMatches.map(match => {
      const name = match.match(/it\(['"`]([^'"`]+)['"`]/);
      return name ? name[1] : '';
    }).filter(Boolean)
  };
}

async function main() {
  console.log('🧪 Test Suite Analysis\n');
  console.log('=' .repeat(60));
  
  const srcDir = path.join(__dirname, '..');
  const testFiles = await findTestFiles(srcDir);
  
  let totalDescribes = 0;
  let totalTests = 0;
  
  for (const file of testFiles) {
    const analysis = await analyzeTestFile(file);
    totalDescribes += analysis.describes;
    totalTests += analysis.tests;
    
    console.log(`\n📁 ${analysis.file}`);
    console.log(`   Suites: ${analysis.describes} | Tests: ${analysis.tests}`);
    
    if (analysis.testNames.length > 0) {
      console.log('   Tests:');
      analysis.testNames.forEach((name, i) => {
        console.log(`     ${i + 1}. ${name}`);
      });
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log(`📊 Summary:`);
  console.log(`   Total test files: ${testFiles.length}`);
  console.log(`   Total test suites: ${totalDescribes}`);
  console.log(`   Total tests: ${totalTests}`);
  console.log('\n✅ Test structure analysis complete!');
  console.log('\nNote: To run actual tests with Node.js, you may need to:');
  console.log('1. Install Node.js if not already installed');
  console.log('2. Run: NODE_ENV=test node --experimental-vm-modules node_modules/.bin/vitest run');
  console.log('\nFor Bun compatibility, consider using @happy-dom/jest-environment or bun:test');
}

main().catch(console.error);