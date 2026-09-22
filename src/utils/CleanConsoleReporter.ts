import { Reporter, TestCase, TestResult, FullConfig, Suite } from '@playwright/test/reporter';

export default class CleanConsoleReporter implements Reporter {
  onBegin(config: FullConfig, suite: Suite) {
    const actualTests = suite.allTests().filter(t => !t.location.file.endsWith('.setup.ts'));
    console.log(`\n🚀 Starting Execution: Running ${actualTests.length} test(s)...\n`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    if (test.location.file.endsWith('.setup.ts')) {
        return; // Silently ignore setup files
    }
    
    const icon = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⚠️';
    console.log(`${icon} [${result.status.toUpperCase()}] ${test.title} (${result.duration}ms)`);
  }

  onEnd() {
    console.log(`\n🎉 Test Execution Completed.\n`);
  }
}
