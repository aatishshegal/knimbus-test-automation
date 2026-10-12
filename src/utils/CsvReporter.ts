import { Reporter, TestCase, TestResult, FullConfig, Suite } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

interface TestReportItem {
  id: string;
  suite: string;
  module: string;
  feature: string;
  scenario: string;
  testType: string;
  status: string;
  durationSec: number;
  retries: number;
  testData: string;
  errorDetails: string;
  specFile: string;
}

export default class CsvReporter implements Reporter {
  private resultsMap: Map<string, TestReportItem> = new Map();
  private testResultsDir: string;
  private archivesDir: string;

  constructor() {
    this.testResultsDir = path.resolve(process.cwd(), 'test-results');
    this.archivesDir = path.resolve(process.cwd(), 'archives');
  }

  onBegin(_config: FullConfig, _suite: Suite) {
    // Ensure directories exist
    if (!fs.existsSync(this.testResultsDir)) {
      fs.mkdirSync(this.testResultsDir, { recursive: true });
    }
    if (!fs.existsSync(this.archivesDir)) {
      fs.mkdirSync(this.archivesDir, { recursive: true });
    }

    // Archive older CSV files to keep test-results clean
    try {
      const files = fs.readdirSync(this.testResultsDir);
      for (const file of files) {
        if (file.endsWith('.csv')) {
          const oldPath = path.join(this.testResultsDir, file);
          const newPath = path.join(this.archivesDir, file);
          fs.renameSync(oldPath, newPath);
        }
      }
    } catch {
      // Ignore archiving errors
    }
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const testPath = test.location.file;

    // Ignore global or project setup files so they don't pollute the client CSV report
    if (testPath.endsWith('.setup.ts')) {
      return;
    }

    // Extract Suite / Project name from Playwright hierarchy
    let suiteName = '';
    try {
      suiteName = test.parent?.project()?.name || '';
    } catch {
      // ignore
    }
    if (!suiteName) {
      const titlePath = test.titlePath();
      if (titlePath.length > 1 && titlePath[1]) {
        suiteName = titlePath[1];
      } else {
        suiteName = testPath.includes('/admin/') ? 'Admin Dashboard' : 'Portal';
      }
    }

    // Format human-friendly module name, e.g. "portal/navigation" -> "Portal / Navigation"
    const moduleName = this.formatModuleName(testPath);

    // Deconstruct test title into Component / Feature and Scenario Description
    const { feature, scenario } = this.parseTestTitle(test.title, testPath);

    // Determine Test Type (Functional vs Validation)
    const testType = this.determineTestType(test, scenario, test.title);

    // Dynamic test data passed via annotations
    let testData = '';
    const dataAnnotation = test.annotations.find(a => a.type === 'testData');
    if (dataAnnotation && dataAnnotation.description) {
      testData = dataAnnotation.description;
    }

    // Determine status (PASSED, FAILED, FLAKY, SKIPPED, TIMED_OUT)
    const outcome = test.outcome();
    let status = 'PASSED';
    if (result.status === 'skipped' || outcome === 'skipped') {
      status = 'SKIPPED';
    } else if (result.status === 'timedOut') {
      status = 'TIMED_OUT';
    } else if (outcome === 'flaky') {
      status = 'FLAKY';
    } else if (result.status === 'passed' || outcome === 'expected') {
      status = 'PASSED';
    } else {
      status = 'FAILED';
    }

    // Extract clean, actionable error summary for failed tests
    let errorDetails = '';
    if (status === 'FAILED' || status === 'TIMED_OUT') {
      if (result.errors && result.errors.length > 0) {
        const rawMsg = result.errors[0].message || result.errors[0].value || '';
        // Strip ANSI escape codes
        const cleanMsg = rawMsg.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
        const lines = cleanMsg.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        errorDetails = lines.slice(0, 2).join(' | ');
      }
    }

    const durationSec = Number(((result.duration || 0) / 1000).toFixed(2));
    const retries = result.retry || 0;

    const existing = this.resultsMap.get(test.id);
    if (existing) {
      // If previous attempt failed and this passed, mark FLAKY
      const finalStatus = outcome === 'flaky' || (existing.status !== 'PASSED' && status === 'PASSED') ? 'FLAKY' : status;
      this.resultsMap.set(test.id, {
        id: test.id,
        suite: suiteName,
        module: moduleName,
        feature: feature,
        scenario: scenario,
        testType: testType,
        status: finalStatus,
        durationSec: Number((existing.durationSec + durationSec).toFixed(2)),
        retries: Math.max(existing.retries, retries),
        testData: testData || existing.testData,
        errorDetails: finalStatus === 'PASSED' || finalStatus === 'FLAKY' ? '' : (errorDetails || existing.errorDetails),
        specFile: path.relative(process.cwd(), testPath)
      });
    } else {
      this.resultsMap.set(test.id, {
        id: test.id,
        suite: suiteName,
        module: moduleName,
        feature: feature,
        scenario: scenario,
        testType: testType,
        status: status,
        durationSec: durationSec,
        retries: retries,
        testData: testData,
        errorDetails: errorDetails,
        specFile: path.relative(process.cwd(), testPath)
      });
    }
  }

