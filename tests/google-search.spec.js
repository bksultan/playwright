// tests/login.spec.js
const { test, expect } = require('@playwright/test');

// Base URL for convenience
const BASE = 'https://opensource-demo.orangehrmlive.com/web/index.php';

// Re-usable helper for navigation → always wait for XHRs to settle
async function gotoLogin(page) {
  await page.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle' });
}

test.describe('OrangeHRM – Login page', () => {

  // 1️⃣  Successful login with valid credentials
  test('valid credentials → dashboard visible', async ({ page }) => {
    await gotoLogin(page);
    await page.fill('input[name="username"]', 'Admin');
    await page.fill('input[name="password"]', 'admin123');

    // press Enter & wait for redirect
    await Promise.all([
      page.waitForURL(`${BASE}/dashboard/**`, { timeout: 10_000 }),
      page.press('input[name="password"]', 'Enter')
    ]);

    await expect(page.locator('h6:has-text("Dashboard")')).toBeVisible();
  });

  // 2️⃣  Invalid password shows error banner
  test('invalid password → “Invalid credentials” message', async ({ page }) => {
    await gotoLogin(page);
    await page.fill('input[name="username"]', 'Admin');
    await page.fill('input[name="password"]', 'wrongPass!');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(3000);

    await expect(page.locator('.oxd-alert-content--error')).toHaveText(/Invalid credentials/i);
  });

  // 3️⃣  Blank username & password show “Required” validation
  test('empty submission → required-field validation', async ({ page }) => {
    await gotoLogin(page);
    await page.click('button[type="submit"]');

    const required = page.getByText('Required', { exact: true });
    await page.waitForTimeout(3000);
    await expect(required).toHaveCount(2);          // username & password each flagged
  });

  // 4️⃣  Password field is masked (type="password")
  test('password input is masked', async ({ page }) => {
    await gotoLogin(page);
    const pwd = page.locator('input[name="password"]');
    await page.waitForTimeout(3000);
    await expect(pwd).toHaveAttribute('type', 'password');
  });

  // 5️⃣  “Forgot your password?” link navigates to reset screen
  test('forgot-password link opens Reset Password page', async ({ page }) => {
    await gotoLogin(page);
    await Promise.all([
      page.waitForURL(`${BASE}/auth/requestPasswordResetCode`, { timeout: 10_000 }),
      page.click('text=Forgot your password?')
    ]);
    await page.waitForTimeout(3000);
    await expect(page.locator('h6:has-text("Reset Password")')).toBeVisible();
  });

});