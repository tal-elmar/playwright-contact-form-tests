# Playwright Form Tests

End-to-end tests for web contact form, written in TypeScript with [Playwright](https://playwright.dev).

## Background

I piloted automated tests that found contact forms on web pages (templates), filled them in and verified the result. This repo rebuilds the idea from scratch, step by step, as a clean and maintainable test suite.

All tests run against the page [Automation Exercise](https://automationexercise.com/contact_us), a public site made for automation practice. The suite never submits forms on real websites for clean testing.

## How to run

Requires [Node.js](https://nodejs.org) 20.19 or newer.

```bash
npm install
npx playwright install
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
| `npx playwright test --project=firefox` | Runs the tests in one browser only |

## Browsers and devices

Every test runs in five Playwright projects, set up in `playwright.config.ts`. The tests themselves don't change.

| Project | Browser engine | Device |
| --- | --- | --- |
| `chromium` | Chromium | Desktop Chrome |
| `firefox` | Firefox | Desktop Firefox |
| `webkit` | WebKit | Desktop Safari |
| `mobile-chrome` | Chromium | Pixel 7 |
| `mobile-safari` | WebKit | iPhone 15 |

## Project structure

```
playwright-form-tests/
├── pages/
│   └── contact-page.ts                   # page object: locators and actions for the form
├── test-data/
│   └── contact-data.ts                   # valid data (faker) and fixed invalid/unusual data
├── tests/
│   ├── contact-form.spec.ts              # happy-path tests
│   ├── contact-form-edge-cases.spec.ts   # invalid and unusual input
│   └── fixtures/sample-attachment.txt    # file used by the upload test
├── playwright.config.ts
└── package.json
```

## What's covered

| Spec | Test | Status |
| --- | --- | --- |
| `contact-form` | Form and all its fields are shown | ✅ |
| `contact-form` | Filled form submits and shows a success message | ✅ |
| `contact-form` | Form submits with a file attached | ✅ |
| `contact-form-edge-cases` | Empty form is blocked (only the email field is required on this site) | ✅ |
| `contact-form-edge-cases` | Invalid email formats are blocked (4 cases) | ✅ |
| `contact-form-edge-cases` | Very long message (5,000 characters) is accepted | ✅ |
| `contact-form-edge-cases` | Special characters in all fields are accepted | ✅ |
| Accessibility | axe-core scan of the form page | Planned |

## How the tests are written

- **Page Object Model.** `ContactPage` holds every locator and action for the form (`open`, `fillForm`, `submit`, ...). The specs only describe what to check, so if the page changes, the fix goes in one file. All `expect` calls stay in the specs.
- **Test data in its own file.** Valid data is random on every run, made with [Faker](https://fakerjs.dev), and emails always use the test domain `example.com`. Invalid emails and special-character strings are fixed, so a failure is easy to reproduce.
- Locators use Playwright's user-facing queries (`getByRole`, `getByPlaceholder`) instead of fragile CSS paths.
- Browser validation messages ("Please fill out this field") are not page text, so those tests read the field's validity state with `checkValidity()`.
- The site shows a cookie consent overlay that can block clicks. A locator handler (`page.addLocatorHandler`), set up in `ContactPage.open()`, clicks "Consent" whenever it gets in the way.
- Repeated cases (invalid emails) are generated from a list with a `for` loop, so each one is a separate test in the report.
- No hard waits. Playwright waits automatically, and `expect` assertions retry until the page is ready.
- One exception: the file upload uses the CSS locator `input[type="file"]`, because that input has no label, placeholder or role to target.

## Roadmap

The repo grows in small stages, one or more commits each:

1. **Basics** (done): Playwright + TypeScript, happy-path tests.
2. **Edge cases** (done): empty required field, invalid email, very long input, special characters.
3. **Page Object Model** (done): move locators into page classes and test data into its own file.
4. **Cross-browser** (done): Chromium, Firefox, WebKit, plus Pixel and iPhone mobile emulation.
5. **Accessibility**: `@axe-core/playwright` scans of the form pages.
6. **CI**: GitHub Actions on every push, with the HTML report uploaded and a status badge here.
7. **API tests**: a few tests with Playwright's `request` against a public practice API.

## What I'd add next

- Check that the success message disappears and the form resets after navigating back.
- Tests for a second practice form (for example DemoQA) to show the approach works on a different page.
