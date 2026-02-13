import { test, expect } from '@playwright/test';

test('frontpage featured post images load correctly', async ({ page }) => {
  await page.goto('/');

  // Get all featured post images
  const images = page.locator('.card-image img');
  const count = await images.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const img = images.nth(i);
    // Scroll into view to trigger lazy loading
    await img.scrollIntoViewIfNeeded();
    // Wait for the image to load
    await expect(img).toBeVisible();
    await img.evaluate((el: HTMLImageElement) => {
      if (el.complete) return;
      return new Promise<void>((resolve, reject) => {
        el.addEventListener('load', () => resolve());
        el.addEventListener('error', () => reject(new Error('Image failed to load')));
      });
    });

    const naturalWidth = await img.evaluate(
      (el: HTMLImageElement) => el.naturalWidth,
    );
    expect(naturalWidth).toBeGreaterThan(0);
  }
});

test('frontpage featured post images have no rounded corners', async ({ page }) => {
  await page.goto('/');

  const cards = page.locator('.featured-card');
  const count = await cards.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const borderRadius = await card.evaluate(
      (el) => getComputedStyle(el).borderRadius,
    );
    expect(borderRadius).toBe('0px');
  }
});

test('frontpage recent posts show descriptions', async ({ page }) => {
  await page.goto('/');

  // The recent posts section should contain description text
  const recentPostDescriptions = page.locator('.border-t .space-y-2 .text-gray-500.text-sm');
  const count = await recentPostDescriptions.count();
  expect(count).toBeGreaterThan(0);
});
