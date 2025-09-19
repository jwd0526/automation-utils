import * as fs from 'fs';
import * as path from 'path';

export const TEST_TMP_DIR = path.join(__dirname, '..', 'tmp');

export class TestHelpers {
  static setupTestDir(): void {
    this.cleanupTestDir();
    if (!fs.existsSync(TEST_TMP_DIR)) {
      fs.mkdirSync(TEST_TMP_DIR, { recursive: true });
    }
  }

  static cleanupTestDir(): void {
    if (fs.existsSync(TEST_TMP_DIR)) {
      fs.rmSync(TEST_TMP_DIR, { recursive: true, force: true });
    }
  }

  static createTsConfigInTestDir(): void {
    const tsConfigPath = path.join(TEST_TMP_DIR, 'tsconfig.json');
    fs.writeFileSync(tsConfigPath, JSON.stringify({
      compilerOptions: {
        target: "ES2020",
        module: "CommonJS",
        jsx: "react"
      }
    }, null, 2));
  }

  static fileExists(filename: string): boolean {
    const fullPath = path.join(TEST_TMP_DIR, filename);
    return fs.existsSync(fullPath);
  }

  static readFile(filename: string): string {
    const fullPath = path.join(TEST_TMP_DIR, filename);
    return fs.readFileSync(fullPath, 'utf-8');
  }

  static getFilesInTestDir(): string[] {
    if (!fs.existsSync(TEST_TMP_DIR)) return [];
    return fs.readdirSync(TEST_TMP_DIR);
  }
}

export class TestAssertions {
  static assertEqual(actual: any, expected: any, message?: string): void {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  }

  static assertTrue(condition: boolean, message?: string): void {
    if (!condition) {
      throw new Error(message || 'Expected condition to be true');
    }
  }

  static assertContains(text: string, substring: string, message?: string): void {
    if (!text.includes(substring)) {
      throw new Error(message || `Expected "${text}" to contain "${substring}"`);
    }
  }

  static assertNotContains(text: string, substring: string, message?: string): void {
    if (text.includes(substring)) {
      throw new Error(message || `Expected "${text}" to not contain "${substring}"`);
    }
  }

  static assertMatches(text: string, pattern: RegExp, message?: string): void {
    if (!pattern.test(text)) {
      throw new Error(message || `Expected "${text}" to match pattern ${pattern}`);
    }
  }
}

export interface TestCase {
  name: string;
  run: () => Promise<void> | void;
}

export class TestRunner {
  private testCases: TestCase[] = [];
  private setupFn?: () => void;
  private teardownFn?: () => void;

  setup(fn: () => void): void {
    this.setupFn = fn;
  }

  teardown(fn: () => void): void {
    this.teardownFn = fn;
  }

  test(name: string, fn: () => Promise<void> | void): void {
    this.testCases.push({ name, run: fn });
  }

  async run(): Promise<void> {
    let passed = 0;
    let failed = 0;

    console.log(`\n🧪 Running ${this.testCases.length} tests...\n`);

    for (const testCase of this.testCases) {
      try {
        this.setupFn?.();
        await testCase.run();
        this.teardownFn?.();
        console.log(`✅ ${testCase.name}`);
        passed++;
      } catch (error) {
        this.teardownFn?.();
        console.log(`❌ ${testCase.name}: ${(error as Error).message}`);
        failed++;
      }
    }

    console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

    if (failed > 0) {
      process.exit(1);
    }
  }
}