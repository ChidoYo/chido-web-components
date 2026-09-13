# Chido Web Components Project

The author’s twelve ongoing quality requirements and verification expectations are maintained in [QUALITY.md](./QUALITY.md). Apply them to all future component changes.

## Current authorized component scope

The author has now authorized a build-time React wrapper generator, a separate
React package entry, and integration tests. This supersedes the historical
first-milestone restrictions on React adapters below. The native library must
remain framework-independent; React is an optional peer for the adapter only.


The author additionally authorized `chido-form-field`, `chido-alert`,
`chido-form-summary`, and `chido-progress`, with separate SCSS files. These support
native control layout, notifications, error navigation, and progress display.


The author explicitly requested implementation of `chido-textarea`, `chido-select`,
`chido-checkbox`, `chido-radio-group`, and `chido-button`, with one hash-routed demo
per component, in addition to the existing `chido-input`. The initial-input-only
milestone below is historical context. Additional components beyond this scope
still require an explicit request. The author subsequently authorized build-time generation of React wrappers; keep React isolated from native component implementations.

New form controls use `control-label` and `control-name` as prefixed public
attributes. The existing input retains `input-label` and `input-name`. Controls
remain native, typed, Shadow DOM-based, and styled with SCSS compiled to CSS.


> **Learning workflow:** I am implementing this library myself from scratch.
> This document is an architectural reference and learning roadmap, not authorization
> for an assistant to implement components. Explain concepts, answer questions, and
> review my code when asked. Only write or modify component code when I explicitly
> request that specific change. Milestone descriptions below describe my intended
> work, not tasks for automatic execution.


I am building a GitHub portfolio project consisting of framework-agnostic Web Components written from scratch using native browser APIs and TypeScript.

Please treat the requirements in this document as the architectural rules for the project.

Save this document at the root of the repository as:

```text
WEB_COMPONENTS_PROJECT.md
```

This file should remain the architectural reference for the project.

## Stylesheet authoring

Use SCSS source files, compiled by Vite with Sass into native CSS. Shared application
styles belong in `src/styles/`, with `main.scss` as the entry point and `_theme.scss`
for theme defaults. Component SCSS stays alongside its component and is intended
for its Shadow DOM. Sass is a build-time development dependency, not a runtime UI
framework. Continue using CSS custom properties for public theme customization.
References below to native CSS describe the browser styling APIs and compiled output.

---

# 1. Project goal

Build a reusable UI component library called **Chido Web Components**.

The custom-element namespace/prefix is:

```text
chido-
```

Examples:

```html
<chido-input></chido-input>
<chido-select></chido-select>
<chido-checkbox></chido-checkbox>
<chido-radio></chido-radio>
<chido-button></chido-button>
```

The library must:

* Be written with native Web Component APIs.
* Use TypeScript.
* Use Vite for development and build tooling.
* Not use React internally.
* Not use Angular internally.
* Not use Vue internally.
* Not use StencilJS internally.
* Not use Lit internally.
* Not depend on another component framework.
* Be consumable from:

  * Plain HTML/JavaScript
  * React
  * Angular
  * Vue

This project is intended for my GitHub portfolio.

Code quality, architecture, accessibility, documentation, TypeScript typing, testing, and browser API knowledge are important.

The purpose of the project is to demonstrate that I understand the native technologies underlying higher-level Web Component tools such as StencilJS.

---

# 2. Branding and naming

My personal domain is:

```text
chido.io
```

The component prefix should therefore be:

```text
chido-
```

Use this prefix consistently throughout the project.

Examples:

```html
<chido-input></chido-input>
<chido-textarea></chido-textarea>
<chido-select></chido-select>
<chido-checkbox></chido-checkbox>
<chido-radio></chido-radio>
<chido-button></chido-button>
<chido-dialog></chido-dialog>
<chido-tooltip></chido-tooltip>
```

TypeScript class names should follow PascalCase naming such as:

```ts
ChidoInput
ChidoSelect
ChidoCheckbox
ChidoButton
```

For example:

```ts
export class ChidoInput extends HTMLElement {
}
```

and:

```ts
customElements.define('chido-input', ChidoInput);
```

Use `chido-` consistently for:

* Custom element names
* Custom events
* CSS custom properties
* CSS parts where appropriate
* Documentation examples
* Testing examples

---

# 3. Initial Vite setup

The project should use the equivalent of:

```bash
npm create vite@latest chido-web-components -- --template vanilla-ts
```

The stack is:

