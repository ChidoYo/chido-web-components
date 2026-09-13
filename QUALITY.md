# Component quality requirements

These twelve requirements apply to every component and every future change.
The native implementation stays independent of frameworks. Evidence below describes
implemented checks, not a blanket WCAG certification.

| Requirement | Implementation and verification |
| --- | --- |
| 1. Native HTML controls | Input, textarea, select, checkbox/radio inputs, button, fieldset/legend, and progress use native elements. Form-field associates a native light-DOM child. |
| 2. Keyboard access | Native editing/activation, radio arrow keys, public focus delegation, summary-link focus, and demo skip link. Playwright verifies keyboard behavior. |
| 3. Labels and descriptions | Wrapping labels or same-tree label associations; group legends; help/error `aria-describedby`; focused summary links. Tests assert accessible names/descriptions. |
| 4. Focus and errors | Visible focus outlines, textual inline errors and `aria-invalid`, native constraint semantics, localized messages. axe checks supported WCAG A/AA rules and color contrast in both themes. |
| 5. Light and dark themes | Shared CSS custom properties in `src/styles/themes.scss`, component overrides, and optional package `themes.css`. Every component demo has both-theme coverage. |
| 6. Responsive behavior | Wrapping navigation, flexible widths, text wrapping, and 320px viewport overflow checks for all ten demos. |
| 7. No framework dependency | Native entry has no runtime framework dependency. React is an optional peer used only by the separate adapter. |
| 8. React example | Live `/#/react` example, generated wrappers, typed event/state/ref behavior, and Strict Mode integration tests against the package export. |
| 9. TypeScript definitions | Strict checking plus emitted native/React declarations; positive and negative consumer JSX type tests. |
| 10. Custom events | All five editable controls emit bubbling/composed `chido-input` and `chido-change`; checkbox includes checked state. Tests cover propagation and silent programmatic writes. |
| 11. Automated tests | Playwright behavior suite plus `@axe-core/playwright` scans in dark/light themes. `npm test` builds and checks types before running. |
| 12. Live examples/documentation | All ten component routes, live React route, and `/#/documentation` with a readable/downloadable complete guide. |

## Theme usage

From an installed local package:

```ts
import '@chidoyo/chido-web-components';
import '@chidoyo/chido-web-components/themes.css';
```

Choose a theme on the document or a containing section:

```html
<html lang="en" data-chido-theme="light">
```

```ts
document.documentElement.dataset.chidoTheme = 'dark';
```

The default theme remains dark ash. This optional stylesheet sets tokens and native
`color-scheme`; consumers still style their own page background/text with
`--chido-color-background` and `--chido-color-text`. Nested theme containers work
through inherited variables. Component-specific variables take priority:

```css
chido-input {
  --chido-input-border-radius: 0.75rem;
}
```

Shared tokens: `--chido-color-background`, `-surface`, `-text`, `-muted`, `-border`,
`-control-border`, `-accent`, `-accent-hover`, `-on-accent`, `-error`, `-warning`,
`-success`. Changing custom colors requires rechecking contrast, including hover
and focus. Styles are not automatically imported by the native package entry.

## Checks before accepting a component change

```sh
npm test
npm run check:generated
```

The accessibility suite checks WCAG 2 A/AA, 2.1 AA, and 2.2 AA rules supported by
axe. It tests the actual demos, including triggered error states. The build also
produces the optional theme stylesheet. Do not disable rules to hide failures;
fix the control or document a specific tool limitation with evidence.

## Manual verification still required

Automated tests find only part of accessibility issues. Passing axe does not prove
WCAG conformance. See [Playwright's accessibility testing guidance](https://playwright.dev/docs/accessibility-testing).

Before a public release, verify:

- Target browser/screen-reader combinations: labels, instructions, error discovery,
  radio selection, summary navigation, and alert announcement timing.
- Keyboard-only operation, no traps, visible/unobscured focus, and useful focus order.
- Zoom/reflow, text spacing overrides, forced colors, and consumers' theme overrides.
- End-to-end form submission and reset once native form association is implemented.

Current automated browser coverage is Chromium. Firefox/WebKit, actual assistive
technology, SSR, and native parent-form integration remain separate work. React
examples run in the browser and do not change those limitations.
