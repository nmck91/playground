import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect the main page h1 (not the header h1) to contain the title
  expect(await page.locator('h1.text-5xl').innerText()).toContain('Last Player Standing');
});