```text
Vite
TypeScript
Native Web Components
Native CSS
```

Do not convert the project to:

```text
React
Angular
Vue
StencilJS
Lit
```

The library itself must remain framework-independent.

---

# 4. Native browser APIs to demonstrate

Where appropriate, components should demonstrate proper use of native browser APIs including:

```ts
HTMLElement
customElements.define()
attachShadow()
connectedCallback()
disconnectedCallback()
static observedAttributes
attributeChangedCallback()
CustomEvent
HTMLSlotElement
ElementInternals
```

Not every component needs every API.

Use browser APIs where they make architectural sense.

Do not add APIs merely for demonstration if they serve no useful purpose.

---

# 5. Shadow DOM

Components should normally use Shadow DOM.

For example:

```ts
constructor() {
  super();

  this.attachShadow({
    mode: 'open'
  });
}
```

The component's internal markup and styling should be isolated from the consuming page.

Do not rely on application-level CSS frameworks or application styles such as:

```text
Bootstrap
Tailwind
React styles
Angular styles
Vue styles
```

for a component to work correctly.

At the same time, components should expose intentional styling hooks so consuming applications can customize them.

Use mechanisms such as:

```text
CSS custom properties
::part()
slots
attributes
properties
```

Do not unnecessarily expose the internal implementation.

---

# 6. TypeScript

Use strict and readable TypeScript.

Avoid:

```ts
any
```

unless there is a strong technical reason.

Public properties, events, helper methods, and internal state should have useful types.

Prefer small private methods rather than large lifecycle callbacks.

Avoid code such as:

```ts
attributeChangedCallback() {
  // 100 lines of logic
}
```

Instead use clearly named helpers.

For example:

```ts
private syncDisabledState(): void {
}

private syncValue(): void {
}

private updateLabel(): void {
}
```

Keep component source code easy to read during a GitHub code review.

---

# 7. Attributes and properties

Design components so HTML attributes make sense for declarative usage.

Example:

```html
<chido-input
  label="First name"
  name="firstName"
  placeholder="Enter your first name"
  required
></chido-input>
```

Also expose appropriate JavaScript properties.

Example:

```ts
const input = document.querySelector<ChidoInput>('chido-input');

if (input) {
  input.value = 'Erick';
  input.disabled = true;
}
```

Correctly handle synchronization between attributes and properties where appropriate.

Boolean attributes must behave like native HTML boolean attributes.

This:

```html
<chido-input disabled></chido-input>
```

means disabled.

This:

```html
<chido-input disabled="false"></chido-input>
```

must still be treated as disabled because the attribute exists.

To enable the element, the attribute should be removed.

Follow normal HTML semantics.

---

# 8. Events

Components should communicate outward using native DOM events.

Use `CustomEvent` where custom event data is useful.

Events that consumers need outside Shadow DOM should generally use:

```ts
new CustomEvent('chido-change', {
  detail: {
    value: this.value
  },
  bubbles: true,
  composed: true
});
```

Event naming should be consistent throughout the library.

Do not implement framework-specific callbacks inside the component library.

For example, do not build React-only APIs into the component implementation.

Prefer DOM events that every framework can consume.

---

# 9. Slots

Use slots when consumers should be able to provide meaningful content.

Examples may eventually include:

```html
<chido-button>
  Save
</chido-button>
```

or:

```html
<chido-input>
  <span slot="prefix">$</span>
</chido-input>
```

Do not use slots simply because Web Components support them.

Use them when they provide a clear public API benefit.

---

# 10. Styling and theming

Components should have sensible default styling but support customization.

Prefer CSS custom properties for theme-level values.

For example:

```css
:host {
  --chido-input-border-color: #767676;
  --chido-input-border-radius: 4px;
  --chido-input-focus-color: #2563eb;
}
```

Consumers should be able to write:

```css
chido-input {
  --chido-input-focus-color: purple;
}
```

Use `::part()` for internal elements where direct styling by the consuming application makes sense.

For example:

```html
<label part="label">
  <span part="label-text"></span>
  <input part="input">
</label>
```

Do not expose every internal element as a CSS part.

Only expose intentional styling surfaces.

---

# 11. Accessibility

Accessibility is a major requirement.

Use semantic native HTML elements internally whenever possible.

For an input component, use a real:

```html
<input>
```

Do not simulate an input using:

```html
<div>
```

Labels should be properly associated with controls.

Support keyboard behavior naturally.

Support appropriate states such as:

```text
disabled
required
readonly
invalid
```

Use ARIA only when necessary.

