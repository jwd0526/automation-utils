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
        },
        stylePresets: {
          theme: {
            primary: '#3b82f6',
            secondary: '#64748b',
            danger: '#ef4444',
            success: '#10b981'
          }
        },
        templates: {
          page: {
            structure: 'div.page>header.page-header+main.page-content+footer.page-footer',
            style: 'scss'
          },
          form: {
            structure: 'form.form>div.form-header+div.form-body+div.form-footer',
            hooks: ['useState', 'useCallback']
          }
        },
        naming: {
          component: 'PascalCase',
          style: 'kebab-case'
        },
        output: {
          structure: 'flat'
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
    const header = `# React Component Generator YAML Template
# This file defines multiple components that can be batch-generated
#
# Usage:
#   make-component --from-yaml components.yaml
#   make-component --from-yaml components.yaml --only Button,Modal
#   make-component --from-yaml components.yaml --test
#
# For more examples and documentation, visit:
# https://github.com/your-repo/react-component-generator

`;

    const componentComments = yamlContent
      .replace('components:', 'components:\n  # Example components with different configurations')
      .replace('- name: Button', '\n  # Basic UI Button Component\n  - name: Button')
      .replace('- name: Modal', '\n  # Modal Dialog with hooks and effects\n  - name: Modal')
      .replace('- name: Card', '\n  # Tailwind Card Component (JavaScript)\n  - name: Card')
      .replace('config:', '\n# Global configuration settings\nconfig:')
      .replace('defaults:', '  # Default settings for all components\n  defaults:')
      .replace('stylePresets:', '  # Style presets and theme colors\n  stylePresets:')
      .replace('templates:', '  # Reusable component templates\n  templates:')
      .replace('naming:', '  # File naming conventions\n  naming:')
      .replace('output:', '  # Output structure options\n  output:');

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