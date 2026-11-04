import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  // Fail the CI build if someone accidentally leaves test.only in the code.
  forbidOnly: !!process.env.CI,
  // Retry only on CI, where a public practice site can be briefly slow.
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: 'https://automationexercise.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  // Every test runs once per project: three desktop browser engines and two phones.
  // Run a single one with: npx playwright test --project=firefox
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile: a phone-sized screen, touch and a mobile user agent.
    // Pixel runs in Chromium, iPhone runs in WebKit (the engine behind Safari).
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 15'] },
    },
  ],
});
