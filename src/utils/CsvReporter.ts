import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

export default class CsvReporter implements Reporter {
  private results: { module: string; path: string; name: string; status: string }[] = [];
  private testResultsDir: string;
  private archivesDir: string;

  constructor() {
    this.testResultsDir = path.resolve(process.cwd(), 'test-results');
    this.archivesDir = path.resolve(process.cwd(), 'archives');
  }

  onBegin() {
    // Ensure directories exist
    if (!fs.existsSync(this.testResultsDir)) {
      fs.mkdirSync(this.testResultsDir, { recursive: true });
    }
    if (!fs.existsSync(this.archivesDir)) {
      fs.mkdirSync(this.archivesDir, { recursive: true });
    }

    // Archive older CSV files
    const files = fs.readdirSync(this.testResultsDir);
    for (const file of files) {
      if (file.endsWith('.csv')) {
        const oldPath = path.join(this.testResultsDir, file);
        const newPath = path.join(this.archivesDir, file);
        fs.renameSync(oldPath, newPath);
      }
    }
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const testPath = test.location.file;
    let moduleName = 'Unknown';

    // Extract module from path, e.g. tests/portal/registration/test.spec.ts -> portal/registration
    const match = testPath.match(/tests\/(.*?)\/[^\/]+$/);
    if (match && match[1]) {
      moduleName = match[1];
    }
    
    let testType = 'Positive';
    const fullPathTitle = test.titlePath().join(' ').toLowerCase();
    if (fullPathTitle.includes('negative')) {
        testType = 'Negative';
    }

    this.results.push({
      module: moduleName,
      path: path.relative(process.cwd(), testPath),
      name: test.title,
      type: testType,
      status: result.status,
    } as any);
  }

  onEnd() {
    if (this.results.length === 0) return;

    // Generate CSV content
    const header = 'Module,Path,Test Case Name,Test Case Type,Status\n';
    const rows = this.results.map((r: any) => {
      // Escape quotes and commas in CSV fields
      const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`;
      return `${escapeCsv(r.module)},${escapeCsv(r.path)},${escapeCsv(r.name)},${escapeCsv(r.type)},${escapeCsv(r.status)}`;
    });

    const csvContent = header + rows.join('\n');

    // Generate filename based on timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `Test_Report_${timestamp}.csv`;
    const filepath = path.join(this.testResultsDir, filename);

    fs.writeFileSync(filepath, csvContent, 'utf-8');
    console.log(`\nCSV Report generated at: ${filepath}`);
  }
}
