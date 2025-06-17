const { test, expect } = require('@playwright/test');

const BASE = 'https://opensource-demo.orangehrmlive.com/web/index.php';

async function gotoLogin(page) {
  await page.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle' });
}

async function gotoDashboard(page) {
  await page.goto(`${BASE}/auth/login`, { waitUntil: 'networkidle' });
  await page.fill('//input[@name="username"]', 'Admin');
  await page.fill('//input[@name="password"]', 'admin123');
  await page.click('//button');
}

test.describe('Orange HRM login test', () => {
  test('Successfull login', async ({ page }) => {
    await gotoLogin(page);
    await page.fill('//input[@name="username"]', 'Admin');
    await page.fill('//input[@name="password"]', 'admin123');

    await Promise.all([
      page.waitForURL(`${BASE}/dashboard/**`, { timeout: 10_000 }),
      await page.click('//button')
    ]);

    await expect(page.locator('//h6[.="Dashboard"]')).toBeVisible();

    await page.waitForTimeout(3000);
  });

  test('Invalid password', async ({ page }) => {
    await gotoLogin(page);
    await page.fill('//input[@name="username"]', 'Admin');
    await page.fill('//input[@name="password"]', 'wrongPassword!');
    await page.click('//button');

    await page.waitForTimeout(3000);

    await expect(page.locator('.oxd-alert-content--error')).toHaveText(/Invalid credentials/i);
  });

  test('empty submission', async ({ page }) => {
    await gotoLogin(page);
    await page.click('//button');

    const required = page.getByText('Required', { exact: true });
    await page.waitForTimeout(3000);
    await expect(required).toHaveCount(2);
  });

  test('forgot password', async ({ page }) => {
    await gotoLogin(page);

    Promise.all([
      page.waitForURL(`${BASE}/auth/requestPasswordResetCode`, { timeout: 10_000 }),
      page.click('text=Forgot your password?')
    ]);

    await page.waitForTimeout(3000);
    await expect(page.locator('//h6')).toBeVisible();
  });

  test('Quick launch tiles > 6', async ({ page }) => {
    await gotoDashboard(page);
    await page.waitForTimeout(3000);

    const tiles = await page.locator('.oxd-sheet').count();
    await expect(tiles).toBeGreaterThan(5);
  });

  test('Rows in PIM > 0', async ({ page }) => {
    await gotoDashboard(page);
    await page.waitForTimeout(3000);

    await page.click('text=PIM');
    
    await page.waitForTimeout(3000);

    const rows = await page.locator("//div[@class='oxd-table-card']").count();

    await expect(rows).toBeGreaterThan(0);
    await page.waitForTimeout(3000);
  });
})
