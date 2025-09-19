import * as fs from 'fs';
import * as path from 'path';
import { ComponentFile, ProjectType } from '../types';

export class FileOperations {
  static async waitForKeyPress(message: string): Promise<void> {
    console.log(message);
    return new Promise((resolve) => {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.once('data', (data) => {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        const key = data.toString();
        if (key === '\u0003') { // Ctrl+C
          process.exit(0);
        }
        resolve();
      });
    });
  }

  static detectProjectType(forceJsx: boolean, forceTsx: boolean): ProjectType {
    if (forceJsx) return 'jsx';
    if (forceTsx) return 'tsx';

    try {
      fs.accessSync(path.join(process.cwd(), 'tsconfig.json'));
      return 'tsx';
    } catch {
      return 'jsx';
    }
  }

  static async createFiles(files: ComponentFile[], outputDir: string, isTest: boolean): Promise<void> {
    if (isTest) {
      this.previewFiles(files);
      return;
    }

    await this.ensureDirectory(outputDir);

    for (const file of files) {
      try {
        fs.writeFileSync(file.path, file.content);
        console.log(`Created: ${file.path}`);
      } catch (error) {
        await this.waitForKeyPress(
          `File creation failed (${file.path}): ${(error as Error).message}, press any key to skip or Ctrl+C to exit`
        );
      }
    }
  }

  private static previewFiles(files: ComponentFile[]): void {
    console.log('\n=== PREVIEW MODE ===\n');
    files.forEach(file => {
      console.log(`--- ${file.path} ---`);
      console.log(file.content);
      console.log('\n');
    });
  }

  private static async ensureDirectory(dir: string): Promise<void> {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    } catch (error) {
      await this.waitForKeyPress(
        `Directory creation failed: ${(error as Error).message}, press any key to skip or Ctrl+C to exit`
      );
    }
  }
}