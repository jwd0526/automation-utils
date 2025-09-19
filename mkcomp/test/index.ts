#!/usr/bin/env tsx

import { TestHelpers } from './utils/testHelpers';

// Import all test modules
import cliTests from './cli.test';
import emmetTests from './emmet.test';
import propsTests from './props.test';
import templatesTests from './templates.test';
import fileOperationsTests from './fileOperations.test';
import integrationTests from './integration.test';
import yamlTests from './yaml.test';

async function runAllTests(): Promise<void> {
  console.log('🚀 Starting React Component Generator Test Suite');
  console.log('================================================\n');

  // Ensure clean start
  TestHelpers.cleanupTestDir();

  const testSuites = [
    { name: 'CLI Parsing', runner: cliTests },
    { name: 'Emmet Processing', runner: emmetTests },
    { name: 'Props Parsing', runner: propsTests },
    { name: 'Template Generation', runner: templatesTests },
    { name: 'File Operations', runner: fileOperationsTests },
    { name: 'YAML Processing', runner: yamlTests },
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
    } finally {
      // Cleanup after each suite
      TestHelpers.cleanupTestDir();
    }
  }

  // Final cleanup
  TestHelpers.cleanupTestDir();

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 FINAL RESULTS');
  console.log('='.repeat(50));
  console.log(`Test Suites: ${suitesPassed} passed, ${suitesFailed} failed`);

  if (suitesFailed > 0) {
    console.log('\n❌ Some tests failed. Check output above for details.');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed!');
    console.log('\n✅ React Component Generator is working correctly');
    process.exit(0);
  }
}

// Handle cleanup on exit/interrupt
process.on('exit', () => {
  TestHelpers.cleanupTestDir();
});

process.on('SIGINT', () => {
  console.log('\n\n🛑 Tests interrupted by user');
  TestHelpers.cleanupTestDir();
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('\n💥 Uncaught exception:', error.message);
  TestHelpers.cleanupTestDir();
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('\n💥 Unhandled rejection:', reason);
  TestHelpers.cleanupTestDir();
  process.exit(1);
});

// Run the tests
runAllTests().catch((error) => {
  console.error('\n💥 Test runner failed:', error.message);
  TestHelpers.cleanupTestDir();
  process.exit(1);
});