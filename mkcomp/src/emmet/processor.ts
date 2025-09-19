import * as emmet from 'emmet';
import { EmmetResult } from '../types';

export class EmmetProcessor {
  static expand(emmetString: string): EmmetResult {
    const jsx = this.expandToJsx(emmetString);
    const { classes, ids } = this.extractClassesAndIds(jsx);

    return { jsx, classes, ids };
  }

  private static formatJsx(jsx: string): string {
    // Normalize indentation to 2 spaces
    return jsx
      .split('\n')
      .map(line => {
        // Replace tabs with 2 spaces
        const normalized = line.replace(/\t/g, '  ');
        return normalized;
      })
      .join('\n');
  }

  private static expandToJsx(emmetString: string): string {
    if (!emmetString) {
      return '<div className="container"></div>';
    }

    try {
      const expanded = emmet.default(emmetString, {
        type: 'markup',
        options: {
          'output.selfClosingStyle': 'xhtml'
        }
      });

      return this.formatJsx(expanded
        .replace(/class="/g, 'className="')
        .replace(/<!--.*?-->/g, '')
        .trim());
    } catch (error) {
      console.warn(`Emmet expansion failed: ${(error as Error).message}. Using default structure.`);
      return '<div className="container"></div>';
    }
  }

  private static extractClassesAndIds(html: string): { classes: string[]; ids: string[] } {
    const classes: string[] = [];
    const ids: string[] = [];

    const classMatches = html.match(/className="([^"]+)"/g);
    if (classMatches) {
      classMatches.forEach(match => {
        const classNames = match.match(/className="([^"]+)"/)?.[1].split(' ') || [];
        classes.push(...classNames);
      });
    }

    const idMatches = html.match(/id="([^"]+)"/g);
    if (idMatches) {
      idMatches.forEach(match => {
        const id = match.match(/id="([^"]+)"/)?.[1];
        if (id) ids.push(id);
      });
    }

    return {
      classes: [...new Set(classes)],
      ids: [...new Set(ids)]
    };
  }
}