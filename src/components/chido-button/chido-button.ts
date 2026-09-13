import styles from './chido-button.scss?inline';

/** Action button. Parent-form submit/reset behavior is intentionally deferred. */
export class ChidoButton extends HTMLElement {
  static observedAttributes = ['disabled'];
  private readonly button: HTMLButtonElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `<style>${styles}</style><button part="button" type="button"><slot></slot></button>`;
    this.button = shadow.querySelector('button')!;
  }

  get disabled(): boolean { return this.hasAttribute('disabled'); }
  set disabled(value: boolean) { this.toggleAttribute('disabled', value); }
  connectedCallback(): void { this.button.disabled = this.disabled; }
  attributeChangedCallback(): void { this.button.disabled = this.disabled; }
  override focus(options?: FocusOptions): void { this.button.focus(options); }
  override blur(): void { this.button.blur(); }
  override click(): void { this.button.click(); }
}

if (!customElements.get('chido-button')) customElements.define('chido-button', ChidoButton);
declare global { interface HTMLElementTagNameMap { 'chido-button': ChidoButton } }
