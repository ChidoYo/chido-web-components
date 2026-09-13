import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
// Exercise the real package export and declaration files produced by npm run build.
import {
  ChidoInput, ChidoTextarea, ChidoSelect, ChidoCheckbox, ChidoRadioGroup,
  ChidoButton, ChidoAlert, ChidoFormField, ChidoFormSummary, ChidoProgress,
} from 'chido-web-components/react';
import type { ChidoTextarea as TextareaElement, ChidoFormError } from 'chido-web-components';

function App() {
  const [name, setName] = useState('Erick');
  const [checked, setChecked] = useState(false);
  const [disabled, setDisabled] = useState<boolean | undefined>(true);
  const [constraint, setConstraint] = useState<number | undefined>(3);
  const [initial, setInitial] = useState('Initial');
  const [events, setEvents] = useState(0);
  const [changes, setChanges] = useState(0);
  const [version, setVersion] = useState('first');
  const [received, setReceived] = useState('');
  const [mounted, setMounted] = useState(true);
  const [choice, setChoice] = useState('mx');
  const [extra, setExtra] = useState(false);
  const [errors, setErrors] = useState<ChidoFormError[]>([]);
  const textarea = useRef<TextareaElement>(null);
  return <>
    {mounted && <ChidoInput id="controlled" inputLabel="Controlled name" value={name}
      onChidoInput={event => { setName(event.detail.value); setEvents(count => count + 1); setReceived(version); }}
      onChidoChange={() => setChanges(count => count + 1)} />}
    <output id="name-state">{name}</output><output id="events">{events}</output><output id="changes">{changes}</output>
    <output id="received">{received}</output>
    <button onClick={() => setName('Updated')}>Set name</button>
    <button onClick={() => setVersion('second')}>Replace callback</button>
    <button onClick={() => setMounted(value => !value)}>Toggle mount</button>
    <ChidoInput id="rejected" inputLabel="Rejected edits" value="Locked" />
    <ChidoInput id="uncontrolled" inputLabel="Uncontrolled" defaultValue={initial} />
    <button onClick={() => setInitial('Changed default')}>Change default</button>
    <ChidoInput id="attributes" inputLabel="Attributes" disabled={disabled} minLength={constraint} placeholder={disabled ? 'Unavailable' : undefined} />
    <button onClick={() => { setDisabled(undefined); setConstraint(undefined); }}>Remove optional props</button>
    <ChidoCheckbox controlLabel="Accept" checked={checked} onChidoChange={event => setChecked(event.detail.checked)} />
    <output id="checked-state">{String(checked)}</output>
    <ChidoTextarea ref={textarea} controlLabel="Notes" defaultValue="Notes default" />
    <button onClick={() => textarea.current?.focus()}>Focus notes through ref</button>
    <ChidoSelect controlLabel="Country" value={choice} onChidoChange={event => setChoice(event.detail.value)}>
      <option value="us">United States</option><option value="mx">Mexico</option>
      {extra && <option value="ca">Canada</option>}
    </ChidoSelect>
    <button onClick={() => setExtra(true)}>Add option</button>
    <output id="choice-state">{choice}</output>
    <ChidoRadioGroup controlLabel="Delivery" defaultValue="standard">
      <option value="standard">Standard</option><option value="express">Express</option>
    </ChidoRadioGroup>
    <ChidoButton onClick={() => setErrors([{ target: 'controlled', message: 'Check the name' }])}>Show errors</ChidoButton>
    <ChidoFormSummary errors={errors} />
    <button onClick={() => setErrors([])}>Clear errors</button>
    <ChidoAlert variant="info" live="off" message="React adapter loaded" />
    <ChidoFormField controlLabel="Native child" helpText="Shared field layout" required>
      <input name="nativeChild" />
    </ChidoFormField>
    <ChidoProgress progressLabel="Course" value={2} max={5} />
  </>;
}

createRoot(document.querySelector('#root')!).render(<StrictMode><App /></StrictMode>);
