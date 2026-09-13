import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['input', 'textarea', 'select', 'checkbox', 'radio-group', 'button', 'form-field', 'alert', 'form-summary', 'progress'];
for (const theme of ['dark', 'light']) {
  for (const route of routes) {
    test(`${route}: ${theme} theme accessibility and narrow layout`, async ({ page }) => {
      await page.goto(`/#/chido-${route}`);
      await page.getByRole('combobox', { name: 'Theme', exact: true }).selectOption(theme);
      const validate = page.getByRole('button', { name: /^(Validate|Continue)/ }).first();
      if (await validate.count()) await validate.click();
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      expect(results.violations).toEqual([]);
      await page.setViewportSize({ width: 320, height: 720 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });
  }
}

test('input keyboard focus and skip link reach their actual targets', async ({ page }) => {
  await page.goto('/#/chido-input');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await page.locator('chido-input').first().evaluate(el => (el as HTMLElement).focus());
  await expect(page.locator('chido-input input').first()).toBeFocused();
  await expect(page.locator('chido-input input').first()).toHaveCSS('outline-style', 'solid');
});

test('React example and documentation are reachable and interactive', async ({ page }) => {
  await page.goto('/#/react');
  await page.getByRole('textbox', { name: 'First name' }).fill('Erick');
  await expect(page.getByText('React state: Erick, updates disabled')).toBeVisible();
  await page.getByRole('checkbox', { name: 'Send course updates' }).check();
  await expect(page.getByText('React state: Erick, updates enabled')).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations).toEqual([]);
  await page.getByRole('link', { name: 'Documentation', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Component documentation' })).toBeVisible();
  await page.locator('summary').click();
  await expect(page.locator('pre')).toContainText('Chido Web Components — Complete Usage Guide');
  const link = await page.locator('#download-guide').getAttribute('href');
  expect((await page.request.get(link!)).ok()).toBe(true);
});
