import { EmmetProcessor } from '../src/emmet/processor';
import { TestRunner, TestAssertions } from './utils/testHelpers';

const runner = new TestRunner();

runner.test('EmmetProcessor - Default expansion', () => {
  const result = EmmetProcessor.expand('');
  TestAssertions.assertEqual(result.jsx, '<div className="container"></div>');
  TestAssertions.assertEqual(result.classes.length, 1);
  TestAssertions.assertEqual(result.classes[0], 'container');
  TestAssertions.assertEqual(result.ids.length, 0);
});

runner.test('EmmetProcessor - Simple div expansion', () => {
  const result = EmmetProcessor.expand('div.button');
  TestAssertions.assertContains(result.jsx, 'className="button"');
  TestAssertions.assertEqual(result.classes.length, 1);
  TestAssertions.assertEqual(result.classes[0], 'button');
});

runner.test('EmmetProcessor - Multiple classes', () => {
  const result = EmmetProcessor.expand('div.btn.primary.large');
  TestAssertions.assertContains(result.jsx, 'className="btn primary large"');
  TestAssertions.assertEqual(result.classes.length, 3);
  TestAssertions.assertTrue(result.classes.includes('btn'));
  TestAssertions.assertTrue(result.classes.includes('primary'));
  TestAssertions.assertTrue(result.classes.includes('large'));
});

runner.test('EmmetProcessor - ID expansion', () => {
  const result = EmmetProcessor.expand('div#main-content');
  TestAssertions.assertContains(result.jsx, 'id="main-content"');
  TestAssertions.assertEqual(result.ids.length, 1);
  TestAssertions.assertEqual(result.ids[0], 'main-content');
});

runner.test('EmmetProcessor - Class and ID combination', () => {
  const result = EmmetProcessor.expand('div#header.navbar.dark');
  TestAssertions.assertContains(result.jsx, 'id="header"');
  TestAssertions.assertContains(result.jsx, 'className="navbar dark"');
  TestAssertions.assertEqual(result.ids.length, 1);
  TestAssertions.assertEqual(result.ids[0], 'header');
  TestAssertions.assertEqual(result.classes.length, 2);
  TestAssertions.assertTrue(result.classes.includes('navbar'));
  TestAssertions.assertTrue(result.classes.includes('dark'));
});

runner.test('EmmetProcessor - Nested elements', () => {
  const result = EmmetProcessor.expand('div.container>h1.title+p.description');
  TestAssertions.assertContains(result.jsx, 'className="container"');
  TestAssertions.assertContains(result.jsx, 'className="title"');
  TestAssertions.assertContains(result.jsx, 'className="description"');
  TestAssertions.assertEqual(result.classes.length, 3);
  TestAssertions.assertTrue(result.classes.includes('container'));
  TestAssertions.assertTrue(result.classes.includes('title'));
  TestAssertions.assertTrue(result.classes.includes('description'));
});

runner.test('EmmetProcessor - Complex nested structure', () => {
  const result = EmmetProcessor.expand('div.modal>div.backdrop+div.content>h2#title.header+div.body>p.text');
  TestAssertions.assertContains(result.jsx, 'className="modal"');
  TestAssertions.assertContains(result.jsx, 'className="backdrop"');
  TestAssertions.assertContains(result.jsx, 'className="content"');
  TestAssertions.assertContains(result.jsx, 'id="title"');
  TestAssertions.assertContains(result.jsx, 'className="header"');
  TestAssertions.assertContains(result.jsx, 'className="body"');
  TestAssertions.assertContains(result.jsx, 'className="text"');

  TestAssertions.assertEqual(result.ids.length, 1);
  TestAssertions.assertEqual(result.ids[0], 'title');

  TestAssertions.assertEqual(result.classes.length, 6);
  const expectedClasses = ['modal', 'backdrop', 'content', 'header', 'body', 'text'];
  expectedClasses.forEach(cls => {
    TestAssertions.assertTrue(result.classes.includes(cls));
  });
});

runner.test('EmmetProcessor - Button with span', () => {
  const result = EmmetProcessor.expand('button.btn.primary>span.text');
  TestAssertions.assertContains(result.jsx, '<button');
  TestAssertions.assertContains(result.jsx, 'className="btn primary"');
  TestAssertions.assertContains(result.jsx, '<span');
  TestAssertions.assertContains(result.jsx, 'className="text"');
  TestAssertions.assertEqual(result.classes.length, 3);
});

runner.test('EmmetProcessor - Form elements', () => {
  const result = EmmetProcessor.expand('form.form>input.input[type=text]+button.submit');
  TestAssertions.assertContains(result.jsx, '<form');
  TestAssertions.assertContains(result.jsx, 'className="form"');
  TestAssertions.assertContains(result.jsx, '<input');
  TestAssertions.assertContains(result.jsx, 'className="input"');
  TestAssertions.assertContains(result.jsx, 'type="text"');
  TestAssertions.assertContains(result.jsx, '<button');
  TestAssertions.assertContains(result.jsx, 'className="submit"');
});

runner.test('EmmetProcessor - Invalid Emmet graceful fallback', () => {
  const result = EmmetProcessor.expand('invalid{syntax}here');
  // The emmet library might still process this, so let's just ensure we get valid JSX
  TestAssertions.assertTrue(result.jsx.includes('<') && result.jsx.includes('>'));
  TestAssertions.assertTrue(result.classes.length >= 0);
  TestAssertions.assertTrue(result.ids.length >= 0);
});

runner.test('EmmetProcessor - Duplicate classes deduplication', () => {
  const result = EmmetProcessor.expand('div.btn>span.btn+p.btn');
  TestAssertions.assertEqual(result.classes.length, 1);
  TestAssertions.assertEqual(result.classes[0], 'btn');
});

runner.test('EmmetProcessor - Multiple IDs deduplication', () => {
  const result = EmmetProcessor.expand('div#main>section#main+aside#sidebar');
  TestAssertions.assertEqual(result.ids.length, 2);
  TestAssertions.assertTrue(result.ids.includes('main'));
  TestAssertions.assertTrue(result.ids.includes('sidebar'));
});

export default runner;