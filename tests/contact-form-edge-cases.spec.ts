import { test, expect, Locator } from '@playwright/test';

// The site uses the browser's built-in validation ("Please fill out this field" popup),
// not a custom error text on the page. That message is not part of the page, so the tests read
// the field's validity state instead and check that no success message appears.

const SUCCESS_MESSAGE = 'Success! Your details have been submitted successfully.';

//valid data to be filled in
const validData = {
  Name: 'Test User',
  Email: 'test.user@example.com',
  Subject: 'Question about an order',
  'Your Message Here': 'Hello, this is an automated test message.',
};

// On this site only the email field is required.
const requiredFields = ['Email'];

// Reads the browser's own validation result for a field.
async function isInvalid(field: Locator) {
  return field.evaluate((el) => !(el as HTMLInputElement | HTMLTextAreaElement).checkValidity());
}

test.describe('Contact form: validation', () => {
  test.beforeEach(async ({ page }) => {
    //clicking on the consent dialogue window that blocks the web page
    await page.addLocatorHandler(page.getByRole('button', { name: 'Consent' }), async (button) => {
      await button.click();
    });

    await page.goto('/contact_us');
  });

  test('empty form is not submitted', async ({ page }) => {
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByText(SUCCESS_MESSAGE)).toHaveCount(0);
    //only the email field is required in the form
    expect(await isInvalid(page.getByPlaceholder('Email', { exact: true }))).toBe(true);
  });

  for (const fieldToLeaveEmpty of requiredFields) {
    test(`form is not submitted when "${fieldToLeaveEmpty}" is empty`, async ({ page }) => {
      for (const [placeholder, value] of Object.entries(validData)) {
        if (placeholder !== fieldToLeaveEmpty) {
          await page.getByPlaceholder(placeholder, { exact: true }).fill(value);
        }
      }

      await page.getByRole('button', { name: 'Submit' }).click();

      await expect(page.getByText(SUCCESS_MESSAGE)).toHaveCount(0);
      expect(await isInvalid(page.getByPlaceholder(fieldToLeaveEmpty, { exact: true }))).toBe(true);
    });
  }

  //4 separate tests, one for each badEmail - filling email field with invalid data format
  for (const badEmail of ['plainaddress', '@no-user.com', 'user@', 'user name@example.com']) {
    test(`form is not submitted with invalid email "${badEmail}"`, async ({ page }) => {
      await page.getByPlaceholder('Name', { exact: true }).fill(validData.Name);
      await page.getByPlaceholder('Email', { exact: true }).fill(badEmail);
      await page.getByPlaceholder('Subject', { exact: true }).fill(validData.Subject);
      await page.getByPlaceholder('Your Message Here', { exact: true }).fill(validData['Your Message Here']);

      await page.getByRole('button', { name: 'Submit' }).click();

      await expect(page.getByText(SUCCESS_MESSAGE)).toHaveCount(0);
      expect(await isInvalid(page.getByPlaceholder('Email', { exact: true }))).toBe(true);
    });
  }
});

test.describe('Contact form: unusual input', () => {
  test.beforeEach(async ({ page }) => {
    await page.addLocatorHandler(page.getByRole('button', { name: 'Consent' }), async (button) => {
      await button.click();
    });

    await page.goto('/contact_us');
  });

  //5000 test message in Message field
  test('very long message is accepted', async ({ page }) => {
    await page.getByPlaceholder('Name', { exact: true }).fill(validData.Name);
    await page.getByPlaceholder('Email', { exact: true }).fill(validData.Email);
    await page.getByPlaceholder('Subject', { exact: true }).fill(validData.Subject);
    await page.getByPlaceholder('Your Message Here', { exact: true }).fill('a'.repeat(5000));

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByText(SUCCESS_MESSAGE).first()).toBeVisible();
  });

  //special characters in Message field
  test('special characters in the message are accepted', async ({ page }) => {
    await page.getByPlaceholder('Name', { exact: true }).fill("O'Brien & Sons");
    await page.getByPlaceholder('Email', { exact: true }).fill(validData.Email);
    await page.getByPlaceholder('Subject', { exact: true }).fill('Quotes " and <tags>');
    await page
      .getByPlaceholder('Your Message Here', { exact: true })
      .fill('<b>bold</b> & "quotes" ; DROP TABLE users;');

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByText(SUCCESS_MESSAGE).first()).toBeVisible();
  });
});
