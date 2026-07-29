// Central, user-facing validation copy.
//
// Every validator in src/validations/* should pull its error text from here
// instead of inlining strings, so the same field always shows the same
// message everywhere it appears (contact form, onboarding wizard, dashboard,
// admin). Keep messages plain-language never expose schema/regex/technical
// details to the user (see server/app/validations for the backend mirror).

export const MESSAGES = {
  // Names
  nameRequired: 'Enter your full name.',
  nameTooShort: 'Name must contain at least 2 characters.',
  nameTooLong: 'Name must be 100 characters or fewer.',
  nameInvalid: 'Enter a valid name using letters, spaces, hyphens, apostrophes, or periods.',

  // Email
  emailRequired: 'Enter your email address.',
  emailInvalid: 'Enter a valid email address.',
  emailMismatch: 'Email addresses do not match.',

  // Phone
  phoneRequired: 'Enter your phone number.',
  phoneInvalid: 'Enter a valid 10-digit U.S. phone number.',

  // Preferred contact method
  contactMethodRequired: 'Select a preferred contact method.',

  // Business name
  businessNameRequired: 'Please enter your business name.',
  businessNameTooShort: 'Business name must contain at least 2 characters.',
  businessNameTooLong: 'Business name must be 80 characters or fewer.',
  businessNameInvalid: 'Please enter a valid business name.',

  // Address
  addressRequired: 'Enter a street address.',
  addressTooShort: 'Enter a complete street address.',
  addressTooLong: 'Address must be 150 characters or fewer.',
  addressInvalid: 'Enter a valid street address.',
  poBoxNotAllowed: 'Enter a physical street address. A PO Box cannot be used here.',
  cityRequired: 'Enter a city.',
  cityTooShort: 'City must contain at least 2 characters.',
  cityTooLong: 'City must be 100 characters or fewer.',
  cityInvalid: 'Enter a valid city name.',
  zipRequired: 'Enter a ZIP code.',
  zipInvalid: 'Enter a valid 5-digit ZIP code.',

  // Dates
  dateRequired: 'Select a date.',
  dateInvalid: 'Enter a valid date.',
  dateNotPast: 'This date cannot be in the past.',
  dateNotFuture: 'This date cannot be in the future.',
  dateTooFarOut: (days) => `Select a date within ${days} days.`,

  // EIN
  einRequired: 'Enter the EIN.',
  einInvalid: 'Enter a valid 9-digit EIN.',

  // Passwords
  passwordRequired: 'Enter a password.',
  passwordTooShort: 'Password must be at least 8 characters.',
  passwordTooLong: 'Password must be 128 characters or fewer.',
  passwordWeak: 'Use at least 8 characters, including uppercase, lowercase, a number, and a special character.',
  confirmPasswordRequired: 'Re-enter your password.',
  passwordMismatch: 'Passwords do not match.',
  loginFailed: 'The email or password is incorrect.',

  // Numeric / ownership
  numberRequired: 'Enter a value.',
  numberInvalid: 'Enter a valid number.',
  integerInvalid: 'Enter a whole number.',
  percentageInvalid: 'Enter a valid ownership percentage.',
  percentageRange: 'Ownership percentage must be between 0 and 100.',
  ownershipTotalInvalid: 'Total ownership must equal 100%.',
  moneyInvalid: 'Enter a valid amount with up to two decimal places.',
  moneyNegative: 'Amount cannot be negative.',

  // Select / radio / checkbox
  selectionRequired: 'Please make a selection.',
  consentRequired: 'You must agree before continuing.',

  // Textarea
  textTooShort: (min) => `Enter at least ${min} characters.`,
  textTooLong: (max) => `Enter ${max} characters or fewer.`,
  textRequired: 'This field is required.',
  textWhitespaceOnly: 'This field cannot be blank.',

  // URL
  urlInvalid: 'Enter a valid website address (starting with http:// or https://).',

  // Files
  fileRequired: 'Choose a file to upload.',
  fileTypeInvalid: (types) => `Upload a ${types} file.`,
  fileTooLarge: (mb) => `The file must be smaller than ${mb} MB.`,

  // Generic fallback never show raw backend/schema errors
  genericError: 'Please correct the highlighted fields.'
}
