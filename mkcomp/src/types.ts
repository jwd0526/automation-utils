export interface CliArgs {
  componentName: string;
  props: string;
  dir: string;
  style: StyleType;
  emmet: string;
  test: boolean;
  jsx: boolean;
  tsx: boolean;
  help: boolean;
  originalCommand?: string;
  fromYaml?: string;
  template?: boolean;
  only?: string[];
}

export type StyleType = 'css' | 'scss' | 'tailwind' | 'styled' | 'none';

export type ProjectType = 'jsx' | 'tsx';

export interface ParsedProps {
  interface: string;
  propTypes: string;
}

export interface PropDefinition {
  name: string;
  type: string;
  isOptional: boolean;
}

export interface ComponentFile {
  path: string;
  content: string;
  type: 'component' | 'style';
}

export interface EmmetResult {
  jsx: string;
  classes: string[];
  ids: string[];
}

export interface ComponentTemplate {
  imports: string;
  component: string;
  fullContent: string;
}