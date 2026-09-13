import '../../src/index';
import type { ChidoFormError } from '../../src/index';

export function renderFormSummaryDemo(container: HTMLElement): void {
  container.innerHTML = `
    <h1 tabindex="-1">Chido form summary</h1>
    <p>Submit the empty form, then follow an error link to its field.</p>
    <form novalidate class="chido-stack chido-gap-4">
      <chido-form-summary></chido-form-summary>
      <chido-form-field control-label="Full name" required validation-text="Enter your full name.">
        <input id="summary-name" name="fullName" />
      </chido-form-field>
      <chido-form-field control-label="Email address" required validation-text="Enter a valid email address.">
        <input id="summary-email" name="email" type="email" />
      </chido-form-field>
      <chido-button>Continue</chido-button>
    </form>`;
  const summary = container.querySelector('chido-form-summary')!;
  const form = container.querySelector('form')!;
  for (const input of container.querySelectorAll('input')) {
    for (const eventName of ['input', 'change']) {
      input.addEventListener(eventName, () => {
        console.log(eventName, {
          label: input.closest('chido-form-field')?.controlLabel,
          name: input.name,
          value: input.value,
        });
      });
    }
  }
  // ChidoButton is an action button; the demo explicitly requests submission.
  container.querySelector('chido-button')!.addEventListener('click', () => form.requestSubmit());
  form.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.isComposing && !event.defaultPrevented
      && event.target instanceof HTMLInputElement) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const errors: ChidoFormError[] = [];
    for (const field of container.querySelectorAll('chido-form-field')) {
      const input = field.querySelector('input')!;
      field.invalid = !input.validity.valid;
      if (field.invalid) errors.push({ target: input, message: field.validationText });
    }
    summary.errors = errors;
    console.log('chido-form-summary update', { errors: errors.map(error => ({
      target: error.target instanceof HTMLElement ? error.target.id : error.target,
      message: error.message,
    })) });
    summary.focus();
  });
}
