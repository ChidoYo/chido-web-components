import '../../src/index';

export function renderFormFieldDemo(container: HTMLElement): void {
  container.innerHTML = `
    <h1 tabindex="-1">Chido form field</h1>
    <p>A shared label, help text, required indicator, and error for a native control.</p>
    <form novalidate class="chido-stack chido-gap-4">
      <chido-form-field control-label="Course title" help-text="Use a short, descriptive title." required validation-text="Enter a course title.">
        <input name="courseTitle" type="text" />
      </chido-form-field>
      <chido-button>Validate field</chido-button>
    </form>`;
  const field = container.querySelector('chido-form-field')!;
  const input = container.querySelector('input')!;
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
    event.preventDefault(); field.invalid = !input.validity.valid;
    console.log('chido-form-field validation', { label: field.controlLabel, value: input.value, invalid: field.invalid });
    if (field.invalid) field.focus();
  });
  input.addEventListener('input', () => { if (input.validity.valid) field.invalid = false; });
}
