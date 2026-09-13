import type { ChidoSelect } from '../../src/index';
import { ChidoRadioGroup, getLocale, setLocale } from '../../src/index';
import type { ChidoValueDetail } from '../../src/index';

export function renderRadioGroupDemo(container: HTMLElement): void {
  container.innerHTML = `
    <h1 tabindex="-1">Chido radio group</h1>
    <p>Native controls, scoped styles, and inline validation.</p>
    <div class="chido-w-25">
      <chido-select id="language" control-label="Validation language">
        <option value="en">English</option>
        <option value="es">Español</option>
      </chido-select>
    </div>
    <div class="chido-stack chido-gap-6 chido-my-6">
    <chido-radio-group control-label="Delivery method" control-name="delivery" required>
      <option value="standard">Standard delivery</option><option value="express">Express delivery</option><option value="pickup" disabled>Pickup (unavailable)</option>
    </chido-radio-group>
    <chido-radio-group control-label="Notification preference" value="email"><option value="email">Email</option><option value="sms">Text message</option></chido-radio-group>
    <chido-radio-group control-label="Disabled group" disabled value="standard"><option value="standard">Standard</option><option value="express">Express</option></chido-radio-group>
    </div>
    <chido-button id="validate">Validate controls</chido-button>
    <p>Latest event: <output id="event">Waiting for interaction</output></p>
  `;
  const language = container.querySelector<ChidoSelect>('#language')!;
  language.value = getLocale();
  language.addEventListener('chido-change', () => setLocale(language.value));
  const controls = container.querySelectorAll<ChidoRadioGroup>('chido-radio-group');
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
