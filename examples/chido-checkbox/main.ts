import type { ChidoSelect } from '../../src/index';
import { ChidoCheckbox, getLocale, setLocale } from '../../src/index';
import type { ChidoValueDetail } from '../../src/index';

export function renderCheckboxDemo(container: HTMLElement): void {
  container.innerHTML = `
    <h1 tabindex="-1">Chido checkbox</h1>
    <p>Native controls, scoped styles, and inline validation.</p>
    <div class="chido-w-25">
      <chido-select id="language" control-label="Validation language">
        <option value="en">English</option>
        <option value="es">Español</option>
      </chido-select>
    </div>
    <div class="chido-stack chido-gap-6 chido-my-6">
    <chido-checkbox control-label="I accept the terms" control-name="terms" value="accepted" required></chido-checkbox>
    <chido-checkbox control-label="Send me updates" checked></chido-checkbox>
    <chido-checkbox control-label="Disabled" checked disabled></chido-checkbox>
    </div>
    <chido-button id="validate">Validate controls</chido-button>
    <p>Latest event: <output id="event">Waiting for interaction</output></p>
  `;
  const language = container.querySelector<ChidoSelect>('#language')!;
  language.value = getLocale();
  language.addEventListener('chido-change', () => setLocale(language.value));
  const controls = container.querySelectorAll<ChidoCheckbox>('chido-checkbox');
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
          checked: control.checked,
          detail: (event as CustomEvent<ChidoValueDetail>).detail,
        });
        output.textContent = `${event.type}: ${JSON.stringify((event as CustomEvent<ChidoValueDetail>).detail)}`;
      });
    }
  }
}
