export const en = {
  missingControlLabel: 'A control-label attribute is required.',
  info: 'Information',
  warning: 'Warning',
  error: 'Error',
  success: 'Success',
  formErrors: 'Please correct the following errors',
  progress: 'Progress',
  inProgress: 'In progress',
  required: 'Required',
  invalidEmail: 'Enter a valid email address.',
  invalidUrl: 'Enter a valid URL.',
  patternMismatch: 'Match the requested format.',
  tooShort: 'Enter at least {min} characters.',
  tooLong: 'Enter no more than {max} characters.',
  missingLabel: 'ChidoInput: the input-label attribute is required.',
};

export type Messages = { [Key in keyof typeof en]: string };
