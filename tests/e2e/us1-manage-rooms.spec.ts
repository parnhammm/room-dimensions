import { test, expect } from '@playwright/test';

test.describe('US1: Manage Rooms', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('AS1: Create a room and verify in list', async ({ page }) => {
    await page.click('a[href="/rooms/new"]');
    await page.fill('#room-label', 'Living Room');
    await page.fill('#room-floor', 'Ground Floor');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    await expect(page.getByText('Living Room')).toBeVisible();
    await expect(page.getByText('Ground Floor')).toBeVisible();
  });

  test('AS2: Edit room label and floor', async ({ page }) => {
    // Create room first
    await page.click('a[href="/rooms/new"]');
    await page.fill('#room-label', 'Old Name');
    await page.fill('#room-floor', 'Old Floor');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // Edit it
    await page.click('a[aria-label="Edit Old Name"]');
    await page.fill('#room-label', 'New Name');
    await page.fill('#room-floor', 'New Floor');
    await page.click('button[type="submit"]');

    await expect(page.getByText('New Name')).toBeVisible();
  });

  test('AS3: Delete room and verify removal', async ({ page }) => {
    // Create room
    await page.click('a[href="/rooms/new"]');
    await page.fill('#room-label', 'To Delete');
    await page.fill('#room-floor', 'Ground Floor');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // Delete it
    page.on('dialog', (dialog) => dialog.accept());
    await page.click('button[aria-label="Delete To Delete"]');
    await expect(page.getByText('To Delete')).not.toBeVisible();
  });

  test('AS4: Multi-room list view', async ({ page }) => {
    // Create multiple rooms
    for (const [label, floor] of [['Kitchen', 'Ground Floor'], ['Bedroom', 'First Floor']]) {
      await page.click('a[href="/rooms/new"]');
      await page.fill('#room-label', label);
      await page.fill('#room-floor', floor);
      await page.click('button[type="submit"]');
      await page.waitForURL('/');
    }
    await expect(page.getByText('Kitchen')).toBeVisible();
    await expect(page.getByText('Bedroom')).toBeVisible();
  });
});