Prefer proper native HTML semantics before adding ARIA.

Do not add redundant ARIA attributes that duplicate native semantics.

---

# 12. Form support

A major long-term goal is for Chido form components to behave as closely as practical to native form controls.

Where appropriate, investigate and use:

```ts
static formAssociated = true;
```

along with:

```ts
ElementInternals
attachInternals()
```

This is especially important for:

```text
chido-input
chido-select
chido-checkbox
chido-radio
chido-textarea
```

The eventual goal is for something like:

```html
<form>
  <chido-input
    name="firstName"
    value="Erick"
  ></chido-input>
</form>
```

to participate correctly in native form submission and validation.

Do not over-engineer form association before the initial component works correctly.

Build the component incrementally.

---

# 13. Framework interoperability

The finished library must eventually demonstrate the same components being consumed by:

```text
Vanilla HTML/JavaScript
React
Angular
Vue
```

The component implementation must remain framework-independent.

Eventually create examples such as:

```text
examples/
  vanilla/
  react/
  angular/
  vue/
```

Each example must consume the same component package.

Do not create separate framework implementations such as:

```text
chido-input-react
chido-input-angular
chido-input-vue
```

There should be one implementation:

```html
<chido-input></chido-input>
```

and every framework should use it.

The goal is:

> Write the component once. Use it everywhere.

---

# 14. Suggested project architecture

Move toward a structure similar to:

```text
chido-web-components/
│
├── src/
│   ├── components/
│   │   ├── input/
│   │   │   ├── chido-input.ts
│   │   │   ├── chido-input.scss
│   │   │   └── chido-input.test.ts
│   │   │
│   │   ├── button/
│   │   ├── select/
│   │   ├── checkbox/
│   │   ├── radio/
│   │   └── textarea/
│   │
│   ├── index.ts
│   └── types/
│
├── examples/
│   ├── vanilla/
│   ├── react/
│   ├── angular/
│   └── vue/
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
└── WEB_COMPONENTS_PROJECT.md
```

Do not create empty directories merely to match this proposed structure.

Add directories when they become useful.

Keep the initial implementation small, clean, and understandable.

---

# 15. First component: `<chido-input>`

The first component to build is:

```html
<chido-input></chido-input>
```

It should render an accessible native text input.

Basic usage:

```html
<chido-input
  label="First name"
  name="firstName"
  placeholder="Enter your first name"
></chido-input>
```

Support these attributes and properties where appropriate:

```text
value
label
name
placeholder
disabled
required
readonly
type
autocomplete
```

For the initial version, focus on text-like input types.

At minimum support:

```text
text
email
password
tel
url
search
```

Do not attempt to implement every HTML input type immediately.

---

# 16. `<chido-input>` internal structure

A reasonable Shadow DOM structure might look like:

```html
<label part="label">
  <span part="label-text">
    First name
  </span>

  <input
    part="input"
    type="text"
  />
</label>
```

You may improve the structure if there is a strong accessibility or architectural reason.

The actual interactive form control must remain a native:

```html
<input>
```

The custom element should enhance and encapsulate the native control rather than replace its semantics.

---

# 17. Input class

The component should use a class similar in concept to:

```ts
export class ChidoInput extends HTMLElement {
}
```

Registration should ultimately be:

```ts
customElements.define('chido-input', ChidoInput);
```

Avoid re-registering the element if the module is imported more than once.

Prefer:

```ts
if (!customElements.get('chido-input')) {
  customElements.define('chido-input', ChidoInput);
}
```

---

# 18. Input value API

This must eventually work:

```ts
const input = document.querySelector<ChidoInput>('chido-input');

if (input) {
  input.value = 'Erick';

  console.log(input.value);
}
```

The public `value` property should represent the current value of the internal native input.

User typing must update the component's public value.

Setting the public value should update the internal native input.

Be thoughtful about whether the `value` attribute represents the initial/default value versus the live value.

Follow native input behavior where practical.

Document the decision.

---

# 19. Input events

The component should work naturally from plain JavaScript.

For example:

```ts
document
  .querySelector('chido-input')
  ?.addEventListener('chido-input', (event) => {
    console.log(event);
  });
```

Expose custom library events:

```text
chido-input
chido-change
```

`chido-input` should fire while the user types.

`chido-change` should fire when the underlying native change event occurs.

Event details should include useful information such as:

```ts
{
  value: string
}
```

Events intended for consumers outside the Shadow DOM should use:

```ts
bubbles: true,
composed: true
```

