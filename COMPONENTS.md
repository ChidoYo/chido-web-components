# Native component APIs

All components register from `src/index.ts`, or import their own module directly
from `src/components/chido-<name>/chido-<name>.ts`. There is no published npm
package yet. Each implementation uses `HTMLElement`, open Shadow DOM, and native
controls. React is not required.

## New form controls

| Element | Native control | Demo |
| --- | --- | --- |
| `chido-textarea` | `textarea` | `/#/chido-textarea` |
| `chido-select` | Single native `select` | `/#/chido-select` |
| `chido-checkbox` | Checkbox `input` | `/#/chido-checkbox` |
| `chido-radio-group` | `fieldset`, `legend`, radio inputs | `/#/chido-radio-group` |
| `chido-button` | Action `button` | `/#/chido-button` |

### Shared form-control API

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

## Styling

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

## Browser tests

Playwright is a development-only dependency. Run:

```sh
npx playwright install chromium
npm test
npm run build
```

Tests start a separate Vite server on port 5175 and cover routes, native interaction,
validation, translations, value/default state, option updates, events, styles, and
reconnection. Chromium coverage is automated; other engines and screen-reader
verification remain future work. The demo stays on port 5174.

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

### Validation when leaving a field

Input, textarea, select, and checkbox show inline errors when their native control
loses focus. Radio groups validate only when focus leaves the group. Form-field
validates its native child on blur. Untouched fields do not initially show value
errors; disabled and read-only controls are excluded from native validation.
Correcting a value clears its error. Blur validation does not move focus or open
a browser validation popup. Form summaries still update on submission in the demo.
