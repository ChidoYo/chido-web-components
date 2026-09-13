import './styles/main.scss';
import type { ChidoSelect } from './index';
import { renderDocumentation } from '../examples/documentation/main';
import { renderInputDemo } from '../examples/chido-input/main';

import { renderTextareaDemo } from '../examples/chido-textarea/main';

import { renderSelectDemo } from '../examples/chido-select/main';

import { renderCheckboxDemo } from '../examples/chido-checkbox/main';

import { renderRadioGroupDemo } from '../examples/chido-radio-group/main';

import { renderButtonDemo } from '../examples/chido-button/main';

import { renderFormFieldDemo } from '../examples/chido-form-field/main';

import { renderAlertDemo } from '../examples/chido-alert/main';

import { renderFormSummaryDemo } from '../examples/chido-form-summary/main';

import { renderProgressDemo } from '../examples/chido-progress/main';

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <a class="skip-link" href="#page">Skip to content</a>
  <nav aria-label="Main navigation">
    <a href="#/">Home</a>
    <a href="#/chido-input">Chido input</a>
    <a href="#/chido-textarea">Textarea</a>
    <a href="#/chido-select">Select</a>
    <a href="#/chido-checkbox">Checkbox</a>
    <a href="#/chido-radio-group">Radio group</a>
    <a href="#/chido-button">Button</a>
    <a href="#/chido-form-field">Form field</a>
    <a href="#/chido-alert">Alert</a>
    <a href="#/chido-form-summary">Form summary</a>
    <a href="#/chido-progress">Progress</a>
    <a href="#/react">React example</a>
    <a href="#/documentation">Documentation</a>
  </nav>
  <div class="toolbar"><chido-select id="theme" control-label="Theme" value="dark"><option value="dark">Dark</option><option value="light">Light</option></chido-select></div>
  <main id="page" tabindex="-1"></main>
`;

const page = document.querySelector<HTMLElement>('#page')!;

let cleanup: (() => void) | undefined;
let routeVersion = 0;
const theme = document.querySelector<ChidoSelect>('#theme')!;
theme.value = document.documentElement.dataset.chidoTheme === 'light' ? 'light' : 'dark';
theme.addEventListener('chido-change', () => { document.documentElement.dataset.chidoTheme = theme.value; });
document.querySelector('.skip-link')!.addEventListener('click', event => { event.preventDefault(); page.focus(); });

function renderRoute(moveFocus = false): void {
  cleanup?.(); cleanup = undefined;
  const version = ++routeVersion;
  const route = window.location.hash.slice(1) || '/';

  switch (route) {
    case '/':
      document.title = 'Chido Web Components';
      page.innerHTML = `
        <h1 tabindex="-1">Chido Web Components</h1>
        <p>A workspace for building native Web Components from scratch.</p>
<ul>
          <li><a href="#/chido-input">Input</a></li>
          <li><a href="#/chido-textarea">Textarea</a></li>
          <li><a href="#/chido-select">Select</a></li>
          <li><a href="#/chido-checkbox">Checkbox</a></li>
          <li><a href="#/chido-radio-group">Radio group</a></li>
          <li><a href="#/chido-button">Button</a></li>
          <li><a href="#/chido-form-field">Form field</a></li>
          <li><a href="#/chido-alert">Alert</a></li>
          <li><a href="#/chido-form-summary">Form summary</a></li>
          <li><a href="#/chido-progress">Progress</a></li>
        </ul>
      `;
      break;
    case '/chido-input':
      document.title = 'Chido Input · Chido Web Components';
      renderInputDemo(page);
      break;
    case '/chido-textarea':
      document.title = 'Chido Textarea · Chido Web Components';
      renderTextareaDemo(page);
      break;
    case '/chido-select':
      document.title = 'Chido Select · Chido Web Components';
      renderSelectDemo(page);
      break;
    case '/chido-checkbox':
      document.title = 'Chido Checkbox · Chido Web Components';
      renderCheckboxDemo(page);
      break;
    case '/chido-radio-group':
      document.title = 'Chido Radio group · Chido Web Components';
      renderRadioGroupDemo(page);
      break;
    case '/chido-button':
      document.title = 'Chido Button · Chido Web Components';
      renderButtonDemo(page);
      break;
    case '/chido-form-field':
      document.title = 'Chido Form field · Chido Web Components';
      renderFormFieldDemo(page);
      break;
    case '/chido-alert':
      document.title = 'Chido Alert · Chido Web Components';
      renderAlertDemo(page);
      break;
    case '/chido-form-summary':
      document.title = 'Chido Form summary · Chido Web Components';
      renderFormSummaryDemo(page);
      break;
    case '/chido-progress':
      document.title = 'Chido Progress · Chido Web Components';
      renderProgressDemo(page);
      break;
    case '/documentation':
      document.title = 'Documentation · Chido Web Components';
      renderDocumentation(page);
      break;
    case '/react':
      document.title = 'React example · Chido Web Components';
      page.innerHTML = '<h1 tabindex="-1">Loading React example…</h1>';
      void import('../examples/react/main').then(({ renderReactDemo }) => {
        if (version !== routeVersion) return;
        cleanup = renderReactDemo(page);
        if (moveFocus) page.querySelector<HTMLHeadingElement>('h1')?.focus();
      });
      break;
    default:
      document.title = 'Page not found · Chido Web Components';
      page.innerHTML = `
        <h1 tabindex="-1">Page not found</h1>
        <p><a href="#/">Return home</a></p>
      `;
  }

  for (const link of app.querySelectorAll<HTMLAnchorElement>('nav a')) {
    if (link.hash === `#${route}`) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }

  // Announce the new page through heading focus after in-app navigation.
  if (moveFocus) page.querySelector<HTMLHeadingElement>('h1')?.focus();
}

window.addEventListener('hashchange', () => renderRoute(true));
renderRoute();
