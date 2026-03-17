import { test, expect } from '@playwright/test';

test.describe('US3: Manage Walls', () => {
  let roomId: string;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('/rooms/new');
    await page.fill('#room-label', 'Wall Test Room');
    await page.fill('#room-floor', 'Ground Floor');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    await page.click('text=Wall Test Room');
    roomId = page.url().split('/rooms/')[1];
    await page.close();
  });

  test('AS1: Add wall and verify in list', async ({ page }) => {
    await page.goto(`/rooms/${roomId}`);
    await page.click('a:has-text("+ Add Wall")');
    await page.fill('#wall-label', 'South Wall');
    await page.fill('#wall-width', '5');
    await page.fill('#wall-height', '2.4');
    await page.click('button[type="submit"]');
    await page.waitForURL(`/rooms/${roomId}`);
    await expect(page.getByText('South Wall')).toBeVisible();
  });

  test('AS2: Edit wall label and dimensions', async ({ page }) => {
    await page.goto(`/rooms/${roomId}`);
    await page.click('a[aria-label="Edit South Wall"]');
    await page.fill('#wall-label', 'North Wall');
    await page.fill('#wall-width', '6');
    await page.click('button[type="submit"]');
    await expect(page.getByText('North Wall')).toBeVisible();
  });

  test('AS3: Delete wall and verify cascade', async ({ page }) => {
    await page.goto(`/rooms/${roomId}/walls/new`);
    await page.fill('#wall-label', 'To Delete');
    await page.fill('#wall-width', '3');
    await page.fill('#wall-height', '2');
    await page.click('button[type="submit"]');
    await page.waitForURL(`/rooms/${roomId}`);
    page.on('dialog', (d) => d.accept());
    await page.click('button[aria-label="Delete To Delete"]');
    await expect(page.getByText('To Delete')).not.toBeVisible();
  });
});
