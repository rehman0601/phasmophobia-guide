import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const pages = [
  '/',
  '/ghosts/',
  '/ghosts/deogen/',
  '/evidence/',
  '/evidence/freezing-temperatures/',
  '/tools/evidence-tracker/',
  '/ghost-cheat-sheet/',
  '/compare/',
  '/compare/deogen-vs-revenant/',
  '/about/',
  '/changelog/',
];

for (const path of pages) {
  test(`no automatic accessibility violations: ${path}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}
