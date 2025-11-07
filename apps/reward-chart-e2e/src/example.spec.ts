import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect h1 to contain the app title
  await expect(page.locator('h1')).toContainText('Our Family Reward Chart');
});

test('displays kids chart section', async ({ page }) => {
  await page.goto('/');

  // Check that the kids chart section is visible
  await expect(page.getByText("Kids' Chart")).toBeVisible();
});

test('displays parent rating section', async ({ page }) => {
  await page.goto('/');

  // Check that the parents section header is visible
  await expect(page.getByText('Rate Mum & Dad!')).toBeVisible();
});
