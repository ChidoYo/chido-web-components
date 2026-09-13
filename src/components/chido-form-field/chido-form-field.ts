import styles from './chido-form-field.scss?inline';
import { getLocale, subscribeLocale, translate } from '../../localization';

type NativeControl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

/** Layout and description association for one direct, slotted native form control. */
export class ChidoFormField extends HTMLElement {
  static observedAttributes = ['control-label', 'help-text', 'required', 'validation-text', 'invalid', 'lang'];
  private readonly label = document.createElement('label');
  private readonly labelText = document.createElement('span');
  private readonly indicator = document.createElement('span');
  private readonly help = document.createElement('span');
  private readonly error = document.createElement('span');
  private readonly controlSlot: HTMLSlotElement;
  private control?: NativeControl;
  private originalRequired = false;
  private originalInvalid: string | null = null;
  private generatedId?: string;
  private unsubscribe?: () => void;
  private readonly validateOnBlur = (): void => {
    if (this.control) this.invalid = this.control.willValidate && !this.control.validity.valid;
  };
  private readonly clearValidError = (): void => {
    if (this.control && (!this.control.willValidate || this.control.validity.valid)) this.invalid = false;
  };

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `<style>${styles}</style><div part="field">
      <slot name="field-label"></slot><slot></slot>
      <slot name="field-help"></slot><slot name="field-error"></slot></div>`;
    this.controlSlot = shadow.querySelector('slot:not([name])')!;
    this.controlSlot.addEventListener('slotchange', () => this.bindControl());
    const prefix = `chido-field-${crypto.randomUUID()}`;
    this.label.slot = 'field-label';
    this.label.append(this.labelText, this.indicator);
    this.indicator.setAttribute('aria-hidden', 'true');
    this.indicator.textContent = ' *';
    this.help.slot = 'field-help'; this.help.id = `${prefix}-help`;
    this.error.slot = 'field-error'; this.error.id = `${prefix}-error`;
  }

  get controlLabel(): string { return this.getAttribute('control-label') ?? ''; }
  set controlLabel(value: string) { this.setAttribute('control-label', value); }
  get helpText(): string { return this.getAttribute('help-text') ?? ''; }
  set helpText(value: string) { this.setAttribute('help-text', value); }
  get validationText(): string { return this.getAttribute('validation-text') ?? ''; }
  set validationText(value: string) { this.setAttribute('validation-text', value); }
  get required(): boolean { return this.hasAttribute('required'); }
  set required(value: boolean) { this.toggleAttribute('required', value); }
  get invalid(): boolean { return this.hasAttribute('invalid'); }
  set invalid(value: boolean) { this.toggleAttribute('invalid', value); }
  override focus(options?: FocusOptions): void { this.control?.focus(options); }

  connectedCallback(): void {
    // Keep label and descriptions in the control's light DOM for native association.
    this.prepend(this.label);
    this.append(this.help, this.error);
    this.bindControl();
    this.unsubscribe?.();
    this.unsubscribe = subscribeLocale(() => this.sync());
  }
  disconnectedCallback(): void { this.unsubscribe?.(); this.unsubscribe = undefined; this.releaseControl(); }
  attributeChangedCallback(): void { this.sync(); }

  private bindControl(): void {
    const next = this.controlSlot.assignedElements().find((element): element is NativeControl =>
      element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement);
    if (next !== this.control) {
      this.releaseControl();
      this.control = next;
      if (next) {
        next.addEventListener('blur', this.validateOnBlur);
        next.addEventListener('input', this.clearValidError);
        next.addEventListener('change', this.clearValidError);
        this.originalRequired = next.required;
        this.originalInvalid = next.getAttribute('aria-invalid');
        if (!next.id) { this.generatedId = `chido-control-${crypto.randomUUID()}`; next.id = this.generatedId; }
      }
    }
    this.sync();
  }

  private releaseControl(): void {
    if (!this.control) return;
    this.control.removeEventListener('blur', this.validateOnBlur);
    this.control.removeEventListener('input', this.clearValidError);
    this.control.removeEventListener('change', this.clearValidError);
    this.updateDescriptions(this.control, []);
    this.control.required = this.originalRequired;
    if (this.originalInvalid === null) this.control.removeAttribute('aria-invalid');
    else this.control.setAttribute('aria-invalid', this.originalInvalid);
    if (this.generatedId && this.control.id === this.generatedId) this.control.removeAttribute('id');
    this.generatedId = undefined;
    this.control = undefined;
  }

  private updateDescriptions(control: NativeControl, ids: string[]): void {
    const existing = (control.getAttribute('aria-describedby') ?? '').split(/\s+/)
      .filter(id => id && id !== this.help.id && id !== this.error.id);
    const result = [...new Set([...existing, ...ids])].join(' ');
    if (result) control.setAttribute('aria-describedby', result);
    else control.removeAttribute('aria-describedby');
  }

  private sync(): void {
    const language = this.lang.trim() || getLocale();
    this.labelText.textContent = this.controlLabel;
    this.label.hidden = !this.controlLabel.trim();
    this.label.htmlFor = this.control?.id ?? '';
    this.indicator.hidden = !this.required && !this.originalRequired;
    this.help.textContent = this.helpText;
    this.help.hidden = !this.helpText;
    this.error.textContent = this.validationText || translate('required', language);
    this.error.lang = language;
    this.error.hidden = !this.invalid;
    if (this.control) {
      this.control.required = this.required || this.originalRequired;
      if (this.invalid) this.control.setAttribute('aria-invalid', 'true');
      else if (this.originalInvalid === null) this.control.removeAttribute('aria-invalid');
      else this.control.setAttribute('aria-invalid', this.originalInvalid);
      this.updateDescriptions(this.control, [this.helpText ? this.help.id : '', this.invalid ? this.error.id : ''].filter(Boolean));
    }
  }
}
if (!customElements.get('chido-form-field')) customElements.define('chido-form-field', ChidoFormField);
declare global { interface HTMLElementTagNameMap { 'chido-form-field': ChidoFormField } }
