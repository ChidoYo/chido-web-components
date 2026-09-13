export interface ControlOption { value: string; label: string; disabled: boolean; selected: boolean }

/** Read plain option data; never copy consumer markup into the shadow root. */
export function readOptions(host: HTMLElement): ControlOption[] {
  return Array.from(host.children)
    .filter((child): child is HTMLOptionElement => child instanceof HTMLOptionElement)
    .map(option => ({ value: option.value, label: option.label, disabled: option.disabled, selected: option.defaultSelected }));
}

export const optionObserverConfig: MutationObserverInit = {
  childList: true, subtree: true, characterData: true, attributes: true,
  attributeFilter: ['value', 'label', 'disabled', 'selected'],
};
