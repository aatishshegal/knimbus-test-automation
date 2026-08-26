import { test, expect } from '../../../src/fixtures';
import portalData from '../../test-data/portal-data.json';
import * as fs from 'fs';
import * as path from 'path';

const queryTypeScenarios = portalData.researchPlusQueryTypes;

test.describe('Research+ Query Type Search Scenarios', () => {

    // Initialize CSV tracking array
    const reportData: string[] = [];
    const csvHeader = 'Test Case executed,Query Type,Search Query,Pass/Fail,Reason of Fail\n';

    test.afterAll(async () => {
        // Compile and write CSV Report
        const reportDir = path.resolve(process.cwd(), 'test-results');
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportPath = path.join(reportDir, `Query_Type_Validation_Report_${timestamp}.csv`);
        const csvContent = csvHeader + reportData.join('\n');
        
        fs.writeFileSync(reportPath, csvContent, 'utf-8');
        console.log(`\n✅ Query Type CSV Report generated successfully: ${reportPath}\n`);
    });

    test.beforeEach(async ({ page, homePage, topNavigationBar, researchPlusPage }) => {
        // Navigate to the portal, relying on the cached global session
        await page.goto(process.env.PORTAL_URL!);
        await expect(homePage.homePageIdentifier).toBeVisible();

        // Navigate to Research+ page
        await topNavigationBar.menuResearch.click();
        await expect(researchPlusPage.pageIdentifier).toBeVisible();
    });

    // Generate dynamic test cases based on JSON configurations
    for (const data of queryTypeScenarios) {
        test(data.testCaseName, async ({ researchPlusPage, searchResultPage, page }) => {
            // Pick a random search query from the array
            const randomIndex = Math.floor(Math.random() * data.queries.length);
            const randomQuery = data.queries[randomIndex];
            
            let passFailStatus = 'Failed';
            let reasonOfFail = '';

            // USER REQUEST: Pause for 3 seconds before running each test case
            await page.waitForTimeout(3000);

            try {
                // Step 1: Ensure "All" tab is selected
                await researchPlusPage.allTab.click();

                // Step 2: Source selection logic
                if (data.action === 'defaultSources') {
                    // USER REQUEST: To reduce load and timeouts, do NOT click 'Select All'.
                    // Just stay on the 'All' tab and perform the search with the default selected sources.
                    // (Intentionally left blank so it uses default selections)
                } else if (data.action === 'selectSpecific') {
                    // Clear all and select specific source
                    await researchPlusPage.clearAllButton.click();
                    await researchPlusPage.selectSpecificResources([data.specificSource]);
                }

                // Step 3: Select Query Type
                await researchPlusPage.queryTypeDropdown1.selectOption({ label: data.queryType });

                // Step 4: Fill search query
                await researchPlusPage.searchBarInput1.fill(randomQuery);

                // Step 5: Perform Search
                // USER REQUEST: Pause for 3 seconds before clicking search button
                await page.waitForTimeout(3000);
                await researchPlusPage.searchButton.click();

                // Step 6: Wait for Results
                // We'll wait up to 45 seconds for the search count text to appear, which indicates results have loaded
                try {
                    await expect(researchPlusPage.showingCountIndicator).toBeVisible({ timeout: 60000 });
                } catch (timeoutError) {
                    throw new Error(`Timeout waiting for results to load for query: "${randomQuery}"`);
                }

                // Get actual text of the result count to verify it isn't "0"
                const countText = await researchPlusPage.showingCountIndicator.innerText();
                // E.g., "Showing 96 of 10,262 results for benjamin" or "Showing 0 results"
                const match = countText.match(/Showing\s+([\d,]+)/);
                const count = match ? parseInt(match[1].replace(/,/g, ''), 10) : 0;

                if (count === 0) {
                    throw new Error(`Search returned 0 results for query: "${randomQuery}"`);
                }

                // If we get here, test passed
                passFailStatus = 'Passed';
                reasonOfFail = 'N/A';

            } catch (error: any) {
                passFailStatus = 'Failed';
                reasonOfFail = error.message.replace(/[\r\n,"]/g, ' ').substring(0, 150); // Clean formatting for CSV
                throw error; // Re-throw so Playwright marks the test as failed
            } finally {
                // Log to CSV array
                const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`;
                reportData.push(`${escapeCsv(data.testCaseName)},${escapeCsv(data.queryType)},${escapeCsv(randomQuery)},${escapeCsv(passFailStatus)},${escapeCsv(reasonOfFail)}`);
            }
        });
    }
});
