import { test, expect } from '@playwright/test';
import type { ChidoFormSummary } from '../src/index';

for (const name of ['form-field', 'alert', 'form-summary', 'progress']) {
  test(`${name} demo loads and is reachable from home`, async ({ page }) => {
    await page.goto('/');
    await page.locator(`nav a[href="#/chido-${name}"]`).click();
    await expect(page.locator('h1')).toHaveText(`Chido ${name.replaceAll('-', ' ')}`);
    await page.reload();
    await expect(page.locator('h1')).toHaveText(`Chido ${name.replaceAll('-', ' ')}`);
  });
}

test('form field provides native label, help/error associations, and required behavior', async ({ page }) => {
  await page.goto('/#/chido-form-field');
  const input = page.getByRole('textbox', { name: 'Course title', exact: true });
  await expect(input).toHaveCount(1);
  await expect(input).toHaveAccessibleDescription('Use a short, descriptive title.');
  await expect(input).toHaveJSProperty('required', true);
  await page.getByText('Course title', { exact: true }).click();
  await expect(input).toBeFocused();
  await page.getByRole('button', { name: 'Validate field' }).click();
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(input).toHaveAccessibleDescription('Use a short, descriptive title. Enter a course title.');
  await input.fill('Native browser APIs');
  await expect(input).not.toHaveAttribute('aria-invalid');
  await expect(page.locator('[slot="field-error"]')).toBeHidden();
});

test('form field preserves external descriptions and restores detached native control state', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const field = document.createElement('chido-form-field');
    field.controlLabel = 'Label'; field.helpText = 'Help'; field.required = true;
    const input = document.createElement('input');
    input.setAttribute('aria-describedby', 'external');
    field.append(input); document.body.append(field);
    await new Promise(resolve => setTimeout(resolve, 0));
    const description = input.getAttribute('aria-describedby');
    const assignedId = input.id;
    field.remove();
    return { description, assignedId, restored: input.getAttribute('aria-describedby'), required: input.required, id: input.id };
  });
  expect(result.description).toContain('external');
  expect(result.description).toContain('chido-field-');
  expect(result.assignedId).not.toBe('');
  expect(result.restored).toBe('external');
  expect(result.required).toBe(false);
  expect(result.id).toBe('');
});

test('alerts expose appropriate roles without stealing focus', async ({ page }) => {
  await page.goto('/#/chido-alert');
  const host = page.locator('#announcement');
  await page.getByRole('button', { name: 'Save progress' }).click();
  await expect(host.getByRole('status')).toContainText('Your progress was saved. Save 1.');
  await expect(page.getByRole('button', { name: 'Save progress' })).toBeFocused();
  await host.evaluate(el => { el.setAttribute('variant', 'error'); });
  await expect(host.getByRole('alert')).toBeVisible();
  await host.evaluate(el => el.setAttribute('live', 'off'));
  await expect(host.getByRole('note')).toHaveAttribute('aria-live', 'off');
  await host.evaluate(el => { el.setAttribute('lang', 'es'); el.setAttribute('variant', 'success'); });
  await expect(host.locator('strong')).toHaveText('Éxito');
  await host.evaluate(el => el.removeAttribute('message'));
  await expect(host.locator('[part="alert"]')).toHaveText('');
  await expect(host.locator('[part="alert"]')).toHaveAttribute('data-empty', 'true');
});

test('summary lists errors, focuses itself on request, and focuses linked fields without changing route', async ({ page }) => {
  await page.goto('/#/chido-form-summary');
  const summary = page.locator('chido-form-summary');
  await expect(summary.locator('section')).toBeHidden();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(summary.locator('a')).toHaveCount(2);
  await expect(summary.locator('section')).toBeFocused();
  await summary.getByRole('link', { name: 'Enter a valid email address.' }).click();
  await expect(page.locator('#summary-email')).toBeFocused();
  await expect(page).toHaveURL(/#\/chido-form-summary$/);
  await page.locator('#summary-name').fill('Erick');
  await page.locator('#summary-email').fill('erick@example.com');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(summary.locator('section')).toBeHidden();
});

test('summary can focus existing shadow controls and treats messages as text', async ({ page }) => {
  await page.goto('/#/chido-form-summary');
  await page.evaluate(() => {
    const input = document.createElement('chido-textarea');
    input.controlLabel = 'Additional notes';
    input.id = 'notes';
    document.body.append(input);
    const summary = document.querySelector('chido-form-summary')!;
    summary.errors = [{ target: 'notes', message: '<img src=x onerror=alert(1)>' }];
  });
  const summary = page.locator('chido-form-summary');
  await expect(summary.locator('img')).toHaveCount(0);
  await summary.getByRole('link').click();
  await expect(page.getByRole('textbox', { name: 'Additional notes' })).toBeFocused();
  await summary.evaluate(el => { (el as ChidoFormSummary).errors = []; });
  await expect(summary.locator('section')).toBeHidden();
});

test('progress supports accessible determinate and indeterminate states and clamps values', async ({ page }) => {
  await page.goto('/#/chido-progress');
  const course = page.locator('chido-progress').first();
  const progress = course.getByRole('progressbar', { name: 'Course completion' });
  await expect(progress).toHaveJSProperty('value', 2);
  await expect(progress).toHaveJSProperty('max', 5);
  await expect(progress).toHaveAttribute('aria-valuetext', '2 of 5 lessons complete');
  await page.getByRole('button', { name: 'Complete next lesson' }).click();
  await expect(progress).toHaveJSProperty('value', 3);
  await expect(page.locator('chido-progress').nth(1).locator('progress')).not.toHaveAttribute('value');
  await course.evaluate(el => { el.setAttribute('value', '999'); el.removeAttribute('value-text'); });
  await expect(progress).toHaveJSProperty('value', 5);
  await expect(progress).toHaveAttribute('aria-valuetext', '100%');
  await course.evaluate(el => el.setAttribute('value', '-1'));
  await expect(progress).toHaveJSProperty('value', 0);
  await course.evaluate(el => { el.removeAttribute('value'); el.setAttribute('lang', 'es'); });
  await expect(progress).not.toHaveAttribute('value');
  await expect(progress).toHaveAttribute('aria-valuetext', 'En curso');
});

test('Chido demo buttons preserve Enter submission and disabled completion state', async ({ page }) => {
  await page.goto('/#/chido-form-summary');
  await page.getByRole('textbox', { name: 'Full name', exact: true }).press('Enter');
  await expect(page.locator('chido-form-summary a')).toHaveCount(2);
  await page.goto('/#/chido-form-field');
  await page.getByRole('textbox', { name: 'Course title', exact: true }).press('Enter');
  await expect(page.locator('[slot="field-error"]')).toBeVisible();
  await page.goto('/#/chido-progress');
  const button = page.getByRole('button', { name: 'Complete next lesson' });
  await button.click(); await button.click(); await button.click();
  await expect(button).toBeDisabled();
  await expect(page.locator('#complete')).toHaveJSProperty('localName', 'chido-button');
  await expect(page.locator('#course-progress progress')).toHaveJSProperty('value', 5);
});
