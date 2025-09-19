#!/usr/bin/env node

import * as fs from 'fs';
import { CliParser, ComponentValidator } from './cli/parser';
import { ReactComponentGenerator } from './generator';
import { BatchComponentGenerator } from './batchGenerator';
import { YamlProcessor } from './yaml/processor';
import { YamlTemplateGenerator } from './yaml/templateGenerator';

async function main(): Promise<void> {
  try {
    const args = CliParser.parse(process.argv.slice(2));

    if (args.help) {
      CliParser.showHelp();
      return;
    }

    // Handle template generation
    if (args.template) {
      await handleTemplateGeneration(args);
      return;
    }

    // Handle YAML processing
    if (args.fromYaml) {
      await handleYamlGeneration(args);
      return;
    }

    // Handle single component generation
    ComponentValidator.validateComponentName(args.componentName);
    const generator = new ReactComponentGenerator(args);
    await generator.generate();

  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
}

async function handleTemplateGeneration(args: any): Promise<void> {
  const templateFile = typeof args.template === 'string' && args.template !== 'true'
    ? args.template
    : 'components.yaml';

  if (fs.existsSync(templateFile)) {
    console.error(`Error: File ${templateFile} already exists. Choose a different name or remove the existing file.`);
    process.exit(1);
  }

  const templateContent = YamlTemplateGenerator.generateTemplate();
  fs.writeFileSync(templateFile, templateContent);

  console.log(`✅ Created YAML template: ${templateFile}`);
  console.log('\n📖 Example usage:');
  console.log(`   make-component --from-yaml ${templateFile}`);
  console.log(`   make-component --from-yaml ${templateFile} --test`);
  console.log(`   make-component --from-yaml ${templateFile} --only Button,Modal`);
}

async function handleYamlGeneration(args: any): Promise<void> {
  if (!fs.existsSync(args.fromYaml)) {
    throw new Error(`YAML file not found: ${args.fromYaml}`);
  }

  let components;

  if (args.only && args.only.length > 0) {
    console.log(`🎯 Filtering components: ${args.only.join(', ')}`);
    components = await YamlProcessor.filterComponents(args.fromYaml, args.only);

    if (components.length === 0) {
      console.error(`Error: No matching components found. Available components can be seen with --test flag.`);
      process.exit(1);
    }
  } else {
    components = await YamlProcessor.processFile(args.fromYaml, {
      dir: args.dir,
      test: args.test
    });
  }

  // Apply test mode to all components if specified
  if (args.test) {
    components = components.map(comp => ({ ...comp, test: true }));
    await BatchComponentGenerator.generateWithPreview(components);
    return;
  }

  // Show component list before generation
  BatchComponentGenerator.logComponentList(components);

  // Generate all components
  await BatchComponentGenerator.generateMultiple(components);
}

main();