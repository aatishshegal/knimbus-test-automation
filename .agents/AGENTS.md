# AI Agent Workflow Rules (Plan, Generate, Heal)

These are the strict instructions and rules for any AI agent (Gemini, Claude, etc.) operating in this workspace. **Do not do unnecessary things.** Follow this workflow strictly when creating or maintaining tests.

## 1. Plan (Research & Discovery)
Before writing any test code, the AI MUST:
- **Do not assume locators. Do not work on assumptions when implementing locators or test cases.** Use the **Puppeteer MCP** to navigate to the target page and inspect the live DOM to extract the most resilient selectors (e.g., `getByRole`, `getByText`). If automated DOM extraction fails, you MUST stop and ask the user for the HTML snippet rather than guessing class names or IDs.
- **Database state check:** Use the **MySQL MCP** to query the database (SELECT ONLY) to verify the preconditions for the test environment. DO NOT execute UPDATE or DELETE operations.
- Review existing Page Object Models (`src/pages/`) to see if the page or component already exists before creating a new one.

## 2. Generate (Implementation)
When generating code, the AI MUST adhere to the framework architecture:
- **Architecture:** Use the Page Object Model (POM) + Playwright Fixtures (`src/fixtures/index.ts`).
- **Data Setup:** Bypass the UI for test data setup whenever possible by using the MySQL MCP or existing API endpoints.
- **Locators:** Rely on DOM-based Playwright locators (`getByRole`, etc.) as `data-testid` is largely unavailable.
- **Style:** Write clean, typed TypeScript code. Do not introduce overly complex design patterns unless requested.

## 3. Heal (Test Maintenance)
When a test fails, the AI MUST NOT guess the fix.
1. Read the Playwright error logs to identify the failing locator.
2. Use the **Puppeteer MCP** to navigate to the exact page where the failure occurred.
3. Compare the failing locator against the live DOM to find what changed (e.g., text change, structural change).
4. Update the Page Object Model file with the corrected locator.

## General Constraints
- **Avoid Race Conditions:** Tests that mutate global admin settings must be flagged for sequential execution or handled carefully.
- **Stick to the Scope:** Do not refactor unrelated code, change linter settings, or modify package dependencies unless explicitly asked by the user.
- **Test Execution Commands:** Always provide test execution commands to the user with the `--headed` flag so they run in headed mode, though the agent may run them in the background.
- **STRICT ENFORCEMENT - Never Hardcode Test Data:** Do NOT hardcode credentials or test data directly into test scripts, even if the user provides the data directly. Always strictly adhere to the framework's use of fixtures or environment variables. If a user asks you to use specific data, instruct them to update their `.env` file or create a fixture, rather than breaking this architectural rule.

## Strict Anti-Pattern Rules (Do NOT Violate)
- **Strict SRP for POMs:** Agents must create dedicated Page Object files for every distinct page/modal. "God Classes" that combine multiple pages (e.g., Login + OTP) are strictly banned.
- **No Dynamic Routing:** Agents must write deterministic tests. Page Objects must never use `locator.or()` to guess the landing page.
- **STRICT ENFORCEMENT - No Hardcoded Test Inputs:** Under NO circumstances should an agent hardcode search queries, expected array lists (e.g., `['tab1', 'tab2']`), or literal strings inside test specifications. ALL inputs and expected values MUST be extracted dynamically from `tests/test-data/portal-data.json`.
- **STRICT ENFORCEMENT - Pure POM Encapsulation:** Do NOT use `for` loops, `if/else` conditions, or complex array iteration inside `.spec.ts` files. If a test requires iterating over elements (like verifying multiple tabs, filters, or widgets), you MUST create a single helper method inside the respective Page Object Model (e.g., `verifyTabsPresent(expectedTabs)`) and call that method from the test. Spec files must remain linear and logicless.
- **Consume Setup State:** If a `global.setup.ts` file generates a `storageState`, fixtures must consume it rather than performing redundant UI logins.

## Data-Driven & Granular Test Architecture Rules (UPDATED)
To maintain Playwright as the single source of truth for test reporting, Agents must adhere to the following when testing multiple scenarios:

1. **Granular Test Blocks Grouped by Precondition:**
   - Do NOT consolidate all field validations into a single massive `test()` block with internal loops. This hides individual test outcomes from the Playwright HTML/CSV reports.
   - Instead, group test cases logically using `test.describe('Precondition Group')` blocks (e.g., `test.describe('Profile Field Validation - Editable ON')`).
   - Setup the exact `AdminApiService` precondition state once in `test.beforeAll()` for the group.
   - Within that group, create an INDEPENDENT `test()` block for every single Field + Rule combination (e.g., `test('TC_FullName_RejectMaxLengthExceed_EditableON - shows error beyond char limit')`).

2. **No Custom CSV Loggers Needed:**
   - Because every field validation is an independent Playwright `test()` block, Playwright will automatically generate granular reports. Do not use custom `logToCsv` logic inside test loops unless specifically requested for a highly complex edge case.

