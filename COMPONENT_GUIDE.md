# Chido Web Components — Complete Usage Guide

This is the consolidated guide to the **implemented** library: all 10 components,
public APIs, events, validation, styling, localization, React wrappers, builds,
and tests. Examples describe current behavior, not future roadmap features.

## Contents

- [Getting started](#getting-started)
- [Component directory](#component-directory)
- [API conventions](#api-conventions)
- [Input](#input)
- [Shared form-control API](#shared-form-control-api)
- [Textarea](#textarea)
- [Select](#select)
- [Checkbox](#checkbox)
- [Radio group](#radio-group)
- [Button](#button)
- [Form field](#form-field)
- [Alert](#alert)
- [Form summary](#form-summary)
- [Progress](#progress)
- [Localization](#localization)
- [Input styling hooks](#input-styling-hooks)
- [Other control styling](#other-control-styling)
- [Spacing utilities](#spacing-utilities)
- [React wrappers](#react-wrappers)
- [Build and testing commands](#build-and-testing-commands)
- [Troubleshooting and current limitations](#troubleshooting-and-current-limitations)

## Getting started

From this repository:

```sh
npm install
npm run dev
```

Open **http://localhost:5174/**. If that port is occupied, use Vite's printed URL.
The demo is one HTML document with hash-based routes, so navigation does not reload
shared application CSS. Component styles are compiled from SCSS into their own
Shadow DOM styles.

In a source-based Vite application, import the registration entry:

```ts
import './src/index';
```

Or import a component selectively:

```ts
import './src/components/chido-input/chido-input';
```

Paths above are relative to a file at the repository root; adjust them to your
importing file. Importing a component registers its custom element with a guard
against duplicate registration. Create markup after registration, or let the
browser upgrade markup that already exists. Assign JavaScript properties after
registration; arbitrary property assignments before upgrade are not supported by
all components yet.

For local package consumption:

```sh
# In this repository:
npm run build
npm pack

# In a consuming application; use the archive path printed by npm pack:
npm install /path/to/chidoyo-chido-web-components-0.1.0.tgz
```

Then use your consumer's browser bundler:

```ts
import '@chidoyo/chido-web-components';
```

For plain HTML without a bundler, copy **all** JavaScript files from `dist/package/`
to a served directory, preserving relative paths, then load its native entry:

```html
<script type="module" src="/vendor/chido/index.js"></script>
<chido-input input-label="First name"></chido-input>
```

Do not load TypeScript/SCSS source directly in an ordinary browser. Do not use
`file://` to test the app. Serve it through Vite or an HTTP server.

The package is currently private and unpublished. The native implementation has
no runtime component-framework dependency. React is required only for the optional
React entry. The optional light/dark theme tokens are exported as `@chidoyo/chido-web-components/themes.css`.
Spacing utilities remain demo/source styles; consumers provide their own page styles.

## Component directory

All demo URLs below are relative to `http://localhost:5174`.

| Element | Exported class / React wrapper | Demo route |
| --- | --- | --- |
| `chido-input` | `ChidoInput` | `/#/chido-input` |
| `chido-textarea` | `ChidoTextarea` | `/#/chido-textarea` |
| `chido-select` | `ChidoSelect` | `/#/chido-select` |
| `chido-checkbox` | `ChidoCheckbox` | `/#/chido-checkbox` |
| `chido-radio-group` | `ChidoRadioGroup` | `/#/chido-radio-group` |
| `chido-button` | `ChidoButton` | `/#/chido-button` |
| `chido-form-field` | `ChidoFormField` | `/#/chido-form-field` |
| `chido-alert` | `ChidoAlert` | `/#/chido-alert` |
| `chido-form-summary` | `ChidoFormSummary` | `/#/chido-form-summary` |
| `chido-progress` | `ChidoProgress` | `/#/chido-progress` |

Native classes come from the package root; React wrappers come from `/react`.
Source implementations and SCSS live in `src/components/chido-<name>/`.
Demo renderers live in `examples/chido-<name>/main.ts`.

## API conventions

- HTML attributes use kebab-case; JavaScript properties use camelCase.
- A required **label configuration** is different from a required **field value**.
  `input-label` is mandatory for input; `control-label` is mandatory for the other
  editable controls. `required` optionally makes user input mandatory.
- Boolean attributes are true when present: `disabled="false"` still disables a
  control. Remove the attribute or assign `.disabled = false` to enable it.
- Input uses `input-label`/`.inputLabel` and `input-name`/`.inputName`. Other form
  controls use `control-label`/`.controlLabel` and `control-name`/`.controlName`.
- `.value` is live state; `value` / `.defaultValue` supplies default state on text,
  textarea, select, and radio controls. Checkbox has separate checked state.
- The five editable controls emit bubbling, composed `chido-input` and
  `chido-change` events. Programmatic writes remain silent.
- Supply labels and custom messages in the application's chosen language; only
  library-owned defaults are translated automatically.
- The five Shadow DOM form controls are not yet associated with parent forms.
  Names alone do not add them to `FormData`. The native child of `chido-form-field`
  remains a native form participant.

## Input

```html
<chido-input
  input-label="Email address"
  input-name="email"
  type="email"
  autocomplete="email"
  placeholder="you@example.com"
  required
  validation-text="Enter your email address."
></chido-input>
```

| Attribute | Property | Default / behavior |
| --- | --- | --- |
| `input-label` | `inputLabel: string` | Mandatory nonblank label; missing hides control and displays configuration error |
| `input-name` | `inputName: string` | Optional; absent means no internal name attribute |
| `value` | `defaultValue: string` | Default value, empty string |
| — | `value: string` | Current internal input value |
| `placeholder` | `placeholder: string` | Empty string |
| `disabled` | `disabled: boolean` | False |
| `required` | `required: boolean` | False |
| `readonly` | `readOnly: boolean` | False |
| `type` | `type: ChidoInputType` | `text`; also `email`, `password`, `tel`, `url`, `search` |
| `autocomplete` | `autocomplete: string` | Absent; browser default |
| `minlength` | `minLength: number` | -1 when unconstrained |
| `maxlength` | `maxLength: number` | -1 when unconstrained |
| `pattern` | `pattern: string` | Absent means no pattern constraint |
| `validation-text` | `validationText: string` | Custom required message; getter falls back to translated default |
| `lang` | inherited `lang: string` | Explicit locale override, otherwise shared locale |

A real wrapping label and input share the same Shadow DOM. There are no slots.
Public `.focus(options?)` and `.blur()` delegate to the internal input.
`.checkValidity()` and `.reportValidity()` refresh native constraints; invalid
controls display inline messages and suppress browser popups.

```ts
import type { ChidoInput } from './src/index';

const field = document.querySelector<ChidoInput>('chido-input');
field?.focus();
field?.reportValidity();
```

### Live and default values

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

### Native input constraints

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

## Shared form-control API

The four new form controls use `control-label` / `.controlLabel` and
`control-name` / `.controlName`. These names make their internal destination
explicit. The existing `chido-input` retains its original `input-label` /
`input-name` API.

| Attribute | Property | Meaning |
| --- | --- | --- |
| `control-label` | `controlLabel: string` | Required visible accessible label; missing/blank hides the control and displays a configuration error |
| `control-name` | `controlName: string` | Optional native control name |
| `disabled` | `disabled: boolean` | Disabled when present |
| `required` | `required: boolean` | Native required constraint, false by default |
| `validation-text` | `validationText: string` | Optional custom required message; empty falls back to translation |
| `lang` | inherited `lang` property | Explicit language override; otherwise uses library locale |

Methods: `.focus(options?)`, `.blur()`, `.reportValidity()` (shows inline errors,
returns whether valid), `.checkValidity()` (uses native validity and invalid events).
Native validation popups are suppressed. A field error appears after a validation
attempt, clears when corrected, and updates with language changes. Configuration
errors take priority. Messages use `aria-describedby`; shown field errors set
`aria-invalid`. Radio options get native keyboard navigation within their own group.

These controls are **not yet form-associated**. Parent form submission, automatic
parent-form validation, reset, and outer disabled fieldsets are not integrated.
Use the public validation methods and value properties for this milestone. Keep
these limitations in mind when testing a surrounding `<form>`.

### Events

The four new form controls emit `chido-input` on native input and `chido-change`
on native change. Events bubble and are composed. Details are `{ value: string }`,
or `{ value: string, checked: boolean }` for checkbox. Native events remain intact.
Setting properties does not emit user events. The original `chido-input` also emits
both custom events with `{ value: string }` details.

```ts
import type { ChidoValueDetail } from './src/index';

document.querySelector('chido-textarea')?.addEventListener('chido-input', event => {
  const detail = (event as CustomEvent<ChidoValueDetail>).detail;
  console.log(detail.value);
});
```

## Textarea

```html
<chido-textarea control-label="Message" control-name="message"
  placeholder="Tell us about your project" rows="4" minlength="10"
  maxlength="300" required></chido-textarea>
```

Additional properties: `.value`, `.defaultValue`, `.placeholder`, `.readOnly`,
`.rows`, `.minLength`, `.maxLength`, `.autocomplete`. Attributes use native lowercase
names (`readonly`, `minlength`, `maxlength`). The `value` attribute and `.defaultValue`
set the default; `.value` is live. Once edited, changing the default preserves the
live value. Length constraints and numeric setters follow native textarea behavior,
including user-edit-dependent length validation. Default rows: 2. The control is
vertically resizable. No slots.

## Select

```html
<chido-select control-label="Country" control-name="country" required>
  <option value="">Choose a country</option>
  <option value="us">United States</option>
  <option value="mx">Mexico</option>
</chido-select>
```

`.value` is the live selection; `value` / `.defaultValue` sets the default while
unedited. Without an explicit value, native first-option/selected-option behavior
applies. An empty first option provides a required-select placeholder.

Direct `<option>` children supply `value`, label/text, `disabled`, and `selected`.
Their plain data is copied into the internal native select; they are not slotted.
Changes to children and option data are observed. Edited selections survive option
updates when the value remains available. Supply unique option values. Multiple
selection and optgroups are not implemented.

## Checkbox

```html
<chido-checkbox control-label="I accept the terms" control-name="terms"
  value="accepted" required></chido-checkbox>
```

`.checked` is the live boolean state. `checked` / `.defaultChecked` defines the
initial/default state without overwriting user edits. `.value` / `value` is the
checkbox payload (default `on`), not its checked state. `.indeterminate` is a
JavaScript-only property; native clicks clear it. Required means it must be checked.
No slots.

## Radio group

```html
<chido-radio-group control-label="Delivery" control-name="delivery" required>
  <option value="standard">Standard delivery</option>
  <option value="express">Express delivery</option>
</chido-radio-group>
```

Provide at least one enabled direct `<option>` child, with unique values. Option
label/text, disabled, and selected attributes are supported, as with select.
A legend labels the fieldset; each native radio has a wrapping label. `.value` is
the live selection; `value` / `.defaultValue` supplies the initial/default choice.
No option is selected by default unless `value` or `selected` supplies one.
Groups are isolated by separate shadow roots even if their internal names match.
No standalone radio component or custom keyboard algorithm is needed.

## Button

```html
<chido-button>Save changes</chido-button>
<chido-button disabled>Unavailable</chido-button>
```

Content uses the default slot. Supply meaningful visible text and avoid nesting
interactive elements. Native click events cross Shadow DOM; listen on the host.
Space and Enter activate it. `.disabled`, `.focus(options?)`, `.blur()`, and
`.click()` delegate to the native button. It always uses `type="button"`; parent
form submit/reset behavior, loading state, and icon-only labeling APIs are deferred.

## Other control styling

Component SCSS lives beside each component. The four form controls share a small
SCSS mixin compiled into their isolated styles; no global CSS is required.

Replace `<name>` with `textarea`, `select`, `checkbox`, or `radio-group`:

- Label: `--chido-<name>-label-color`, `-label-font-size`, `-label-font-weight`, `-label-gap`.
- Textarea/select: `--chido-<name>-text-color`, `-font-size`, `-background`, `-padding`, `-border-color`, `-border-radius`.
- States: `--chido-<name>-focus-color`, `-disabled-opacity`; checkbox/radio `-accent-color`.
- Messages: `--chido-<name>-validation-color`, `-validation-font-size`.
- Textarea adds `--chido-textarea-placeholder-color`.
- Radio group adds `--chido-radio-group-option-gap`.

Public parts: `label`, `label-text`, `control`, `validation-message` for textarea,
select, and checkbox. The control also has its native part name (`textarea`,
`select`, or `input`). Radio group exposes `group`, `label-text`, `options`,
`option`, `option-text`, `control`, `input`, and `validation-message`.
Button exposes `button` and `--chido-button-text-color`, `-background`,
`-hover-background`, `-border-color`, `-border-radius`, `-padding`, `-focus-color`,
`-disabled-opacity`.

```css
chido-select { --chido-select-border-radius: 0.75rem; }
chido-checkbox { --chido-checkbox-accent-color: #d9c2ff; }
chido-radio-group::part(option-text) { font-weight: 600; }
chido-button::part(button) { letter-spacing: 0.025em; }
```

## Form field

```html
<chido-form-field control-label="Course title"
  help-text="Use a short, descriptive title." required
  invalid validation-text="Enter a course title.">
  <input name="courseTitle" type="text" />
</chido-form-field>
```

`chido-form-field` is a layout and accessibility-association helper for **one direct
native input, textarea, or select child**. Supply a nonempty `control-label`.
It checks native validity when the child loses focus and updates `.invalid`.
Input/change events clear the error once the child is valid. Applications can also
set `.invalid` for submission or custom validation. It synchronizes `required` to
the native control and displays an
asterisk (hidden from assistive technology because native required semantics convey
that state). An originally required child stays required.

Properties reflect their attributes: `.controlLabel` (`control-label`), `.helpText`
(`help-text`), `.validationText` (`validation-text`), `.required`, `.invalid`, `.lang`.
Boolean attributes follow HTML presence semantics. `.focus()` focuses the child.
`validation-text` is displayed only when invalid; absent text uses the localized
required message, so supply a specific message for non-required errors.

The wrapper generates label/help/error elements in **light DOM**, assigned to named
slots in its shadow layout. This keeps native `label for` and `aria-describedby`
references in the same DOM tree as the child. Generated IDs are unique, existing
control IDs and description references are preserved, and generated associations
are removed when the child detaches. The `field-label`, `field-help`, and `field-error`
slots are reserved for these generated elements. Do not supply those slots yourself.

Keep the child ID stable while mounted. Do not wrap the existing Chido controls:
they already own their internal labels/errors across a different shadow boundary.
This wrapper does not reach into arbitrary custom elements. No automatic inline
validation or live announcements are added; the demo uses native validity plus
explicit invalid state. A native child still participates in its surrounding form.

Styling variables: `--chido-form-field-gap`, `-label-font-size`, `-label-color`,
`-help-font-size`, `-help-color`, `-error-font-size`, `-error-color`. The shadow layout
exposes `::part(field)`. Since generated content lives in light DOM, consumers can
also style it with `chido-form-field > [slot="field-label"]`,
`[slot="field-help"]`, and `[slot="field-error"]`. The native child is styled by
consumer CSS; the wrapper does not impose input styling.

## Alert

```html
<chido-alert variant="success" message="Your progress was saved."></chido-alert>
```

Properties: `.variant` (`info` default, `warning`, `error`, `success`), `.message`
(plain text), `.live` (`auto` default, `polite`, `assertive`, `off`), `.lang`.
Default informational/warning/success messages use `role="status"` (polite);
errors use `role="alert"` (assertive). `live` explicitly overrides that policy;
`off` uses a non-live note. Severity also has a visible translated title so it is
not communicated by color alone. Consumer message text is not auto-translated.

For dynamic announcements, mount an empty alert first and then change `.message`.
Its empty live region remains present without a visible box. It never moves focus,
auto-dismisses, or repeatedly announces unchanged content. Initial populated content
is not reliably announced by every screen reader; use `live="off"` for static
contextual examples, as in the demo. Set variant/live before updating the message
when you need a particular announcement priority. No rich HTML or slots in this
version; message strings are assigned as text.

Parts: `alert`, `title`, `message`. Variables: `--chido-alert-padding`,
`-border-color`, `-border-radius`, `-background`, `-color`.

## Form summary

```ts
const summary = document.querySelector('chido-form-summary')!;
summary.errors = [
  { target: 'email-field', message: 'Enter a valid email address.' },
  { target: document.querySelector('chido-textarea')!, message: 'Add your notes.' },
];
summary.focus();
```

`.errors` is an array of `{ target: HTMLElement | string, message: string }`.
A string is an element ID in the summary's document or shadow tree, not a CSS
selector. Pass element references for targets in other trees. Error messages are
plain text. Assign a new array to update; the getter returns copies. Empty arrays
hide the summary. `.summaryTitle` / `summary-title` overrides the translated heading;
English defaults to “Please correct the following errors.”

The summary does not discover errors or submit forms. After application validation,
set `.errors` and explicitly call `.focus()` to move focus to the summary. It avoids
an additional live-region announcement to prevent duplicating the focused content.
Links focus their referenced fields without changing the hash router. It supports
native focusable elements, the existing Chido controls' open shadow inputs, and
form-field/radio-group focus delegation. Supply connected, enabled targets; deleted
targets are safely ignored. Closed-shadow custom controls need their own public
focus implementation. Clear or replace errors when your application revalidates.

Parts: `summary`, `title`, `list`, `item`, `link`. Variables:
`--chido-form-summary-padding`, `-border-color`, `-border-radius`, `-background`,
`-color`, `-title-font-size`, `-link-color`, `-focus-color`.

## Progress

```html
<chido-progress progress-label="Course completion" value="2" max="5"
  value-text="2 of 5 lessons complete"></chido-progress>
<chido-progress progress-label="Preparing course"></chido-progress>
```

Properties: `.progressLabel` / `progress-label`, numeric `.value`, numeric `.max`
(default 100), `.valueText` / `value-text`, `.lang`. `.indeterminate` is a read-only
boolean: omit/remove the `value` attribute for unknown progress. Finite values are
clamped to 0–max. Invalid/nonpositive max falls back to 100; invalid values become 0.
Native `<progress>` supplies progressbar semantics and its label is associated in
the same shadow root. Default labels and status text are localized; custom labels
and `value-text` are consumer-provided. Known progress displays a localized percent
unless overridden. `value-text` also becomes `aria-valuetext` for step/course wording.

There is no live region on progress: frequent value updates should not continually
interrupt readers. Use a separate polite alert for meaningful completion milestones
when your application needs announcements. This is a progress indicator, not a step
navigation widget or an LMS persistence layer.

Parts: `container`, `label`, `progress`, `value-text`. Variables:
`--chido-progress-gap`, `-label-color`, `-height`, `-color`, `-track-color`, `-text-color`.
Native track styling varies by browser. No custom animation is imposed.

## Accessibility references and verification

The notification/focus patterns follow the WAI guidance on
[form error notifications](https://www.w3.org/WAI/tutorials/forms/notifications/)
and [status messages](https://w3c.github.io/wcag/techniques/aria/ARIA22).
Progress updates are distinct from live announcements, as described in
[ARIA25](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA25).
Browser tests check accessible names/descriptions, live-region roles, focus targets,
plain-text rendering, and progress values. Actual announcement timing still needs
manual testing with the screen readers/browser combinations your consumers support.


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
`src/index.ts` registers all components and exports the locale API and component classes.

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

## Input styling hooks

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

## React wrappers

`npm run build` now generates and compiles a React wrapper for every current Chido
component. The native components remain framework-independent. The React adapter
uses the same native elements, styles, validation, and localization.

### React build output

```sh
npm run build
```

The build runs these steps in order:

1. Generate `src/react/generated.ts` from native component source.
2. Type-check the project and build the existing Vanilla demo into `dist/`.
3. Build native and React ES-module entry points into `dist/package/`.
4. Emit TypeScript declarations into `dist/package/types/`.

Package exports are configured for `@chidoyo/chido-web-components` and
`@chidoyo/chido-web-components/react`. These use the repository's existing package name,
not a claim that the name is available on npm. The package remains private and
nothing has been published. React 19 is an optional peer dependency: native-only
consumers do not need React; consumers of `/react` must supply it. React/React DOM
and their types are development dependencies for building and testing the adapter.
React code is externalized from the package bundles and is not included in the
native entry point.

To inspect a local installable archive after building, use `npm pack`, then install
the resulting archive into a test application. The archive includes the package
build and API documentation, not the demo, tests, or source generator.

### React usage

```tsx
import { useState } from 'react';
import { ChidoInput, ChidoCheckbox } from '@chidoyo/chido-web-components/react';

export function Profile() {
  const [name, setName] = useState('');
  const [accepted, setAccepted] = useState(false);

  return <>
    <ChidoInput
      inputLabel="First name"
      value={name}
      onChidoInput={event => setName(event.detail.value)}
    />
    <ChidoCheckbox
      controlLabel="Accept terms"
      checked={accepted}
      onChidoChange={event => setAccepted(event.detail.checked)}
    />
  </>;
}
```

All 10 current wrappers are exported: `ChidoInput`, `ChidoTextarea`, `ChidoSelect`,
`ChidoCheckbox`, `ChidoRadioGroup`, `ChidoButton`, `ChidoFormField`, `ChidoAlert`,
`ChidoFormSummary`, and `ChidoProgress`. Each exports a matching `*Props` type.

Public setter names become optional camelCase React props. Existing native APIs
remain authoritative: input uses `inputLabel`/`inputName`, other controls use
`controlLabel`/`controlName`. Do not use kebab-case component attributes on the
wrapper; those bypass its typed property mapping. Standard host props such as
`className`, `style`, `id`, `lang`, `aria-*`, and `onClick` pass through to the host.
Host ARIA attributes are not automatically forwarded into the component's shadow
control. Use its documented labeling API.

#### Values, defaults, and prop removal

- `value` and `checked` provide controlled state for editable controls. Update text
  state in `onChidoInput`; `onChidoChange` on text controls occurs when editing is
  committed, usually on blur. Select, checkbox, and radio state can use
  `onChidoChange`. The adapter restores rejected controlled edits after the native
  input/change sequence completes.
- `defaultValue` and `defaultChecked` initialize uncontrolled fields only. Later
  changes to these React props are ignored. Use a new React `key` to remount/reset.
- Avoid supplying both live and default props for the same state. Avoid switching
  controlled/uncontrolled modes during a component's lifetime. If a controlled live
  prop is removed, the current value is retained as uncontrolled state.
- Omitting a previously supplied reflected prop removes its corresponding attribute.
  This restores defaults for numeric constraints without assigning invalid numbers
  such as `minLength = -1`. Boolean false values use native property setters.
- Object/array props, such as form-summary `errors`, are assigned as properties,
  never serialized into attributes. Use a new array when changing summary entries.
- Setting props does not dispatch synthetic input/change events.

For child content, use React children normally:

```tsx
<ChidoSelect controlLabel="Country" defaultValue="mx">
  <option value="us">United States</option>
  <option value="mx">Mexico</option>
</ChidoSelect>
<ChidoButton onClick={() => console.log('Save')}>Save</ChidoButton>
```

#### Events and refs

The five editable form controls expose `onChidoInput` and `onChidoChange`, receiving
native typed `CustomEvent`s. Checkbox details include `checked`; other controls
provide `value`. These are not React synthetic `onChange` events. Listeners are
updated to use the latest callback and are removed on unmount, including React
Strict Mode's extra effect setup/cleanup cycle.

Refs expose the actual native custom element and its existing methods:

```tsx
import { useRef } from 'react';
import { ChidoTextarea } from '@chidoyo/chido-web-components/react';
import type { ChidoTextarea as TextareaElement } from '@chidoyo/chido-web-components';

export function Notes() {
  const notes = useRef<TextareaElement>(null);
  return <>
    <ChidoTextarea ref={notes} controlLabel="Notes" />
    <button onClick={() => notes.current?.focus()}>Focus notes</button>
  </>;
}
```

Refs expose the component's public focus and validation methods, including
`chido-input.focus()`, `.blur()`, `.checkValidity()`, and `.reportValidity()`.
Parent-form association remains a separate future milestone.

#### Browser-only boundary

This first adapter targets browser-rendered React 19 applications. The native
modules use `HTMLElement` at import time, so importing either package entry in a
Node SSR process is not supported. In an SSR framework, use its client-only loading
mechanism with server rendering disabled. The React bundle includes a `use client`
directive, but that directive alone does not make the native modules SSR-safe.
No hydration or server-rendering support is claimed by this implementation.

### Generator maintenance

Run `npm run generate:react` manually or let build/dev/test generate wrappers.
`npm run check:generated` verifies the checked-in generated file is up to date.
Do not edit `src/react/generated.ts` directly.

`scripts/generate-react.mjs` uses the already-installed TypeScript compiler API to
find public setters on each `HTMLElement` class under
`src/components/chido-*/chido-*.ts`. Prop types reference the native class types,
including unions and array types, rather than duplicating them. Attribute mappings
are extracted from literal native attribute calls in each accessor. Read-only
getters and methods remain available through the element ref, not as writable props.
Inherited host props are provided by React's `HTMLAttributes`.

The generator recognizes the current `emitValue(this, ...)` convention to expose
typed `onChidoInput`/`onChidoChange`. New event families or new nonliteral attribute
mapping conventions require extending the generator explicitly; it does not infer
arbitrary event semantics. `create-component.ts` contains the shared lifecycle and
synchronization adapter. Component implementations never import React.

### React verification

`npm test` builds the actual package, checks consumer JSX types, and runs browser
tests, including a React Strict Mode fixture importing the package's `/react`
export. Coverage includes all wrappers mounting, controlled and uncontrolled state,
boolean/numeric prop removal, typed events, callback replacement, dynamic option
children, array props, native refs, unmount cleanup, and the existing native suite.

The design uses native custom-element properties/events as documented by
[React](https://react.dev/reference/react-dom/components#custom-html-elements),
and separate entries/external dependencies through
[Vite library mode](https://vite.dev/guide/build.html#library-mode).

## Build and testing commands

Run commands from the repository root:

| Command | Purpose |
| --- | --- |
| `npm install` | Install development dependencies |
| `npm run dev` | Generate wrappers and start Vite, normally port 5174 |
| `npm run typecheck` | Regenerate wrappers and check project TypeScript |
| `npm run generate:react` | Regenerate typed wrappers from native source |
| `npm run check:generated` | Fail if generated wrappers differ from current source |
| `npm run build` | Generate wrappers, type-check, build demo/native/React bundles, emit declarations |
| `npm run preview` | Serve the built demo; use Vite's printed URL |
| `npx playwright install chromium` | Install the browser required by the tests |
| `npm test` | Build, check consumer JSX types, and run the browser suite |
| `npm run test:types` | Check consumer JSX fixtures against an existing package build |
| `npm pack --dry-run` | Inspect package contents without creating an archive |
| `npm pack` | Create a local archive after building; does not publish to npm |

Tests use their own server on port **5175**; keep that port available. They cover
native controls, routes, localization, errors, styling hooks, focus, progress, and
React integration under Strict Mode. Automated browser coverage currently targets
Chromium. Check other engines and assistive technology separately.

### Manual review checklist

1. Navigate to each demo using the homepage or navigation links; refresh and use Back.
2. Tab through controls and verify visible focus, label association, disabled state,
   read-only editing restrictions, and radio arrow-key selection.
3. Trigger validation on empty required fields, correct the values, and switch
   between English and Spanish. Confirm custom messages remain consumer-provided.
4. Check select/radio option data, checkbox live/default state, and event payloads.
5. Submit the form-summary demo, follow an error link, and confirm focus reaches
   the intended field without changing the application's hash route.
6. Update an initially empty alert and check announcement behavior with the target
   screen reader/browser. Test polite, assertive, and static messages.
7. Check determinate/indeterminate progress and meaningful custom `value-text`.
8. Override component CSS variables and parts; check readable contrast, keyboard
   focus, zoom, and narrow layouts in the consuming application's design.

## Troubleshooting and current limitations

| Symptom | What to check |
| --- | --- |
| An editable control is hidden | Supply a nonblank `input-label` or `control-label`, as appropriate |
| `disabled="false"` still disables | Remove the boolean attribute or assign the property `false` |
| Input text does not change when its `value` attribute changes | After edits, use the live `.value` property instead of changing the default |
| No change callback while typing in React | Use `onChidoInput` for text edits; `onChidoChange` is the native committed-change event |
| CSS selector cannot reach the input | Use supported variables or `::part()`; ordinary selectors stop at Shadow DOM |
| Native browser validation popup appears | Check that the component's listener is installed; plain native children of form-field need application validation such as the demo's `novalidate` form |
| A surrounding form omits a Chido value | Shadow form controls do not yet implement `ElementInternals`/form association |
| A form-field does not label an existing Chido control | Form-field supports a direct native child, not another shadow-based Chido control |
| Summary has no errors | Assign `.errors`; the summary does not discover invalid fields automatically |
| Summary link does not focus a field | Supply a connected, enabled target element or an ID in the summary's DOM tree |
| No alert announcement | Mount an empty region before updating it; verify live mode and actual screen-reader behavior |
| Root document language does not change messages | Set the library locale or the individual component's `lang` |
| Progress is indeterminate | Add `value`; omit/remove it only for unknown progress |
| React import fails in a Node process | Current native module imports require browser globals; SSR/hydration is not supported |
| New React prop is missing | Run the generator/build; check the property has a public setter using supported attribute-mapping conventions |

Additional boundaries:

- Select is single-selection and does not support optgroups yet.
- Radio groups need at least one enabled option and unique values.
- Button is an action button, not a parent-form submit/reset button.
- Do not assume Angular/Vue adapters or examples exist; only the native API and
  generated React adapter have been implemented and tested here.
- Package publishing, parent-form association, broader browser testing, and SSR
  support are separate milestones.

This guide is the consumer-oriented reference. The root architectural document
`WEB_COMPONENTS_PROJECT.md` remains the development roadmap. Focused native and
React references remain in `COMPONENTS.md` and `REACT.md`.

## Library quality checklist and themes

The twelve ongoing quality requirements and their test coverage are documented in
[QUALITY.md](./QUALITY.md). All ten demos now have a light/dark theme selector,
automated axe checks for supported WCAG A/AA rules, and 320px layout checks.
These checks complement manual accessibility review; they do not certify full
WCAG conformance.

```ts
import '@chidoyo/chido-web-components/themes.css';
document.documentElement.dataset.chidoTheme = 'light'; // or 'dark'
```

Components use shared tokens as fallbacks for their specific customization variables.
Page styles can use `--chido-color-background` and `--chido-color-text`.
The existing dark ash theme remains the default. Visit `/#/react` for a live React
example and `/#/documentation` to read or download this guide.

### Validation when leaving a field

Input, textarea, select, and checkbox show inline errors when their native control
loses focus. Radio groups validate only when focus leaves the group. Form-field
validates its native child on blur. Untouched fields do not initially show value
errors; disabled and read-only controls are excluded from native validation.
Correcting a value clears its error. Blur validation does not move focus or open
a browser validation popup. Form summaries still update on submission in the demo.
