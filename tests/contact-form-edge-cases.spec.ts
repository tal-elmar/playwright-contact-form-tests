import { test, expect } from '@playwright/test';
import { ContactPage } from '../pages/contact-page';
import {
  invalidEmails,
  longMessage,
  requiredFields,
  specialCharacters,
  validContact,
} from '../test-data/contact-data';

// The site uses the browser's built-in validation ("Please fill out this field" popup),
// not a custom error text on the page. That message is not part of the page, so the tests read
// the field's validity state instead (contactPage.isInvalid) and check that no success message appears.

let contactPage: ContactPage;

test.beforeEach(async ({ page }) => {
  contactPage = new ContactPage(page);
  // opens the page and sets up the click on the consent dialogue window
  await contactPage.open();
});

test.describe('Contact form: validation', () => {
  test('empty form is not submitted', async () => {
    await contactPage.submit();

    await expect(contactPage.successMessage).toHaveCount(0);
    //only the email field is required in the form
    expect(await contactPage.isInvalid('email')).toBe(true);
  });

  for (const fieldToLeaveEmpty of requiredFields) {
    test(`form is not submitted when "${fieldToLeaveEmpty}" is empty`, async () => {
      //valid data in every field except the one under test
      await contactPage.fillForm({ ...validContact(), [fieldToLeaveEmpty]: undefined });
      await contactPage.submit();

      await expect(contactPage.successMessage).toHaveCount(0);
      expect(await contactPage.isInvalid(fieldToLeaveEmpty)).toBe(true);
    });
  }

  //4 separate tests, one for each badEmail - filling email field with invalid data format
  for (const badEmail of invalidEmails) {
    test(`form is not submitted with invalid email "${badEmail}"`, async () => {
      await contactPage.fillForm({ ...validContact(), email: badEmail });
      await contactPage.submit();

      await expect(contactPage.successMessage).toHaveCount(0);
      expect(await contactPage.isInvalid('email')).toBe(true);
    });
  }
});

test.describe('Contact form: unusual input', () => {
  //5000 test message in Message field
  test('very long message is accepted', async () => {
    await contactPage.fillForm({ ...validContact(), message: longMessage });
    await contactPage.submit();

    await expect(contactPage.successMessage.first()).toBeVisible();
  });

  //special characters in Name, Subject and Message fields
  test('special characters in the message are accepted', async () => {
    await contactPage.fillForm({ ...validContact(), ...specialCharacters });
    await contactPage.submit();

    await expect(contactPage.successMessage.first()).toBeVisible();
  });
});
