import { test, expect } from '@playwright/test';

test.describe('US2: Floor and Ceiling Dimensions', () => {
  let roomUrl: string;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('/');
    await page.click('a[href="/rooms/new"]');
    await page.fill('#room-label', 'Dimension Test Room');
    await page.fill('#room-floor', 'Ground Floor');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    await page.click('text=Dimension Test Room');
    roomUrl = page.url();
    await page.close();
  });

  test('AS1: Add floor segment and verify', async ({ page }) => {
    await page.goto(roomUrl);
    await page.click('text=+ Add Segment >> nth=0');
    await page.fill('#seg-label', 'North Base');
    await page.fill('#seg-measurement', '4.5');
    await page.click('button:has-text("Add")');
    await expect(page.getByText('North Base')).toBeVisible();
    await expect(page.getByText(/4\.5/)).toBeVisible();
  });

  test('AS2: Add 5+ segments and verify all saved', async ({ page }) => {
    await page.goto(roomUrl);
    for (let i = 1; i <= 5; i++) {
      await page.click('button:has-text("+ Add Segment") >> nth=0');
      await page.fill('#seg-label', `Segment ${i}`);
      await page.fill('#seg-measurement', `${i}.0`);
      await page.click('button:has-text("Add")');
    }
    for (let i = 1; i <= 5; i++) {
      await expect(page.getByText(`Segment ${i}`)).toBeVisible();
    }
  });

  test('AS3: Edit segment and verify update', async ({ page }) => {
    await page.goto(roomUrl);
    await page.click('button:has-text("+ Add Segment") >> nth=0');
    await page.fill('#seg-label', 'Before Edit');
    await page.fill('#seg-measurement', '3.0');
    await page.click('button:has-text("Add")');
    await page.click('button[aria-label="Edit Before Edit"]');
    await page.fill('#seg-label', 'After Edit');
    await page.click('button:has-text("Update")');
    await expect(page.getByText('After Edit')).toBeVisible();
  });

  test('AS5: Ceiling panel is independent of floor', async ({ page }) => {
    await page.goto(roomUrl);
    const ceilSection = page.getByRole('region', { name: /ceiling/i });
    await expect(ceilSection.getByText(/No ceiling segments/i)).toBeVisible();
  });
});
