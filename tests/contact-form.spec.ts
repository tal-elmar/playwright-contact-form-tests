import { test, expect } from '@playwright/test';
import { ContactPage } from '../pages/contact-page';
import { validContact } from '../test-data/contact-data';

// Practice site built for automation training: https://automationexercise.com/contact_us
// Locators and actions live in pages/contact-page.ts, test data in test-data/contact-data.ts.

test.describe('Contact form Happy Path', () => {
  let contactPage: ContactPage;

  test.beforeEach(async ({ page }) => {
    contactPage = new ContactPage(page);
    // opens the page and sets up the click on the consent dialogue window
    await contactPage.open();
  });

  test('checks the form is fully visible', async () => {
    await expect(contactPage.heading).toBeVisible();
    for (const field of Object.values(contactPage.fields)) {
      await expect(field).toBeVisible();
    }
    await expect(contactPage.submitButton).toBeEnabled();
  });

  test('submit the form and show a success message', async () => {
    await contactPage.fillForm(validContact());
    // submit() also accepts the "Press OK to proceed!" browser dialog
    await contactPage.submit();

    await expect(contactPage.successMessage.first()).toBeVisible();
  });

  test('submit the form with a file attached', async () => {
    await contactPage.fillForm(validContact());
    await contactPage.attachFile('tests/fixtures/sample-attachment.txt');
    await contactPage.submit();

    await expect(contactPage.successMessage.first()).toBeVisible();
  });
});
