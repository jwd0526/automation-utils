import * as fs from 'fs';
import * as path from 'path';
import { YamlProcessor } from '../src/yaml/processor';
import { YamlTemplateGenerator } from '../src/yaml/templateGenerator';
import { TestRunner, TestAssertions, TestHelpers, TEST_TMP_DIR } from './utils/testHelpers';

const runner = new TestRunner();

runner.setup(() => {
  TestHelpers.setupTestDir();
});

runner.teardown(() => {
  TestHelpers.cleanupTestDir();
});

runner.test('YamlTemplateGenerator - Generate template', () => {
  const template = YamlTemplateGenerator.generateTemplate();

  TestAssertions.assertContains(template, 'components:');
  TestAssertions.assertContains(template, 'name: Button');
  TestAssertions.assertContains(template, 'name: Modal');
  TestAssertions.assertContains(template, 'name: Card');
  TestAssertions.assertContains(template, 'config:');
  TestAssertions.assertContains(template, 'defaults:');
  TestAssertions.assertContains(template, '# mkcomp YAML Template');
});

runner.test('YamlTemplateGenerator - Generate minimal template', () => {
  const template = YamlTemplateGenerator.generateMinimalTemplate();

  TestAssertions.assertContains(template, 'components:');
  TestAssertions.assertContains(template, 'name: ExampleComponent');
  TestAssertions.assertContains(template, '# Minimal React Component Template');
});

runner.test('YamlProcessor - Process simple YAML', async () => {
  const yamlContent = `
components:
  - name: TestButton
    type: tsx
    output:
      directory: ${TEST_TMP_DIR}
      style: css
    props:
      - name: text
        type: string
        required: true
    structure:
      emmet: "button.btn"
`;

  const yamlFile = path.join(TEST_TMP_DIR, 'test.yaml');
  fs.writeFileSync(yamlFile, yamlContent);

  const components = await YamlProcessor.processFile(yamlFile);

  TestAssertions.assertEqual(components.length, 1);
  TestAssertions.assertEqual(components[0].componentName, 'TestButton');
  TestAssertions.assertEqual(components[0].props, 'text:string');
  TestAssertions.assertEqual(components[0].style, 'css');
  TestAssertions.assertEqual(components[0].emmet, 'button.btn');
  TestAssertions.assertEqual(components[0].tsx, true);
});

runner.test('YamlProcessor - Process multiple components', async () => {
  const yamlContent = `
components:
  - name: Button
    type: tsx
    output:
      directory: ${TEST_TMP_DIR}
      style: css
    props:
      - name: text
        type: string
        required: true
  - name: Card
    type: jsx
    output:
      directory: ${TEST_TMP_DIR}
      style: tailwind
    props:
      - name: title
        type: string
        required: true
      - name: children
        type: React.ReactNode
        required: false
`;

  const yamlFile = path.join(TEST_TMP_DIR, 'multi.yaml');
  fs.writeFileSync(yamlFile, yamlContent);

  const components = await YamlProcessor.processFile(yamlFile);

  TestAssertions.assertEqual(components.length, 2);

  // First component
  TestAssertions.assertEqual(components[0].componentName, 'Button');
  TestAssertions.assertEqual(components[0].tsx, true);
  TestAssertions.assertEqual(components[0].style, 'css');

  // Second component
  TestAssertions.assertEqual(components[1].componentName, 'Card');
  TestAssertions.assertEqual(components[1].jsx, true);
  TestAssertions.assertEqual(components[1].style, 'tailwind');
  TestAssertions.assertEqual(components[1].props, 'title:string,children?:React.ReactNode');
});

runner.test('YamlProcessor - Filter components', async () => {
  const yamlContent = `
components:
  - name: Button
    type: tsx
    output:
      directory: ${TEST_TMP_DIR}
      style: css
  - name: Card
    type: tsx
    output:
      directory: ${TEST_TMP_DIR}
      style: css
  - name: Modal
    type: tsx
    output:
      directory: ${TEST_TMP_DIR}
      style: css
`;

  const yamlFile = path.join(TEST_TMP_DIR, 'filter.yaml');
  fs.writeFileSync(yamlFile, yamlContent);

  const filtered = await YamlProcessor.filterComponents(yamlFile, ['Button', 'Modal']);

  TestAssertions.assertEqual(filtered.length, 2);
  TestAssertions.assertEqual(filtered[0].componentName, 'Button');
  TestAssertions.assertEqual(filtered[1].componentName, 'Modal');
});

runner.test('YamlProcessor - Handle defaults and config', async () => {
  const yamlContent = `
components:
  - name: TestComponent
    type: auto
    output:
      directory: custom/dir
      style: scss
config:
  defaults:
    type: tsx
    style: css
    directory: default/dir
`;

  const yamlFile = path.join(TEST_TMP_DIR, 'config.yaml');
  fs.writeFileSync(yamlFile, yamlContent);

  const components = await YamlProcessor.processFile(yamlFile);

  TestAssertions.assertEqual(components.length, 1);
  TestAssertions.assertEqual(components[0].componentName, 'TestComponent');
  TestAssertions.assertEqual(components[0].dir, 'custom/dir'); // Component override wins
  TestAssertions.assertEqual(components[0].style, 'scss'); // Component override wins
});

runner.test('YamlProcessor - Props with optional and defaults', async () => {
  const yamlContent = `
components:
  - name: ComplexButton
    type: tsx
    output:
      directory: ${TEST_TMP_DIR}
      style: css
    props:
      - name: text
        type: string
        required: true
      - name: variant
        type: "'primary' | 'secondary'"
        required: false
        default: "'primary'"
      - name: disabled
        type: boolean
        required: false
        default: false
      - name: children
        type: React.ReactNode
        required: false
`;

  const yamlFile = path.join(TEST_TMP_DIR, 'complex.yaml');
  fs.writeFileSync(yamlFile, yamlContent);

  const components = await YamlProcessor.processFile(yamlFile);

  TestAssertions.assertEqual(components.length, 1);
  TestAssertions.assertEqual(
    components[0].props,
    "text:string,variant?:'primary' | 'secondary',disabled?:boolean,children?:React.ReactNode"
  );
});

runner.test('YamlProcessor - Validation errors', async () => {
  const invalidYaml = `
components:
  - type: tsx  # Missing name
    output:
      directory: test
      style: css
`;

  const yamlFile = path.join(TEST_TMP_DIR, 'invalid.yaml');
  fs.writeFileSync(yamlFile, invalidYaml);

  try {
    await YamlProcessor.processFile(yamlFile);
    TestAssertions.assertTrue(false, 'Should have thrown validation error');
  } catch (error) {
    TestAssertions.assertContains((error as Error).message, 'missing "name"');
  }
});

runner.test('YamlProcessor - File not found error', async () => {
  try {
    await YamlProcessor.processFile('nonexistent.yaml');
    TestAssertions.assertTrue(false, 'Should have thrown file not found error');
  } catch (error) {
    TestAssertions.assertContains((error as Error).message, 'Failed to process YAML file');
  }
});

export default runner;