import { test, expect } from '@playwright/test';

// Missing URLs reported by Search Console on 2026-09-14.
const tags = [
  'powerpoint', 'decisions', 'tedx', 'startup', 'quit', 'selforganisation',
  'stoic', 'video', 'basecamp', 'smartcity', 'advising', 'culture', 'edtech',
  'crate', 'reading', 'conventions', 'fairytale', 'funding', 'product',
  'duckduckgo', 'studivz', 'politics', 'podcast',
];
const legacyRedirects = [
  ...tags.map((tag) => [`/tag/${tag}/`, `/category/${tag}/`]),
  ...['vc', 'entrepreneurship', 'motivation'].map((category) => [`/category/${category}/feed/`, '/rss.xml']),
  ...['stoic', 'quit', 'video', 'conventions', 'funding'].map((tag) => [`/tag/${tag}/feed/`, '/rss.xml']),
  ['/author/jodok/feed/', '/rss.xml'],
  ['/page/2/', '/posts/'],
  ['/page/2/?ref=https://devpick.io', '/posts/?ref=https://devpick.io'],
  ['/page/3/', '/posts/'],
  ['/author/jodok/page/2/', '/posts/'],
  ['/category/tree-ly/', '/category/tree.ly/'],
  ['/category/food-for-thought/', '/category/food%20for%20thought/'],
  ['/category/climate-change/', '/category/climate%20change/'],
  ['/2020/01/how-to-crate/import-this', '/2020/01/import-this/'],
  ['/wp-content/uploads/2020/01/200119-Appraisal-Interviews.pdf', '/assets/200119-Appraisal-Interviews.pdf'],
];

test('reported legacy URLs redirect once to a working replacement', async ({ request }) => {
  for (const [source, target] of legacyRedirects) {
    const response = await request.get(source, { maxRedirects: 0 });
    expect(response.status(), source).toBe(301);
    expect(response.headers().location, source).toBe(target);
    expect((await request.get(target, { maxRedirects: 0 })).status(), target).toBe(200);
  }
});

test('every sitemap page serves HTML at its declared canonical URL', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap-0.xml')).text();
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]));
  expect(urls.length).toBeGreaterThan(100);
  for (const url of urls) {
    expect(url.pathname.endsWith('/'), url.href).toBeTruthy();
    const response = await request.get(url.pathname, { maxRedirects: 0 });
    expect(response.status(), url.href).toBe(200);
    const html = await response.text();
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    expect(canonical && new URL(canonical).href, url.href).toBe(url.href);
  }
});

test('duplicate URLs consolidate and the Zen of Python link resolves', async ({ request }) => {
  for (const path of ['/2021/02/pitching-und-raising-capital', '/category/sustainability', '/category/crate.io']) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status()).toBe(301);
    expect(response.headers().location).toBe(`${path}/`);
  }
  const html = await (await request.get('/2020/01/how-to-crate/')).text();
  expect(html).toContain('href="/2020/01/import-this/"');
});
