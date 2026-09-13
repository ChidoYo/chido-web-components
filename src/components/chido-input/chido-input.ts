import { getLocale, resolveLocale, subscribeLocale, translate } from '../../localization';
import { emitValue } from '../shared/events';
import styles from './chido-input.scss?inline';

const inputTypes = ['text', 'email', 'password', 'tel', 'url', 'search'] as const;
export type ChidoInputType = (typeof inputTypes)[number];

export class ChidoInput extends HTMLElement {

  static observedAttributes = [
    'input-label',
    'input-name',
    'disabled',
    'placeholder',
    'required',
    'validation-text',
    'lang',
    'value',
    'readonly',
    'type',
    'autocomplete',
    'minlength',
    'maxlength',
    'pattern'
  ]

  private readonly labelText: HTMLSpanElement
  private readonly message: HTMLSpanElement
  private readonly input: HTMLInputElement

  private unsubscribeLocale?: () => void
  private validationShown = false

  constructor() {
    super()

    const shadow = this.attachShadow({ mode: 'open' })

    shadow.innerHTML = `
      <style>${styles}</style>

      <label part="label">
        <span part="label-text"></span>
        <input part="input" type="text" aria-describedby="validation-message" />
      </label>
      <span part="validation-message" id="validation-message" hidden></span>
    `

    this.labelText = shadow.querySelector('label span')!;
    this.message = shadow.querySelector('#validation-message')!;

    this.input = shadow.querySelector('input')!;
    for (const eventName of ['input', 'change'] as const) {
      this.input.addEventListener(eventName, () => {
        this.updateValidation();
        emitValue(this, eventName === 'input' ? 'chido-input' : 'chido-change', { value: this.value });
      });
    }

    this.input.addEventListener('blur', () => {
      this.validationShown = true;
      this.updateValidation();
    });

    this.input.addEventListener('invalid', (event) => {
      event.preventDefault();

      this.validationShown = true;
      this.updateValidation();
    });
  }

  public get inputName(): string { return this.getAttribute('input-name') ?? '' }
  public set inputName(value: string) { this.setAttribute('input-name', value) }

  public get inputLabel(): string { return this.getAttribute('input-label') ?? '' }
  public set inputLabel(value: string) { this.setAttribute('input-label', value) }

  public get value(): string { return this.input.value }
  public set value(value: string) {
    this.input.value = value;
    this.updateValidation();
  }

  public get defaultValue(): string { return this.getAttribute('value') ?? '' }
  public set defaultValue(value: string) { this.setAttribute('value', value) }

  public get disabled(): boolean { return this.hasAttribute('disabled') }
  public set disabled(value: boolean) { this.toggleAttribute('disabled', value) }

  public get placeholder(): string { return this.getAttribute('placeholder') ?? '' }
  public set placeholder(value: string) { this.setAttribute('placeholder', value) }

  public get required(): boolean { return this.hasAttribute('required') }
  public set required(value: boolean) { this.toggleAttribute('required', value) }

  public get readOnly(): boolean { return this.hasAttribute('readonly') }
  public set readOnly(value: boolean) { this.toggleAttribute('readonly', value) }

  public get type(): ChidoInputType {
    return inputTypes.find(type => type === this.getAttribute('type')?.toLowerCase()) ?? 'text';
  }
  public set type(value: ChidoInputType) { this.setAttribute('type', value) }

  public get autocomplete(): string { return this.getAttribute('autocomplete') ?? '' }
  public set autocomplete(value: string) { this.setAttribute('autocomplete', value) }

  public get minLength(): number { return this.input.minLength }
  public set minLength(value: number) {
    // Delegate numeric conversion and invalid-value exceptions to the browser.
    this.input.minLength = value;
    this.setAttribute('minlength', String(this.input.minLength));
  }

  public get maxLength(): number { return this.input.maxLength }
  public set maxLength(value: number) {
    this.input.maxLength = value;
    this.setAttribute('maxlength', String(this.input.maxLength));
  }

  public get pattern(): string { return this.getAttribute('pattern') ?? '' }
  public set pattern(value: string) { this.setAttribute('pattern', value) }

  public get validationText(): string { return this.getAttribute('validation-text')?.trim() || translate('required', this.locale) }
  public set validationText(value: string) { this.setAttribute('validation-text', value) }

  public override focus(options?: FocusOptions): void { this.input.focus(options); }
  public override blur(): void { this.input.blur(); }
  public checkValidity(): boolean { this.updateValidation(); return this.input.checkValidity(); }
  public reportValidity(): boolean { this.updateValidation(); return this.input.reportValidity(); }

  private get locale(): string {
    return this.lang.trim() ? resolveLocale(this.lang) : getLocale();
  }

  connectedCallback(): void {
    this.unsubscribeLocale?.();
    this.unsubscribeLocale = subscribeLocale(() => this.updateControl());
    this.updateControl();
  }

  disconnectedCallback(): void {
    this.unsubscribeLocale?.();
    this.unsubscribeLocale = undefined;
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    if (name === 'value') {
      // Let the native input preserve its distinction between default and edited values.
      this.input.defaultValue = this.defaultValue;
    }
    if (ChidoInput.observedAttributes.includes(name)) {
      this.updateControl();
    }
  }

  private updateControl(): void {
    const label = this.inputLabel.trim();
    const name = this.inputName;

    // Find the elements before using them.
    const control =
      this.shadowRoot!.querySelector<HTMLLabelElement>('label')!;
    const input = this.input;

    input.disabled = this.disabled;
    input.placeholder = this.placeholder;
    input.required = this.required;
    input.readOnly = this.readOnly;
    if (input.type !== this.type) input.type = this.type;
    for (const attribute of ['autocomplete', 'minlength', 'maxlength', 'pattern']) {
      const value = this.getAttribute(attribute);
      if (value === null) input.removeAttribute(attribute);
      else if (input.getAttribute(attribute) !== value) input.setAttribute(attribute, value);
    }
    this.updateValidation();

    // Only input-label is required.
    const isMissingLabel = label.length === 0;

    control.hidden = isMissingLabel;
    this.labelText.textContent = label;

    // input-name is optional.
    if (name) {
      input.name = name;
    } else {
      input.removeAttribute('name');
    }


  }

  private updateValidation(): void {
    this.input.setCustomValidity('');

    if (this.input.willValidate) {
      const validity = this.input.validity;
      let message = '';
      if (validity.valueMissing) message = this.validationText;
      else if (validity.typeMismatch) {
        message = translate(this.type === 'email' ? 'invalidEmail' : 'invalidUrl', this.locale);
      } else if (validity.patternMismatch) message = translate('patternMismatch', this.locale);
      else if (validity.tooShort) {
        message = translate('tooShort', this.locale).replace('{min}', String(this.minLength));
      } else if (validity.tooLong) {
        message = translate('tooLong', this.locale).replace('{max}', String(this.maxLength));
      }
      this.input.setCustomValidity(message);
    }

    const invalid = this.input.willValidate && !this.input.validity.valid;
    if (!invalid) this.validationShown = false;
    const showError = invalid && this.validationShown;

    if (showError) this.input.setAttribute('aria-invalid', 'true');
    else this.input.removeAttribute('aria-invalid');

    // Configuration errors take priority over field validation.
    const missingLabel = !this.inputLabel.trim();
    this.message.lang = this.locale;
    this.message.textContent = missingLabel
      ? translate('missingLabel', this.locale)
      : showError ? this.input.validationMessage : '';
    this.message.hidden = !missingLabel && !showError;
  }
}

if (!customElements.get('chido-input')) customElements.define('chido-input', ChidoInput)
