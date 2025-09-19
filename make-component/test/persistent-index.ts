#!/usr/bin/env tsx

import { TestHelpers } from './utils/testHelpers';

// Import all test modules
import cliTests from './cli.test';
import emmetTests from './emmet.test';
import propsTests from './props.test';
import templatesTests from './templates.test';
import fileOperationsTests from './fileOperations.test';
import integrationTests from './integration.test';

// Set persistent mode flag
(global as any).PRESERVE_TEST_FILES = true;

// Override cleanup to do nothing in persistent mode
const originalCleanup = TestHelpers.cleanupTestDir;
TestHelpers.cleanupTestDir = () => {
  if (!(global as any).PRESERVE_TEST_FILES) {
    originalCleanup();
  }
};

async function runPersistentTests(): Promise<void> {
  console.log('🚀 Starting React Component Generator Test Suite (Persistent Mode)');
  console.log('Files will be preserved in test/tmp for inspection');
  console.log('================================================================\n');

  // Ensure clean start but don't cleanup during tests
  TestHelpers.cleanupTestDir();
  TestHelpers.setupTestDir();

  const testSuites = [
    { name: 'CLI Parsing', runner: cliTests },
    { name: 'Emmet Processing', runner: emmetTests },
    { name: 'Props Parsing', runner: propsTests },
    { name: 'Template Generation', runner: templatesTests },
    { name: 'File Operations', runner: fileOperationsTests },
    { name: 'Integration Tests', runner: integrationTests }
  ];

  let totalPassed = 0;
  let totalFailed = 0;
  let suitesPassed = 0;
  let suitesFailed = 0;

  for (const suite of testSuites) {
    console.log(`\n📁 ${suite.name}`);
    console.log('='.repeat(suite.name.length + 3));

    try {
      // Capture test results by intercepting process.exit
      const originalExit = process.exit;
      let testsFailed = false;

      process.exit = ((code?: number) => {
        if (code === 1) {
          testsFailed = true;
          return undefined as never;
        }
        return originalExit(code);
      }) as typeof process.exit;

      await suite.runner.run();

      process.exit = originalExit;

      if (testsFailed) {
        suitesFailed++;
        console.log(`❌ ${suite.name} suite failed`);
      } else {
        suitesPassed++;
        console.log(`✅ ${suite.name} suite passed`);
      }

    } catch (error) {
      suitesFailed++;
      console.log(`💥 ${suite.name} suite crashed: ${(error as Error).message}`);
    }
    // Note: No cleanup between suites in persistent mode
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 FINAL RESULTS (PERSISTENT MODE)');
  console.log('='.repeat(50));
  console.log(`Test Suites: ${suitesPassed} passed, ${suitesFailed} failed`);
  console.log(`\n📁 Generated files preserved in: test/tmp/`);
  console.log('   Files include command headers showing how they were created');

  if (suitesFailed > 0) {
    console.log('\n❌ Some tests failed. Check output above for details.');
    console.log('🔍 Generated files preserved for inspection');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed!');
    console.log('✅ React Component Generator is working correctly');
    console.log('🔍 Generated files preserved for inspection');
    process.exit(0);
  }
}

// Handle cleanup on exit/interrupt (still preserve files)
process.on('exit', () => {
  console.log('\n📁 Test files preserved in test/tmp/');
});

process.on('SIGINT', () => {
  console.log('\n\n🛑 Tests interrupted by user');
  console.log('📁 Test files preserved in test/tmp/');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('\n💥 Uncaught exception:', error.message);
  console.log('📁 Test files preserved in test/tmp/');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('\n💥 Unhandled rejection:', reason);
  console.log('📁 Test files preserved in test/tmp/');
  process.exit(1);
});

// Run the tests
runPersistentTests().catch((error) => {
  console.error('\n💥 Test runner failed:', error.message);
  console.log('📁 Test files preserved in test/tmp/');
  process.exit(1);
});