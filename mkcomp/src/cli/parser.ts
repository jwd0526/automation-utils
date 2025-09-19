import { CliArgs, StyleType } from '../types';

export class CliParser {
  static parse(args: string[]): CliArgs {
    const parsed: CliArgs = {
      componentName: '',
      props: '',
      dir: process.cwd(),
      style: 'css',
      emmet: '',
      test: false,
      jsx: false,
      tsx: false,
      help: false,
      originalCommand: `mkcomp ${args.join(' ')}`,
      fromYaml: undefined,
      template: false,
      only: undefined
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      switch (arg) {
        case '-h':
        case '--help':
          parsed.help = true;
          break;
        case '--test':
          parsed.test = true;
          break;
        case '--jsx':
          parsed.jsx = true;
          break;
        case '--tsx':
          parsed.tsx = true;
          break;
        case '--from-yaml':
          parsed.fromYaml = args[++i] || '';
          break;
        case '--template':
          parsed.template = true;
          break;
        case '--only':
          const onlyArg = args[++i] || '';
          parsed.only = onlyArg.split(',').map(s => s.trim()).filter(Boolean);
          break;
        case '-p':
        case '--props':
          parsed.props = args[++i] || '';
          break;
        case '-d':
        case '--dir':
          parsed.dir = args[++i] || process.cwd();
          break;
        case '-s':
        case '--style':
          const styleValue = args[++i] as StyleType;
          if (['css', 'scss', 'tailwind', 'styled', 'none'].includes(styleValue)) {
            parsed.style = styleValue;
          }
          break;
        case '-e':
        case '--emmet':
          parsed.emmet = args[++i] || '';
          break;
        default:
          if (!parsed.componentName && !arg.startsWith('-')) {
            parsed.componentName = arg;
          }
          break;
      }
    }

    return parsed;
  }

  static showHelp(): void {
    console.log(`
mkcomp

USAGE:
    mkcomp <componentName> [options]
    mkcomp --from-yaml <file.yaml> [options]
    mkcomp --template [file.yaml]

ARGUMENTS:
    componentName    Component name in PascalCase (e.g., Button, ModalDialog, UserCard)

OPTIONS:
    -p, --props <props>        Component props (e.g., "title:string,count:number,onClick:()=>void")
    -d, --dir <directory>      Output directory (default: current directory)
    -s, --style <type>         Style type: css|scss|tailwind|styled|none (default: css)
    -e, --emmet <string>       Emmet abbreviation for JSX structure
    --test                     Dry-run mode (preview without creating files)
    --jsx                      Force JavaScript .jsx files
    --tsx                      Force TypeScript .tsx files
    --from-yaml <file>         Generate components from YAML configuration file
    --template [file]          Create a YAML template file (default: components.yaml)
    --only <components>        Generate only specified components from YAML (comma-separated)
    -h, --help                 Show this help

EXAMPLES:
    # Single component generation
    mkcomp Button
    mkcomp Button -p "text:string,onClick:()=>void"
    mkcomp Card -p "title:string,children" -s tailwind
    mkcomp Modal -d src/components -e "div.modal>div.content>h2+p"
    mkcomp Badge --test -p "variant:string,children"

    # YAML-based generation
    mkcomp --template                              # Create template
    mkcomp --template my-components.yaml           # Create custom template
    mkcomp --from-yaml components.yaml             # Generate all components
    mkcomp --from-yaml components.yaml --test      # Preview generation
    mkcomp --from-yaml components.yaml --only Button,Modal
`);
  }
}

export class ComponentValidator {
  static validateComponentName(name: string): void {
    if (!name) {
      throw new Error('Component name is required');
    }
    if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
      throw new Error('Component name must start with capital letter and contain only letters and numbers');
    }
  }
}