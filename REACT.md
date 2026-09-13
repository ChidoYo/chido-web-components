# Generated React wrappers

`npm run build` now generates and compiles a React wrapper for every current Chido
component. The native components remain framework-independent. The React adapter
uses the same native elements, styles, validation, and localization.

## Build output

```sh
npm run build
```

The build runs these steps in order:

1. Generate `src/react/generated.ts` from native component source.
2. Type-check the project and build the existing Vanilla demo into `dist/`.
3. Build native and React ES-module entry points into `dist/package/`.
4. Emit TypeScript declarations into `dist/package/types/`.

Package exports are configured for `chido-web-components` and
`chido-web-components/react`. These use the repository's existing package name,
not a claim that the name is available on npm. The package remains private and
nothing has been published. React 19 is an optional peer dependency: native-only
consumers do not need React; consumers of `/react` must supply it. React/React DOM
and their types are development dependencies for building and testing the adapter.
React code is externalized from the package bundles and is not included in the
native entry point.

To inspect a local installable archive after building, use `npm pack`, then install
the resulting archive into a test application. The archive includes the package
build and API documentation, not the demo, tests, or source generator.

## Usage in a browser React application

```tsx
import { useState } from 'react';
import { ChidoInput, ChidoCheckbox } from 'chido-web-components/react';

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

### Values, defaults, and prop removal

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

### Events and refs

The five editable form controls expose `onChidoInput` and `onChidoChange`, receiving
native typed `CustomEvent`s. Checkbox details include `checked`; other controls
provide `value`. These are not React synthetic `onChange` events. Listeners are
updated to use the latest callback and are removed on unmount, including React
Strict Mode's extra effect setup/cleanup cycle.

Refs expose the actual native custom element and its existing methods:

```tsx
import { useRef } from 'react';
import { ChidoTextarea } from 'chido-web-components/react';
import type { ChidoTextarea as TextareaElement } from 'chido-web-components';

const notes = useRef<TextareaElement>(null);
// In JSX:
// <ChidoTextarea ref={notes} controlLabel="Notes" />
// <button onClick={() => notes.current?.focus()}>Focus notes</button>
```

Refs expose the component's public focus and validation methods, including
`chido-input.focus()`, `.blur()`, `.checkValidity()`, and `.reportValidity()`.
Parent-form association remains a separate future milestone.

### Browser-only boundary

This first adapter targets browser-rendered React 19 applications. The native
modules use `HTMLElement` at import time, so importing either package entry in a
Node SSR process is not supported. In an SSR framework, use its client-only loading
mechanism with server rendering disabled. The React bundle includes a `use client`
directive, but that directive alone does not make the native modules SSR-safe.
No hydration or server-rendering support is claimed by this implementation.

## Generator maintenance

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

## Verification

`npm test` builds the actual package, checks consumer JSX types, and runs browser
tests, including a React Strict Mode fixture importing the package's `/react`
export. Coverage includes all wrappers mounting, controlled and uncontrolled state,
boolean/numeric prop removal, typed events, callback replacement, dynamic option
children, array props, native refs, unmount cleanup, and the existing native suite.

The design uses native custom-element properties/events as documented by
[React](https://react.dev/reference/react-dom/components#custom-html-elements),
and separate entries/external dependencies through
[Vite library mode](https://vite.dev/guide/build.html#library-mode).
