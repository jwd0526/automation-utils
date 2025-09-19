import * as fs from 'fs';
import * as path from 'path';
import { FileOperations } from '../src/utils/fileOperations';
import { TestRunner, TestAssertions, TestHelpers, TEST_TMP_DIR } from './utils/testHelpers';

const runner = new TestRunner();

runner.setup(() => {
  TestHelpers.setupTestDir();
});

runner.teardown(() => {
  TestHelpers.cleanupTestDir();
});

runner.test('FileOperations - detectProjectType with tsconfig.json', () => {
  TestHelpers.createTsConfigInTestDir();

  const originalCwd = process.cwd();
  process.chdir(TEST_TMP_DIR);

  try {
    const projectType = FileOperations.detectProjectType(false, false);
    TestAssertions.assertEqual(projectType, 'tsx');
  } finally {
    process.chdir(originalCwd);
  }
});

runner.test('FileOperations - detectProjectType without tsconfig.json', () => {
  const originalCwd = process.cwd();

  // Ensure the test directory definitely doesn't have tsconfig.json
  const tsConfigPath = path.join(TEST_TMP_DIR, 'tsconfig.json');
  if (fs.existsSync(tsConfigPath)) {
    fs.unlinkSync(tsConfigPath);
  }

  process.chdir(TEST_TMP_DIR);

  try {
    // Verify no tsconfig.json exists
    TestAssertions.assertTrue(!fs.existsSync('tsconfig.json'));

    const projectType = FileOperations.detectProjectType(false, false);
    TestAssertions.assertEqual(projectType, 'jsx');
  } finally {
    process.chdir(originalCwd);
  }
});

runner.test('FileOperations - detectProjectType force JSX', () => {
  TestHelpers.createTsConfigInTestDir();

  const originalCwd = process.cwd();
  process.chdir(TEST_TMP_DIR);

  try {
    const projectType = FileOperations.detectProjectType(true, false);
    TestAssertions.assertEqual(projectType, 'jsx');
  } finally {
    process.chdir(originalCwd);
  }
});

runner.test('FileOperations - detectProjectType force TSX', () => {
  const originalCwd = process.cwd();
  process.chdir(TEST_TMP_DIR);

  try {
    const projectType = FileOperations.detectProjectType(false, true);
    TestAssertions.assertEqual(projectType, 'tsx');
  } finally {
    process.chdir(originalCwd);
  }
});

runner.test('FileOperations - createFiles in test mode', async () => {
  const files = [
    {
      path: path.join(TEST_TMP_DIR, 'Button.tsx'),
      content: 'export default Button;',
      type: 'component' as const
    },
    {
      path: path.join(TEST_TMP_DIR, 'Button.css'),
      content: '.btn { color: blue; }',
      type: 'style' as const
    }
  ];

  // Capture console output
  const originalLog = console.log;
  const logs: string[] = [];
  console.log = (msg: string) => logs.push(msg);

  try {
    await FileOperations.createFiles(files, TEST_TMP_DIR, true);

    TestAssertions.assertTrue(logs.some(log => log.includes('PREVIEW MODE')));
    TestAssertions.assertTrue(logs.some(log => log.includes('Button.tsx')));
    TestAssertions.assertTrue(logs.some(log => log.includes('export default Button;')));

    // Files should NOT be created in test mode
    TestAssertions.assertTrue(!TestHelpers.fileExists('Button.tsx'));
    TestAssertions.assertTrue(!TestHelpers.fileExists('Button.css'));
  } finally {
    console.log = originalLog;
  }
});

