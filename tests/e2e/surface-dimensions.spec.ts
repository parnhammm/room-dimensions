import { test, expect } from '@playwright/test';

test.describe('Surface Dimensions (floor & ceiling)', () => {
  let roomUrl: string;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('/');
    await page.click('a[href="/rooms/new"]');
    await page.fill('#room-label', 'Surface Dim Test Room');
    await page.fill('#room-floor', 'Ground Floor');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    await page.click('text=Surface Dim Test Room');
    roomUrl = page.url();
    await page.close();
  });

  test('Floor: CTA visible when no dimension set', async ({ page }) => {
    await page.goto(roomUrl);
    await expect(page.getByRole('button', { name: /add floor dimensions/i })).toBeVisible();
  });

  test('Floor: Add dimensions and verify display (SC-002 ≤2000ms)', async ({ page }) => {
    await page.goto(roomUrl);
    await page.click('button[aria-label="Add floor dimensions"]');
    await page.fill('input[aria-label="Width"]', '5');
    await page.fill('input[aria-label="Length"]', '4.2');

    const [response] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/floor-dimensions') && r.request().method() === 'PUT'),
      page.click('button[type="submit"]'),
    ]);
    expect(response.status()).toBe(200);
    expect(response.timing().responseEnd - response.timing().requestStart).toBeLessThan(2000);

    await expect(page.getByText(/5/)).toBeVisible();
    await expect(page.getByText(/4\.2/)).toBeVisible();
  });

  test('Floor: Edit width and verify update', async ({ page }) => {
    await page.goto(roomUrl);
    await page.click('button:has-text("Edit") >> nth=0');
    await page.fill('input[aria-label="Width"]', '5.5');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/5\.5/)).toBeVisible();
  });

  test('Floor: Validation rejects zero width', async ({ page }) => {
    await page.goto(roomUrl);
    await page.click('button:has-text("Edit") >> nth=0');
    await page.fill('input[aria-label="Width"]', '0');
    await page.click('button[type="submit"]');
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('alert')).toContainText(/positive/i);
  });

  test('Floor: Validation rejects negative length', async ({ page }) => {
    await page.goto(roomUrl);
    await page.click('button:has-text("Edit") >> nth=0');
    await page.fill('input[aria-label="Length"]', '-1');
    await page.click('button[type="submit"]');
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('alert')).toContainText(/positive/i);
  });

  test('Floor: Remove returns to CTA state', async ({ page }) => {
    await page.goto(roomUrl);
    await page.click('button[aria-label="Remove floor dimensions"]');
    await expect(page.getByRole('button', { name: /add floor dimensions/i })).toBeVisible();
  });

  test('Ceiling: Independent of floor — CTA visible after floor removed', async ({ page }) => {
    await page.goto(roomUrl);
    await expect(page.getByRole('button', { name: /add ceiling dimensions/i })).toBeVisible();
  });

  test('Ceiling: Add dimensions and verify display', async ({ page }) => {
    await page.goto(roomUrl);
    await page.click('button[aria-label="Add ceiling dimensions"]');
    await page.fill('input[aria-label="Width"]', '4.8');
    await page.fill('input[aria-label="Length"]', '3');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/4\.8/)).toBeVisible();
    await expect(page.getByText(/3/)).toBeVisible();
  });

  test('Print summary: shows floor and ceiling dimensions', async ({ page }) => {
    // Add a floor dimension for print verification
    await page.goto(roomUrl);
    await page.click('button[aria-label="Add floor dimensions"]');
    await page.fill('input[aria-label="Width"]', '6');
    await page.fill('input[aria-label="Length"]', '4');
    await page.click('button[type="submit"]');
    await expect(page.getByRole('button', { name: /add floor dimensions/i })).not.toBeVisible();

    // Navigate to print summary
    await page.goto('/print');
    await expect(page.getByText(/6/)).toBeVisible();
    await expect(page.getByText(/4\.8/)).toBeVisible();
  });
});
