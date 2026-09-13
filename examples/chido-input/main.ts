import type { ChidoInput, ChidoSelect } from '../../src/index';
import { getLocale, setLocale } from '../../src/index';

/** Labels and custom messages are supplied by the consuming application. */
export function renderInputDemo(container: HTMLElement): void {
  container.innerHTML = `
    <h1 tabindex="-1">Chido input</h1>
    <p>Open the browser console to see chido-input events while typing and chido-change events when you leave a changed field.</p>

    <div class="chido-w-25">
      <chido-select id="demo-language" control-label="Validation language">
          <option value="en">English</option>
          <option value="es">Español</option>
      </chido-select>
    </div>

    <h2 class="chido-my-4">Default validation message</h2>
    
    <div class="chido-my-4">
      <chido-input input-label="First Name" required></chido-input>    
    </div>

    <h2 class="chido-my-4">Explicit Spanish language</h2>

    <div class="chido-my-4">
      <chido-input lang="es" input-label="Nombre" required></chido-input>
    </div>

    <h2 class="chido-my-4">Custom validation message</h2>

    <div class="chido-my-4">
      <chido-input
        input-label="First Name"
        required
        validation-text="Please enter your first name"
      ></chido-input>
    </div>

    <h2 class="chido-my-4">Additional native input options</h2>

    <div class="chido-my-4">
      <chido-input input-label="Email" type="email" autocomplete="email" required></chido-input>
    </div>

    <div class="chido-my-4">
      <chido-input input-label="Website" type="url" placeholder="https://example.com"></chido-input>
    </div>

    <div class="chido-my-4">
      <chido-input input-label="Username (3–12 lowercase letters)" minlength="3" maxlength="12" pattern="[a-z]+" autocomplete="username"></chido-input>
    </div>

    <div class="chido-my-4">
      <chido-input input-label="Read-only reference" value="CHIDO-001" readonly></chido-input>
    </div>

    <chido-button id="validate-inputs">Validate inputs</chido-button>
  `;

  for (const component of container.querySelectorAll<ChidoInput>('chido-input')) {
    for (const eventName of ['chido-input', 'chido-change'] as const) {
      component.addEventListener(eventName, event => {
        const { detail } = event as CustomEvent<{ value: string }>;
        console.log(eventName, {
          label: component.inputLabel,
          value: component.value,
          detail,
        });
      });
    }
  }

  const language = container.querySelector<ChidoSelect>('#demo-language')!;
  language.value = getLocale();
  language.addEventListener('chido-change', () => setLocale(language.value));
  container.querySelector('#validate-inputs')!.addEventListener('click', () => {
    for (const component of container.querySelectorAll('chido-input')) {
      // The public form-validation API will be added with form association.
      component.shadowRoot!.querySelector('input')!.reportValidity();
    }
  });
}
