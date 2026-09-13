import { test, expect } from '@playwright/test';
import type { ChidoTextarea, ChidoSelect, ChidoCheckbox, ChidoRadioGroup, ChidoButton } from '../src/index';

test('all demo routes support navigation, reload, and browser history', async ({ page }) => {
  await page.goto('/');
  for (const name of ['input', 'textarea', 'select', 'checkbox', 'radio-group', 'button']) {
    await page.locator(`nav a[href="#/chido-${name}"]`).click();
    await expect(page.locator('h1')).toHaveText(`Chido ${name.replace('-', ' ')}`, { ignoreCase: true });
    await expect(page.locator(`nav a[href="#/chido-${name}"]`)).toHaveAttribute('aria-current', 'page');
    await page.reload();
    await expect(page.locator(`chido-${name}`).first()).toBeVisible();
  }
  await page.goBack();
  await expect(page).toHaveURL(/chido-radio-group/);
});

test('textarea has native editing, default/live values, and localized inline validation', async ({ page }) => {
  await page.goto('/#/chido-textarea');
  const host = page.locator('chido-textarea').first();
  const input = host.getByRole('textbox', { name: 'Message' });
  await page.getByRole('button', { name: 'Validate controls' }).click();
  await expect(host.locator('#validation-message')).toHaveText('Required');
  await page.getByRole('combobox', { name: 'Validation language', exact: true }).selectOption('es');
  await expect(host.locator('#validation-message')).toHaveText('Obligatorio');
  await input.fill('A sufficiently long message');
  await expect(host.locator('#validation-message')).toBeHidden();
  await expect(page.locator('#event')).toContainText('A sufficiently long message');
  await host.evaluate(el => {
    const control = el as ChidoTextarea;
    control.defaultValue = 'Default';
    control.value = 'Live text';
    control.defaultValue = 'Another default';
  });
  await expect(input).toHaveValue('Live text');
  await host.evaluate(el => { (el as ChidoTextarea).disabled = true; });
  await expect(input).toBeDisabled();
  await host.evaluate(el => el.removeAttribute('disabled'));
  await expect(input).toBeEnabled();
  await host.evaluate(el => { (el as ChidoTextarea).readOnly = true; });
  await expect(input).not.toBeEditable();
  await input.focus();
  await expect(input).toBeFocused();
});

test('select accepts option children, updates dynamic options, and preserves edited values', async ({ page }) => {
  await page.goto('/#/chido-select');
  const host = page.locator('#page chido-select:not(#language)').first();
  const select = host.getByRole('combobox', { name: 'Country' });
  await page.locator('#validate').click();
  await expect(host.locator('#validation-message')).toHaveText('Required');
  await select.selectOption('mx');
  await expect(host.locator('#validation-message')).toBeHidden();
  await expect(page.locator('#event')).toContainText('"value":"mx"');
  await host.evaluate(el => {
    const option = document.createElement('option');
    option.value = 'uk'; option.textContent = 'United Kingdom';
    el.append(option);
    (el as ChidoSelect).defaultValue = 'us';
  });
  await expect(select.locator('option')).toHaveCount(5);
  await expect(select).toHaveValue('mx');
  await select.selectOption('uk');
  await host.evaluate(el => {
    el.querySelector('option[value="uk"]')!.textContent = 'UK';
  });
  await expect(select.locator('option[value="uk"]')).toHaveText('UK');
  await expect(select).toHaveValue('uk');
});

test('checkbox reflects default checked state but preserves live edits and emits checked payloads', async ({ page }) => {
  await page.goto('/#/chido-checkbox');
  const host = page.locator('chido-checkbox').first();
  const checkbox = host.getByRole('checkbox', { name: 'I accept the terms' });
  await page.locator('#validate').click();
  await expect(host.locator('#validation-message')).toHaveText('Required');
  await checkbox.check();
  await expect(host.locator('#validation-message')).toBeHidden();
  await expect(page.locator('#event')).toContainText('"checked":true');
  await host.evaluate(el => {
    const control = el as ChidoCheckbox;
    control.defaultChecked = true;
    control.checked = false;
    control.defaultChecked = false;
    control.defaultChecked = true;
  });
  await expect(checkbox).not.toBeChecked();
  await host.evaluate(el => el.setAttribute('disabled', 'false'));
  await expect(checkbox).toBeDisabled();
  await host.evaluate(el => el.removeAttribute('disabled'));
  await expect(checkbox).toBeEnabled();
  await host.evaluate(el => { (el as ChidoCheckbox).indeterminate = true; });
  await expect(checkbox).toHaveJSProperty('indeterminate', true);
});

