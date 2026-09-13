import { en } from './en';
import { es } from './es';
import type { Messages } from './en';

export type Locale = 'en' | 'es';
const dictionaries: Record<Locale, Messages> = { en, es };
let locale: Locale = 'en';
const listeners = new Set<() => void>();

/** Regional variants use their base language; unsupported languages use English. */
export function resolveLocale(language: string): Locale {
  return language.trim().toLowerCase().split('-')[0] === 'es' ? 'es' : 'en';
}

export function getLocale(): Locale { return locale; }

export function setLocale(language: string): void {
  const next = resolveLocale(language);
  if (next === locale) return;
  locale = next;
  for (const listener of listeners) listener();
}

export function translate(key: keyof Messages, language: string = locale): string {
  return dictionaries[resolveLocale(language)][key];
}

export function subscribeLocale(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
