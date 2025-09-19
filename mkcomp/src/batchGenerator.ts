import { ReactComponentGenerator } from './generator';
import { CliArgs } from './types';

export class BatchComponentGenerator {
  static async generateMultiple(components: CliArgs[]): Promise<void> {
    if (components.length === 0) {
      console.log('No components to generate.');
      return;
    }

    console.log(`\n🚀 Generating ${components.length} component${components.length > 1 ? 's' : ''}...\n`);

    let successCount = 0;
    let failureCount = 0;
    const failures: { component: string; error: string }[] = [];

    for (const componentArgs of components) {
      try {
        console.log(`📦 Generating ${componentArgs.componentName}...`);

        const generator = new ReactComponentGenerator(componentArgs);
        await generator.generate();

        successCount++;
      } catch (error) {
        failureCount++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        failures.push({
          component: componentArgs.componentName,
          error: errorMessage
        });
        console.error(`❌ Failed to generate ${componentArgs.componentName}: ${errorMessage}`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 GENERATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Successfully generated: ${successCount} component${successCount !== 1 ? 's' : ''}`);

    if (failureCount > 0) {
      console.log(`❌ Failed to generate: ${failureCount} component${failureCount !== 1 ? 's' : ''}`);
      console.log('\nFailures:');
      failures.forEach(failure => {
        console.log(`  • ${failure.component}: ${failure.error}`);
      });
    }

    const totalFiles = this.estimateFileCount(components.filter((_, index) => index < successCount));
    if (totalFiles > 0) {
      console.log(`\n📁 Total files created: ${totalFiles}`);
    }

    if (failureCount > 0) {
      process.exit(1);
    }
  }

  static async generateWithPreview(components: CliArgs[]): Promise<void> {
    console.log('\n=== YAML PREVIEW MODE ===\n');
    console.log(`📦 Found ${components.length} component${components.length > 1 ? 's' : ''} to generate:\n`);

    components.forEach((component, index) => {
      console.log(`${index + 1}. ${component.componentName}`);
      console.log(`   Type: ${component.tsx ? 'TypeScript' : 'JavaScript'}`);
      console.log(`   Style: ${component.style}`);
      console.log(`   Directory: ${component.dir}`);
      if (component.props) {
        console.log(`   Props: ${component.props}`);
      }
      if (component.emmet) {
        console.log(`   Structure: ${component.emmet}`);
      }
      console.log('');
    });

    console.log('🔍 To generate these components, run the same command without --test\n');
  }

  private static estimateFileCount(components: CliArgs[]): number {
    return components.reduce((count, component) => {
      // Component file
      let files = 1;

      // Style file (if not tailwind or none)
      if (component.style !== 'tailwind' && component.style !== 'none') {
        files += 1;
      }

      return count + files;
    }, 0);
  }

  static logComponentList(components: CliArgs[]): void {
    console.log(`📦 Found ${components.length} component${components.length > 1 ? 's' : ''} to generate:`);

    const grouped = this.groupComponentsByDirectory(components);

    Object.entries(grouped).forEach(([directory, comps]) => {
      console.log(`   📁 ${directory}/`);
      comps.forEach(comp => {
        const extension = comp.tsx ? 'tsx' : 'jsx';
        const styleExt = comp.style === 'scss' ? 'scss' : 'css';
        const hasStyle = comp.style !== 'tailwind' && comp.style !== 'none';

        console.log(`      • ${comp.componentName}.${extension}${hasStyle ? ` + ${comp.componentName}.${styleExt}` : ''}`);
      });
    });
    console.log('');
  }

  private static groupComponentsByDirectory(components: CliArgs[]): Record<string, CliArgs[]> {
    return components.reduce((groups, component) => {
      const dir = component.dir;
      if (!groups[dir]) {
        groups[dir] = [];
      }
      groups[dir].push(component);
      return groups;
    }, {} as Record<string, CliArgs[]>);
  }
}