  onEnd() {
    if (this.resultsMap.size === 0) return;

    const escapeCsv = (val: string | number | undefined | null) => {
      if (val === undefined || val === null) return '""';
      const str = String(val);
      return `"${str.replace(/"/g, '""')}"`;
    };

    // Sort results logically: Suite -> Module -> Spec File -> Feature
    const results = Array.from(this.resultsMap.values()).sort((a, b) => {
      if (a.suite !== b.suite) return a.suite.localeCompare(b.suite);
      if (a.module !== b.module) return a.module.localeCompare(b.module);
      if (a.specFile !== b.specFile) return a.specFile.localeCompare(b.specFile);
      return a.feature.localeCompare(b.feature);
    });

    const { fileStamp, displayStamp } = this.getFormattedTimestamp();

    // -------------------------------------------------------------
    // 1. GENERATE MAIN DETAILED TEST REPORT CSV
    // -------------------------------------------------------------
    const headers = [
      '#',
      'Suite',
      'Module',
      'Feature',
      'Scenario Description',
      'Test Type',
      'Status',
      'Duration (s)',
      'Retries',
      'Test Data',
      'Error Details',
      'Spec File'
    ];

    const rows = results.map((r, idx) => {
      return [
        idx + 1,
        escapeCsv(r.suite),
        escapeCsv(r.module),
        escapeCsv(r.feature),
        escapeCsv(r.scenario),
        escapeCsv(r.testType),
        escapeCsv(r.status),
        r.durationSec,
        r.retries,
        escapeCsv(r.testData),
        escapeCsv(r.errorDetails),
        escapeCsv(r.specFile)
      ].join(',');
    });

    // Add UTF-8 BOM (\uFEFF) so Excel reliably interprets Unicode/emojis without character corruption
    const detailedCsvContent = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');
    const detailedFilename = `Test_Report_${fileStamp}.csv`;
    const detailedFilepath = path.join(this.testResultsDir, detailedFilename);
    fs.writeFileSync(detailedFilepath, detailedCsvContent, 'utf-8');

    // -------------------------------------------------------------
    // 2. GENERATE EXECUTIVE SUMMARY CSV
    // -------------------------------------------------------------
    const totalTests = results.length;
    const passedTests = results.filter(r => r.status === 'PASSED').length;
    const failedTests = results.filter(r => r.status === 'FAILED').length;
    const flakyTests = results.filter(r => r.status === 'FLAKY').length;
    const skippedTests = results.filter(r => r.status === 'SKIPPED').length;
    const timedOutTests = results.filter(r => r.status === 'TIMED_OUT').length;
    const totalDurationSec = Number(results.reduce((acc, r) => acc + r.durationSec, 0).toFixed(2));
    const passRate = totalTests > 0 ? (((passedTests + flakyTests) / totalTests) * 100).toFixed(2) + '%' : '0%';
    const formattedDuration = totalDurationSec >= 60
      ? `${Math.floor(totalDurationSec / 60)}m ${Math.round(totalDurationSec % 60)}s`
      : `${totalDurationSec}s`;

    // Calculate Suite breakdown
    const suiteMap = new Map<string, { total: number; passed: number; failed: number; flaky: number; skipped: number; duration: number }>();
    for (const r of results) {
      const s = suiteMap.get(r.suite) || { total: 0, passed: 0, failed: 0, flaky: 0, skipped: 0, duration: 0 };
      s.total++;
      if (r.status === 'PASSED') s.passed++;
      else if (r.status === 'FAILED' || r.status === 'TIMED_OUT') s.failed++;
      else if (r.status === 'FLAKY') s.flaky++;
      else if (r.status === 'SKIPPED') s.skipped++;
      s.duration += r.durationSec;
      suiteMap.set(r.suite, s);
    }

    // Calculate Module breakdown
    const moduleMap = new Map<string, { total: number; passed: number; failed: number; flaky: number; skipped: number; duration: number }>();
    for (const r of results) {
      const m = moduleMap.get(r.module) || { total: 0, passed: 0, failed: 0, flaky: 0, skipped: 0, duration: 0 };
      m.total++;
      if (r.status === 'PASSED') m.passed++;
      else if (r.status === 'FAILED' || r.status === 'TIMED_OUT') m.failed++;
      else if (r.status === 'FLAKY') m.flaky++;
      else if (r.status === 'SKIPPED') m.skipped++;
      m.duration += r.durationSec;
      moduleMap.set(r.module, m);
    }

    const summaryLines: string[] = [
      '"=== EXECUTIVE TEST EXECUTION SUMMARY ===",""',
      `"Report Name","Knimbus Test Automation Report"`,
      `"Executed On","${displayStamp}"`,
      `"Total Scenarios",${totalTests}`,
      `"Passed",${passedTests}`,
      `"Failed",${failedTests}`,
      `"Flaky (Passed on Retry)",${flakyTests}`,
      `"Timed Out",${timedOutTests}`,
      `"Skipped",${skippedTests}`,
      `"Pass Rate","${passRate}"`,
      `"Total Duration (s)",${totalDurationSec}`,
      `"Total Duration (Formatted)","${formattedDuration}"`,
      '""',
      '"--- SUITE BREAKDOWN ---",""',
      '"Suite","Total","Passed","Failed","Flaky","Skipped","Pass Rate (%)","Duration (s)"'
    ];

    for (const [suite, s] of suiteMap.entries()) {
      const sPassRate = s.total > 0 ? (((s.passed + s.flaky) / s.total) * 100).toFixed(2) + '%' : '0%';
      summaryLines.push(
        `${escapeCsv(suite)},${s.total},${s.passed},${s.failed},${s.flaky},${s.skipped},${escapeCsv(sPassRate)},${Number(s.duration.toFixed(2))}`
      );
    }

    summaryLines.push('""', '"--- MODULE BREAKDOWN ---",""', '"Module","Total","Passed","Failed","Flaky","Skipped","Pass Rate (%)","Duration (s)"');

    for (const [module, m] of moduleMap.entries()) {
      const mPassRate = m.total > 0 ? (((m.passed + m.flaky) / m.total) * 100).toFixed(2) + '%' : '0%';
      summaryLines.push(
        `${escapeCsv(module)},${m.total},${m.passed},${m.failed},${m.flaky},${m.skipped},${escapeCsv(mPassRate)},${Number(m.duration.toFixed(2))}`
      );
    }

    const summaryCsvContent = '\uFEFF' + summaryLines.join('\n');
    const summaryFilename = `Test_Summary_${fileStamp}.csv`;
    const summaryFilepath = path.join(this.testResultsDir, summaryFilename);
    fs.writeFileSync(summaryFilepath, summaryCsvContent, 'utf-8');

    // -------------------------------------------------------------
    // 3. CONSOLE REPORT SUMMARY
    // -------------------------------------------------------------
    console.log(`\n================================================================================`);
    console.log(`                    KNIMBUS TEST EXECUTION SUMMARY                              `);
    console.log(`================================================================================`);
    console.log(` Executed On      : ${displayStamp}`);
    console.log(` Total Scenarios  : ${totalTests}`);
    console.log(` Passed           : ${passedTests}`);
    console.log(` Failed           : ${failedTests}`);
    console.log(` Flaky            : ${flakyTests}`);
    console.log(` Skipped          : ${skippedTests}`);
    console.log(` Pass Rate        : ${passRate}`);
    console.log(` Total Duration   : ${formattedDuration}`);
    console.log(`--------------------------------------------------------------------------------`);
    console.log(` Detailed Report  : ${detailedFilepath}`);
    console.log(` Executive Summary: ${summaryFilepath}`);
    console.log(`================================================================================\n`);
  }

