# Chido Web Components

Start with the [complete component guide](./COMPONENT_GUIDE.md) for all 10 components, styling, localization, React usage, and build/test instructions.

A personal portfolio and learning project for building framework-agnostic Web Components from scratch with TypeScript, native browser APIs, and Vite.

## Development

```sh
npm install
npm run dev
```

The development server uses port **5174**. Open the URL printed by Vite.

```sh
npm run typecheck
npm run build
npm run preview
```

## Project reference

[WEB_COMPONENTS_PROJECT.md](./WEB_COMPONENTS_PROJECT.md) describes the architecture and learning roadmap. Components will be implemented by the project author; the reference does not authorize automatic implementation.

Implemented components: `<chido-input>`, `<chido-textarea>`, `<chido-select>`,
`<chido-checkbox>`, `<chido-radio-group>`, and `<chido-button>`. Each has a demo route.

## Demo navigation

The demo uses one `index.html` and a native hash router in `src/main.ts`.
Shared page CSS is imported once by that entry point. Links switch views without
reloading the document, and browser Back/Forward navigation works normally.

- Home: `http://localhost:5174/#/`
- Input demo: `http://localhost:5174/#/chido-input`

Edit `examples/chido-input/main.ts` to add input examples. It imports your
component module without implementing the component itself. The former
`examples/chido-input/index.html` is replaced by this routed view. Unknown
routes display a page-not-found view. Hash routes also work with static hosting
without a server fallback rule.

## Styles

Author styles with SCSS. Vite compiles them to browser-native CSS using the
Sass development dependency; no runtime styling framework is required.

- `src/styles/main.scss`: shared application styles, imported by `src/main.ts`.
- `src/styles/_theme.scss`: dark ash theme and reusable CSS custom properties.
- `src/components/chido-input/chido-input.scss`: component styles, kept alongside the component for its future Shadow DOM implementation.

Use `@use` to include additional SCSS modules in the shared stylesheet.
Keep CSS custom properties for theme values that consumers can override at runtime.

## Localization

English is the default. The library provides English (`en`) and Spanish (`es`)
messages without runtime dependencies.

```ts
import { setLocale, getLocale } from './src/index';

setLocale('es'); // Updates connected components, including visible errors.
getLocale(); // 'es'
setLocale('en'); // Restore English.
```

Import paths above reference this repository; the library is not published yet.
The same DOM-based API can be used by HTML, React, Angular, or Vue consumers.
`src/index.ts` registers the input and exports the locale API and component class.

An explicit component `lang` overrides the shared locale:

```html
<chido-input lang="es" input-label="Nombre" required></chido-input>
```

Language priority: nonempty component `lang`, shared locale, English default.
Regional tags such as `es-MX` resolve to Spanish; unsupported languages fall back
to English. Removing `lang` restores the shared locale. Ancestor/document language
is not used for locale selection in this version. The message element receives
its resolved language for assistive technology.

Default required messages are `Required` and `Obligatorio`. Missing-label
configuration messages are also translated. A nonblank `validation-text` always
overrides the translated required message. Consumers translate their own labels,
placeholders, and custom messages, and should supply a matching `lang` for them.

Open the input demo and click **Validate inputs** while fields are empty. Switch
between English and Spanish to update the first error; the explicit Spanish
example stays Spanish, and the custom message stays unchanged. Enter text to
clear an error. Locale changes preserve input values.

Add translation keys in `src/localization/en.ts`; TypeScript requires matching
keys in the Spanish dictionary. This version supports a single shared locale per
loaded library module. Parent-form validation still requires future form association.

## Input value

The optional `value` attribute supplies the initial/default value:

```html
<chido-input input-label="First name" value="Erick"></chido-input>
```

The public `.value` property reads the current native input value, including user
edits. Assigning `.value` updates the input and its validation immediately without
emitting input/change events or changing the default-value attribute.

```ts
import { ChidoInput } from './src/index';

const input = document.querySelector<ChidoInput>('chido-input');
if (input) {
  input.value = 'Hello';
  console.log(input.value);
}
```

