import type { ChidoButton } from '../../src/index';
import '../../src/index';

export function renderProgressDemo(container: HTMLElement): void {
  container.innerHTML = `
    <h1 tabindex="-1">Chido progress</h1>
    <div class="chido-stack chido-gap-6">
      <chido-progress id="course-progress" progress-label="Course completion" value="2" max="5" value-text="2 of 5 lessons complete"></chido-progress>
      <chido-button id="complete">Complete next lesson</chido-button>
      <chido-progress progress-label="Preparing your course"></chido-progress>
      <chido-progress progress-label="Registration steps" value="1" max="3" value-text="Step 1 of 3"></chido-progress>
    </div>`;
  const progress = container.querySelector('chido-progress')!;
  const button = container.querySelector<ChidoButton>('#complete')!;
  button.addEventListener('click', () => {
    progress.value += 1;
    progress.valueText = `${progress.value} of ${progress.max} lessons complete`;
    button.disabled = progress.value >= progress.max;
    console.log('chido-progress update', { value: progress.value, max: progress.max, valueText: progress.valueText });
  });
}
