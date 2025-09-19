import { PropsParser } from '../src/templates/propsParser';
import { TestRunner, TestAssertions } from './utils/testHelpers';

const runner = new TestRunner();

runner.test('PropsParser - Empty props string', () => {
  const result = PropsParser.parse('', 'Button');
  TestAssertions.assertEqual(result.interface, '');
  TestAssertions.assertEqual(result.propTypes, '');
});

runner.test('PropsParser - Single string prop', () => {
  const result = PropsParser.parse('text:string', 'Button');
  TestAssertions.assertContains(result.interface, 'interface ButtonProps');
  TestAssertions.assertContains(result.interface, 'text: string;');
  TestAssertions.assertNotContains(result.interface, 'text?:');

  TestAssertions.assertContains(result.propTypes, 'Button.propTypes');
  TestAssertions.assertContains(result.propTypes, 'text: PropTypes.string.isRequired');
});

runner.test('PropsParser - Single optional prop', () => {
  const result = PropsParser.parse('text?:string', 'Button');
  TestAssertions.assertContains(result.interface, 'text?: string;');
  TestAssertions.assertContains(result.propTypes, 'text: PropTypes.string,');
  TestAssertions.assertNotContains(result.propTypes, '.isRequired');
});

runner.test('PropsParser - Multiple props with different types', () => {
  const result = PropsParser.parse('title:string,count:number,isVisible:boolean,onClick:()=>void', 'Modal');

  TestAssertions.assertContains(result.interface, 'interface ModalProps');
  TestAssertions.assertContains(result.interface, 'title: string;');
  TestAssertions.assertContains(result.interface, 'count: number;');
  TestAssertions.assertContains(result.interface, 'isVisible: boolean;');
  TestAssertions.assertContains(result.interface, 'onClick: ()=>void;');

  TestAssertions.assertContains(result.propTypes, 'Modal.propTypes');
  TestAssertions.assertContains(result.propTypes, 'title: PropTypes.string.isRequired');
  TestAssertions.assertContains(result.propTypes, 'count: PropTypes.number.isRequired');
  TestAssertions.assertContains(result.propTypes, 'isVisible: PropTypes.bool.isRequired');
  TestAssertions.assertContains(result.propTypes, 'onClick: PropTypes.func.isRequired');
});

runner.test('PropsParser - Mixed required and optional props', () => {
  const result = PropsParser.parse('title:string,subtitle?:string,count:number,isOpen?:boolean', 'Card');

  TestAssertions.assertContains(result.interface, 'title: string;');
  TestAssertions.assertContains(result.interface, 'subtitle?: string;');
  TestAssertions.assertContains(result.interface, 'count: number;');
  TestAssertions.assertContains(result.interface, 'isOpen?: boolean;');

  TestAssertions.assertContains(result.propTypes, 'title: PropTypes.string.isRequired');
  TestAssertions.assertContains(result.propTypes, 'subtitle: PropTypes.string,');
  TestAssertions.assertContains(result.propTypes, 'count: PropTypes.number.isRequired');
  TestAssertions.assertContains(result.propTypes, 'isOpen: PropTypes.bool,');
});

runner.test('PropsParser - Children prop', () => {
  const result = PropsParser.parse('children', 'Container');

  TestAssertions.assertContains(result.interface, 'interface ContainerProps');
  TestAssertions.assertContains(result.interface, 'children?: React.ReactNode;');

  TestAssertions.assertContains(result.propTypes, 'Container.propTypes');
  TestAssertions.assertContains(result.propTypes, 'children: PropTypes.node,');
  TestAssertions.assertNotContains(result.propTypes, '.isRequired');
});

runner.test('PropsParser - Props with children at end', () => {
  const result = PropsParser.parse('title:string,className?:string,children', 'Wrapper');

  TestAssertions.assertContains(result.interface, 'title: string;');
  TestAssertions.assertContains(result.interface, 'className?: string;');
  TestAssertions.assertContains(result.interface, 'children?: React.ReactNode;');

  TestAssertions.assertContains(result.propTypes, 'title: PropTypes.string.isRequired');
  TestAssertions.assertContains(result.propTypes, 'className: PropTypes.string,');
  TestAssertions.assertContains(result.propTypes, 'children: PropTypes.node,');
});

runner.test('PropsParser - Props without types default to any', () => {
  const result = PropsParser.parse('data,config?', 'Component');

  TestAssertions.assertContains(result.interface, 'data: any;');
  TestAssertions.assertContains(result.interface, 'config?: any;');

  TestAssertions.assertContains(result.propTypes, 'data: PropTypes.any.isRequired');
  TestAssertions.assertContains(result.propTypes, 'config: PropTypes.any,');
});

runner.test('PropsParser - Custom type handling', () => {
  const result = PropsParser.parse('user:User,items:Item[],callback:CustomCallback', 'List');

  TestAssertions.assertContains(result.interface, 'user: User;');
  TestAssertions.assertContains(result.interface, 'items: Item[];');
  TestAssertions.assertContains(result.interface, 'callback: CustomCallback;');

  TestAssertions.assertContains(result.propTypes, 'user: PropTypes.any.isRequired');
  TestAssertions.assertContains(result.propTypes, 'items: PropTypes.any.isRequired');
  TestAssertions.assertContains(result.propTypes, 'callback: PropTypes.any.isRequired');
});

runner.test('PropsParser - Complex real-world example', () => {
  const result = PropsParser.parse(
    'title:string,isOpen:boolean,onClose:()=>void,size?:string,className?:string,children',
    'Modal'
  );

  TestAssertions.assertContains(result.interface, 'interface ModalProps');
  TestAssertions.assertContains(result.interface, 'title: string;');
  TestAssertions.assertContains(result.interface, 'isOpen: boolean;');
  TestAssertions.assertContains(result.interface, 'onClose: ()=>void;');
  TestAssertions.assertContains(result.interface, 'size?: string;');
  TestAssertions.assertContains(result.interface, 'className?: string;');
  TestAssertions.assertContains(result.interface, 'children?: React.ReactNode;');

  TestAssertions.assertContains(result.propTypes, 'Modal.propTypes');
  TestAssertions.assertContains(result.propTypes, 'title: PropTypes.string.isRequired');
  TestAssertions.assertContains(result.propTypes, 'isOpen: PropTypes.bool.isRequired');
  TestAssertions.assertContains(result.propTypes, 'onClose: PropTypes.func.isRequired');
  TestAssertions.assertContains(result.propTypes, 'size: PropTypes.string,');
  TestAssertions.assertContains(result.propTypes, 'className: PropTypes.string,');
  TestAssertions.assertContains(result.propTypes, 'children: PropTypes.node,');
});

runner.test('PropsParser - Whitespace handling', () => {
  const result = PropsParser.parse(' title : string , count? : number , children ', 'Component');

  TestAssertions.assertContains(result.interface, 'title: string;');
  TestAssertions.assertContains(result.interface, 'count?: number;');
  TestAssertions.assertContains(result.interface, 'children?: React.ReactNode;');
});

export default runner;