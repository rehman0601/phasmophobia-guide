import { expect, test } from '@playwright/test';

test.describe('evidence tracker', () => {
  test('narrows candidates, supports ruled-out evidence, and encodes state in the URL', async ({ page }) => {
    await page.goto('/tools/evidence-tracker/');
    await expect(page.getByRole('heading', { name: '30 candidates' })).toBeVisible();

    const spiritBox = page.locator('.evidence-toggle', { hasText: 'Spirit Box' });
    await spiritBox.click();
    await expect(page.getByRole('heading', { name: '14 candidates' })).toBeVisible();
    await expect(page).toHaveURL(/has=spirit-box/);

    await spiritBox.click();
    await expect(spiritBox).toHaveAttribute('data-state', 'ruled');
    await expect(page.getByRole('heading', { name: '16 candidates' })).toBeVisible();
    await expect(page).toHaveURL(/not=spirit-box/);
  });

  test('reduced difficulties disable ruled-out evidence', async ({ page }) => {
    await page.goto('/tools/evidence-tracker/');
    const spiritBox = page.locator('.evidence-toggle', { hasText: 'Spirit Box' });
    await spiritBox.click();
    await spiritBox.click();
    await expect(spiritBox).toHaveAttribute('data-state', 'ruled');

    await page.getByRole('button', { name: 'Nightmare' }).click();
    await expect(page.getByRole('button', { name: 'Nightmare' })).toHaveAttribute('aria-pressed', 'true');
    await expect(spiritBox).toHaveAttribute('data-state', 'neutral');
    await expect(page.getByText('Ruled-out evidence is disabled below three shown')).toBeVisible();
  });

  test('custom zero evidence leaves only The Mimic when orbs are found', async ({ page }) => {
    await page.goto('/tools/evidence-tracker/');
    await page.getByRole('button', { name: 'Custom' }).click();
    await page.getByLabel(/Evidence shown/).fill('0');
    await page.locator('.evidence-toggle', { hasText: 'Ghost Orbs' }).click();

    await expect(page.getByRole('heading', { name: '1 candidate' })).toBeVisible();
    await expect(page.locator('.candidate-list li a').first()).toHaveText('The Mimic');
  });

  test('state survives a reload', async ({ page }) => {
    await page.goto('/tools/evidence-tracker/');
    await page.getByRole('button', { name: 'Custom' }).click();
    await page.getByLabel(/Evidence shown/).fill('0');
    await page.locator('.evidence-toggle', { hasText: 'Ghost Orbs' }).click();
    await expect(page).toHaveURL(/has=ghost-orbs/);
    await page.reload();

    await expect(page.getByRole('button', { name: 'Custom' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('heading', { name: '1 candidate' })).toBeVisible();
    await expect(page.locator('.candidate-list li a').first()).toHaveText('The Mimic');
  });

  test('is usable on a phone without horizontal overflow', async ({ page }) => {
    await page.goto('/tools/evidence-tracker/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);
    await page.locator('.evidence-toggle', { hasText: 'EMF Level 5' }).click();
    await expect(page.getByRole('button', { name: /EMF Level 5: found/ })).toBeVisible();
  });
});