test('radio groups have accessible legends, native arrow navigation, and independent selections', async ({ page }) => {
  await page.goto('/#/chido-radio-group');
  const host = page.locator('chido-radio-group').first();
  await expect(host.getByRole('group', { name: 'Delivery method' })).toBeVisible();
  await page.locator('#validate').click();
  await expect(host.locator('#validation-message')).toHaveText('Required');
  const standard = host.getByRole('radio', { name: 'Standard delivery' });
  const express = host.getByRole('radio', { name: 'Express delivery' });
  await standard.check();
  await standard.press('ArrowRight');
  await expect(express).toBeChecked();
  await expect(host.locator('#validation-message')).toBeHidden();
  await expect(page.locator('chido-radio-group').nth(1).getByRole('radio', { name: 'Email', exact: true })).toBeChecked();
  await host.evaluate(el => { (el as ChidoRadioGroup).disabled = true; });
  await expect(express).toBeDisabled();
  await host.evaluate(el => { (el as ChidoRadioGroup).disabled = false; });
  await expect(express).toBeEnabled();
  await expect(host.getByRole('radio', { name: 'Pickup (unavailable)' })).toBeDisabled();
});

test('button has slotted text, native keyboard activation, and disabled click behavior', async ({ page }) => {
  await page.goto('/#/chido-button');
  const host = page.locator('#action');
  const button = host.getByRole('button', { name: 'Save changes' });
  await button.focus();
  await button.press('Enter');
  await button.press('Space');
  await expect(page.locator('#result')).toHaveText('Save activated 2 time(s).');
  await host.evaluate(el => {
    const button = el as ChidoButton;
    button.disabled = true;
    button.click();
  });
  await expect(button).toBeDisabled();
  await expect(page.locator('#result')).toHaveText('Save activated 2 time(s).');
});

for (const kind of ['textarea', 'select', 'checkbox', 'radio-group']) {
  test(`${kind} handles labels, custom messages, runtime language, styling, and reconnection`, async ({ page }) => {
    await page.goto(`/#/chido-${kind}`);
    const host = page.locator(`#page chido-${kind}:not(#language)`).first();
    await host.evaluate(el => el.removeAttribute('control-label'));
    await expect(host.locator('#validation-message')).toContainText('control-label');
    await host.evaluate(el => {
      el.setAttribute('control-label', 'Restored label');
      el.setAttribute('validation-text', 'Custom error');
      el.setAttribute('lang', 'es');
      (el as ChidoTextarea).reportValidity();
    });
    await expect(host.locator('#validation-message')).toHaveText('Custom error');
    await host.evaluate(el => el.removeAttribute('validation-text'));
    await expect(host.locator('#validation-message')).toHaveText('Obligatorio');
    await host.evaluate(el => {
      const parent = el.parentElement!;
      el.remove(); parent.prepend(el);
    });
    await page.getByRole('combobox', { name: 'Validation language', exact: true }).selectOption('en');
    await expect(host.locator('#validation-message')).toHaveText('Obligatorio');
    await host.evaluate((el, kind) => {
      el.removeAttribute('lang');
      (el as HTMLElement).style.setProperty(`--chido-${kind}-validation-color`, 'rgb(1, 2, 3)');
    }, kind);
    await expect(host.locator('#validation-message')).toHaveText('Required');
    await expect(host.locator('#validation-message')).toHaveCSS('color', 'rgb(1, 2, 3)');
  });
}

