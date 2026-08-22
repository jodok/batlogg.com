import { test, expect } from '@playwright/test';

test('homepage exposes substantial, structured content without JavaScript', async ({ browser, request }) => {
  const response = await request.get('/');
  expect(response.ok()).toBeTruthy();

  const html = await response.text();
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? '';
  const text = main
    .replace(/<(script|style|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  expect(text.length).toBeGreaterThan(500);
  expect((main.match(/<h1\b/gi) ?? [])).toHaveLength(1);
  expect(main.search(/<h1\b/i)).toBeLessThan(main.search(/<h2\b/i));
  expect(main.search(/<h2\b/i)).toBeLessThan(main.search(/<h3\b/i));

  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('main h1')).toHaveText('Jodok Batlogg');
  await expect(page.locator('main')).toContainText('Entrepreneur and engineer');
  await context.close();
});

test('unknown paths return 404 with recovery links for agents', async ({ page }) => {
  const response = await page.goto('/this-path-must-not-exist-agent-test');
  expect(response?.status()).toBe(404);

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Not Found');
  await expect(page.getByRole('heading', { level: 2, name: 'Where to look next' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Agent guide (llms.txt)' })).toHaveAttribute('href', '/llms.txt');
  await expect(page.getByRole('link', { name: 'XML sitemap' })).toHaveAttribute('href', '/sitemap-index.xml');
  await expect(page.getByRole('link', { name: 'Writing archive' })).toHaveAttribute('href', '/posts');
  await expect(page.getByRole('link', { name: 'About and contact' })).toHaveAttribute('href', '/about');
});

test('llms.txt follows the published format and includes when-to-use guidance', async ({ request }) => {
  const response = await request.get('/llms.txt');
  expect(response.ok()).toBeTruthy();
  expect(response.headers()['content-type']).toContain('text/plain');

  const body = await response.text();
  const lines = body.split('\n');
  expect(lines[0]).toBe('# Jodok Batlogg');
  expect(lines.filter((line) => line.startsWith('# '))).toHaveLength(1);
  expect(lines.some((line) => line.startsWith('> Personal site'))).toBeTruthy();
  expect(body).toContain('## When to use this site');
  expect(body).toContain('## How to engage Jodok and Tashi');
  expect(body).toContain('## Contact and agent routing');
  expect(body).toContain('[Email Tashi](mailto:tashi@namche.ai)');
  expect(body).toContain('include sender, purpose, timezone, deadline, and preferred reply channel');
});

test('Organization JSON-LD stays complete across page layouts', async ({ page }) => {
  for (const path of ['/', '/about/', '/2026/03/leadership-is-a-decision-system/']) {
    await page.goto(path);
    const jsonLd = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent() ?? '{}');
    const organization = jsonLd['@graph']?.find((entry: { '@type'?: string }) => entry['@type'] === 'Organization');

    expect(organization).toMatchObject({
      '@type': 'Organization',
      name: 'Jodok Batlogg',
      url: 'https://batlogg.com/',
      logo: 'https://batlogg.com/favicon.svg',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'agent inquiries',
        email: 'tashi@namche.ai',
        telephone: '+43 677 64049410',
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Sebastianstraße 6b',
        postalCode: '6850',
        addressLocality: 'Dornbirn',
        addressCountry: 'AT',
      },
    });
    expect(organization.sameAs).toEqual(expect.arrayContaining([
      'https://github.com/jodok',
      'https://www.linkedin.com/in/jodok',
    ]));
  }
});