Example:

```ts
this.dispatchEvent(
  new CustomEvent('chido-input', {
    detail: {
      value: this.value
    },
    bubbles: true,
    composed: true
  })
);
```

Do not blindly stop native events.

Explain event design decisions in documentation or comments where the behavior is not obvious.

---

# 20. Input focus

Calling:

```ts
input.focus();
```

on the custom element should focus the internal native input if this can be implemented cleanly.

Because `HTMLElement` already exposes `focus()`, design this carefully.

A public override such as:

```ts
public override focus(options?: FocusOptions): void
```

may be appropriate if it correctly delegates focus to the internal input.

Do not implement a custom method such as `focusInput()` unless there is a strong reason.

The component should behave naturally to developers using the DOM.

Include a proper `:focus-visible` state.

---

# 21. Input validation

Eventually support relevant native validation attributes such as:

```text
required
minlength
maxlength
pattern
type
```

Do not implement every validation feature immediately.

For the first version, `required` must at least propagate correctly to the internal input.

Structure the component so additional native validation features can be added without redesigning the entire class.

Long-term, investigate exposing native-like APIs such as:

```ts
validity
validationMessage
checkValidity()
reportValidity()
setCustomValidity()
```

if appropriate for a form-associated custom element.

Do not implement these before they are needed.

---

# 22. Input styling

Give `<chido-input>` clean but intentionally simple styling.

It should look professional enough for a portfolio demonstration without turning the first milestone into a full design-system project.

Support visual states for:

```text
normal
hover
focus-visible
disabled
```

Consider CSS custom properties such as:

```css
--chido-input-font-family
--chido-input-font-size
--chido-input-text-color
--chido-input-background
--chido-input-border-color
--chido-input-border-radius
--chido-input-focus-color
--chido-input-label-color
--chido-input-disabled-opacity
```

The exact list can be adjusted if some variables are unnecessary.

Keep token naming consistent.

Avoid unnecessary design tokens.

---

# 23. CSS Parts

Expose useful CSS parts such as:

```text
label
label-text
input
```

Example:

```html
<label part="label">
  <span part="label-text">
    First name
  </span>

  <input part="input">
</label>
```

This should eventually allow a consuming application to write:

```css
chido-input::part(input) {
  font-weight: 600;
}
```

Only expose parts that are intentionally part of the public styling API.

---

# 24. Registration and library entry point

Register the component using native Custom Elements APIs.

Example:

```ts
if (!customElements.get('chido-input')) {
  customElements.define('chido-input', ChidoInput);
}
```

The library entry point should eventually make component imports clean.

For example:

```ts
import './components/input/chido-input';
```

or another intentional registration strategy.

Avoid hidden registration behavior that makes tree shaking or selective imports unnecessarily difficult.

As the library grows, consider supporting both:

```ts
import '@chido/web-components';
```

and individual imports if practical.

Do not build package publishing infrastructure yet unless it is needed for the first milestone.

---

# 25. Vanilla demo page

Use the Vite application as the initial Vanilla TypeScript demonstration.

Create examples showing:

```html
<chido-input
  label="First name"
  name="firstName"
  placeholder="Enter your first name"
></chido-input>
```

Also demonstrate:

```text
required
disabled
readonly
email input
password input
```

Include an interactive event example.

For example, show the latest value emitted by:

```text
chido-input
```

and/or:

```text
chido-change
```

on the demo page.

Keep the page clean and focused.

The demo should showcase the component rather than distract from it.

---

# 26. Testing

Set the project up so components can be tested.

Tests should verify observable behavior rather than implementation details whenever possible.

For `<chido-input>`, useful tests include:

* The custom element can be created.
* Shadow DOM is attached.
* The internal native input exists.
* The label renders correctly.
* Placeholder propagates correctly.
* `disabled` propagates correctly.
* Removing `disabled` updates the internal input.
* `required` propagates correctly.
* Removing `required` updates the internal input.
* `readonly` propagates correctly.
* Setting `.value` updates the internal input.
* User input updates the public value.
* `chido-input` fires with the expected value.
* `chido-change` fires with the expected value.
* Attribute updates after connection update the component.
* Boolean attributes behave according to normal HTML semantics.
* Calling `.focus()` focuses the internal native input.

Do not add a heavy testing framework without explaining why it is appropriate.

Prefer a testing solution that works naturally with Vite and TypeScript.

---

# 27. Documentation

Maintain a useful root:

```text
README.md
```

Each component should eventually document:

