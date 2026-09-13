import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ChidoInput, ChidoCheckbox } from '../../src/react';

function logUpdate(label: string, event: CustomEvent<{ value: string; checked?: boolean }>): void {
  console.log(event.type, { label, value: event.detail.value, detail: event.detail });
}

function Example() {
  const [name, setName] = useState('');
  const [checked, setChecked] = useState(false);
  return <div className="chido-stack chido-gap-4">
    <ChidoInput inputLabel="First name" value={name} onChidoInput={event => {
      setName(event.detail.value);
      logUpdate('First name', event);
    }} onChidoChange={event => logUpdate('First name', event)} />
    <ChidoCheckbox controlLabel="Send course updates" checked={checked}
      onChidoInput={event => logUpdate('Send course updates', event)}
      onChidoChange={event => {
        setChecked(event.detail.checked);
        logUpdate('Send course updates', event);
      }} />
    <p>React state: {name || '(empty)'}, updates {checked ? 'enabled' : 'disabled'}</p>
  </div>;
}
export function renderReactDemo(container: HTMLElement): () => void {
  container.innerHTML = `<h1 tabindex="-1">React wrapper example</h1>
    <p>The same native components, with typed React props and events.</p><div id="react-example"></div>
    <pre><code>&lt;ChidoInput inputLabel="First name" value={name}
  onChidoInput={event =&gt; setName(event.detail.value)} /&gt;</code></pre>`;
  const root = createRoot(container.querySelector('#react-example')!);
  root.render(<StrictMode><Example /></StrictMode>);
  return () => root.unmount();
}
