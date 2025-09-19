import { ComponentTemplateGenerator } from '../src/templates/componentTemplate';
import { StyleTemplateGenerator } from '../src/templates/styleTemplate';
import { TestRunner, TestAssertions } from './utils/testHelpers';

const runner = new TestRunner();

// Component Template Tests
runner.test('ComponentTemplate - Basic TypeScript component', () => {
  const result = ComponentTemplateGenerator.generate(
    'Button',
    '',
    '<button className="btn">Click me</button>',
    'tsx',
    'css'
  );

  TestAssertions.assertContains(result.imports, "import React from 'react';");
  TestAssertions.assertContains(result.imports, "import './Button.css';");
  TestAssertions.assertNotContains(result.imports, "PropTypes");

  TestAssertions.assertContains(result.component, 'const Button = () => {');
  TestAssertions.assertContains(result.component, 'return (');
  TestAssertions.assertContains(result.component, '<button className="btn">Click me</button>');
  TestAssertions.assertContains(result.component, 'export default Button;');

  TestAssertions.assertEqual(result.fullContent, result.imports + '\n\n' + result.component);
});

runner.test('ComponentTemplate - Basic JavaScript component', () => {
  const result = ComponentTemplateGenerator.generate(
    'Button',
    '',
    '<button className="btn">Click me</button>',
    'jsx',
    'css'
  );

  TestAssertions.assertContains(result.imports, "import React from 'react';");
  TestAssertions.assertContains(result.imports, "import PropTypes from 'prop-types';");
  TestAssertions.assertContains(result.imports, "import './Button.css';");

  TestAssertions.assertContains(result.component, 'const Button = () => {');
  TestAssertions.assertContains(result.component, 'export default Button;');
});

runner.test('ComponentTemplate - TypeScript with props', () => {
  const result = ComponentTemplateGenerator.generate(
    'Button',
    'text:string,onClick:()=>void',
    '<button onClick={props.onClick}>{props.text}</button>',
    'tsx',
    'css'
  );

  TestAssertions.assertContains(result.component, 'interface ButtonProps');
  TestAssertions.assertContains(result.component, 'text: string;');
  TestAssertions.assertContains(result.component, 'onClick: ()=>void;');
  TestAssertions.assertContains(result.component, 'const Button = (props: ButtonProps) => {');
  TestAssertions.assertNotContains(result.component, 'PropTypes');
});

runner.test('ComponentTemplate - JavaScript with props', () => {
  const result = ComponentTemplateGenerator.generate(
    'Button',
    'text:string,onClick:()=>void',
    '<button onClick={props.onClick}>{props.text}</button>',
    'jsx',
    'css'
  );

  TestAssertions.assertNotContains(result.component, 'interface');
  TestAssertions.assertContains(result.component, 'const Button = (props) => {');
  TestAssertions.assertContains(result.component, 'Button.propTypes');
  TestAssertions.assertContains(result.component, 'text: PropTypes.string.isRequired');
  TestAssertions.assertContains(result.component, 'onClick: PropTypes.func.isRequired');
});

runner.test('ComponentTemplate - SCSS imports', () => {
  const result = ComponentTemplateGenerator.generate(
    'Button',
    '',
    '<button>Click</button>',
    'tsx',
    'scss'
  );

  TestAssertions.assertContains(result.imports, "import './Button.scss';");
  TestAssertions.assertNotContains(result.imports, "import './Button.css';");
});

runner.test('ComponentTemplate - Tailwind (no style imports)', () => {
  const result = ComponentTemplateGenerator.generate(
    'Button',
    '',
    '<button className="bg-blue-500">Click</button>',
    'tsx',
    'tailwind'
  );

  TestAssertions.assertNotContains(result.imports, "import './Button.css';");
  TestAssertions.assertNotContains(result.imports, "import './Button.scss';");
});

runner.test('ComponentTemplate - No style imports for none style', () => {
  const result = ComponentTemplateGenerator.generate(
    'Button',
    '',
    '<button>Click</button>',
    'tsx',
    'none'
  );

  TestAssertions.assertNotContains(result.imports, "import './Button.css';");
  TestAssertions.assertNotContains(result.imports, "import './Button.scss';");
});

runner.test('ComponentTemplate - Complex props with children', () => {
  const result = ComponentTemplateGenerator.generate(
    'Modal',
    'title:string,isOpen:boolean,onClose:()=>void,children',
    '<div className="modal">{props.children}</div>',
    'tsx',
    'css'
  );

  TestAssertions.assertContains(result.component, 'interface ModalProps');
  TestAssertions.assertContains(result.component, 'title: string;');
  TestAssertions.assertContains(result.component, 'isOpen: boolean;');
  TestAssertions.assertContains(result.component, 'onClose: ()=>void;');
  TestAssertions.assertContains(result.component, 'children?: React.ReactNode;');
  TestAssertions.assertContains(result.component, 'const Modal = (props: ModalProps) => {');
});

// Style Template Tests
runner.test('StyleTemplate - CSS generation', () => {
  const result = StyleTemplateGenerator.generate(['btn', 'primary'], ['header'], 'css');

  TestAssertions.assertContains(result, '/* Generated styles */');
  TestAssertions.assertContains(result, '.btn {');
  TestAssertions.assertContains(result, '.primary {');
  TestAssertions.assertContains(result, '#header {');
  TestAssertions.assertContains(result, '/* Add your styles here */');
});

runner.test('StyleTemplate - SCSS generation', () => {
  const result = StyleTemplateGenerator.generate(['btn', 'primary'], ['header'], 'scss');

  TestAssertions.assertContains(result, '// Generated styles');
  TestAssertions.assertContains(result, '.btn {');
  TestAssertions.assertContains(result, '.primary {');
  TestAssertions.assertContains(result, '#header {');
  TestAssertions.assertContains(result, '// Add your styles here');
  TestAssertions.assertNotContains(result, '/* Add your styles here */');
});

runner.test('StyleTemplate - Tailwind returns empty', () => {
  const result = StyleTemplateGenerator.generate(['btn', 'primary'], ['header'], 'tailwind');
  TestAssertions.assertEqual(result, '');
});

runner.test('StyleTemplate - None style returns empty', () => {
  const result = StyleTemplateGenerator.generate(['btn', 'primary'], ['header'], 'none');
  TestAssertions.assertEqual(result, '');
});

runner.test('StyleTemplate - Empty classes and IDs', () => {
  const result = StyleTemplateGenerator.generate([], [], 'css');
  TestAssertions.assertContains(result, '/* Generated styles */');
  TestAssertions.assertNotContains(result, '.{');
  TestAssertions.assertNotContains(result, '#{');
});

runner.test('StyleTemplate - Multiple classes and IDs', () => {
  const classes = ['container', 'header', 'nav', 'content', 'footer'];
  const ids = ['main', 'sidebar', 'app'];
  const result = StyleTemplateGenerator.generate(classes, ids, 'css');

  classes.forEach(cls => {
    TestAssertions.assertContains(result, `.${cls} {`);
  });

  ids.forEach(id => {
    TestAssertions.assertContains(result, `#${id} {`);
  });
});

runner.test('StyleTemplate - Special characters in class names', () => {
  const result = StyleTemplateGenerator.generate(['btn-primary', 'text_large', 'bg-blue-500'], [], 'css');

  TestAssertions.assertContains(result, '.btn-primary {');
  TestAssertions.assertContains(result, '.text_large {');
  TestAssertions.assertContains(result, '.bg-blue-500 {');
});

export default runner;