```text
Purpose
Installation
Basic usage
Attributes
Properties
Methods
Events
CSS custom properties
CSS parts
Slots
Accessibility behavior
Examples
Framework usage
```

For `<chido-input>`, create documentation detailed enough that another developer could use the component without reading its source code.

Example documentation should use:

```html
<chido-input></chido-input>
```

consistently.

---

# 28. Code quality rules

Follow these rules throughout the project.

Do not:

* Generate one enormous component file.
* Put all application logic in lifecycle methods.
* Use `innerHTML` repeatedly during every state change.
* Re-render the entire Shadow DOM whenever one property changes if direct DOM updates are more appropriate.
* Use `any` unnecessarily.
* Add dependencies for functionality that native browser APIs handle well.
* Add React concepts to the internal implementation.
* Add Stencil decorators.
* Add Lit decorators.
* Add Angular decorators.
* Add Vue APIs.
* Hide important browser behavior behind unnecessary abstractions.
* Over-engineer the first component.
* Implement the entire future component roadmap at once.

Prefer:

* Small functions.
* Explicit TypeScript types.
* Native browser APIs.
* Clear public APIs.
* Encapsulation.
* Accessibility.
* Useful comments for non-obvious decisions.
* Consistent naming.
* Predictable browser-like behavior.
* Minimal runtime dependencies.

---

# 29. Important architectural principle

This portfolio needs to demonstrate that I understand what a Web Component framework such as StencilJS normally handles for me.

The source code should visibly demonstrate knowledge of:

```text
Custom Elements
HTMLElement
customElements.define()
Shadow DOM
Web Component lifecycle
attributes
properties
attribute/property synchronization
DOM events
CustomEvent
event bubbling
composed events
slots
CSS encapsulation
CSS custom properties
CSS parts
native form controls
accessibility
ElementInternals
form-associated custom elements
TypeScript
framework interoperability
```

Do not abstract these concepts away behind another component library.

---

# 30. Long-term component roadmap

Potential components include:

```text
chido-input
chido-textarea
chido-select
chido-checkbox
chido-radio
chido-button
chido-dialog
chido-tooltip
chido-toggle
```

The first priority is form components.

Do not implement all of these now.

We will build the library incrementally.

The first component is:

```text
chido-input
```

Do not begin another component until I explicitly ask.

---

# 31. Long-term framework demos

Once the core components are stable, demonstrate them in multiple environments.

## Vanilla HTML

```html
<chido-input
  label="First name"
></chido-input>
```

## React

Use the same custom element from JSX/TSX.

Example concept:

```tsx
<chido-input
  label="First name"
></chido-input>
```

Do not create a completely separate React component implementation.

If TypeScript requires custom JSX element declarations, create clean typings for the Chido custom elements.

## Angular

Use the same native:

```html
<chido-input></chido-input>
```

Document only the Angular configuration that is actually necessary.

Do not rewrite the component in Angular.

## Vue

Use the same native:

```html
<chido-input></chido-input>
```

Document any Vue compiler/custom-element configuration that is actually necessary.

Do not rewrite the component in Vue.

The objective is to prove:

> Write the Chido component once. Use it everywhere.

---

# 32. Long-term package identity

The repository may be named:

```text
chido-web-components
```

Potential future package names could include:

```text
@chido/web-components
```

or another available package name associated with:

```text
chido.io
```

Do not publish anything yet.

Do not assume package names are available without checking first.

The project should nevertheless be structured cleanly enough that packaging it later would be practical.

---

# 33. GitHub portfolio quality

This repository should eventually look like something appropriate to send to a frontend hiring manager.

Prioritize:

```text
Readable commit-sized changes
Clean architecture
Excellent README
Working live demo
Automated tests
Strict TypeScript
Accessibility
Minimal dependencies
Framework interoperability
Professional naming
Clear public APIs
Native Web Component knowledge
```

Avoid making the repository look like an unfinished tutorial or code-generation experiment.

The code should look intentional.

---

# 34. First implementation milestone

The first component I will implement is:

```html
<chido-input></chido-input>
```

Build a clean first version demonstrating:

* Native `HTMLElement`
* Native `customElements.define`
* TypeScript
* Open Shadow DOM
* Native `<label>`
* Native `<input>`
* `label`
* `name`
* `value`
* `placeholder`
* `type`
* `autocomplete`
* `disabled`
* `required`
* `readonly`
* Attribute/property synchronization
* Public `.value`
* Public focus behavior
* `chido-input` custom event
* `chido-change` custom event
* Events that cross the Shadow DOM boundary
* CSS custom properties
* `::part()` styling hooks
* Accessible labeling
* Focus-visible styling
* Disabled styling
* A Vanilla Vite demonstration

