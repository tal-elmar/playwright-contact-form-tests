import type { Locator, Page } from '@playwright/test';

// The four text fields of the form. Every key is optional, so a test can leave
// a field out on purpose (for example to check that an empty email is blocked).
export type ContactDetails = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

// same as export type ContactField = 'name' | 'email' | 'subject' | 'message';
export type ContactField = keyof ContactDetails;

const SUCCESS_TEXT = 'Success! Your details have been submitted successfully.';

// Page object for https://automationexercise.com/contact_us
// It knows WHERE things are on the page and HOW to use them.
// The tests decide WHAT to check, so all expect() calls stay in the spec files.
export class ContactPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly fields: Record<ContactField, Locator>;
  readonly fileInput: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Get In Touch' });

    // The fields have no <label> elements, so they are located by placeholder.
    this.fields = {
      name: page.getByPlaceholder('Name', { exact: true }),
      email: page.getByPlaceholder('Email', { exact: true }),
      subject: page.getByPlaceholder('Subject', { exact: true }),
      message: page.getByPlaceholder('Your Message Here', { exact: true }),
    };

    // The upload input has no label, placeholder or role, so this is the one
    // CSS selector in the suite.
    this.fileInput = page.locator('input[type="file"]');
    this.submitButton = page.getByRole('button', { name: 'Submit' });

    // The page's HTML contains this text twice (only one copy is visible), so this
    // locator matches 2 elements. Tests that check visibility use .first() to avoid
    // Playwright's strict mode error.
    this.successMessage = page.getByText(SUCCESS_TEXT);
  }

  async open() {
    // The tested site shows a cookie consent overlay that blocks clicks. This handler runs
    // whenever the overlay appears, and does nothing if it never shows up.
    await this.page.addLocatorHandler(
      this.page.getByRole('button', { name: 'Consent' }),
      async (button) => {
        await button.click();
      },
    );

    await this.page.goto('/contact_us');
  }

  // Fills only the fields that are given and skips the rest.
  async fillForm(details: ContactDetails) {
    for (const [field, value] of Object.entries(details)) {
      if (value !== undefined) {
        await this.fields[field as ContactField].fill(value);
      }
    }
  }

  // Attach file check. The path is relative to the project root, where `npx playwright test` runs.
  async attachFile(filePath: string) {
    await this.fileInput.setInputFiles(filePath);
  }

  async submit() {
    // On a valid form the site asks "Press OK to proceed!" in a browser dialog.
    // If validation blocks the form, no dialog appears and this listener is never used.
    this.page.once('dialog', (dialog) => dialog.accept());
    await this.submitButton.click();
  }

  // Reads the browser's own validation result for a field. The "Please fill out
  // this field" bubble is not page text, so checkValidity() is how we see it.
  async isInvalid(field: ContactField) {
    return this.fields[field].evaluate(
      (el) => !(el as HTMLInputElement | HTMLTextAreaElement).checkValidity(),
    );
  }
}
