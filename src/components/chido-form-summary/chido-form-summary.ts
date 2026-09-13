import styles from './chido-form-summary.scss?inline';
import { getLocale, subscribeLocale, translate } from '../../localization';

export interface ChidoFormError {
  message: string;
  /** Element reference, or an element ID in the summary's own DOM tree. */
  target: HTMLElement | string;
}

export class ChidoFormSummary extends HTMLElement {
  static observedAttributes = ['summary-title', 'lang'];
  private readonly section: HTMLElement;
  private readonly heading: HTMLHeadingElement;
  private readonly list: HTMLUListElement;
  private items: ChidoFormError[] = [];
  private unsubscribe?: () => void;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `<style>${styles}</style><section part="summary" aria-labelledby="summary-title" tabindex="-1" hidden>
      <h2 id="summary-title" part="title"></h2><ul part="list"></ul></section>`;
    this.section = shadow.querySelector('section')!;
    this.heading = shadow.querySelector('h2')!;
    this.list = shadow.querySelector('ul')!;
  }
  get summaryTitle(): string { return this.getAttribute('summary-title') ?? ''; }
  set summaryTitle(value: string) { this.setAttribute('summary-title', value); }
  get errors(): ChidoFormError[] { return this.items.map(item => ({ ...item })); }
  set errors(value: readonly ChidoFormError[]) {
    this.items = value.filter(item => item.message.trim()).map(item => ({ ...item }));
    this.renderErrors();
  }
  override focus(options?: FocusOptions): void { if (this.items.length) this.section.focus(options); }
  connectedCallback(): void {
    this.unsubscribe?.(); this.unsubscribe = subscribeLocale(() => this.syncTitle());
    this.syncTitle(); this.renderErrors();
  }
  disconnectedCallback(): void { this.unsubscribe?.(); this.unsubscribe = undefined; }
  attributeChangedCallback(): void { this.syncTitle(); }

  private syncTitle(): void {
    const language = this.lang.trim() || getLocale();
    this.heading.lang = language;
    this.heading.textContent = this.summaryTitle || translate('formErrors', language);
  }
  private resolveTarget(target: HTMLElement | string): HTMLElement | null {
    if (typeof target !== 'string') return target;
    const root = this.getRootNode();
    return root instanceof Document || root instanceof ShadowRoot ? root.getElementById(target) : null;
  }
  private renderErrors(): void {
    const entries = this.items.map(item => {
      const li = document.createElement('li');
      li.setAttribute('part', 'item');
      const link = document.createElement('a');
      link.setAttribute('part', 'link');
      const target = this.resolveTarget(item.target);
      const id = typeof item.target === 'string' ? item.target : target?.id;
      link.href = id ? `#${encodeURIComponent(id)}` : '#';
      link.textContent = item.message;
      link.addEventListener('click', event => {
        // Focus directly rather than changing the application's hash route.
        event.preventDefault();
        const target = this.resolveTarget(item.target);
        if (!target?.isConnected) return;
        target.scrollIntoView({ block: 'center' });
        // Support existing open-shadow Chido controls, including input, which
        // predates public focus delegation. Radio groups use their own focus().
        if (target.localName === 'chido-radio-group' || target.localName === 'chido-form-field') target.focus();
        else {
          const inner = target.shadowRoot?.querySelector<HTMLElement>('input:not(:disabled), textarea:not(:disabled), select:not(:disabled), button:not(:disabled)');
          (inner ?? target).focus();
        }
      });
      li.append(link);
      return li;
    });
    this.list.replaceChildren(...entries);
    this.section.hidden = this.items.length === 0;
  }
}
if (!customElements.get('chido-form-summary')) customElements.define('chido-form-summary', ChidoFormSummary);
declare global { interface HTMLElementTagNameMap { 'chido-form-summary': ChidoFormSummary } }
