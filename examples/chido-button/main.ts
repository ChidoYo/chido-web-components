import '../../src/index';

export function renderButtonDemo(container: HTMLElement): void {
  container.innerHTML = `
    <h1 tabindex="-1">Chido button</h1>
    <p>An action button with native keyboard behavior and slotted content.</p>
    <div class="chido-my-6">
      <chido-button id="action">Save changes</chido-button>
      <chido-button disabled>Unavailable</chido-button>
      <chido-button class="themed-button">Custom theme</chido-button>
    </div>
    <p role="status" id="result">No actions yet.</p>
  `;
  let count = 0;
  container.querySelector('#action')!.addEventListener('click', () => {
    container.querySelector('#result')!.textContent = `Save activated ${++count} time(s).`;
  });
  for (const button of container.querySelectorAll('chido-button')) {
    button.addEventListener('click', () => {
      console.log('click', { label: button.textContent?.trim(), saveCount: count });
    });
  }
  const themed = container.querySelector<HTMLElement>('.themed-button')!;
  themed.style.setProperty('--chido-button-background', '#d9c2ff');
  themed.style.setProperty('--chido-button-text-color', '#182e29');
  themed.style.setProperty('--chido-button-hover-background', '#c6a4f5');
  themed.style.setProperty('--chido-button-border-radius', '1.5rem');
}
