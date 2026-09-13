import { InlineValidation } from '../shared/validation';
import { emitValue } from '../shared/events';
import styles from './chido-textarea.scss?inline';

export class ChidoTextarea extends HTMLElement {
  static observedAttributes = ['control-label', 'control-name', 'disabled', 'required', 'validation-text', 'lang', 'value', 'readonly', 'placeholder', 'rows', 'minlength', 'maxlength', 'autocomplete'];
  private readonly control: HTMLTextAreaElement;
  private readonly label: HTMLLabelElement;
  private readonly labelText: HTMLSpanElement;
  private readonly validation: InlineValidation;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `<style>${styles}</style>
      <label part="label"><span part="label-text"></span><textarea part="control textarea" aria-describedby="validation-message"></textarea></label>
      <span id="validation-message" part="validation-message" hidden></span>`;
    this.control = shadow.querySelector('textarea')!;
    this.label = shadow.querySelector('label')!;
    this.labelText = shadow.querySelector('label span')!;
    this.validation = new InlineValidation(this, shadow.querySelector('#validation-message')!,
      () => [this.control], () => Boolean(this.controlLabel.trim()));
    this.control.addEventListener('blur', () => this.validation.report());
    this.control.addEventListener('invalid', event => { event.preventDefault(); this.validation.report(); });
    for (const eventName of ['input', 'change'] as const) {
      this.control.addEventListener(eventName, () => {
        
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
  set value(value: string) { this.control.value = value; this.validation.update(); }
  get defaultValue(): string { return this.getAttribute('value') ?? ''; }
  set defaultValue(value: string) { this.setAttribute('value', value); }
  get placeholder(): string { return this.getAttribute('placeholder') ?? ''; }
  set placeholder(value: string) { this.setAttribute('placeholder', value); }
  get autocomplete(): string { return this.getAttribute('autocomplete') ?? ''; }
  set autocomplete(value: string) { this.setAttribute('autocomplete', value); }
  get readOnly(): boolean { return this.hasAttribute('readonly'); }
  set readOnly(value: boolean) { this.toggleAttribute('readonly', value); }
  get rows(): number { return this.control.rows; }
  set rows(value: number) { this.control.rows = value; this.setAttribute('rows', String(this.control.rows)); }
  get minLength(): number { return this.control.minLength; }
  set minLength(value: number) { this.control.minLength = value; this.setAttribute('minlength', String(this.control.minLength)); }
  get maxLength(): number { return this.control.maxLength; }
  set maxLength(value: number) { this.control.maxLength = value; this.setAttribute('maxlength', String(this.control.maxLength)); }

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
    if (name === 'value') this.control.defaultValue = this.defaultValue;
    this.syncControl();
  }

  private syncControl(): void {
    this.labelText.textContent = this.controlLabel;
    this.label.hidden = !this.controlLabel.trim();
    this.control.name = this.controlName;
    this.control.disabled = this.disabled;
    this.control.required = this.required;
    this.control.readOnly = this.readOnly;
    for (const name of ['placeholder', 'rows', 'minlength', 'maxlength', 'autocomplete']) {
      const value = this.getAttribute(name);
      if (value === null) this.control.removeAttribute(name);
      else if (this.control.getAttribute(name) !== value) this.control.setAttribute(name, value);
    }
    this.validation.update();
  }
}

if (!customElements.get('chido-textarea')) customElements.define('chido-textarea', ChidoTextarea);

declare global { interface HTMLElementTagNameMap { 'chido-textarea': ChidoTextarea } }
