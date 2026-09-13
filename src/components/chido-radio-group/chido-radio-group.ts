import styles from './chido-radio-group.scss?inline';
import { InlineValidation } from '../shared/validation';
import { emitValue } from '../shared/events';
import { readOptions, optionObserverConfig } from '../shared/options';

export class ChidoRadioGroup extends HTMLElement {
  static observedAttributes = ['control-label', 'control-name', 'disabled', 'required', 'value', 'validation-text', 'lang'];
  private readonly fieldset: HTMLFieldSetElement;
  private readonly legend: HTMLLegendElement;
  private readonly optionsContainer: HTMLDivElement;
  private readonly validation: InlineValidation;
  private readonly optionsObserver = new MutationObserver(() => this.syncOptions());
  private dirtyValue = false;
  private requestedValue = '';
  private radios: HTMLInputElement[] = [];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `<style>${styles}</style>
      <fieldset part="group"><legend part="label-text"></legend><div part="options"></div></fieldset>
      <span id="validation-message" part="validation-message" hidden></span>`;
    this.fieldset = shadow.querySelector('fieldset')!;
    this.legend = shadow.querySelector('legend')!;
    this.optionsContainer = shadow.querySelector('div')!;
    this.validation = new InlineValidation(this, shadow.querySelector('#validation-message')!,
      () => this.radios, () => Boolean(this.controlLabel.trim()));
    this.optionsContainer.addEventListener('focusout', event => {
      if (event.relatedTarget instanceof Node && this.optionsContainer.contains(event.relatedTarget)) return;
      this.validation.report();
    });
    // Native radio inputs provide arrow-key navigation and mutually exclusive selection.
    for (const eventName of ['input', 'change'] as const) {
      this.optionsContainer.addEventListener(eventName, () => {
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
  get value(): string { return this.radios.find(radio => radio.checked)?.value ?? ''; }
  set value(value: string) { this.dirtyValue = true; this.requestedValue = value; this.selectValue(value); this.validation.update(); }
  get defaultValue(): string { return this.getAttribute('value') ?? ''; }
  set defaultValue(value: string) { this.setAttribute('value', value); }

  override focus(options?: FocusOptions): void {
    if (this.disabled) return;
    (this.radios.find(radio => radio.checked && !radio.disabled) ?? this.radios.find(radio => !radio.disabled))?.focus(options);
  }
  override blur(): void { this.radios.forEach(radio => radio.blur()); }
  reportValidity(): boolean { return this.validation.report(); }
  checkValidity(): boolean {
    this.validation.update();
    return this.radios.every(radio => radio.checkValidity());
  }

  connectedCallback(): void {
    this.syncOptions();
    this.optionsObserver.observe(this, optionObserverConfig);
    this.validation.connect();
  }
  disconnectedCallback(): void { this.optionsObserver.disconnect(); this.validation.disconnect(); }
  attributeChangedCallback(name: string): void {
    if (name === 'value' && !this.dirtyValue) this.selectValue(this.defaultValue);
    this.syncControl();
  }

  private selectValue(value: string): void {
    // Choose at most one even if consumers accidentally supply duplicate values.
    const match = this.radios.find(radio => radio.value === value);
    for (const radio of this.radios) radio.checked = radio === match;
  }

  private syncOptions(): void {
    const current = this.dirtyValue ? this.requestedValue : this.value;
    const data = readOptions(this);
    this.radios = [];
    const labels = data.map(option => {
      const label = document.createElement('label');
      label.setAttribute('part', 'option');
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = this.controlName || 'chido-radio-group';
      radio.value = option.value;
      radio.disabled = option.disabled;
      radio.setAttribute('part', 'control input');
      radio.setAttribute('aria-describedby', 'validation-message');
      radio.addEventListener('invalid', event => { event.preventDefault(); this.validation.report(); });
      const text = document.createElement('span');
      text.setAttribute('part', 'option-text');
      text.textContent = option.label;
      label.append(radio, text);
      this.radios.push(radio);
      return label;
    });
    this.optionsContainer.replaceChildren(...labels);
    if (this.dirtyValue) this.selectValue(current);
    else if (this.hasAttribute('value')) this.selectValue(this.defaultValue);
    else {
      const selected = data.findIndex(option => option.selected);
      this.radios.forEach((radio, index) => { radio.checked = index === selected; });
    }
    this.syncControl();
  }

  private syncControl(): void {
    this.legend.textContent = this.controlLabel;
    this.fieldset.hidden = !this.controlLabel.trim();
    this.fieldset.disabled = this.disabled;
    for (const radio of this.radios) {
      radio.name = this.controlName || 'chido-radio-group';
      radio.required = this.required;
    }
    this.validation.update();
  }
}

if (!customElements.get('chido-radio-group')) customElements.define('chido-radio-group', ChidoRadioGroup);
declare global { interface HTMLElementTagNameMap { 'chido-radio-group': ChidoRadioGroup } }
