import { CliParser, ComponentValidator } from '../src/cli/parser';
import { TestRunner, TestAssertions } from './utils/testHelpers';

const runner = new TestRunner();

runner.test('CliParser - Basic component name parsing', () => {
  const args = CliParser.parse(['Button']);
  TestAssertions.assertEqual(args.componentName, 'Button');
  TestAssertions.assertEqual(args.props, '');
  TestAssertions.assertEqual(args.style, 'css');
  TestAssertions.assertEqual(args.test, false);
});

runner.test('CliParser - Props parsing', () => {
  const args = CliParser.parse(['Button', '-p', 'text:string,onClick:()=>void']);
  TestAssertions.assertEqual(args.componentName, 'Button');
  TestAssertions.assertEqual(args.props, 'text:string,onClick:()=>void');
});

runner.test('CliParser - Directory parsing', () => {
  const args = CliParser.parse(['Button', '-d', 'src/components']);
  TestAssertions.assertEqual(args.dir, 'src/components');
});

runner.test('CliParser - Style type parsing', () => {
  const args = CliParser.parse(['Button', '-s', 'tailwind']);
  TestAssertions.assertEqual(args.style, 'tailwind');
});

runner.test('CliParser - Emmet parsing', () => {
  const args = CliParser.parse(['Button', '-e', 'div.btn>span.text']);
  TestAssertions.assertEqual(args.emmet, 'div.btn>span.text');
});

runner.test('CliParser - Test flag', () => {
  const args = CliParser.parse(['Button', '--test']);
  TestAssertions.assertEqual(args.test, true);
});

runner.test('CliParser - JSX flag', () => {
  const args = CliParser.parse(['Button', '--jsx']);
  TestAssertions.assertEqual(args.jsx, true);
  TestAssertions.assertEqual(args.tsx, false);
});

runner.test('CliParser - TSX flag', () => {
  const args = CliParser.parse(['Button', '--tsx']);
  TestAssertions.assertEqual(args.tsx, true);
  TestAssertions.assertEqual(args.jsx, false);
});

runner.test('CliParser - Help flag', () => {
  const args = CliParser.parse(['--help']);
  TestAssertions.assertEqual(args.help, true);
});

runner.test('CliParser - Long form arguments', () => {
  const args = CliParser.parse([
    'Button',
    '--props', 'text:string',
    '--dir', 'components',
    '--style', 'scss',
    '--emmet', 'button.btn'
  ]);
  TestAssertions.assertEqual(args.componentName, 'Button');
  TestAssertions.assertEqual(args.props, 'text:string');
  TestAssertions.assertEqual(args.dir, 'components');
  TestAssertions.assertEqual(args.style, 'scss');
  TestAssertions.assertEqual(args.emmet, 'button.btn');
});

runner.test('CliParser - Complex arguments combination', () => {
  const args = CliParser.parse([
    'ModalDialog',
    '-p', 'title:string,isOpen:boolean,onClose:()=>void,children',
    '-d', 'src/components/ui',
    '-s', 'tailwind',
    '-e', 'div.modal>div.backdrop+div.content>h2.title+div.body',
    '--test',
    '--tsx'
  ]);
  TestAssertions.assertEqual(args.componentName, 'ModalDialog');
  TestAssertions.assertEqual(args.props, 'title:string,isOpen:boolean,onClose:()=>void,children');
  TestAssertions.assertEqual(args.dir, 'src/components/ui');
  TestAssertions.assertEqual(args.style, 'tailwind');
  TestAssertions.assertEqual(args.emmet, 'div.modal>div.backdrop+div.content>h2.title+div.body');
  TestAssertions.assertEqual(args.test, true);
  TestAssertions.assertEqual(args.tsx, true);
});

runner.test('ComponentValidator - Valid component names', () => {
  // These should not throw errors
  ComponentValidator.validateComponentName('Button');
  ComponentValidator.validateComponentName('ModalDialog');
  ComponentValidator.validateComponentName('UserCard123');
  ComponentValidator.validateComponentName('A');
  TestAssertions.assertTrue(true); // If we get here, all validations passed
});

runner.test('ComponentValidator - Invalid component names', () => {
  const invalidNames = [
    '',
    'button',
    'modal-dialog',
    'user_card',
    '123Button',
    'button.component',
    'Button-Component'
  ];

  invalidNames.forEach(name => {
    try {
      ComponentValidator.validateComponentName(name);
      throw new Error(`Expected validation to fail for "${name}"`);
    } catch (error) {
      const message = (error as Error).message;
      if (!message.includes('Component name must start with capital letter') &&
          !message.includes('Component name is required')) {
        throw error;
      }
    }
  });
});

export default runner;