import { test, expect } from '@playwright/test';

test.describe('Contractor Management', () => {
  test.beforeEach(async ({ page }) => {
    // Hide webpack dev server overlay that might block clicks
    await page.addInitScript(() => {
      const style = document.createElement('style');
      style.textContent = `
        #webpack-dev-server-client-overlay,
        iframe[src="about:blank"] {
          display: none !important;
          pointer-events: none !important;
          width: 0 !important;
          height: 0 !important;
          opacity: 0 !important;
        }
      `;
      document.documentElement.appendChild(style);
    });

    // Log in first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'ChangeMe123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard/**');
  });

  test('should support full contractor CRUD flow', async ({ page }) => {
    // Navigate to suppliers list page
    await page.goto('/dashboard/supplies/suppliers');

    // 1. Create a new contractor
    await page.click('button:has-text("Add"), button:has-text("add")');

    // Fill details
    const modal = page.locator('.bg-white.rounded-2xl');
    await modal.locator('input').first().fill('E2E Contractor');
    await modal.locator('input').nth(1).fill('9876543210'); // phone
    await modal.locator('input').nth(2).fill('Test Bank');    // bankName
    await modal.locator('input').nth(3).fill('111222333444'); // accountNumber
    await modal.locator('input').nth(4).fill('1000');          // openingBalance
    await modal.locator('input').nth(5).fill('E2E test contractor notes'); // notes

    // Save
    await page.click('button:has-text("Save")');

    // Wait for the modal to close and check table
    const tableRow = page.locator('table tbody tr:has-text("E2E Contractor")');
    await expect(tableRow).toBeVisible();

    // 2. Edit contractor
    const editBtn = tableRow.locator('button[title*="edit"], button[title*="Edit"], .bg-amber-50').first();
    await editBtn.click();

    // Change name in modal
    await modal.locator('input').first().fill('E2E Contractor Updated');
    await page.click('button:has-text("Save")');

    // Verify change
    const updatedRow = page.locator('table tbody tr:has-text("E2E Contractor Updated")');
    await expect(updatedRow).toBeVisible();

    // 3. Delete contractor
    const deleteBtn = updatedRow.locator('button[title*="delete"], button[title*="Delete"], .bg-red-50').first();
    await deleteBtn.click();

    // Confirm dialog
    await page.click('button:has-text("Confirm")');

    // Verify contractor is deleted
    await expect(page.locator('table tbody tr:has-text("E2E Contractor Updated")')).toBeHidden();
  });
});
