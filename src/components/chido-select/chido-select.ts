import { InlineValidation } from '../shared/validation';
import { emitValue } from '../shared/events';
import { readOptions, optionObserverConfig } from '../shared/options';
import styles from './chido-select.scss?inline';

export class ChidoSelect extends HTMLElement {
  static observedAttributes = ['control-label', 'control-name', 'disabled', 'required', 'validation-text', 'lang', 'value'];
  private readonly control: HTMLSelectElement;
  private readonly label: HTMLLabelElement;
  private readonly labelText: HTMLSpanElement;
  private readonly validation: InlineValidation;
  private dirtyValue = false;
  private requestedValue = '';
  private readonly optionsObserver = new MutationObserver(() => this.syncOptions());

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `<style>${styles}</style>
      <label part="label"><span part="label-text"></span><select part="control select" aria-describedby="validation-message"></select></label>
      <span id="validation-message" part="validation-message" hidden></span>`;
    this.control = shadow.querySelector('select')!;
    this.label = shadow.querySelector('label')!;
    this.labelText = shadow.querySelector('label span')!;
    this.validation = new InlineValidation(this, shadow.querySelector('#validation-message')!,
      () => [this.control], () => Boolean(this.controlLabel.trim()));
    this.control.addEventListener('blur', () => this.validation.report());
    this.control.addEventListener('invalid', event => { event.preventDefault(); this.validation.report(); });
    for (const eventName of ['input', 'change'] as const) {
      this.control.addEventListener(eventName, () => {
        this.dirtyValue = true;
        this.requestedValue = this.value;
        this.validation.update();
        emitValue(this, eventName === 'input' ? 'chido-input' : 'chido-change', { value: this.value });
      });
    }
  }

  get controlLabel(): string { return this.getAttribute('control-label') ?? ''; }
  set controlLabel(value: string) { this.setAttribute('control-label', value); }
  get controlName(): string { return this.getAttribute('control-name') ?? ''; }
  set controlName(value: string) { this.setAttribute('control-name', value); }
  get disabled(): boolean { return this.hasAttribute('disabled'); }
  set disabled(value: boolean) { this.toggleAttribute('disabled', value); }
  get required(): boolean { return this.hasAttribute('required'); }
  set required(value: boolean) { this.toggleAttribute('required', value); }
  get validationText(): string { return this.getAttribute('validation-text') ?? ''; }
  set validationText(value: string) { this.setAttribute('validation-text', value); }
  get value(): string { return this.control.value; }
  set value(value: string) { this.dirtyValue = true; this.requestedValue = value; this.control.value = value; this.validation.update(); }
  get defaultValue(): string { return this.getAttribute('value') ?? ''; }
  set defaultValue(value: string) { this.setAttribute('value', value); }

  override focus(options?: FocusOptions): void { this.control.focus(options); }
  override blur(): void { this.control.blur(); }
  reportValidity(): boolean { return this.validation.report(); }
  checkValidity(): boolean { this.validation.update(); return this.control.checkValidity(); }

  connectedCallback(): void {
    this.syncOptions();
    this.optionsObserver.observe(this, optionObserverConfig);
    this.syncControl();
    this.validation.connect();
  }

  disconnectedCallback(): void {
    this.validation.disconnect();
    this.optionsObserver.disconnect();
  }

  attributeChangedCallback(name: string): void {
    if (name === 'value' && !this.dirtyValue) this.control.value = this.defaultValue;
    this.syncControl();
  }

  private syncControl(): void {
    this.labelText.textContent = this.controlLabel;
    this.label.hidden = !this.controlLabel.trim();
    this.control.name = this.controlName;
    this.control.disabled = this.disabled;
    this.control.required = this.required;
    this.validation.update();
  }

  private syncOptions(): void {
    const current = this.dirtyValue ? this.requestedValue : this.value;
    const options = readOptions(this).map(data => {
      const option = new Option(data.label, data.value, data.selected, data.selected);
      option.disabled = data.disabled;
      return option;
    });
    this.control.replaceChildren(...options);
    if (this.dirtyValue) this.control.value = current;
    else if (this.hasAttribute('value')) this.control.value = this.defaultValue;
    this.validation.update();
  }
}

if (!customElements.get('chido-select')) customElements.define('chido-select', ChidoSelect);

declare global { interface HTMLElementTagNameMap { 'chido-select': ChidoSelect } }
