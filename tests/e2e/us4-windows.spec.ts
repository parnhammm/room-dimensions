import { test, expect } from '@playwright/test';

test.describe('US4: Windows', () => {
  let wallUrl: string;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('/rooms/new');
    await page.fill('#room-label', 'Window Test Room');
    await page.fill('#room-floor', 'Ground Floor');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    await page.click('text=Window Test Room');
    const roomId = page.url().split('/rooms/')[1];
    await page.click('a:has-text("+ Add Wall")');
    await page.fill('#wall-label', 'Front Wall');
    await page.fill('#wall-width', '5');
    await page.fill('#wall-height', '2.4');
    await page.click('button[type="submit"]');
    await page.click('a:has-text("View")');
    wallUrl = page.url();
    await page.close();
  });

  test('AS1: Add window and verify', async ({ page }) => {
    await page.goto(wallUrl);
    await page.click('button:has-text("+ Add Window")');
    await page.fill('#win-label', 'Bay Window');
    await page.fill('#win-width', '1.2');
    await page.fill('#win-height', '1.0');
    await page.click('button:has-text("Add")');
    await expect(page.getByText('Bay Window')).toBeVisible();
  });

  test('SC-003: Room list → detail → wall detail in ≤3 clicks', async ({ page }) => {
    await page.goto('/');
    let clicks = 0;
    await page.click('text=Window Test Room'); clicks++;
    await page.click('a:has-text("View")'); clicks++;
    await expect(page).toHaveURL(/\/walls\//);
    expect(clicks).toBeLessThanOrEqual(3);
  });
});
