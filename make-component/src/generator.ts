import * as path from 'path';
import { CliArgs, ComponentFile } from './types';
import { EmmetProcessor } from './emmet/processor';
import { ComponentTemplateGenerator } from './templates/componentTemplate';
import { StyleTemplateGenerator } from './templates/styleTemplate';
import { FileOperations } from './utils/fileOperations';

export class ReactComponentGenerator {
  private args: CliArgs;

  constructor(args: CliArgs) {
    this.args = args;
  }

  async generate(): Promise<void> {
    const { componentName, dir, style, emmet: emmetString, test, jsx, tsx } = this.args;

    const projectType = FileOperations.detectProjectType(jsx, tsx);
    const extension = projectType === 'tsx' ? 'tsx' : 'jsx';

    const { jsx: jsxContent, classes, ids } = EmmetProcessor.expand(emmetString);

    const componentTemplate = ComponentTemplateGenerator.generate(
      componentName,
      this.args.props,
      jsxContent,
      projectType,
      style,
      this.args.originalCommand
    );

    const files: ComponentFile[] = [
      {
        path: path.join(dir, `${componentName}.${extension}`),
        content: componentTemplate.fullContent,
        type: 'component'
      }
    ];

    if (style === 'css' || style === 'scss') {
      const styleContent = StyleTemplateGenerator.generate(classes, ids, style, this.args.originalCommand);
      files.push({
        path: path.join(dir, `${componentName}.${style}`),
        content: styleContent,
        type: 'style'
      });
    }

    await FileOperations.createFiles(files, dir, test);
  }
}