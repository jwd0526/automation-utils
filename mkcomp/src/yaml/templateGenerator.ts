import * as yaml from 'js-yaml';
import { YamlDocument } from './types';

export class YamlTemplateGenerator {
  static generateTemplate(): string {
    const template: YamlDocument = {
      components: [
        {
          name: 'Button',
          type: 'tsx',
          output: {
            directory: 'src/components/ui',
            style: 'css'
          },
          props: [
            {
              name: 'children',
              type: 'React.ReactNode',
              required: false
            },
            {
              name: 'variant',
              type: "'primary' | 'secondary' | 'danger'",
              required: false,
              default: "'primary'"
            },
            {
              name: 'size',
              type: "'sm' | 'md' | 'lg'",
              required: false,
              default: "'md'"
            },
            {
              name: 'onClick',
              type: '() => void',
              required: false
            },
            {
              name: 'disabled',
              type: 'boolean',
              required: false,
              default: false
            }
          ],
          structure: {
            emmet: 'button.btn[type=button]>span.btn-text'
          }
        },
        {
          name: 'Modal',
          type: 'tsx',
          output: {
            directory: 'src/components/overlays',
            style: 'scss'
          },
          props: [
            {
              name: 'isOpen',
              type: 'boolean',
              required: true
            },
            {
              name: 'title',
              type: 'string',
              required: true
            },
            {
              name: 'children',
              type: 'React.ReactNode',
              required: false
            },
            {
              name: 'onClose',
              type: '() => void',
              required: true
            },
            {
              name: 'size',
              type: "'sm' | 'md' | 'lg' | 'xl'",
              required: false,
              default: "'md'"
            }
          ],
          structure: {
            emmet: 'div.modal-overlay>div.modal>div.modal-header>h2.modal-title+button.modal-close[aria-label="Close"]^div.modal-body+div.modal-footer'
          },
          hooks: ['useEffect', 'useState'],
          custom: {
            effects: [
              {
                trigger: 'isOpen',
                action: "document.body.style.overflow = isOpen ? 'hidden' : 'auto'"
              }
            ]
          }
        },
        {
          name: 'Card',
          type: 'jsx',
          output: {
            directory: 'src/components/ui',
            style: 'tailwind'
          },
          props: [
            {
              name: 'title',
              type: 'string',
              required: true
            },
            {
              name: 'description',
              type: 'string',
              required: false
            },
            {
              name: 'children',
              type: 'React.ReactNode',
              required: false
            }
          ],
          structure: {
            emmet: 'div.bg-white.rounded-lg.shadow-md.p-6>h3.text-lg.font-semibold.mb-2+p.text-gray-600.mb-4+div.card-content'
          }
        }
      ],
      config: {
        defaults: {
          type: 'auto',
          style: 'css',
          directory: 'src/components'
        }
      }
    };

    const yamlContent = yaml.dump(template, {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
      sortKeys: false
    });

    return this.addComments(yamlContent);
  }

  private static addComments(yamlContent: string): string {
    const header = `# mkcomp YAML Template
# This file defines multiple components that can be batch-generated
#
# Usage:
#   mkcomp --from-yaml components.yaml
#   mkcomp --from-yaml components.yaml --only Button,Modal
#   mkcomp --from-yaml components.yaml --test
#
# For more examples and documentation, visit:
# https://github.com/your-repo/mkcomp

`;

    // Add comments without breaking YAML structure
    const componentComments = yamlContent
      .replace('components:', '# Example components with different configurations\ncomponents:')
      .replace('  - name: Button', '  # Basic UI Button Component\n  - name: Button')
      .replace('  - name: Modal', '  # Modal Dialog with hooks and effects\n  - name: Modal')
      .replace('  - name: Card', '  # Tailwind Card Component (JavaScript)\n  - name: Card')
      .replace('\nconfig:', '\n# Global configuration settings (only defaults are currently supported)\nconfig:')
      .replace('  defaults:', '  # Default settings for all components\n  defaults:');

    return header + componentComments;
  }

  static generateMinimalTemplate(): string {
    const minimalTemplate: YamlDocument = {
      components: [
        {
          name: 'ExampleComponent',
          type: 'auto',
          output: {
            directory: 'src/components',
            style: 'css'
          },
          props: [
            {
              name: 'title',
              type: 'string',
              required: true
            },
            {
              name: 'children',
              type: 'React.ReactNode',
              required: false
            }
          ],
          structure: {
            emmet: 'div.example>h2.title+div.content'
          }
        }
      ]
    };

    const yamlContent = yaml.dump(minimalTemplate, {
      indent: 2,
      lineWidth: 80,
      noRefs: true
    });

    return `# Minimal React Component Template
# Add your components here

${yamlContent}`;
  }
}