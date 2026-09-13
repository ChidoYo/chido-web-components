import { createElement, forwardRef, useLayoutEffect, useRef } from 'react';
import type { HTMLAttributes, ForwardRefExoticComponent, PropsWithoutRef, RefAttributes } from 'react';

interface PropertyBinding {
  name: string;
  attribute?: string;
  initialOnly?: boolean;
  controlled?: boolean;
}

/** React integration only. Native component code never imports this adapter. */
export function createComponent<Element extends HTMLElement, Props extends HTMLAttributes<Element>>(
  tag: string,
  bindings: readonly PropertyBinding[],
  events: Readonly<Record<string, string>>,
): ForwardRefExoticComponent<PropsWithoutRef<Props> & RefAttributes<Element>> {
  const propertyNames = new Set(bindings.map(binding => binding.name));
  const Wrapper = forwardRef<Element, Props>((props, forwardedRef) => {
    const elementRef = useRef<Element | null>(null);
    const latest = useRef(props);
    const previous = useRef<Record<string, unknown>>({});
    const defaults = useRef<Record<string, unknown>>({});
    const initialized = useRef(false);

    // Apply on every commit: controlled values must also recover from edits when
    // a parent rerenders with the same prop value. Avoid equal-value assignments.
    useLayoutEffect(() => {
      latest.current = props;
      const element = elementRef.current;
      if (!element) return;
      for (const binding of bindings) {
        const value: unknown = Reflect.get(props, binding.name);
        if (!initialized.current) defaults.current[binding.name] = Reflect.get(element, binding.name);
        if (binding.initialOnly && initialized.current) continue;
        if (value !== undefined && value !== null) {
          if (!Object.is(Reflect.get(element, binding.name), value)) Reflect.set(element, binding.name, value);
        } else if (Object.hasOwn(previous.current, binding.name)) {
          if (binding.attribute) element.removeAttribute(binding.attribute);
          else if (!binding.controlled) Reflect.set(element, binding.name, defaults.current[binding.name]);
        }
      }
      initialized.current = true;
      previous.current = Object.fromEntries(bindings.filter(binding => Reflect.get(props, binding.name) != null)
        .map(binding => [binding.name, Reflect.get(props, binding.name)]));
    });

    useLayoutEffect(() => {
      const element = elementRef.current;
      if (!element) return;
      let active = true;
      const listeners = Object.entries(events).map(([prop, eventName]) => {
        const listener = (event: Event): void => {
          const handler: unknown = Reflect.get(latest.current, prop);
          if (typeof handler === 'function') handler(event);
          // Wait for the full native input/change sequence and React's commit.
          // A microtask can run between those events and undo a checkbox click.
          // Restore rejected controlled edits even if React does not rerender.
          window.setTimeout(() => {
            if (!active) return;
            for (const binding of bindings) {
              if (!binding.controlled) continue;
              const value: unknown = Reflect.get(latest.current, binding.name);
              if (value != null && !Object.is(Reflect.get(element, binding.name), value)) Reflect.set(element, binding.name, value);
            }
          }, 0);
        };
        element.addEventListener(eventName, listener);
        return () => element.removeEventListener(eventName, listener);
      });
      return () => { active = false; listeners.forEach(remove => remove()); };
    }, []);

    // Expose the actual custom element after layout synchronization, not a facade.
    useLayoutEffect(() => {
      const element = elementRef.current;
      if (typeof forwardedRef === 'function') {
        const cleanup: unknown = forwardedRef(element);
        return () => { if (typeof cleanup === 'function') cleanup(); else forwardedRef(null); };
      }
      if (forwardedRef) forwardedRef.current = element;
      return () => { if (forwardedRef) forwardedRef.current = null; };
    }, [forwardedRef]);

    const hostProps: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(props)) {
      if (!propertyNames.has(key) && !Object.hasOwn(events, key)) hostProps[key] = value;
    }
    return createElement(tag, { ...hostProps, ref: elementRef });
  });
  Wrapper.displayName = tag;
  return Wrapper;
}
