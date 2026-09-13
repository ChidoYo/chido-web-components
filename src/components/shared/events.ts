export interface ChidoValueDetail { value: string }
export interface ChidoCheckedDetail extends ChidoValueDetail { checked: boolean }

export function emitValue(
  host: HTMLElement,
  type: 'chido-input' | 'chido-change',
  detail: ChidoValueDetail | ChidoCheckedDetail,
): void {
  host.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
}