Do not implement React, Angular, or Vue demos yet.

Do not implement every future component yet.

Do not install:

```text
StencilJS
Lit
React
Angular
Vue
```

as dependencies for the component library.

Do not make unnecessary changes to Vite.

---

# 35. Initial file structure

For the first milestone, a reasonable structure might be:

```text
src/
├── components/
│   └── input/
│       ├── chido-input.ts
│       └── chido-input.scss
│
├── index.ts
└── main.ts
```

If testing is added during this milestone:

```text
src/
├── components/
│   └── input/
│       ├── chido-input.ts
│       ├── chido-input.scss
│       └── chido-input.test.ts
```

You may adjust this structure if the existing Vite project makes another structure cleaner.

Do not add unnecessary abstraction layers.

---

# 36. Assistance while I write code

I will write the components myself. Treat this document as guidance, not a request to generate the implementation.

When I ask for help:

* Explain the relevant native browser APIs and architectural tradeoffs.
* Review existing code before suggesting changes.
* Prefer focused explanations and small examples over complete solutions.
* Do not create components, tests, or implementation infrastructure unless I explicitly ask for that work.
* If I explicitly request code changes, briefly explain the files affected and any dependencies needed, then stay within that scope.

Prefer zero additional runtime dependencies.

---

# 37. After implementation

When I complete `<chido-input>`, use this checklist to review the milestone:

1. Run the TypeScript checks.
2. Run the Vite production build.
3. Run tests if tests have been configured.
4. Fix any errors.
5. Tell me exactly which files were created.
6. Tell me exactly which files were modified.
7. Explain the component's public API.
8. Tell me how to run it locally.
9. Give me a short manual testing checklist.
10. Mention any intentional limitations of this first version.
11. Do not move on to another component until I ask.

The local development command should normally remain:

```bash
npm run dev
```

The production build command should normally remain:

```bash
npm run build
```

---

# 38. Manual testing checklist

After completing the component, verify at minimum that:

```html
<chido-input
  label="First name"
  placeholder="Enter your first name"
></chido-input>
```

renders correctly.

Verify that:

```html
<chido-input disabled></chido-input>
```

cannot be edited.

Verify that:

```html
<chido-input readonly></chido-input>
```

cannot be edited but behaves differently from a disabled input.

Verify:

```html
<chido-input required></chido-input>
```

properly propagates the required state.

Verify:

```html
<chido-input
  type="email"
  label="Email"
></chido-input>
```

uses the appropriate native input type.

Verify this works:

```ts
const input = document.querySelector<ChidoInput>('chido-input');

if (input) {
  input.value = 'Hello';
}
```

Verify this receives events:

```ts
document
  .querySelector('chido-input')
  ?.addEventListener('chido-input', (event) => {
    console.log(event);
  });
```

Verify:

```ts
input.focus();
```

focuses the internal native input.

Verify consumer CSS custom properties work.

Example:

```css
chido-input {
  --chido-input-focus-color: rebeccapurple;
}
```

Verify CSS parts work.

Example:

```css
chido-input::part(input) {
  font-weight: 600;
}
```

---

# 39. Important restraint

Do not try to impress me by generating excessive infrastructure.

The quality of this portfolio project should come from:

```text
good architecture
browser knowledge
clean TypeScript
accessibility
well-designed APIs
tests
documentation
interoperability
```

not from having the largest number of files or dependencies.

For the first milestone, keep the implementation understandable enough that another frontend developer could inspect the code and quickly understand how the component works.

---

# 40. Project philosophy

The philosophy of Chido Web Components is:

> Framework-agnostic UI components built directly on the Web Platform.

The project should demonstrate that modern browser APIs are capable of creating reusable components that can be consumed from:

```text
HTML
JavaScript
TypeScript
React
Angular
Vue
```

without rewriting the component for each framework.

The component library itself should remain built on:

```text
HTML
CSS
TypeScript
Custom Elements
Shadow DOM
native DOM events
native browser APIs
```

This architectural principle should remain consistent as the project grows.

---

# How to use this reference

Keep this document as the architectural reference while I build the library myself.
The first learning milestone is `<chido-input>` with a native text input.
Do not automatically implement this milestone or any later milestone.
Offer explanations, focused guidance, and code review when requested.
Only make implementation changes when I explicitly ask for them.
