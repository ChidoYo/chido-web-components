import { getLocale, resolveLocale, subscribeLocale, translate } from '../../localization';

/** Shared message rendering only; components retain their native state and lifecycle. */
export class InlineValidation {
  private shown = false;
  private unsubscribe?: () => void;

  private readonly host: HTMLElement;
  private readonly message: HTMLElement;
  private readonly controls: () => Array<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
  private readonly hasLabel: () => boolean;

  constructor(
    host: HTMLElement,
    message: HTMLElement,
    controls: () => Array<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    hasLabel: () => boolean,
  ) {
    this.host = host;
    this.message = message;
    this.controls = controls;
    this.hasLabel = hasLabel;
  }

  connect(): void {
    this.disconnect();
    this.unsubscribe = subscribeLocale(() => this.update());
    this.update();
  }

  disconnect(): void { this.unsubscribe?.(); this.unsubscribe = undefined; }

  report(): boolean {
    this.shown = true;
    this.update();
    return this.hasLabel() && this.controls().every(control => !control.willValidate || control.validity.valid);
  }

  update(): void {
    const language = this.host.lang.trim() ? resolveLocale(this.host.lang) : getLocale();
    const controls = this.controls();
    for (const control of controls) {
      control.setCustomValidity('');
      if (!control.willValidate) continue;
      const state = control.validity;
      let message = '';
      if (state.valueMissing) {
        message = this.host.getAttribute('validation-text')?.trim() || translate('required', language);
      } else if (control instanceof HTMLTextAreaElement) {
        if (state.tooShort) message = translate('tooShort', language).replace('{min}', String(control.minLength));
        if (state.tooLong) message = translate('tooLong', language).replace('{max}', String(control.maxLength));
      }
      control.setCustomValidity(message);
    }
    const invalid = controls.find(control => control.willValidate && !control.validity.valid);
    if (!invalid) this.shown = false;
    const showError = this.shown && Boolean(invalid);
    for (const control of controls) {
      if (showError) control.setAttribute('aria-invalid', 'true');
      else control.removeAttribute('aria-invalid');
    }
    const missingLabel = !this.hasLabel();
    this.message.lang = language;
    this.message.textContent = missingLabel
      ? translate('missingControlLabel', language)
      : showError ? invalid!.validationMessage : '';
    this.message.hidden = !missingLabel && !showError;
  }
}
