import { test, expect } from '@playwright/test';

test.describe('Extracts Wizard', () => {
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

  test('should support creating an extract via wizard', async ({ page }) => {
    // Navigate to Create Extract page
    await page.goto('/dashboard/extracts/create');

    // 1. Fill Step 1 Basic Data
    await page.fill('input[type="date"] >> nth=0', '2026-07-01');
    await page.fill('input[type="date"] >> nth=1', '2026-07-05');

    // Add Site inline
    await page.click('input[placeholder*="site"], input[placeholder*="Site"]');
    await page.click('text=+ Add New Site, text=+ add new site');
    await page.fill('input[placeholder*="site name"], input[placeholder*="Site Name"]', 'Extract Site A');
    await page.click('button:has-text("Add"), button:has-text("add")');

    // Add Contractor inline
    await page.click('input[placeholder*="contractor"], input[placeholder*="Contractor"]');
    await page.click('text=+ Add New, text=+ add new');
    await page.fill('input[placeholder*="contractor name"], input[placeholder*="Name"] >> nth=1', 'Extract Contractor A');
    await page.click('button:has-text("Add"), button:has-text("add") >> nth=1');

    // Add Crusher inline
    await page.click('input[placeholder*="crusher"], input[placeholder*="Crusher"]');
    await page.click('text=+ Add New, text=+ add new');
    await page.fill('input[placeholder*="crusher name"], input[placeholder*="Name"] >> nth=2', 'Extract Crusher A');
    await page.click('button:has-text("Add"), button:has-text("add") >> nth=2');

    // Click Next
    await page.click('button:has-text("Next"), button:has-text("next")');

    // 2. Step 2 Data (Lines)
    await expect(page.locator('h3:has-text("Step 2")')).toBeVisible();

    // Click Save
    await page.click('button:has-text("Save"), button:has-text("save")');

    // Wait for redirect to extracts list
    await page.waitForURL('**/dashboard/extracts');
  });
});
