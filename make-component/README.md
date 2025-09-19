# React Component Generator

A powerful TypeScript-based CLI tool for generating React components with Emmet support, multiple styling options, and YAML-based batch generation. Create consistent, well-structured React components with a single command or batch-generate entire component libraries.

## Features

- **Single & Batch Generation** - Create one component or many from YAML config
- **Multiple Style Systems** - CSS, SCSS, Tailwind, Styled Components, or none
- **Emmet Support** - Use Emmet abbreviations for rapid JSX structure creation
- **TypeScript & JavaScript** - Auto-detect or force specific file types
- **Props Management** - Define typed props with optional/required flags
- **Command Headers** - Every generated file includes creation metadata
- **Preview Mode** - See what will be generated before creating files
- **Single File Bundle** - Deploy as a single executable JavaScript file
- **Comprehensive Testing** - 80+ tests covering all functionality

## Quick Start

### Installation & Usage

#### From Local Build

```bash
# If you have the project locally, use the bundled version directly
node /path/to/react-component-generator/bundle/index.js Button

# Or copy to your PATH for global access
cp /path/to/react-component-generator/bundle/index.js /usr/local/bin/make-component
chmod +x /usr/local/bin/make-component
make-component Button
```

#### From GitHub

```bash
# Download the single file
curl -o make-component https://raw.githubusercontent.com/jwd0526/automation-utils/react-component-generator/main/bundle/index.js
chmod +x make-component

# Use immediately
./make-component Button

# Or install globally
sudo mv make-component /usr/local/bin/
make-component Button
```

### Development Setup (for contributors)

```bash
# Clone and setup
git clone <repository-url>
cd react-component-generator
npm install

# Build the project
npm run build

# Run directly from source (development)
npm run dev Button

# Use the bundled version
node bundle/index.js Button
```

### Basic Usage

```bash
# Simple component
make-component Button

# Component with props
make-component Button -p "text:string,onClick:()=>void"

# Component with styling
make-component Card -p "title:string,children" -s scss

# Component with Emmet structure
make-component Modal -e "div.modal>div.backdrop+div.content>h2.title+div.body"

# Preview without creating files
make-component Button --test
```

## Documentation

### Single Component Generation

#### Basic Syntax
```bash
make-component <ComponentName> [options]
```

#### Options

| Option | Description | Example |
|--------|-------------|---------|
| `-p, --props <props>` | Component props definition | `"title:string,count:number"` |
| `-d, --dir <directory>` | Output directory | `src/components/ui` |
| `-s, --style <type>` | Style type: css\|scss\|tailwind\|styled\|none | `scss` |
| `-e, --emmet <string>` | Emmet abbreviation for JSX structure | `"div.card>h2+p"` |
| `--test` | Preview mode (no files created) | |
| `--jsx` | Force JavaScript .jsx files | |
| `--tsx` | Force TypeScript .tsx files | |
| `-h, --help` | Show help | |

#### Props Format

Props are defined as comma-separated `name:type` pairs:

```bash
# Basic props
-p "title:string,count:number,isVisible:boolean"

# Optional props (use ?)
-p "title:string,subtitle?:string,children"

# Function props
-p "onClick:()=>void,onSubmit:(data:FormData)=>void"

# Complex types
-p "user:User,items:Item[],callback:(id:string)=>void"

# Special children prop (auto-typed as React.ReactNode)
-p "title:string,children"
```

#### Examples

```bash
# Basic button
make-component Button

# Button with props and CSS
make-component Button -p "text:string,variant:string,onClick:()=>void" -s css

# Card with Tailwind styling
make-component Card -p "title:string,children" -s tailwind \
  -e "div.bg-white.rounded-lg.shadow-md.p-6>h3.text-lg.font-semibold+div.content"

# Modal with TypeScript and SCSS
make-component Modal -p "isOpen:boolean,title:string,onClose:()=>void,children" \
  --tsx -s scss -e "div.modal-overlay>div.modal>div.modal-header+div.modal-body"

# Form input with validation
make-component FormInput -p "label:string,value?:string,error?:string,onChange:(value:string)=>void" \
  -e "div.form-group>label.form-label+input.form-input+span.form-error"
```

### YAML Batch Generation

#### Create Template

```bash
# Create default template
make-component --template

# Create custom template
make-component --template my-components.yaml
```

#### Generate from YAML

```bash
# Generate all components
make-component --from-yaml components.yaml

# Preview generation
make-component --from-yaml components.yaml --test

# Generate specific components only
make-component --from-yaml components.yaml --only Button,Modal,Card

# Override output directory
make-component --from-yaml components.yaml -d custom/output/dir
```

#### YAML Structure

