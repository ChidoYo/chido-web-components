import styles from './chido-alert.scss?inline';
import { getLocale, subscribeLocale, translate } from '../../localization';

export type ChidoAlertVariant = 'info' | 'warning' | 'error' | 'success';
export type ChidoAlertLive = 'auto' | 'polite' | 'assertive' | 'off';

export class ChidoAlert extends HTMLElement {
  static observedAttributes = ['variant', 'message', 'live', 'lang'];
  private readonly region: HTMLDivElement;
  private readonly kind: HTMLElement;
  private readonly text: HTMLSpanElement;
  private unsubscribe?: () => void;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    // Establish an empty live region before inserting announcement text.
    shadow.innerHTML = `<style>${styles}</style><div part="alert" role="status" aria-atomic="true"><strong part="title"></strong><span part="message"></span></div>`;
    this.region = shadow.querySelector('div')!;
    this.kind = shadow.querySelector('strong')!;
    this.text = shadow.querySelector('span')!;
  }
  get variant(): ChidoAlertVariant {
    const value = this.getAttribute('variant');
    return value === 'warning' || value === 'error' || value === 'success' ? value : 'info';
  }
  set variant(value: ChidoAlertVariant) { this.setAttribute('variant', value); }
  get message(): string { return this.getAttribute('message') ?? ''; }
  set message(value: string) { this.setAttribute('message', value); }
  get live(): ChidoAlertLive {
    const value = this.getAttribute('live');
    return value === 'polite' || value === 'assertive' || value === 'off' ? value : 'auto';
  }
  set live(value: ChidoAlertLive) { this.setAttribute('live', value); }
  connectedCallback(): void {
    this.unsubscribe?.(); this.unsubscribe = subscribeLocale(() => this.sync()); this.sync();
  }
  disconnectedCallback(): void { this.unsubscribe?.(); this.unsubscribe = undefined; }
  attributeChangedCallback(): void { this.sync(); }
  private sync(): void {
    const mode = this.live === 'auto' ? (this.variant === 'error' ? 'assertive' : 'polite') : this.live;
    this.region.setAttribute('role', mode === 'assertive' ? 'alert' : mode === 'polite' ? 'status' : 'note');
    if (mode === 'off') this.region.setAttribute('aria-live', 'off');
    else this.region.removeAttribute('aria-live');
    this.region.dataset.variant = this.variant;
    // Keep the live region present so later message changes can be announced.
    const empty = !this.message.trim();
    this.region.dataset.empty = String(empty);
    const language = this.lang.trim() || getLocale();
    this.kind.lang = language;
    const title = empty ? '' : translate(this.variant, language);
    if (this.kind.textContent !== title) this.kind.textContent = title;
    const message = empty ? '' : this.message;
    if (this.text.textContent !== message) this.text.textContent = message;
  }
}
if (!customElements.get('chido-alert')) customElements.define('chido-alert', ChidoAlert);
declare global { interface HTMLElementTagNameMap { 'chido-alert': ChidoAlert } }
