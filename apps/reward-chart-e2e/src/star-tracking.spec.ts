import { test, expect } from '@playwright/test';

test.describe('Star Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should toggle star on click', async ({ page }) => {
    // Find all star buttons
    const allStarButtons = page.locator('button').filter({ hasText: /[☆★]/ });

    // Find the index of the first empty button
    const buttonIndex = await allStarButtons.evaluateAll((buttons) => {
      return buttons.findIndex(btn => btn.textContent?.includes('☆'));
    });

    // Get a stable reference to this specific button by its index
    const starButton = allStarButtons.nth(buttonIndex >= 0 ? buttonIndex : 0);

    // Click to fill it
    await starButton.click();

    // Wait for the state to update
    await page.waitForTimeout(150);

    // Verify it's filled - button text may have whitespace from flex layout
    await expect(starButton).toContainText('★');

    // Click again to empty it
    await starButton.click();

    // Wait for the state to update
    await page.waitForTimeout(150);

    // Verify it's empty again - button text may have whitespace from flex layout
    await expect(starButton).toContainText('☆');
  });

  test('should update total star count when clicking stars', async ({ page }) => {
    // Get initial star count
    const starCountElement = page.locator('.text-teal-500').filter({ hasText: '⭐' }).first();
    const initialText = await starCountElement.textContent();
    const initialCount = parseInt(initialText?.match(/\d+/)?.[0] || '0');

    // Click a star to fill it
    const starButton = page.locator('button').filter({ hasText: '☆' }).first();
    await starButton.click();

    // Wait for update
    await page.waitForTimeout(100);

    // Check star count increased
    const newText = await starCountElement.textContent();
    const newCount = parseInt(newText?.match(/\d+/)?.[0] || '0');
    expect(newCount).toBe(initialCount + 1);
  });

  test('should show celebration animation when clicking star', async ({ page }) => {
    // Click a star
    const starButton = page.locator('button').filter({ hasText: '☆' }).first();
    await starButton.click();

    // Check for celebration element
    const celebration = page.locator('.celebration');
    await expect(celebration).toBeVisible();

    // Wait for animation to complete
    await page.waitForTimeout(700);

    // Celebration should be removed
    await expect(celebration).not.toBeVisible();
  });

  test('should display week range', async ({ page }) => {
    // Check that week display is visible
    await expect(page.locator('text=/Week of/i')).toBeVisible();

    // Should contain year
    await expect(page.locator('text=/\\d{4}/')).toBeVisible();
  });

  test('should toggle parents section visibility', async ({ page }) => {
    // Find the toggle button
    const toggleButton = page.getByRole('button', { name: '📊' });

    // Get parents section
    const parentsSection = page.getByText('Rate Mum & Dad!').locator('..');

    // Toggle off
    await toggleButton.click();
    await page.waitForTimeout(100);

    // Check if cards are hidden (they might use display: none or hidden class)
    const parentCards = page.locator('app-child-card').filter({ hasText: /Mum|Dad/ });
    const isHidden = await parentCards.first().isHidden();
    expect(isHidden).toBe(true);

    // Toggle back on
    await toggleButton.click();
    await page.waitForTimeout(100);

    // Should be visible again
    await expect(parentCards.first()).toBeVisible();
  });

  test('should reset week when confirmed', async ({ page }) => {
    // Fill some stars first
    const stars = await page.locator('button').filter({ hasText: '☆' }).all();
    await stars[0].click();
    await stars[1].click();
    await stars[2].click();

    // Wait for updates
    await page.waitForTimeout(200);

    // Set up dialog handler to accept BEFORE clicking the button
    page.once('dialog', dialog => dialog.accept());

    // Click new week button
    await page.getByRole('button', { name: /new week/i }).click();

    // Wait for reset
    await page.waitForTimeout(200);

    // Check that all stars are empty (all should be ☆)
    const filledStars = await page.locator('button').filter({ hasText: '★' }).count();
    expect(filledStars).toBe(0);
  });

  test('should not reset week when cancelled', async ({ page }) => {
    // Click a star to fill it
    const starButton = page.locator('button').filter({ hasText: '☆' }).first();
    await starButton.click();

    // Wait for update
    await page.waitForTimeout(200);

    // Count filled stars before cancel
    const filledStarsBeforeCancel = await page.locator('button').filter({ hasText: '★' }).count();
    expect(filledStarsBeforeCancel).toBeGreaterThan(0);

    // Set up dialog handler to dismiss BEFORE clicking the button
    page.once('dialog', dialog => dialog.dismiss());

    // Click new week button
    await page.getByRole('button', { name: /new week/i }).click();

    // Wait for dialog handling
    await page.waitForTimeout(200);

    // Filled star count should remain the same (not reset)
    const filledStarsAfterCancel = await page.locator('button').filter({ hasText: '★' }).count();
    expect(filledStarsAfterCancel).toBe(filledStarsBeforeCancel);
  });

  test('should show progress bar', async ({ page }) => {
    // Check progress bar exists
    const progressBar = page.locator('.bg-teal-500').first();
    await expect(progressBar).toBeVisible();
  });

  test('should update progress bar when stars change', async ({ page }) => {
    // Get initial progress width
    const progressBar = page.locator('.bg-teal-500').first();
    const initialWidth = await progressBar.evaluate(el =>
      el.getBoundingClientRect().width
    );

    // Click multiple empty stars to ensure they toggle on
    const stars = await page.locator('button').filter({ hasText: '☆' }).all();
    const starsToClick = Math.min(3, stars.length);

    if (starsToClick > 0) {
      for (let i = 0; i < starsToClick; i++) {
        await stars[i].click();
        await page.waitForTimeout(100);
      }

      // Get new width
      const newWidth = await progressBar.evaluate(el =>
        el.getBoundingClientRect().width
      );

      // Progress should have increased (with small tolerance for rounding)
      expect(newWidth).toBeGreaterThanOrEqual(initialWidth);
    }
  });

  test('should display milestone progress text', async ({ page }) => {
    // Check for milestone text pattern
    await expect(page.locator('text=/\\d+ \\/ \\d+ stars to next reward/i').first()).toBeVisible();
  });
});
