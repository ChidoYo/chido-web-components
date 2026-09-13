import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => { await page.goto('/tests/fixtures/react/'); });

test('all generated wrappers mount from the package export', async ({ page }) => {
  await expect(page.getByRole('textbox', { name: 'Controlled name' })).toHaveValue('Erick');
  await expect(page.getByRole('textbox', { name: 'Notes' })).toHaveValue('Notes default');
  await expect(page.getByRole('combobox', { name: 'Country' })).toHaveValue('mx');
  await expect(page.getByRole('radio', { name: 'Standard', exact: true })).toBeChecked();
  await expect(page.getByRole('note')).toContainText('React adapter loaded');
  await expect(page.getByRole('textbox', { name: 'Native child' })).toHaveAccessibleDescription('Shared field layout');
  await expect(page.getByRole('progressbar', { name: 'Course' })).toHaveJSProperty('value', 2);
});

test('controlled values and typed events update React state once under Strict Mode', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Controlled name' });
  await input.fill('Typed');
  await expect(input).toHaveValue('Typed');
  await expect(page.locator('#name-state')).toHaveText('Typed');
  await expect(page.locator('#events')).toHaveText('1');
  await input.press('Tab');
  await expect(page.locator('#changes')).toHaveText('1');
  await page.getByRole('button', { name: 'Set name', exact: true }).click();
  await expect(input).toHaveValue('Updated');
  await expect(page.locator('#events')).toHaveText('1');
  await page.getByRole('button', { name: 'Replace callback' }).click();
  await input.fill('Latest');
  await expect(page.locator('#received')).toHaveText('second');
});

test('rejected controlled edits are restored and uncontrolled values survive rerenders', async ({ page }) => {
  const locked = page.getByRole('textbox', { name: 'Rejected edits' });
  await locked.fill('Discard this');
  await expect(locked).toHaveValue('Locked');
  const uncontrolled = page.getByRole('textbox', { name: 'Uncontrolled', exact: true });
  await uncontrolled.fill('Keep my edits');
  await page.getByRole('button', { name: 'Change default' }).click();
  await expect(uncontrolled).toHaveValue('Keep my edits');
});

test('optional prop removal restores native defaults without invalid numeric setters', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Attributes' });
  await expect(input).toBeDisabled();
  await expect(input).toHaveJSProperty('minLength', 3);
  await page.getByRole('button', { name: 'Remove optional props' }).click();
  await expect(input).toBeEnabled();
  await expect(input).toHaveJSProperty('minLength', -1);
  await expect(input).toHaveJSProperty('placeholder', '');
});

test('checkbox payloads, select children, element refs, and array props work', async ({ page }) => {
  await page.getByRole('checkbox', { name: 'Accept', exact: true }).check();
  await expect(page.locator('#checked-state')).toHaveText('true');
  await page.getByRole('button', { name: 'Focus notes through ref' }).click();
  await expect(page.getByRole('textbox', { name: 'Notes' })).toBeFocused();
  await page.getByRole('button', { name: 'Add option' }).click();
  const select = page.getByRole('combobox', { name: 'Country' });
  await expect(select).toHaveValue('mx');
  await select.selectOption('ca');
  await expect(page.locator('#choice-state')).toHaveText('ca');
  await page.getByRole('button', { name: 'Show errors' }).click();
  await expect(page.getByRole('link', { name: 'Check the name' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear errors' }).click();
  await expect(page.locator('chido-form-summary section')).toBeHidden();
});

test('unmount cleans event listeners and remount does not duplicate them', async ({ page }) => {
  const old = await page.locator('#controlled').elementHandle();
  await page.getByRole('button', { name: 'Toggle mount' }).click();
  await old!.evaluate(el => el.dispatchEvent(new CustomEvent('chido-input', { detail: { value: 'Detached' } })));
  await expect(page.locator('#events')).toHaveText('0');
  await page.getByRole('button', { name: 'Toggle mount' }).click();
  await page.getByRole('textbox', { name: 'Controlled name' }).fill('Remounted');
  await expect(page.locator('#events')).toHaveText('1');
});