test('select and radio values assigned before connection are retained when options load', async ({ page }) => {
  await page.goto('/');
  for (const tag of ['chido-select', 'chido-radio-group'] as const) {
    const result = await page.evaluate(tag => {
      const el = document.createElement(tag);
      el.controlLabel = 'Created programmatically';
      el.value = 'b';
      el.innerHTML = '<option value="a">A</option><option value="b">B</option>';
      document.body.append(el);
      return el.value;
    }, tag);
    expect(result).toBe('b');
  }
});

test('events cross an enclosing shadow root and property writes remain silent', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    const wrapper = document.createElement('div');
    const root = wrapper.attachShadow({ mode: 'open' });
    const control = document.createElement('chido-textarea');
    control.controlLabel = 'Nested textarea';
    root.append(control);
    document.body.append(wrapper);
    document.addEventListener('chido-input', event => {
      const custom = event as CustomEvent<{ value: string }>;
      document.body.dataset.received = JSON.stringify({ value: custom.detail.value, composed: custom.composed });
    });
    control.value = 'Programmatic';
  });
  await expect(page.locator('body')).not.toHaveAttribute('data-received');
  await page.getByRole('textbox', { name: 'Nested textarea' }).fill('Typed');
  await expect(page.locator('body')).toHaveAttribute('data-received', JSON.stringify({ value: 'Typed', composed: true }));
});

test('chido-input emits input and change across shadow roots without duplicating after reconnection', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    const wrapper = document.createElement('div');
    const shadow = wrapper.attachShadow({ mode: 'open' });
    const control = document.createElement('chido-input') as HTMLElement & { value: string };
    control.setAttribute('input-label', 'Event test');
    shadow.append(control);
    document.body.append(wrapper);
    control.remove(); shadow.append(control);
    for (const type of ['chido-input', 'chido-change', 'input']) {
      let count = 0;
      document.addEventListener(type, event => {
        document.body.setAttribute(`data-${type}-count`, String(++count));
        if (type !== 'input') {
          const custom = event as CustomEvent<{ value: string }>;
          document.body.setAttribute(`data-${type}`, JSON.stringify({
            value: custom.detail.value, bubbles: custom.bubbles, composed: custom.composed,
          }));
        }
      });
    }
    control.value = 'Programmatic';
    control.setAttribute('value', 'Default');
  });
  const body = page.locator('body');
  await expect(body).not.toHaveAttribute('data-chido-input-count');
  await expect(body).not.toHaveAttribute('data-chido-change-count');
  const input = page.getByRole('textbox', { name: 'Event test' });
  await input.fill('Typed');
  await expect(body).toHaveAttribute('data-chido-input-count', '1');
  await expect(body).toHaveAttribute('data-input-count', '1');
  await expect(body).not.toHaveAttribute('data-chido-change-count');
  await input.press('Tab');
  await expect(body).toHaveAttribute('data-chido-change-count', '1');
  for (const type of ['chido-input', 'chido-change']) {
    await expect(body).toHaveAttribute(`data-${type}`, JSON.stringify({ value: 'Typed', bubbles: true, composed: true }));
  }
});

test('Chido settings selects switch themes and preserve validation language across routes', async ({ page }) => {
  await page.goto('/#/chido-input');
  await expect(page.locator('#theme')).toHaveJSProperty('localName', 'chido-select');
  await page.getByRole('combobox', { name: 'Theme', exact: true }).selectOption('light');
  await expect(page.locator('html')).toHaveAttribute('data-chido-theme', 'light');
  await page.getByRole('combobox', { name: 'Validation language', exact: true }).selectOption('es');
  await page.getByRole('button', { name: 'Validate inputs' }).click();
  await expect(page.locator('chido-input #validation-message').first()).toHaveText('Obligatorio');
  await page.locator('nav a[href="#/chido-select"]').click();
  await expect(page.getByRole('combobox', { name: 'Validation language', exact: true })).toHaveValue('es');
  await expect(page.getByRole('combobox', { name: 'Theme', exact: true })).toHaveValue('light');
  await page.getByRole('button', { name: 'Validate controls' }).click();
  await expect(page.locator('#page chido-select:not(#language) #validation-message').first()).toHaveText('Obligatorio');
  await expect(page.locator('#event')).toHaveText('Waiting for interaction');
});
