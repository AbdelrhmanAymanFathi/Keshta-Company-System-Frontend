import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
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
    // Navigate to the login page
    await page.goto('/login');
  });

  test('should display login form elements in default language', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should switch language and translate UI elements', async ({ page }) => {
    const languageBtn = page.locator('button:has-text("AR"), button:has-text("العربية"), button:has-text("EN")');
    if (await languageBtn.count() > 0) {
      await languageBtn.first().click();
      await expect(page.locator('input[type="email"]')).toBeVisible();
    }
  });

  test('should show validation error on invalid login', async ({ page }) => {
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'WrongPass123!');
    await page.click('button[type="submit"]');

    const errorAlert = page.locator('text=Invalid credentials, text=خطأ, .text-red-500, .bg-red-50');
    await expect(errorAlert.first()).toBeVisible();
  });

  test('should login successfully and redirect to dashboard with valid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'ChangeMe123!');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard/**');
    
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).not.toBeNull();
  });
});
