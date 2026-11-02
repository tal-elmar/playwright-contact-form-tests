import { faker } from '@faker-js/faker';
import type { ContactDetails, ContactField } from '../pages/contact-page';

// Valid data is random on every run (faker), so the tests don't depend on one
// set of values. Emails use example.com, a domain reserved for testing.
export function validContact(): Required<ContactDetails> {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email({ provider: 'example.com' }),
    subject: faker.lorem.sentence({ min: 3, max: 6 }),
    message: faker.lorem.paragraph(),
  };
}

// Invalid and unusual data stays fixed, so a failure is easy to reproduce.

// On the tested site only the email field is required.
export const requiredFields: ContactField[] = ['email'];

// "missing@domain" is left out on purpose: browsers accept it as a valid email.
export const invalidEmails = ['plainaddress', '@no-user.com', 'user@', 'user name@example.com'];

export const longMessage = 'a'.repeat(5000);

export const specialCharacters = {
  name: "O'Brien & Sons",
  subject: 'Quotes " and <tags>',
  message: '<b>bold</b> & "quotes" ; DROP TABLE users;',
};
