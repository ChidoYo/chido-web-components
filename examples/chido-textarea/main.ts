import type { ChidoSelect } from '../../src/index';
import { ChidoTextarea, getLocale, setLocale } from '../../src/index';
import type { ChidoValueDetail } from '../../src/index';

export function renderTextareaDemo(container: HTMLElement): void {
  container.innerHTML = `
    <h1 tabindex="-1">Chido textarea</h1>
    <p>Native controls, scoped styles, and inline validation.</p>
    <div class="chido-w-25">
      <chido-select id="language" control-label="Validation language">
        <option value="en">English</option>
        <option value="es">Español</option>
      </chido-select>
    </div>
    <div class="chido-stack chido-gap-6 chido-my-6">
    <chido-textarea control-label="Message" control-name="message" placeholder="Tell us about your project" rows="4" minlength="10" maxlength="300" required></chido-textarea>
    <chido-textarea control-label="Read-only notes" value="You can select and copy these notes." readonly></chido-textarea>
    <chido-textarea control-label="Disabled" value="Unavailable" disabled></chido-textarea>
    </div>
    <chido-button id="validate">Validate controls</chido-button>
    <p>Latest event: <output id="event">Waiting for interaction</output></p>
  `;
  const language = container.querySelector<ChidoSelect>('#language')!;
  language.value = getLocale();
  language.addEventListener('chido-change', () => setLocale(language.value));
  const controls = container.querySelectorAll<ChidoTextarea>('chido-textarea');
  container.querySelector('#validate')!.addEventListener('click', () => {
    controls.forEach(control => control.reportValidity());
  });
  const output = container.querySelector('output')!;
  for (const control of controls) {
    for (const name of ['chido-input', 'chido-change']) {
      control.addEventListener(name, event => {
        console.log(event.type, {
          label: control.controlLabel,
          value: control.value,
          detail: (event as CustomEvent<ChidoValueDetail>).detail,
        });
        output.textContent = `${event.type}: ${JSON.stringify((event as CustomEvent<ChidoValueDetail>).detail)}`;
      });
    }
  }
}
