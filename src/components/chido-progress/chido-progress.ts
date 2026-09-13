import styles from './chido-progress.scss?inline';
import { getLocale, resolveLocale, subscribeLocale, translate } from '../../localization';

/** Native progress: omit value for indeterminate work; use value/max for completion. */
export class ChidoProgress extends HTMLElement {
  static observedAttributes = ['progress-label', 'value', 'max', 'value-text', 'lang'];
  private readonly progress: HTMLProgressElement;
  private readonly label: HTMLLabelElement;
  private readonly text: HTMLSpanElement;
  private unsubscribe?: () => void;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `<style>${styles}</style><div part="container">
      <label part="label" for="progress"></label>
      <progress part="progress" id="progress" max="100"></progress>
      <span part="value-text" aria-hidden="true"></span></div>`;
    this.progress = shadow.querySelector('progress')!;
    this.label = shadow.querySelector('label')!;
    this.text = shadow.querySelector('span')!;
  }
  get progressLabel(): string { return this.getAttribute('progress-label') ?? ''; }
  set progressLabel(value: string) { this.setAttribute('progress-label', value); }
  get value(): number { return this.progress.value; }
  set value(value: number) { this.setAttribute('value', String(value)); }
  get max(): number {
    const value = Number(this.getAttribute('max'));
    return Number.isFinite(value) && value > 0 ? value : 100;
  }
  set max(value: number) { this.setAttribute('max', String(value)); }
  get valueText(): string { return this.getAttribute('value-text') ?? ''; }
  set valueText(value: string) { this.setAttribute('value-text', value); }
  get indeterminate(): boolean { return !this.hasAttribute('value'); }

  connectedCallback(): void {
    this.unsubscribe?.(); this.unsubscribe = subscribeLocale(() => this.sync()); this.sync();
  }
  disconnectedCallback(): void { this.unsubscribe?.(); this.unsubscribe = undefined; }
  attributeChangedCallback(): void { this.sync(); }
  private sync(): void {
    const language = resolveLocale(this.lang.trim() || getLocale());
    this.progress.max = this.max;
    if (this.indeterminate) this.progress.removeAttribute('value');
    else {
      const value = Number(this.getAttribute('value'));
      this.progress.value = Number.isFinite(value) ? Math.max(0, Math.min(value, this.max)) : 0;
    }
    this.label.textContent = this.progressLabel || translate('progress', language);
    this.label.lang = language;
    const text = this.valueText || (this.indeterminate ? translate('inProgress', language)
      : new Intl.NumberFormat(language, { style: 'percent', maximumFractionDigits: 0 }).format(this.value / this.max));
    this.text.textContent = text;
    this.text.lang = language;
    this.progress.lang = language;
    this.progress.setAttribute('aria-valuetext', text);
  }
}
if (!customElements.get('chido-progress')) customElements.define('chido-progress', ChidoProgress);
declare global { interface HTMLElementTagNameMap { 'chido-progress': ChidoProgress } }
