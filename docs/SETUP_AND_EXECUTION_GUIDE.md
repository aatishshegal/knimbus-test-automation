# Knimbus Test Automation — Setup, Configuration & Execution Guide

This document is the complete step-by-step onboarding guide for running this test automation project on a **new or copied machine**. Follow this guide sequentially to configure the environment, install required dependencies, understand the multi-tenant architecture, and execute tests successfully.

---

## 📋 Quick Setup Checklist (For Impatient Engineers)

If you have already copied or cloned this repository to your machine, run these commands in order:

```bash
# 1. Install Node.js dependencies
npm install

# 2. Install Playwright browser engines & OS dependencies (MANDATORY)
npx playwright install --with-deps

# 3. Create your environment configuration file
cp .env.example .env
# (Now edit .env with your actual credentials)

# 4. Run a sanity check test in headed mode
npx playwright test tests/admin/navigation/admin-header.spec.ts --project="Admin Dashboard" --headed
```

---

## 🛠️ Step 1: System Prerequisites

Before starting, ensure your operating system has the required foundational tools installed:

1. **Node.js**: Version **v18.x** or **v20.x+** (LTS recommended).
   * Check your version:
     ```bash
     node -v
     npm -v
     ```
   * If not installed, download from [nodejs.org](https://nodejs.org/) or install via `nvm`:
     ```bash
     nvm install 20 && nvm use 20
     ```
2. **Git**: Installed and accessible in your shell terminal.
3. **Network Access**: Ensure your machine has unrestricted network access to:
   * `https://qa.knimbus.com` (Admin Dashboard & API)
   * `https://sydneyuniversity.knimbus.com` (Portal Tenant 1)
   * `https://codecnetwork.knimbus.com` (Portal Tenant 2)

---

## 📦 Step 2: Install Project Dependencies

When you copy the repository to a new machine, `node_modules/` is either absent or unlinked. Run:

```bash
npm install
```

This installs:
* `@playwright/test`: Core test execution framework and assertion library.
* `typescript`: TypeScript compiler and type definitions.
* `dotenv`: Environment variable loader.
* `eslint` and `prettier`: Code quality and formatting linters.

---

## 🌐 Step 3: Install Playwright Browsers (Crucial Step!)

> [!IMPORTANT]
> **Why tests fail on a fresh machine:**  
> Playwright does NOT use your globally installed Google Chrome or Firefox. It requires dedicated, sandboxed browser binaries (`Chromium`, `Firefox`, `WebKit`). If you run tests without installing them, Playwright throws:  
> `browserType.launch: Executable doesn't exist at ... Run "npx playwright install"`

To install the browser binaries and required OS-level shared libraries, run:

```bash
npx playwright install --with-deps
```

* If you only intend to run Chromium (default in this project), you can speed up installation with:
  ```bash
  npx playwright install --with-deps chromium
  ```

---

## ⚙️ Step 4: Environment Variables Setup (`.env`)

The project uses `.env` for test data credentials, URLs, and tenant isolation.  
`.env` is ignored by Git to protect credentials. You must create it from `.env.example`:

```bash
cp .env.example .env
```

Open `.env` in your editor and configure the keys according to the two institutional tenants below:

### Understanding the Two Institutional Tenants:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       TENANT 1: Sydney University                           │
│                 (Used for End-User Portal Test Suites)                      │
├─────────────────────────┬───────────────────────────────────────────────────┤
│ PORTAL_URL              │ https://sydneyuniversity.knimbus.com              │
│ LIBRARY_NAME            │ "Sydney University"                               │
│ DASHBOARD_URL           │ https://qa.knimbus.com                            │
│ ADMIN_USER              │ Admin username for Sydney University API setup    │
│ ADMIN_PASSWORD          │ Admin password for Sydney University API setup    │
│ STANDARD_USER_EMAIL     │ Standard portal user email                        │
│ STANDARD_USER_PASSWORD  │ Standard portal user password                     │
│ OTP_USER_EMAIL          │ User designated for OTP login flows               │
│ OTP_USER_PASSWORD       │ Password for OTP user                             │
└─────────────────────────┴───────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         TENANT 2: Codec Network                             │
│         (Used for Admin Dashboard UI Testing & Cross-Portal Validation)      │
├─────────────────────────┬───────────────────────────────────────────────────┤
│ ADMIN_TEST_URL          │ https://qa.knimbus.com                            │
│ ADMIN_TEST_EMAIL        │ codecnetwork@yopmail.com                          │
│ ADMIN_TEST_PASSWORD     │ Admin password for Codec Network                  │
│ TEST_TENANT_PORTAL_URL  │ https://codecnetwork.knimbus.com                  │
└─────────────────────────┴───────────────────────────────────────────────────┘
```

> [!NOTE]
> **Why are there two tenants?**  
> Sydney University is dedicated to end-user portal regression (Search, My Library, Profile, Catalog). Codec Network is dedicated to administrative automation (User Management, Service Groups, Content Groups, Security Settings). Changes in Codec Network Admin never interfere with Sydney University portal tests.

---

## 🔄 Step 5: How Test Initialization & Authentication Work

You do **not** need to manually log in before executing tests. The framework automates the entire authentication lifecycle through a multi-project setup pipeline in `playwright.config.ts`:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SETUP EXECUTION FLOW                          │
├─────────────────────────────────────────────────────────────────────────┤
│  1. tests/global.setup.ts                                               │
│     • Calls AdminApiService to reset backend preconditions:             │
│       - twoFactorAuth: false (Baseline: OTP off)                        │
│       - mandatoryFields: false                                          │
│       - allFieldsEditable: true                                         │
│       - Restores test user passwords                                    │
│                                                                         │
│  2. tests/portal.setup.ts                                               │
│     • Logs into Sydney University portal once                           │
│     • Saves authenticated session to .auth/user.json                    │
│                                                                         │
│  3. tests/admin.setup.ts                                                │
│     • Logs into Codec Network Admin Dashboard once                      │
│     • Saves authenticated session to .auth/admin.json                   │
│                                                                         │
│  4. UI Test Execution                                                   │
│     • Portal and Admin test suites consume these .auth/*.json files     │
│       without repeating UI login steps, saving massive time!            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Step 6: Test Execution Guide

### 1. Run the Entire Test Suite
Executes all configured test projects across Portal and Admin:
```bash
npx playwright test
```

---

### 2. Run Specific Projects (Recommended)
`playwright.config.ts` divides test suites into dedicated projects. Run them individually using the `--project` flag:

* **Admin Dashboard** (User Management, Service Groups, Content Groups, Headers):
  ```bash
  npx playwright test --project="Admin Dashboard"
  ```
* **Portal - Read-Only** (Fast parallel execution for Search, Home, Navigation):
  ```bash
  npx playwright test --project="Portal - Read-Only"
  ```
* **Portal - Profile** (User Profile sections, Work & Education, Enrollment):
  ```bash
  npx playwright test --project="Portal - Profile"
  ```
* **Portal - Research Plus** (Federated search queries & external publisher aggregations):
  ```bash
  npx playwright test --project="Portal - Research Plus"
  ```
* **Portal - Pre-Login** (Unauthenticated flows: Registration, Password Reset, OTP):
  ```bash
  npx playwright test --project="Portal - Pre-Login"
  ```

---

### 3. Run a Specific Test File
To run a single module without running the rest of the suite:
```bash
# Service Groups
npx playwright test tests/admin/user-management/service-groups.spec.ts --project="Admin Dashboard"

# Add Single User (148 validation rules)
npx playwright test tests/admin/user-management/add-single-user.spec.ts --project="Admin Dashboard"

# Manage Users & Filters
npx playwright test tests/admin/user-management/manage-users.spec.ts --project="Admin Dashboard"
```

---

### 4. Run a Specific Scenario by Name (Grep)
Use the `-g` (grep) flag to run a single test case without running other tests in the file:
```bash
npx playwright test -g "Service Groups - Create Group - verifies create group button is visible" --project="Admin Dashboard"
```

---

### 5. Running in Headed Mode (Visual Inspection)
To visually watch the browser interact with the UI during debugging, add the `--headed` flag:
```bash
npx playwright test tests/admin/user-management/service-groups.spec.ts --project="Admin Dashboard" --headed
```

---

### 6. Running with Interactive UI Mode
Playwright UI Mode provides time-travel debugging, DOM inspection, and live selector testing:
```bash
npx playwright test --ui
```

---

## 📊 Step 7: Viewing Reports & Execution Logs

After tests complete, reports are automatically generated:

### 1. Interactive HTML Report
To view screenshots, step traces, and execution timelines in your browser:
```bash
npx playwright show-report
```

### 2. Custom Executive CSV Reports
The framework automatically writes detailed CSV logs to `test-results/`:
* `test-results/Test_Summary_YYYY-MM-DD_HH-mm-ss.csv`: Executive pass/fail count and total duration.
* `test-results/Test_Report_YYYY-MM-DD_HH-mm-ss.csv`: Row-by-row breakdown of every scenario, test data used, duration, and error details.

---

## ❓ Step 8: Troubleshooting & Common Pitfalls

### Issue 1: `Executable doesn't exist at ... Run "npx playwright install"`
* **Cause**: Playwright browser binaries were not downloaded on this machine.
* **Fix**:
  ```bash
  npx playwright install --with-deps
  ```

### Issue 2: `Error: Cannot find module ...`
* **Cause**: Dependencies are missing.
* **Fix**:
  ```bash
  npm install
  ```

### Issue 3: `API Login failed with status: 401 or 404`
* **Cause**: Incorrect admin credentials or base URL in `.env`.
* **Fix**: Verify `DASHBOARD_URL`, `ADMIN_USER`, and `ADMIN_PASSWORD` in `.env`. Ensure your network is not blocking `qa.knimbus.com`.

### Issue 4: `Error: expect(received).toBe(expected) // Object.is equality` on User Counts
* **Cause**: Knimbus displays counts >= 1,000 with commas (`1,083`).
* **Fix**: Use `.replace(/,/g, '')` when parsing numeric text from DOM elements before assertions.

### Issue 5: `.auth/user.json` or `.auth/admin.json` Session Expired
* **Cause**: Cached cookies have timed out on the backend server.
* **Fix**: Delete the `.auth` folder or re-run the setup project:
  ```bash
  rm -rf .auth
  npx playwright test tests/admin.setup.ts tests/portal.setup.ts
  ```

---

## 🛡️ Architectural Rules & Guidelines for Contributors

If you write or maintain tests in this repository, you must adhere strictly to [.agents/AGENTS.md](file:///Users/ks/Documents/Knimbus%20Test%20Automation/.agents/AGENTS.md):

1. **No Hardcoded Test Data**: Extract all labels, queries, and expected messages from [`tests/test-data/admin-data.json`](file:///Users/ks/Documents/Knimbus%20Test%20Automation/tests/test-data/admin-data.json) or [`tests/test-data/portal-data.json`](file:///Users/ks/Documents/Knimbus%20Test%20Automation/tests/test-data/portal-data.json).
2. **No Logic in Specs**: Zero `if/else` statements, loops, or branch logic in `.spec.ts` files. All logic belongs in Page Object Models.
3. **Natural Hierarchy Test Naming**: All test titles must follow:
   `[Page / Module] - [Component / Feature] - [Action and Expected Outcome]`
4. **Backend Preconditions via API**: Use `AdminApiService` to configure admin settings in `beforeAll` hooks; do not configure them via UI clicks.
5. **Clean State Restoration**: Always revert settings in `afterAll` or `finally` blocks to prevent dirty backend states from failing subsequent tests.