`.defaultValue` reflects the `value` attribute. Changes to that default update the
live value only until the user edits the input or `.value` is assigned. The internal
native input manages this behavior. Reconnection, localization, and other attribute
updates preserve the live value. Form reset support is still deferred to form association.

## Additional input properties

All of these are optional and synchronize when their attributes change or are removed:

| Property | Attribute | Default |
| --- | --- | --- |
| `readOnly: boolean` | `readonly` | `false` |
| `type: ChidoInputType` | `type` | `text` |
| `autocomplete: string` | `autocomplete` | Absent, browser default |
| `minLength: number` | `minlength` | `-1` (no constraint) |
| `maxLength: number` | `maxlength` | `-1` (no constraint) |
| `pattern: string` | `pattern` | Absent, no constraint |

Supported types: `text`, `email`, `password`, `tel`, `url`, and `search`.
Unsupported type attributes fall back to `text`. Read-only inputs remain focusable
and selectable but are excluded from validation. Boolean attribute presence means
true, including `readonly="false"`.

```html
<chido-input input-label="Email" type="email" autocomplete="email" required></chido-input>
<chido-input input-label="Username (3–12 lowercase letters)"
  minlength="3" maxlength="12" pattern="[a-z]+"></chido-input>
```

Length-property setters use native numeric conversion and throw for negative values;
remove the corresponding attribute to clear a length constraint. Use nonnegative
integers and keep `minlength` at or below `maxlength`. Length constraints retain native
behavior: they measure UTF-16 code units, and too-short/too-long validation depends
on user editing, not merely assigning `.value`. Maximum length normally prevents
additional typing. Optional empty fields remain valid.

Patterns use the browser's native whole-value pattern syntax; omit regex delimiters.
An absent pattern applies no constraint, whereas an empty pattern rejects nonempty
text. Provide a visible format hint in the label when using a pattern.

Email, URL, pattern, and length messages have English and Spanish translations.
`validation-text` continues to override only the required-field message. Use the
demo's Validate inputs button after entering invalid values to check inline errors;
read-only controls should show none. Parent-form association remains future work.

## Spacing utilities

`src/styles/_spacing.scss` provides shared spacing classes, loaded by `main.scss`.
The root font size is `100%` (normally 16px, respecting browser preferences), using
IBM Plex Sans Condensed. Spacing uses `em`: it follows the font size of the element
with the class, not necessarily the root. For example, `1em` on a 32px heading is
32px; on a container with 16px text it is 16px.

| Step | Spacing |
| --- | --- |
| 0 | 0 |
| 1 | 0.25em |
| 2 | 0.5em |
| 3 | 0.75em |
| 4 | 1em |
| 6 | 1.5em |
| 8 | 2em |

Use `chido-stack` for a vertical flex layout with a default `1em` gap and cleared
block margins on its direct children. Change the gap using `chido-gap-{step}`:

```html
<section class="chido-stack chido-gap-6">
  <h2>Contact details</h2>
  <p>Tell us how to reach you.</p>
  <chido-input input-label="Email" type="email"></chido-input>
</section>
```

`chido-gap-*` also works on your own grid/flex containers. For individual elements,
`chido-mbs-*` sets margin-block-start and `chido-mbe-*` sets margin-block-end
(top and bottom in horizontal writing). Ordinary block margins can collapse;
prefer stack gaps for predictable container spacing.

These shared utilities style the app and component hosts, not Shadow DOM internals.

### Margin and padding

Use `chido-{m|p}{side}-{step}` for Bootstrap-like naming with the Chido scale:

- `m`: margin; `p`: padding.
- No side: all sides. `x`: left/right. `y`: top/bottom.
- `t`: top; `b`: bottom; `s`: inline start; `e`: inline end.
- `s` and `e` follow text direction (left/right in LTR, reversed in RTL).
- Steps remain `0`, `1`, `2`, `3`, `4`, `6`, `8`; their values are listed above.
- Margin also accepts `auto`, e.g. `chido-mx-auto` to center a constrained-width block.

```html
<section class="chido-p-4 chido-mb-6">
  <h2 class="chido-mt-0 chido-mb-2">Contact details</h2>
  <p class="chido-m-0">Enter your information.</p>
</section>
```

