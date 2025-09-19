import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { ProjectType, StyleType, CliArgs } from '../types';
import {
  YamlDocument,
  YamlComponentDefinition,
  ProcessedYamlComponent,
  YamlPropDefinition
} from './types';

export class YamlProcessor {
  static async processFile(filePath: string, overrides?: Partial<CliArgs>): Promise<CliArgs[]> {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const yamlDoc = yaml.load(fileContent) as YamlDocument;

      this.validateYamlDocument(yamlDoc);

      const processedComponents = yamlDoc.components.map(component =>
        this.processComponent(component, yamlDoc.config, overrides)
      );

      return processedComponents.map(component => this.convertToCliArgs(component));
    } catch (error) {
      throw new Error(`Failed to process YAML file: ${(error as Error).message}`);
    }
  }

  private static validateYamlDocument(yamlDoc: YamlDocument): void {
    if (!yamlDoc) {
      throw new Error('Invalid YAML: Document is empty');
    }

    if (!yamlDoc.components || !Array.isArray(yamlDoc.components)) {
      throw new Error('Invalid YAML: "components" must be an array');
    }

    if (yamlDoc.components.length === 0) {
      throw new Error('Invalid YAML: At least one component must be defined');
    }

    yamlDoc.components.forEach((component, index) => {
      if (!component.name) {
        throw new Error(`Invalid YAML: Component at index ${index} missing "name"`);
      }

      if (!component.output?.directory) {
        throw new Error(`Invalid YAML: Component "${component.name}" missing output directory`);
      }
    });
  }

  private static processComponent(
    component: YamlComponentDefinition,
    config?: YamlDocument['config'],
    overrides?: Partial<CliArgs>
  ): ProcessedYamlComponent {
    // Apply defaults from config
    const defaults = config?.defaults;

    const projectType = this.resolveProjectType(
      component.type,
      defaults?.type || 'auto'
    );

    const styleType = component.output.style || defaults?.style || 'css';

    const outputDirectory = overrides?.dir || component.output.directory || defaults?.directory || 'src/components';

    const propsString = this.generatePropsString(component.props || []);

    const emmet = component.structure?.emmet || component.structure?.jsx || '';

    const imports = this.processImports(component.imports || []);

    const hooks = component.hooks || [];

    const customEffects = component.custom?.effects || [];

    return {
      name: component.name,
      outputPath: outputDirectory,
      propsString,
      emmet,
      projectType,
      styleType,
      imports,
      hooks,
      customEffects
    };
  }

  private static resolveProjectType(componentType: ProjectType | 'auto', defaultType: ProjectType | 'auto'): ProjectType {
    if (componentType !== 'auto') {
      return componentType;
    }

    if (defaultType !== 'auto') {
      return defaultType;
    }

    // Auto-detect from project (fallback to tsx)
    try {
      fs.accessSync(path.join(process.cwd(), 'tsconfig.json'));
      return 'tsx';
    } catch {
      return 'jsx';
    }
  }

  private static generatePropsString(props: YamlPropDefinition[]): string {
    if (props.length === 0) return '';

    const propStrings = props.map(prop => {
      const optionalMarker = prop.required === false ? '?' : '';
      return `${prop.name}${optionalMarker}:${prop.type}`;
    });

    return propStrings.join(',');
  }

  private static processImports(imports: { from: string; import: string }[]): string[] {
    return imports.map(imp => `import ${imp.import} from '${imp.from}';`);
  }

  private static convertToCliArgs(component: ProcessedYamlComponent): CliArgs {
    const commandParts = ['make-component', component.name];

    if (component.propsString) {
      commandParts.push('-p', `"${component.propsString}"`);
    }

    if (component.outputPath !== 'src/components') {
      commandParts.push('-d', component.outputPath);
    }

    if (component.styleType !== 'css') {
      commandParts.push('-s', component.styleType);
    }

    if (component.emmet) {
      commandParts.push('-e', `"${component.emmet}"`);
    }

    if (component.projectType === 'jsx') {
      commandParts.push('--jsx');
    } else if (component.projectType === 'tsx') {
      commandParts.push('--tsx');
    }

    return {
      componentName: component.name,
      props: component.propsString,
      dir: component.outputPath,
      style: component.styleType,
      emmet: component.emmet,
      test: false,
      jsx: component.projectType === 'jsx',
      tsx: component.projectType === 'tsx',
      help: false,
      originalCommand: commandParts.join(' ')
    };
  }

  static async filterComponents(filePath: string, componentNames: string[]): Promise<CliArgs[]> {
    const allComponents = await this.processFile(filePath);

    return allComponents.filter(component =>
      componentNames.includes(component.componentName)
    );
  }
}