```yaml
# components.yaml
components:
  - name: Button
    type: tsx  # tsx, jsx, auto
    output:
      directory: src/components/ui
      style: css  # css, scss, tailwind, styled, none
    props:
      - name: children
        type: React.ReactNode
        required: false
      - name: variant
        type: "'primary' | 'secondary' | 'danger'"
        required: false
        default: "'primary'"
      - name: onClick
        type: "() => void"
        required: false
    structure:
      emmet: "button.btn[type=button]>span.btn-text"

  - name: Modal
    type: tsx
    output:
      directory: src/components/overlays
      style: scss
    props:
      - name: isOpen
        type: boolean
        required: true
      - name: title
        type: string
        required: true
      - name: onClose
        type: "() => void"
        required: true
    structure:
      emmet: "div.modal-overlay>div.modal>div.modal-header>h2.modal-title+button.close^div.modal-body"
    hooks: [useEffect, useState]
    custom:
      effects:
        - trigger: isOpen
          action: "document.body.style.overflow = isOpen ? 'hidden' : 'auto'"

# Global configuration
config:
  defaults:
    type: auto
    style: css
    directory: src/components
  stylePresets:
    theme:
      primary: "#3b82f6"
      secondary: "#64748b"
  templates:
    page:
      structure: "div.page>header+main+footer"
      style: scss
```

## Styling Options

### CSS/SCSS
Generates separate `.css` or `.scss` files with extracted classes from Emmet structure:

```css
/* Generated by React Component Generator */
.btn {
  /* Add your styles here */
}

.btn-text {
  /* Add your styles here */
}
```

### Tailwind
Uses Tailwind classes inline, no separate style file:

```jsx
<button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
  <span className="btn-text">{children}</span>
</button>
```

### Styled Components
Generates styled-components (future feature):

```jsx
const StyledButton = styled.button`
  /* Component styles */
`;
```

### None
Plain JSX structure without styling setup.

## Development

### Project Structure

```
src/
├── cli/
│   └── parser.ts              # CLI argument parsing
├── emmet/
│   └── processor.ts           # Emmet expansion logic
├── templates/
│   ├── componentTemplate.ts   # React component generation
│   ├── styleTemplate.ts      # CSS/SCSS generation
│   └── propsParser.ts        # Props interface generation
├── utils/
│   └── fileOperations.ts     # File system operations
├── yaml/
│   ├── processor.ts          # YAML parsing and processing
│   ├── templateGenerator.ts  # YAML template creation
│   └── types.ts             # YAML type definitions
├── batchGenerator.ts         # Batch component generation
├── generator.ts              # Main component generator
├── types.ts                  # Core type definitions
└── index.ts                  # CLI entry point

test/
├── utils/testHelpers.ts      # Test utilities
├── cli.test.ts              # CLI parsing tests
├── emmet.test.ts            # Emmet processing tests
├── props.test.ts            # Props parsing tests
├── templates.test.ts        # Template generation tests
├── fileOperations.test.ts   # File operations tests
├── yaml.test.ts             # YAML processing tests
├── integration.test.ts      # End-to-end tests
└── index.ts                 # Test runner
```

### Build Scripts

```bash
# Development
npm run dev <args>              # Run from TypeScript source
npm run clean                   # Clean build artifacts

# Building
npm run build                   # Compile TS and create bundle
npm run bundle                  # Create bundled single file

# Testing
npm test                        # Run all tests with cleanup
npm run test:persist           # Run tests, preserve generated files
npm run test:build             # Test the bundled version
npm run test:all               # Run all test types
```

### Testing

The project includes comprehensive testing with 80+ test cases:

- **CLI Parsing** (13 tests) - Argument parsing and validation
- **Emmet Processing** (12 tests) - HTML expansion and parsing
- **Props Parsing** (11 tests) - TypeScript interface generation
- **Template Generation** (15 tests) - Component and style templates
- **File Operations** (10 tests) - File system operations
- **YAML Processing** (10 tests) - YAML parsing and validation
- **Integration Tests** (12+ tests) - End-to-end scenarios

```bash
# Run tests with file cleanup
npm test

# Run tests preserving generated files for inspection
npm run test:persist

# Generated test files will be in test/tmp/ with command headers
```

## Deployment

### Single File Bundle

Create a portable single-file executable:

```bash
npm run build
cp bundle/index.js make-component.js
chmod +x make-component.js

# Use anywhere
./make-component.js Button -p "text:string"
```

### Global Installation

```bash
# Copy to PATH
cp bundle/index.js /usr/local/bin/make-component
chmod +x /usr/local/bin/make-component

# Use globally
make-component Button
```

### GitHub Distribution

Users can download and use directly:

```bash
# Download single file
curl -o make-component https://raw.githubusercontent.com/user/repo/main/bundle/index.js
chmod +x make-component

# Use immediately
./make-component Button -p "text:string,onClick:()=>void"
```

## Generated File Structure

### TypeScript Component

