import { test, expect } from '@playwright/test';

test.describe('Item Management', () => {
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

    // Standard E2E Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'ChangeMe123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard/**');
  });

  test('should support full item CRUD flow', async ({ page }) => {
    // Navigate to Items list page
    await page.goto('/dashboard/supplies/items');

    // 1. Create a new Item
    await page.click('button:has-text("Add Item"), button:has-text("newItem")');
    await page.fill('input[placeholder*="item name"], input[placeholder*="Item Name"], input[type="text"]', 'E2E Sand');
    
    // Select unit if option is available
    const unitSelect = page.locator('select');
    if (await unitSelect.count() > 0) {
      await unitSelect.selectOption({ index: 1 }); // select first unit option (e.g. m³)
    }

    await page.fill('input[placeholder*="price"], input[type="number"]', '120.00');
    await page.click('button:has-text("Save"), button[type="submit"]');

    // Verify it appears in the table
    const tableRow = page.locator('table tbody tr:has-text("E2E Sand")');
    await expect(tableRow).toBeVisible();

    // 2. Update the item
    // Click edit button
    const editBtn = tableRow.locator('button .w-5.h-5').first();
    await editBtn.click();

    // Modify price
    await page.fill('input[placeholder*="price"], input[type="number"]', '140.00');
    await page.click('button:has-text("Save"), button[type="submit"]');

    // Verify updated price is shown
    await expect(tableRow).toContainText('140');

    // 3. Delete the item
    const deleteBtn = tableRow.locator('button').nth(1);
    await deleteBtn.click();

    // Click confirm in the ConfirmDialog
    await page.click('button:has-text("Confirm")');

    // Verify item is gone
    await expect(page.locator('table tbody tr:has-text("E2E Sand")')).toBeHidden();
  });
});
