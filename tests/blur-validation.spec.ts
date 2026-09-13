import { test, expect } from '@playwright/test';

for (const tag of ['input', 'textarea', 'select', 'checkbox', 'radio-group', 'form-field']) {
  test(`${tag} validates on leaving focus without stealing it`, async ({ page }) => {
    await page.goto('/');
    await page.locator('#page').evaluate((container, tag) => {
      const attributes = tag === 'input' ? 'input-label="Test"' : 'control-label="Test"';
      const children = tag === 'select' ? '<option value="">Choose</option><option value="yes">Yes</option>'
        : tag === 'radio-group' ? '<option value="a">A</option><option value="b">B</option>'
        : tag === 'form-field' ? '<input />' : '';
      container.innerHTML = `<chido-${tag} ${attributes} required>${children}</chido-${tag}><button id="next">Next</button>`;
    }, tag);
    const host = page.locator(`#page chido-${tag}`);
    const control = host.locator('input, textarea, select').first();
    const message = host.locator(tag === 'form-field' ? '[slot="field-error"]' : '#validation-message');
    await expect(message).toBeHidden();
    await control.focus();
    if (tag === 'radio-group') {
      await host.locator('input').nth(1).focus();
      await expect(message).toBeHidden();
    }
    await page.keyboard.press('Tab');
    await expect(page.locator('#next')).toBeFocused();
    await expect(message).toHaveText('Required');
    await expect(message).toBeVisible();
    await expect(control).toHaveAttribute('aria-invalid', 'true');
    if (tag === 'checkbox' || tag === 'radio-group') await control.check();
    else if (tag === 'select') await control.selectOption('yes');
    else await control.fill('Valid');
    await expect(message).toBeHidden();
  });
}

test('read-only and disabled inputs do not show required errors on blur', async ({ page }) => {
  await page.goto('/');
  await page.locator('#page').evaluate(container => {
    container.innerHTML = '<chido-input input-label="Reference" required readonly></chido-input><chido-textarea control-label="Notes" required readonly></chido-textarea><chido-checkbox control-label="Disabled" required disabled></chido-checkbox><button id="next">Next</button>';
  });
  for (const tag of ['input', 'textarea']) {
    const control = page.locator(`#page chido-${tag}`).locator('input, textarea');
    await control.focus();
    await page.keyboard.press('Tab');
    await expect(page.locator(`#page chido-${tag} #validation-message`)).toBeHidden();
  }
  await expect(page.locator('#next')).toBeFocused();
  await expect(page.locator('#page chido-checkbox #validation-message')).toBeHidden();
});
