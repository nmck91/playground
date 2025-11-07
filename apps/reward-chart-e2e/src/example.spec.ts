import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect h1 to contain text - the app redirects to /index.html
  await expect(page.locator('h1')).toContainText('Family Reward Chart');
});
