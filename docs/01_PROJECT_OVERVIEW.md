# Project Overview

## Project Purpose
To build a production-ready, enterprise-grade Playwright automation framework using TypeScript for the Knimbus ecosystem. This framework will ensure high quality and regression safety for both end-users (Library Portal) and administrators (Librarian Dashboard).

## Goals
- Create a highly modular, maintainable, and scalable framework.
- Ensure the framework is easily understandable for a team with intermediate TypeScript experience (avoiding overly complex paradigms initially).
- Support cross-browser testing (Chromium, Firefox, WebKit).
- Provide robust documentation for engineering hand-offs and AI-assisted development.

## Scope
### Modules
1. **Library Portal** (`sydneyuniversity.knimbus.com`)
   - End-user facing.
   - Dynamic authentication flows based on admin settings (SSO, OTP, Mandatory Fields).
   - Core features: Search, Read, Profile Management, Subscriptions.

2. **Librarian Dashboard** (`qa.knimbus.com`)
   - Admin facing.
   - Controls library settings, user management, authentication rules, reporting, and configurations.

## Tech Stack
- **Core Engine:** Playwright
- **Language:** TypeScript
- **Design Pattern:** Page Object Model (POM) + Fixtures
- **Test Runner:** Playwright Test
- **Assertions:** Playwright built-in Web-First Assertions
- **Linting/Formatting:** ESLint & Prettier (to be configured)

## Architecture Overview
The framework employs a Page Object Model pattern combined with Playwright's Fixtures to separate test logic from page interaction logic. Because of the dynamic nature of the login flow (dependent on Dashboard settings), authentication state management will be a key architectural pillar. Tests will utilize `sessionStorage` manipulation and API calls for test data setup where possible.