`chido-gap-*` sets both row and column gaps on a grid or flex container;
`chido-row-gap-*` and `chido-column-gap-*` set each independently. A column flex
stack normally shows vertical gaps; a row flex layout shows horizontal gaps.
Gap spaces children apart without adding outer spacing. It doesn't affect ordinary
block layout. Margin spaces an element from neighbors; padding adds space inside it.

Utilities use ordinary CSS specificity without `!important`. Avoid conflicting
utilities on the same element; class order in HTML does not determine precedence.
Responsive and negative-spacing variants are not included yet.

## Component styling hooks

Set these CSS custom properties on `chido-input` or an ancestor. Fallbacks live
inside the component, allowing inherited theme values to work.

| Element | CSS properties (all prefixed `--chido-input-`) | Defaults |
| --- | --- | --- |
| Label text | `label-font-family`, `label-font-size`, `label-font-weight`, `label-color` | inherit, 0.875rem, 600, #eceeef |
| Label/input spacing | `label-gap` | 0.5rem |
| Input text | `font-family`, `font-size`, `font-weight`, `text-color` | inherit, 1rem, inherit, #eceeef |
| Input box | `padding`, `background`, `border-color`, `border-radius` | 0.75rem 1rem, #303336, #777c82, 0.375rem |
| Input states | `placeholder-color`, `focus-color`, `disabled-opacity` | #b7bdc3, #a8c7fa, 0.55 |
| Validation text | `validation-font-family`, `validation-font-size`, `validation-font-weight`, `validation-color` | inherit, 0.875rem, 400, #ffb4ab |
| Validation spacing | `validation-gap` | 0.5rem |

```css
chido-input {
  --chido-input-label-font-size: 1rem;
  --chido-input-label-font-weight: 700;
  --chido-input-font-size: 1rem;
  --chido-input-border-radius: 0.5rem;
  --chido-input-validation-color: #ffb4ab;
  --chido-input-validation-font-weight: 600;
}
```

Public CSS parts are `label`, `label-text`, `input`, and `validation-message`.
Use them for customization beyond the variables:

```css
chido-input::part(label-text) { letter-spacing: 0.025em; }
chido-input::part(validation-message) { font-style: italic; }
```

The validation span also displays missing-label configuration errors. Hidden
messages retain `display: none` until the component displays them. Consumers
should preserve visible focus indicators and readable text/background contrast.

## Additional components

Textarea, select, checkbox, radio-group, and button now have native implementations
and individual demo routes linked from the homepage and navigation. See
[COMPONENTS.md](./COMPONENTS.md) for their attributes/properties, events, accessibility,
styling hooks, examples, limitations, and browser-test instructions.

Run `npm test` for the Playwright browser suite. React wrappers are generated at build time; package publishing
remains deferred. The original input's public API is unchanged.

## Form helpers and feedback

The navigation now includes `chido-form-field`, `chido-alert`, `chido-form-summary`,
and `chido-progress`, each with its own SCSS file and demo route. See
[COMPONENTS.md](./COMPONENTS.md#form-field) for usage and accessibility details.
The form-field wraps a native light-DOM control; the existing Chido controls retain
their own internal labels. Summaries accept application-provided error arrays.

## Generated React wrappers

`npm run build` now generates typed wrappers for all current components and builds
separate native and React package entries with TypeScript declarations. See
[REACT.md](./REACT.md) for usage, generator maintenance, testing, and the browser-only
support boundary. React remains an optional peer dependency for `/react` consumers.
The package is still private and has not been published.

## Quality and accessibility

[QUALITY.md](./QUALITY.md) tracks native controls, keyboard access, labeling,
focus/error states, themes, responsive layout, framework independence, React usage,
TypeScript, custom events, tests, and live documentation. Use the demo theme selector
to try dark/light appearances. `npm test` includes axe accessibility scans.
Live routes: `/#/react` and `/#/documentation`.

Consumers may import `@chidoyo/chido-web-components/themes.css` and set
`data-chido-theme="light"` or `"dark"` on an ancestor. Automated checks supplement,
but do not replace, screen-reader and full WCAG conformance review.
