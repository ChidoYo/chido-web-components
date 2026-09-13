import { ChidoInput, ChidoCheckbox, ChidoProgress, ChidoAlert, ChidoFormSummary } from 'chido-web-components/react';

export const valid = <ChidoInput value="Hello" minLength={2} onChidoInput={event => event.detail.value.toUpperCase()} />;
export const checked = <ChidoCheckbox checked onChidoChange={event => event.detail.checked.valueOf()} />;
export const progress = <ChidoProgress value={2} max={5} />;
export const summary = <ChidoFormSummary errors={[{ target: 'email', message: 'Required' }]} />;
// @ts-expect-error Input value is a string.
export const badValue = <ChidoInput value={42} />;
// @ts-expect-error Checked is a boolean, not an HTML attribute string.
export const badChecked = <ChidoCheckbox checked="false" />;
// @ts-expect-error Variant is constrained to the component's public union.
export const badVariant = <ChidoAlert variant="urgent" />;
// @ts-expect-error Progress is numeric.
export const badProgress = <ChidoProgress value="2" />;
