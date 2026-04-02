import { test, expect } from '@playwright/test';

test('frontpage featured post images load correctly', async ({ page }) => {
  await page.goto('/');

  // Featured posts use aspect-square containers with images
  const images = page.locator('.aspect-square img');
  const count = await images.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const img = images.nth(i);
    // Scroll into view to trigger lazy loading
    await img.scrollIntoViewIfNeeded();
    // Wait for the image to load
    await expect(img).toBeVisible();
    // Wait until the image has loaded and has real dimensions
    await expect(img).toHaveJSProperty('complete', true);
    await expect(
      img.evaluate((el: HTMLImageElement) => el.naturalWidth > 0),
    ).resolves.toBe(true);
  }
});

test('frontpage featured post images have no rounded corners', async ({ page }) => {
  await page.goto('/');

  // Featured post image containers
  const cards = page.locator('.aspect-square');
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

  // Recent posts have description paragraphs with these classes
  const recentPostDescriptions = page.locator('p.text-gray-500.text-sm');
  const count = await recentPostDescriptions.count();
  expect(count).toBeGreaterThan(0);
});
