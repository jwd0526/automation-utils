import { StyleType, ProjectType } from '../types';

export interface YamlPropDefinition {
  name: string;
  type: string;
  required?: boolean;
  default?: string | boolean | number;
}

export interface YamlComponentStructure {
  emmet?: string;
  jsx?: string;
}

export interface YamlComponentImport {
  from: string;
  import: string;
}

export interface YamlComponentHooks {
  effects?: Array<{
    trigger: string;
    action: string;
  }>;
}

export interface YamlComponentCustom {
  effects?: Array<{
    trigger: string;
    action: string;
  }>;
}

export interface YamlComponentOutput {
  directory: string;
  style: StyleType;
}

export interface YamlComponentDefinition {
  name: string;
  type: ProjectType | 'auto';
  output: YamlComponentOutput;
  props?: YamlPropDefinition[];
  structure?: YamlComponentStructure;
  hooks?: string[];
  custom?: YamlComponentCustom;
  imports?: YamlComponentImport[];
}

export interface YamlConfigDefaults {
  type: ProjectType | 'auto';
  style: StyleType;
  directory: string;
}

export interface YamlConfigStylePresets {
  theme?: Record<string, string>;
}

export interface YamlConfigTemplates {
  [templateName: string]: {
    structure: string;
    style?: StyleType;
    hooks?: string[];
  };
}

export interface YamlConfigNaming {
  component: 'PascalCase' | 'camelCase' | 'kebab-case';
  style: 'kebab-case' | 'camelCase' | 'PascalCase';
}

export interface YamlConfigOutput {
  structure: 'flat' | 'grouped' | 'typed';
}

export interface YamlConfig {
  defaults?: YamlConfigDefaults;
  stylePresets?: YamlConfigStylePresets;
  templates?: YamlConfigTemplates;
  naming?: YamlConfigNaming;
  output?: YamlConfigOutput;
}

export interface YamlDocument {
  components: YamlComponentDefinition[];
  config?: YamlConfig;
}

export interface ProcessedYamlComponent {
  name: string;
  outputPath: string;
  propsString: string;
  emmet: string;
  projectType: ProjectType;
  styleType: StyleType;
  imports: string[];
  hooks: string[];
  customEffects: Array<{
    trigger: string;
    action: string;
  }>;
}