runner.test('FileOperations - createFiles actually creates files', async () => {
  const files = [
    {
      path: path.join(TEST_TMP_DIR, 'Button.tsx'),
      content: 'const Button = () => <button>Click</button>;\nexport default Button;',
      type: 'component' as const
    },
    {
      path: path.join(TEST_TMP_DIR, 'Button.css'),
      content: '.btn {\n  color: blue;\n  padding: 10px;\n}',
      type: 'style' as const
    }
  ];

  await FileOperations.createFiles(files, TEST_TMP_DIR, false);

  TestAssertions.assertTrue(TestHelpers.fileExists('Button.tsx'));
  TestAssertions.assertTrue(TestHelpers.fileExists('Button.css'));

  const componentContent = TestHelpers.readFile('Button.tsx');
  const styleContent = TestHelpers.readFile('Button.css');

  TestAssertions.assertContains(componentContent, 'const Button = () =>');
  TestAssertions.assertContains(componentContent, 'export default Button;');
  TestAssertions.assertContains(styleContent, '.btn {');
  TestAssertions.assertContains(styleContent, 'color: blue;');
});

runner.test('FileOperations - createFiles creates directory if needed', async () => {
  const nestedDir = path.join(TEST_TMP_DIR, 'components', 'ui');
  const files = [
    {
      path: path.join(nestedDir, 'Modal.tsx'),
      content: 'export default Modal;',
      type: 'component' as const
    }
  ];

  TestAssertions.assertTrue(!fs.existsSync(nestedDir));

  await FileOperations.createFiles(files, nestedDir, false);

  TestAssertions.assertTrue(fs.existsSync(nestedDir));
  TestAssertions.assertTrue(fs.existsSync(path.join(nestedDir, 'Modal.tsx')));

  const content = fs.readFileSync(path.join(nestedDir, 'Modal.tsx'), 'utf-8');
  TestAssertions.assertEqual(content, 'export default Modal;');
});

runner.test('FileOperations - createFiles handles multiple files', async () => {
  const files = [
    {
      path: path.join(TEST_TMP_DIR, 'Header.tsx'),
      content: 'export default Header;',
      type: 'component' as const
    },
    {
      path: path.join(TEST_TMP_DIR, 'Header.scss'),
      content: '.header { background: white; }',
      type: 'style' as const
    },
    {
      path: path.join(TEST_TMP_DIR, 'Footer.tsx'),
      content: 'export default Footer;',
      type: 'component' as const
    },
    {
      path: path.join(TEST_TMP_DIR, 'Footer.scss'),
      content: '.footer { background: gray; }',
      type: 'style' as const
    }
  ];

  await FileOperations.createFiles(files, TEST_TMP_DIR, false);

  TestAssertions.assertTrue(TestHelpers.fileExists('Header.tsx'));
  TestAssertions.assertTrue(TestHelpers.fileExists('Header.scss'));
  TestAssertions.assertTrue(TestHelpers.fileExists('Footer.tsx'));
  TestAssertions.assertTrue(TestHelpers.fileExists('Footer.scss'));

  TestAssertions.assertContains(TestHelpers.readFile('Header.tsx'), 'export default Header;');
  TestAssertions.assertContains(TestHelpers.readFile('Header.scss'), '.header {');
  TestAssertions.assertContains(TestHelpers.readFile('Footer.tsx'), 'export default Footer;');
  TestAssertions.assertContains(TestHelpers.readFile('Footer.scss'), '.footer {');
});

runner.test('FileOperations - createFiles overwrites existing files', async () => {
  const filePath = path.join(TEST_TMP_DIR, 'Component.tsx');

  // Create initial file
  fs.writeFileSync(filePath, 'Initial content');
  TestAssertions.assertEqual(TestHelpers.readFile('Component.tsx'), 'Initial content');

  const files = [
    {
      path: filePath,
      content: 'Updated content',
      type: 'component' as const
    }
  ];

  await FileOperations.createFiles(files, TEST_TMP_DIR, false);

  TestAssertions.assertEqual(TestHelpers.readFile('Component.tsx'), 'Updated content');
});

runner.test('FileOperations - empty files list', async () => {
  const originalLog = console.log;
  const logs: string[] = [];
  console.log = (msg: string) => logs.push(msg);

  try {
    await FileOperations.createFiles([], TEST_TMP_DIR, false);
    // Should complete without error
    TestAssertions.assertTrue(true);
  } finally {
    console.log = originalLog;
  }
});

export default runner;