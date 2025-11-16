import { test, expect } from '@playwright/test';

test.describe('Reward Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Open rewards modal
    await page.getByRole('button', { name: /rewards/i }).click();
    await expect(page.getByText('🎁 Reward Menu')).toBeVisible();
  });

  test.describe('View Rewards', () => {
    test('should display kids rewards section', async ({ page }) => {
      await expect(page.getByText("🧒 Kids' Rewards")).toBeVisible();
    });

    test('should display parents rewards section', async ({ page }) => {
      await expect(page.getByText("👨‍👩‍👧‍👦 Parents' Rewards")).toBeVisible();
    });

    test('should display existing rewards with star counts', async ({ page }) => {
      // Check for a specific reward - use first() to avoid strict mode violation since multiple rewards may have same star count
      await expect(page.getByText(/Choose what's for dinner/i)).toBeVisible();
      await expect(page.getByText(/20 ⭐/).first()).toBeVisible();
    });
  });

  test.describe('Add Reward', () => {
    test('should add a new kids reward', async ({ page }) => {
      // Click add button
      const addButtons = await page.getByRole('button', { name: /\+ Add Reward/i }).all();
      await addButtons[0].click(); // First one is for kids

      // Fill in form
      await page.getByPlaceholder(/e\.g\., Extra screen time/i).fill('New Test Reward');
      await page.getByLabel(/Stars Required/i).first().fill('35');

      // Save
      await page.getByRole('button', { name: /^Save$/i }).first().click();

      // Verify reward appears in list
      await expect(page.getByText('New Test Reward')).toBeVisible();
      await expect(page.getByText('35 ⭐')).toBeVisible();
    });

    test('should add a new parent reward', async ({ page }) => {
      // Click add button for parents section
      const addButtons = await page.getByRole('button', { name: /\+ Add Reward/i }).all();
      await addButtons[1].click(); // Second one is for parents

      // Fill in form
      await page.getByPlaceholder(/e\.g\., Coffee in bed/i).fill('Parent Test Reward');
      await page.getByLabel(/Stars Required/i).last().fill('18');

      // Save
      const saveButtons = await page.getByRole('button', { name: /^Save$/i }).all();
      await saveButtons[saveButtons.length - 1].click();

      // Verify reward appears
      await expect(page.getByText('Parent Test Reward')).toBeVisible();
      await expect(page.getByText('18 ⭐')).toBeVisible();
    });

    test('should cancel adding a reward', async ({ page }) => {
      // Click add button
      const addButtons = await page.getByRole('button', { name: /\+ Add Reward/i }).all();
      await addButtons[0].click();

      // Fill in form
      await page.getByPlaceholder(/e\.g\., Extra screen time/i).fill('Cancelled Reward');

      // Click cancel
      await page.getByRole('button', { name: /Cancel/i }).first().click();

      // Verify reward doesn't appear
      await expect(page.getByText('Cancelled Reward')).not.toBeVisible();
    });

    test('should sort rewards by star count after adding', async ({ page }) => {
      // Add a reward with 15 stars (should appear early in list)
      const addButtons = await page.getByRole('button', { name: /\+ Add Reward/i }).all();
      await addButtons[0].click();

      await page.getByPlaceholder(/e\.g\., Extra screen time/i).fill('Low Star Reward');
      await page.getByLabel(/Stars Required/i).first().fill('15');
      await page.getByRole('button', { name: /^Save$/i }).first().click();

      // Get all reward items
      const rewards = await page.locator('.border-teal-500').allTextContents();
      const lowStarIndex = rewards.findIndex(r => r.includes('Low Star Reward'));
      const higherStarIndex = rewards.findIndex(r => r.includes('30 ⭐'));

      // Low star reward should appear before higher star rewards
      if (lowStarIndex !== -1 && higherStarIndex !== -1) {
        expect(lowStarIndex).toBeLessThan(higherStarIndex);
      }
    });
  });

  test.describe('Edit Reward', () => {
    test('should edit a kids reward', async ({ page }) => {
      // Click edit on first reward
      const editButtons = await page.getByRole('button', { name: /^Edit$/i }).all();
      await editButtons[0].click();

      // Modify the reward
      const nameInput = await page.getByLabel(/Reward Name/i).first();
      await nameInput.fill('');
      await nameInput.fill('Edited Reward Name');

      const starsInput = await page.getByLabel(/Stars Required/i).first();
      await starsInput.fill('');
      await starsInput.fill('99');

      // Save
      await page.getByRole('button', { name: /^Save$/i }).first().click();

      // Verify changes
      await expect(page.getByText('Edited Reward Name')).toBeVisible();
      await expect(page.getByText('99 ⭐')).toBeVisible();
    });

    test('should cancel editing a reward', async ({ page }) => {
      // Get original text
      const firstRewardText = await page.locator('.border-teal-500').first().textContent();

      // Click edit
      const editButtons = await page.getByRole('button', { name: /^Edit$/i }).all();
      await editButtons[0].click();

      // Modify
      await page.getByLabel(/Reward Name/i).first().fill('Should Not Save');

      // Cancel
      await page.getByRole('button', { name: /Cancel/i }).first().click();

      // Verify original text is still there
      await expect(page.getByText('Should Not Save')).not.toBeVisible();
    });
  });

  test.describe('Delete Reward', () => {
    test('should delete a reward when confirmed', async ({ page }) => {
      // Get text of first reward before deleting
      const firstRewardText = await page.locator('.border-teal-500').first().textContent();

      // Set up dialog handler to accept
      page.on('dialog', dialog => dialog.accept());

      // Click delete on first reward
      const deleteButtons = await page.getByRole('button', { name: /Delete/i }).all();
      await deleteButtons[0].click();

      // Verify reward is removed
      await expect(page.getByText(firstRewardText || '')).not.toBeVisible();
    });

    test('should not delete a reward when cancelled', async ({ page }) => {
      // Get text of first reward
      const firstRewardText = await page.locator('.border-teal-500').first().textContent();

      // Set up dialog handler to dismiss
      page.on('dialog', dialog => dialog.dismiss());

      // Click delete
      const deleteButtons = await page.getByRole('button', { name: /Delete/i }).all();
      await deleteButtons[0].click();

      // Verify reward is still there
      await expect(page.getByText(firstRewardText || '')).toBeVisible();
    });
  });

  test.describe('Modal Interaction', () => {
    test('should close modal with close button', async ({ page }) => {
      await page.getByRole('button', { name: /×/ }).click();
      await expect(page.getByText('🎁 Reward Menu')).not.toBeVisible();
    });

    test('should close modal with escape key', async ({ page }) => {
      // Focus the modal first to ensure escape key is captured
      await page.locator('[role="dialog"]').filter({ hasText: '🎁 Reward Menu' }).focus();
      await page.keyboard.press('Escape');
      await expect(page.getByText('🎁 Reward Menu')).not.toBeVisible();
    });

    test('should close modal by clicking overlay', async ({ page }) => {
      // Click outside the modal content - filter to only the rewards modal to avoid strict mode violation with settings modal
      await page.locator('[role="dialog"]').filter({ hasText: '🎁 Reward Menu' }).click({ position: { x: 10, y: 10 } });
      await expect(page.getByText('🎁 Reward Menu')).not.toBeVisible();
    });
  });

  test.describe('Validation', () => {
    test('should not save reward with empty name', async ({ page }) => {
      const addButtons = await page.getByRole('button', { name: /\+ Add Reward/i }).all();
      await addButtons[0].click();

      // Try to save with empty name
      await page.getByLabel(/Stars Required/i).first().fill('20');
      await page.getByRole('button', { name: /^Save$/i }).first().click();

      // Form should still be visible (didn't save)
      await expect(page.getByPlaceholder(/e\.g\., Extra screen time/i)).toBeVisible();
    });

    test('should not save reward with zero stars', async ({ page }) => {
      const addButtons = await page.getByRole('button', { name: /\+ Add Reward/i }).all();
      await addButtons[0].click();

      await page.getByPlaceholder(/e\.g\., Extra screen time/i).fill('Test Reward');
      await page.getByLabel(/Stars Required/i).first().fill('0');
      await page.getByRole('button', { name: /^Save$/i }).first().click();

      // Form should still be visible (didn't save)
      await expect(page.getByPlaceholder(/e\.g\., Extra screen time/i)).toBeVisible();
    });
  });
});