```tsx
// Generated by React Component Generator
// Command: make-component Button -p "text:string,onClick:()=>void" -s scss
// Generated at: 2024-01-15T10:30:45.123Z

import React from 'react';
import './Button.scss';

interface ButtonProps {
  text: string;
  onClick: () => void;
}

const Button = (props: ButtonProps) => {
  return (
    <button className="btn" onClick={props.onClick}>
      <span className="btn-text">{props.text}</span>
    </button>
  );
};

export default Button;
```

### JavaScript Component

```jsx
// Generated by React Component Generator
// Command: make-component Button -p "text:string,onClick:()=>void" --jsx
// Generated at: 2024-01-15T10:30:45.123Z

import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

const Button = (props) => {
  return (
    <button className="btn" onClick={props.onClick}>
      <span className="btn-text">{props.text}</span>
    </button>
  );
};

Button.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default Button;
```

### Style File

```scss
// Generated by React Component Generator
// Command: make-component Button -p "text:string,onClick:()=>void" -s scss
// Generated at: 2024-01-15T10:30:45.123Z

// Generated styles

.btn {
  // Add your styles here
}

.btn-text {
  // Add your styles here
}
```

## Advanced Examples

### Complex Modal Component

```bash
make-component Modal \
  -p "isOpen:boolean,title:string,size?:'sm'|'md'|'lg',onClose:()=>void,children" \
  -s scss \
  --tsx \
  -e "div.modal-overlay>div.modal.modal-\${size}>div.modal-header>h2.modal-title{Modal Title}+button.modal-close[aria-label=Close]^div.modal-body+div.modal-footer>button.btn.btn-secondary{Cancel}+button.btn.btn-primary{Confirm}"
```

### E-commerce Product Card

```bash
make-component ProductCard \
  -p "product:{id:string;name:string;price:number;image:string},onAddToCart:(id:string)=>void" \
  -s tailwind \
  -e "article.bg-white.rounded-lg.shadow-md.overflow-hidden>img.w-full.h-48.object-cover[src=\${product.image}][alt=\${product.name}]+div.p-4>h3.text-lg.font-semibold.mb-2{\${product.name}}+p.text-xl.font-bold.text-green-600{\$\${product.price}}+button.w-full.bg-blue-500.text-white.py-2.rounded.hover:bg-blue-600{Add to Cart}"
```

### Form Components Library

Create a YAML file for an entire form component library:

```yaml
# forms.yaml
components:
  - name: FormInput
    type: tsx
    output:
      directory: src/components/forms
      style: scss
    props:
      - name: label
        type: string
        required: true
      - name: type
        type: "'text' | 'email' | 'password' | 'number'"
        required: false
        default: "'text'"
      - name: value
        type: string
        required: false
      - name: error
        type: string
        required: false
      - name: onChange
        type: "(value: string) => void"
        required: false
    structure:
      emmet: "div.form-group>label.form-label[for=\${name}]{\${label}}+input.form-input[type=\${type}][name=\${name}]+span.form-error{\${error}}"

  - name: FormButton
    type: tsx
    output:
      directory: src/components/forms
      style: scss
    props:
      - name: type
        type: "'submit' | 'button' | 'reset'"
        required: false
        default: "'button'"
      - name: variant
        type: "'primary' | 'secondary' | 'danger'"
        required: false
        default: "'primary'"
      - name: children
        type: React.ReactNode
        required: true
    structure:
      emmet: "button.form-btn.form-btn-\${variant}[type=\${type}]"

  - name: FormSelect
    type: tsx
    output:
      directory: src/components/forms
      style: scss
    props:
      - name: label
        type: string
        required: true
      - name: options
        type: "Array<{value: string; label: string}>"
        required: true
      - name: value
        type: string
        required: false
      - name: onChange
        type: "(value: string) => void"
        required: false
    structure:
      emmet: "div.form-group>label.form-label{\${label}}+select.form-select>option[value=''][disabled][selected]{Select an option}"
```

Generate the entire form library:

```bash
make-component --from-yaml forms.yaml
```

## Troubleshooting

### Common Issues

**Command not found**
```bash
# Make sure the file is executable
chmod +x make-component

# Check if it's in your PATH
echo $PATH
```

**TypeScript detection not working**
```bash
# Force TypeScript
make-component Button --tsx

# Force JavaScript
make-component Button --jsx
```

**YAML validation errors**
```bash
# Use test mode to debug
make-component --from-yaml components.yaml --test

# Check YAML syntax
cat components.yaml | head -20
```

**Emmet expansion issues**
```bash
# Test Emmet string separately
make-component Test -e "div.test" --test

# Use simpler structure first
make-component Test -e "div>h1+p"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite: `npm test`
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Roadmap

- [ ] Styled Components support
- [ ] Custom hook generation
- [ ] Component story generation (Storybook)
- [ ] Theme integration
- [ ] VS Code extension
- [ ] React Native support
- [ ] Vue.js support

---

**Made with love for the React community**