  // --- Helper Methods ---

  private formatModuleName(testPath: string): string {
    const match = testPath.match(/tests\/(.*?)\/[^\/]+$/);
    if (!match || !match[1]) return 'General';
    return match[1]
      .split('/')
      .map(segment =>
        segment
          .split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      )
      .join(' / ');
  }

  private parseTestTitle(title: string, filePath: string): { feature: string; scenario: string } {
    const parts = title.split(' - ').map(p => p.trim());
    if (parts.length >= 3) {
      return {
        feature: parts[1],
        scenario: parts.slice(2).join(' - ')
      };
    } else if (parts.length === 2) {
      const featureName = parts[0].replace(/^TC_/, '').replace(/_/g, ' ').trim();
      return {
        feature: featureName,
        scenario: parts[1]
      };
    } else {
      const baseFileName = path.basename(filePath, path.extname(filePath)).replace(/\.spec$/, '');
      const cleanFileName = baseFileName
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      return {
        feature: cleanFileName,
        scenario: title
      };
    }
  }

  private determineTestType(test: TestCase, scenario: string, fullTitle: string): string {
    const typeAnnotation = test.annotations.find(a => a.type === 'testType');
    if (typeAnnotation && typeAnnotation.description) {
      return typeAnnotation.description;
    }

    const combinedText = `${fullTitle} ${scenario}`.toLowerCase();
    const validationKeywords = [
      'reject',
      'error',
      'invalid',
      'require',
      'blank',
      'exceed',
      'forbidden',
      'disabled',
      'unauthorized',
      'empty',
      'leading',
      'trailing',
      'special char',
      'cannot',
      'prevent',
      'fail',
      'negative',
      'maxlength',
      'minlength',
      'mismatch',
      'not allowed',
      'denied',
      'limit',
      'boundary',
      'warning',
      'mandatory',
      'restrict'
    ];

    const isValidation = validationKeywords.some(keyword => combinedText.includes(keyword));
    return isValidation ? 'Validation' : 'Functional';
  }

  private getFormattedTimestamp(): { fileStamp: string; displayStamp: string } {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const fileStamp = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
    const displayStamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return { fileStamp, displayStamp };
  }
}

