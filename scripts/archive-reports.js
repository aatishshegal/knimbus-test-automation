const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define paths relative to the root of the project
const rootDir = path.join(__dirname, '..');
const archivesDir = path.join(rootDir, 'archives');
const testResultsDir = path.join(rootDir, 'test-results');
const playwrightReportDir = path.join(rootDir, 'playwright-report');

// 1. Ensure archives directory exists
if (!fs.existsSync(archivesDir)) {
  fs.mkdirSync(archivesDir, { recursive: true });
}

// 2. Generate a timestamp for the zip file
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const zipFileName = `Test_Reports_${timestamp}.zip`;
const zipFilePath = path.join(archivesDir, zipFileName);

// 3. Identify which directories actually exist and have data
let dirsToArchive = [];
if (fs.existsSync(testResultsDir) && fs.readdirSync(testResultsDir).length > 0) {
    dirsToArchive.push('test-results');
}
if (fs.existsSync(playwrightReportDir) && fs.readdirSync(playwrightReportDir).length > 0) {
    dirsToArchive.push('playwright-report');
}

// 4. Archive and Cleanup
if (dirsToArchive.length > 0) {
  console.log(`[Archive] Found previous test reports. Archiving to ${zipFileName}...`);
  try {
    // Execute the native zip command (available on Mac/Linux)
    const cmd = `zip -rq "${zipFilePath}" ${dirsToArchive.join(' ')}`;
    execSync(cmd, { cwd: rootDir, stdio: 'inherit' });
    console.log(`[Archive] Successfully archived old reports into archives/ directory.`);
    
    // Clean up the old directories so the next test run starts fresh
    dirsToArchive.forEach(dir => {
      fs.rmSync(path.join(rootDir, dir), { recursive: true, force: true });
    });
    console.log('[Archive] Cleaned up old report directories.');
  } catch (error) {
    console.error('[Archive] Failed to create archive:', error.message);
  }
} else {
  console.log('[Archive] No previous test reports found to archive.');
}