3. **Admin Preconditions State Maintenance:**
   - Always use `allFieldsEditable: true` in your Admin API payload when preparing a form for validation, unless explicitly testing a disabled field state.
   - Always guarantee teardown and reset of the Tenant Admin State inside `finally` or `test.afterAll` blocks to ensure subsequent tests are not poisoned by dirty backend state.

4. **Readable Test Naming Convention:**
   - Test names should be highly readable. Avoid using superfluous words like "Positive" or "Negative" in the test names. 
   - Retain natural spaces for readability. E.g., Use `TC_Enrollment_college_Affiliation restricts input to 100 characters max` instead of removing spaces.

5. **Test Data Reporting via Annotations:**
   - If a test validates specific input data from a JSON file, push that data to the test context using Playwright annotations so custom reporters (like `CsvReporter.ts`) can extract and log it in a "Test Data" column.
   - Example: `test.info().annotations.push({ type: 'testData', description: String(value) });`

## Intelligent Debugging & Execution Strategy
- **Mandatory Cross-Module Testing:** If you modify ANY existing shared code (e.g., a shared Page Object Model file, utility, or fixture) while creating or fixing a test case, you MUST identify and execute ALL other test suites that rely on that shared file to ensure your changes did not introduce regressions or side-effects in other modules.
- **Targeted Test Execution:** When a file contains multiple test cases and you only need to fix one failing test, do NOT re-run the entire file while debugging. Use the Playwright grep flag (`-g "Test Name"`) to isolate and run only the failing test to save time. Once the fix is verified, run the entire file one last time to ensure your changes did not inadvertently break the other passing tests.
- **POM Impact Analysis:** Before modifying any shared Page Object Model (POM) classes, utilities, or locators to fix a specific test case, you MUST perform an impact analysis. Understand exactly what you are changing and verify if other dependent test cases rely on that same element/method.
- **Admin Setup Optimization:** If a test case requires a lengthy Admin Dashboard setup (e.g., toggling settings), and the setup successfully passes but the test fails *later* in the flow, temporarily skip or comment out the admin setup steps while you iterate and debug the actual failure. There is no need to repeatedly log into the admin dashboard if the state is already correct. Once the test is fixed, re-enable the admin setup for final verification.

## Important Instruction: Configuring MCP Servers in the Workspace

When adding or configuring MCP (Model Context Protocol) servers for a workspace in this IDE, you must strictly follow these placement and naming conventions for the IDE to successfully detect and load them:

1. **Correct File Name:** The configuration file MUST be named `mcp_config.json`. Do not use `mcp.json`.
2. **Correct Directory:** The file MUST be placed inside the hidden `.agents/` folder at the root of the workspace.
   - **Correct Path:** `[workspace-root]/.agents/mcp_config.json`
   - **Incorrect Path:** `[workspace-root]/mcp_config.json`
3. **IDE Reload:** After creating or modifying the `.agents/mcp_config.json` file, the IDE Window must be reloaded (or the extension restarted) for the agent to gain access to the new MCP tools.

**Example `mcp_config.json` structure:**
```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    }
  }
}
```

*Note: Ensure the target MCP NPM package actually exists (e.g. `@modelcontextprotocol/server-mysql` does not exist officially) and that necessary VPNs are connected if connecting to internal IPs.*

## API-Based Admin Settings Integration

When configuring admin preconditions for test cases, you MUST NOT use the UI to configure settings in the Admin Dashboard. Instead, use the `AdminApiService.ts` framework.

**How to map and implement new Admin Settings via API:**
1. **Never guess the endpoint:** If a setting is missing from `AdminApiService.ts`, DO NOT guess the `/ws/update...` endpoint name. It will likely result in a 404 error.
2. **Reverse Engineer via Network Tab:** Write a temporary Playwright script to log into the Admin Dashboard (`DashboardLoginPage.ts`), navigate to the setting, modify it, click Save, and intercept the network traffic (or take screenshots to fix locators and write a working UI script).
3. **Analyze the Payload:** Knimbus uses a generic DTO pattern. The frontend fetches a massive `eLibraryDTO` object. When saving *any* setting, the UI POSTs this EXACT SAME full DTO object to a distinct endpoint specific to the setting being saved.
4. **Update `AdminApiService.ts`:**
   - Locate the specific property that changed inside the `eLibraryDTO` (usually inside `elibraryInfoDTO`).
   - Add the new property to the `updateSecuritySettings` method arguments.
   - Update the local `info` object in the method with the new value.
   - Add the specific `/ws/update...` endpoint you intercepted to the `endpoints` array in `saveElibraryDTO()`. The method will broadcast the DTO to all endpoints in the array.
5. **Usage in Tests:** Call `adminApi.updateSecuritySettings({...})` in the `beforeAll` block of your test file to instantly set up the required state.

## Temporary Files & Scratch Scripts
- **Clean Up After Yourself:** If you create any temporary scratch scripts (e.g., to extract DOM elements or test API endpoints), you MUST delete them immediately after use and once the actual test case is confirmed to be working. Do not leave dead code in the repository.
