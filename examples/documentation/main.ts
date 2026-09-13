import guide from '../../COMPONENT_GUIDE.md?raw';
import guideUrl from '../../COMPONENT_GUIDE.md?url';

export function renderDocumentation(container: HTMLElement): void {
  container.innerHTML = `<h1 tabindex="-1">Component documentation</h1>
    <p>Use the navigation to try every component. Each demo supports the theme selector above.</p>
    <p><a id="download-guide" download="COMPONENT_GUIDE.md">Download the complete Markdown guide</a></p>
    <details><summary>Read the complete guide</summary><pre></pre></details>`;
  container.querySelector<HTMLAnchorElement>('#download-guide')!.href = guideUrl;
  container.querySelector('pre')!.textContent = guide;
}
