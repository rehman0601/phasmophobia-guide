import { expect, test } from '@playwright/test';

test.describe('core pages', () => {
  test('home page states what the site is', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/DEAD AIR/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Know what is in the dark');
    await expect(page.getByRole('link', { name: 'Open the evidence tracker' }).first()).toBeVisible();
  });

  test('ghost index searches and filters', async ({ page }) => {
    await page.goto('/ghosts/');
    await expect(page.locator('#ghost-grid .card')).toHaveCount(30);

    await page.getByLabel('Search', { exact: true }).fill('deogen');
    await expect(page.locator('#ghost-grid .card:visible')).toHaveCount(1);
    await expect(page.locator('#ghost-count')).toHaveText('1');

    await page.getByLabel('Search', { exact: true }).fill('');
    await page.getByLabel('Show').selectOption('forced-evidence');
    await expect(page.locator('#ghost-grid .card:visible')).toHaveCount(5);

    await page.getByLabel('Show').selectOption('');
    await page.getByLabel('Evidence').selectOption('dots-projector');
    await expect(page.locator('#ghost-grid .card:visible')).toHaveCount(13);
  });

  test('ghost detail shows evidence, behavior, and FAQ', async ({ page }) => {
    await page.goto('/ghosts/deogen/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Deogen');
    await expect(page.locator('dt').filter({ hasText: 'Guaranteed' }).first()).toBeVisible();
    await expect(page.getByText('3.0 m/s at distance').first()).toBeVisible();

    const question = page.getByText('How fast is Deogen?');
    await question.click();
    await expect(page.getByText('Its hunt sanity threshold is 40%.').last()).toBeVisible();
  });

  test('cheat sheet lists all 30 ghosts without page overflow', async ({ page }) => {
    await page.goto('/ghost-cheat-sheet/');
    await expect(page.locator('tbody tr')).toHaveCount(30);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('evidence page names the ghosts that force it', async ({ page }) => {
    await page.goto('/evidence/freezing-temperatures/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Freezing Temperatures');
    await expect(page.getByText('Guaranteed for Hantu')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Hantu' }).first()).toBeVisible();
  });

  test('comparison page lines both ghosts up', async ({ page }) => {
    await page.goto('/compare/deogen-vs-revenant/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Deogen vs Revenant');
    const table = page.locator('table');
    await expect(table.getByRole('link', { name: 'Deogen' })).toBeVisible();
    await expect(table.getByRole('link', { name: 'Revenant' })).toBeVisible();
  });

  test('missing page returns 404', async ({ request }) => {
    const response = await request.get('/this-page-does-not-exist/');
    expect(response.status()).toBe(404);
  });
});
