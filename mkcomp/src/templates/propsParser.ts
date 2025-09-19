import { ParsedProps, PropDefinition } from '../types';

export class PropsParser {
  static parse(propsString: string, componentName: string): ParsedProps {
    if (!propsString) {
      return { interface: '', propTypes: '' };
    }

    const propDefinitions = this.parsePropsString(propsString);
    const interfaceCode = this.generateInterface(propDefinitions, componentName);
    const propTypesCode = this.generatePropTypes(propDefinitions, componentName);

    return {
      interface: interfaceCode,
      propTypes: propTypesCode
    };
  }

  private static parsePropsString(propsString: string): PropDefinition[] {
    const props = propsString.split(',').map(prop => prop.trim()).filter(Boolean);
    const definitions: PropDefinition[] = [];

    props.forEach(prop => {
      if (prop === 'children') {
        definitions.push({
          name: 'children',
          type: 'React.ReactNode',
          isOptional: true
        });
        return;
      }

      const [name, type] = prop.split(':').map(s => s.trim());
      const isOptional = name.endsWith('?');
      const cleanName = isOptional ? name.slice(0, -1) : name;
      const tsType = type || 'any';

      definitions.push({
        name: cleanName,
        type: tsType,
        isOptional
      });
    });

    return definitions;
  }

  private static generateInterface(props: PropDefinition[], componentName: string): string {
    if (props.length === 0) return '';

    const interfaceProps = props.map(prop => {
      const optionalMarker = prop.isOptional ? '?' : '';
      return `  ${prop.name}${optionalMarker}: ${prop.type};`;
    });

    return `interface ${componentName}Props {\n${interfaceProps.join('\n')}\n}`;
  }

  private static generatePropTypes(props: PropDefinition[], componentName: string): string {
    if (props.length === 0) return '';

    const propTypesProps = props.map(prop => {
      let propType = this.getJsPropType(prop.type);

      if (!prop.isOptional) {
        propType += '.isRequired';
      }

      return `  ${prop.name}: ${propType},`;
    });

    return `${componentName}.propTypes = {\n${propTypesProps.join('\n')}\n};`;
  }

  private static getJsPropType(tsType: string): string {
    switch (tsType) {
      case 'string':
        return 'PropTypes.string';
      case 'number':
        return 'PropTypes.number';
      case 'boolean':
        return 'PropTypes.bool';
      case '()=>void':
        return 'PropTypes.func';
      case 'React.ReactNode':
        return 'PropTypes.node';
      default:
        return 'PropTypes.any';
    }
  }
}