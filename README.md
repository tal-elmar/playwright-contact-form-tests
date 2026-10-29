# Playwright Form Tests

End-to-end tests for web contact form, written in TypeScript with [Playwright](https://playwright.dev).

## Background

I piloted automated tests that found contact forms on web pages (templates), filled them in and verified the result. This repo rebuilds the idea from scratch, step by step, as a clean and maintainable test suite.

All tests run against the page [Automation Exercise](https://automationexercise.com/contact_us), a public site made for automation practice. The suite never submits forms on real websites for clean testing.

## How to run

Requires [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npx playwright install chromium
npx playwright test
```

Open the HTML report after a run:

```bash
npx playwright show-report
```

Other useful commands:

| Command | What it does |
| --- | --- |
| `npm run test:headed` | Runs the tests with a visible browser |
| `npm run test:ui` | Opens Playwright's interactive UI mode |
| `npm run typecheck` | Checks the TypeScript without running tests |

## What's covered

| Area | Test | Status |
| --- | --- | --- |
| Contact form | Form and all its fields are shown | ✅ |
| Contact form | Filled form submits and shows a success message | ✅ |
| Contact form | Form submits with a file attached | ✅ |
| Validation | Empty fields, invalid email, long input | Planned |
| Accessibility | axe-core scan of the form page | Planned |

## How the tests are written

- Locators use Playwright's user-facing queries (`getByRole`, `getByPlaceholder`) instead of fragile CSS paths.
- No hard waits. Playwright waits automatically, and `expect` assertions retry until the page is ready.
- One exception: the file upload uses the CSS locator `input[type="file"]`, because that input has no label, placeholder or role to target.

## Roadmap

The repo grows in small stages, one or more commits each:

1. **Basics** (this commit): Playwright + TypeScript, happy-path tests.
2. **Negative cases**: empty required fields, invalid email, very long input.
3. **Page Object Model**: move locators into page classes and test data into its own file.
4. **Cross-browser**: Firefox, WebKit and a mobile viewport.
5. **Accessibility**: `@axe-core/playwright` scans of the form pages.
6. **CI**: GitHub Actions on every push, with the HTML report uploaded and a status badge here.
7. **API tests**: a few tests with Playwright's `request` against a public practice API.

## What I'd add next

- Check that the success message disappears and the form resets after navigating back.
- Tests for a second practice form (for example DemoQA) to show the approach works on a different page.
