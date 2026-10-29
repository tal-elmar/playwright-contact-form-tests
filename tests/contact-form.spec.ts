import { test, expect } from '@playwright/test';

// Practice site built for automation training: https://automationexercise.com/contact_us
// The form fields have no <label> elements, so they are located by their placeholder text.

const SUCCESS_MESSAGE = 'Success! Your details have been submitted successfully.';

test.describe('Contact form Happy Path', () => {
  test.beforeEach(async ({ page }) => {
    //clicking on the consent dialogue window that blocks the web page
    await page.addLocatorHandler(page.getByRole('button', { name: 'Consent' }), async (button) => {
      await button.click();
    });
    await page.goto('/contact_us');
  });

  test('checks the form is fully visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Get In Touch' })).toBeVisible();
    await expect(page.getByPlaceholder('Name', { exact: true })).toBeVisible();
    await expect(page.getByPlaceholder('Email', { exact: true })).toBeVisible();
    await expect(page.getByPlaceholder('Subject')).toBeVisible();
    await expect(page.getByPlaceholder('Your Message Here')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
  });

  test('submit the form and show a success message', async ({ page }) => {
    await page.getByPlaceholder('Name', { exact: true }).fill('Test User');
    await page.getByPlaceholder('Email', { exact: true }).fill('test.user@example.com');
    await page.getByPlaceholder('Subject').fill('Question about an order');
    await page.getByPlaceholder('Your Message Here').fill('Hello, this is an automated test message.');

    // The site asks "Press OK to proceed!" in a browser dialog before submitting.
    page.on('dialog', dialog => {
      dialog.accept()
    });
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText(SUCCESS_MESSAGE).first()).toBeVisible();
  });

  test('submit the form with a file attached', async ({ page }) => {
    await page.getByPlaceholder('Name', { exact: true }).fill('Test User');
    await page.getByPlaceholder('Email', { exact: true }).fill('test.user@example.com');
    await page.getByPlaceholder('Subject').fill('Screenshot of the issue');
    await page.getByPlaceholder('Your Message Here').fill('Please see the attached file.');

    // The upload input has no label or placeholder, so this is the one CSS selector in the suite.
    await page.locator('input[type="file"]').setInputFiles('tests/fixtures/sample-attachment.txt');

    page.on('dialog', dialog => {
      dialog.accept()
    });
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByText(SUCCESS_MESSAGE).first()).toBeVisible();
  });

});
