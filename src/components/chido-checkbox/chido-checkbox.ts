import { InlineValidation } from '../shared/validation';
import { emitValue } from '../shared/events';
import styles from './chido-checkbox.scss?inline';

export class ChidoCheckbox extends HTMLElement {
  static observedAttributes = ['control-label', 'control-name', 'disabled', 'required', 'validation-text', 'lang', 'value', 'checked'];
  private readonly control: HTMLInputElement;
  private readonly label: HTMLLabelElement;
  private readonly labelText: HTMLSpanElement;
  private readonly validation: InlineValidation;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `<style>${styles}</style>
      <label part="label"><input part="control input" type="checkbox" aria-describedby="validation-message" /><span part="label-text"></span></label>
      <span id="validation-message" part="validation-message" hidden></span>`;
    this.control = shadow.querySelector('input')!;
    this.label = shadow.querySelector('label')!;
    this.labelText = shadow.querySelector('label span')!;
    this.validation = new InlineValidation(this, shadow.querySelector('#validation-message')!,
      () => [this.control], () => Boolean(this.controlLabel.trim()));
    this.control.addEventListener('blur', () => this.validation.report());
    this.control.addEventListener('invalid', event => { event.preventDefault(); this.validation.report(); });
    for (const eventName of ['input', 'change'] as const) {
      this.control.addEventListener(eventName, () => {
        
        this.validation.update();
        emitValue(this, eventName === 'input' ? 'chido-input' : 'chido-change', { value: this.value, checked: this.checked });
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
  set value(value: string) { this.setAttribute('value', value); this.validation.update(); }
  get checked(): boolean { return this.control.checked; }
  set checked(value: boolean) { this.control.checked = value; this.validation.update(); }
  get defaultChecked(): boolean { return this.hasAttribute('checked'); }
  set defaultChecked(value: boolean) { this.toggleAttribute('checked', value); }
  get indeterminate(): boolean { return this.control.indeterminate; }
  set indeterminate(value: boolean) { this.control.indeterminate = value; }

  override focus(options?: FocusOptions): void { this.control.focus(options); }
  override blur(): void { this.control.blur(); }
  reportValidity(): boolean { return this.validation.report(); }
  checkValidity(): boolean { this.validation.update(); return this.control.checkValidity(); }

  connectedCallback(): void {
    this.syncControl();
    this.validation.connect();
  }

  disconnectedCallback(): void {
    this.validation.disconnect();
  }

  attributeChangedCallback(name: string): void {
    if (name === 'checked') this.control.defaultChecked = this.defaultChecked;
    this.syncControl();
  }

  private syncControl(): void {
    this.labelText.textContent = this.controlLabel;
    this.label.hidden = !this.controlLabel.trim();
    this.control.name = this.controlName;
    this.control.disabled = this.disabled;
    this.control.required = this.required;
    this.control.value = this.getAttribute('value') ?? 'on';
    this.validation.update();
  }
}

if (!customElements.get('chido-checkbox')) customElements.define('chido-checkbox', ChidoCheckbox);

declare global { interface HTMLElementTagNameMap { 'chido-checkbox': ChidoCheckbox } }
