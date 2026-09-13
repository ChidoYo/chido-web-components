import '../../src/index';

export function renderAlertDemo(container: HTMLElement): void {
  container.innerHTML = `
    <h1 tabindex="-1">Chido alert</h1>
    <p>Informational, warning, and success messages are polite. Errors are assertive by default.</p>
    <div class="chido-stack chido-gap-4">
      <chido-alert variant="info" live="off" message="Your progress is saved automatically."></chido-alert>
      <chido-alert variant="warning" live="off" message="This course closes tomorrow."></chido-alert>
      <chido-alert variant="error" live="off" message="An example error. Static examples do not announce."></chido-alert>
      <chido-alert variant="success" live="off" message="You completed the introduction."></chido-alert>
      <chido-alert id="announcement" variant="success"></chido-alert>
      <chido-button id="announce">Save progress</chido-button>
    </div>`;
  let count = 0;
  container.querySelector('#announce')!.addEventListener('click', () => {
    const alert = container.querySelectorAll('chido-alert')[4]!;
    alert.message = `Your progress was saved. Save ${++count}.`;
    console.log('chido-alert update', { message: alert.message, variant: alert.variant });
  });
}
