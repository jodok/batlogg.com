import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { request as httpRequest } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';
import { createAppServer } from '../server.mjs';

let root;
let server;
let baseUrl;

before(async () => {
  root = await mkdtemp(path.join(os.tmpdir(), 'batlogg-server-'));
  await mkdir(path.join(root, 'about'), { recursive: true });
  await mkdir(path.join(root, 'category', 'crate.io'), { recursive: true });
  await mkdir(path.join(root, '_astro'), { recursive: true });
  await writeFile(path.join(root, 'index.html'), '<h1>HTML home</h1>');
  await writeFile(path.join(root, 'index.md'), '# Markdown home\n');
  await writeFile(path.join(root, 'about', 'index.html'), '<h1>HTML about</h1>');
  await writeFile(path.join(root, 'about', 'index.md'), '# Markdown about\n');
  await writeFile(path.join(root, 'category', 'crate.io', 'index.html'), '<h1>HTML dotted category</h1>');
  await writeFile(path.join(root, 'category', 'crate.io', 'index.md'), '# Markdown dotted category\n');
  await writeFile(path.join(root, '404.html'), '<h1>HTML not found</h1>');
  await writeFile(path.join(root, '404.md'), '# Markdown not found\n');
  await writeFile(path.join(root, 'llms.txt'), '# Agent guide\n');
  await writeFile(path.join(root, '_astro', 'app.js'), 'export {};\n');
  for (const route of ['posts', 'category/stoic', 'category/tree.ly', 'category/food for thought', 'category/climate change', '2020/01/import-this']) {
    await mkdir(path.join(root, route), { recursive: true });
    await writeFile(path.join(root, route, 'index.html'), `<h1>${route}</h1>`);
  }
  await mkdir(path.join(root, 'assets'));
  await writeFile(path.join(root, 'assets/200119-Appraisal-Interviews.pdf'), 'PDF');
  await writeFile(path.join(root, 'rss.xml'), '<rss/>');

  server = createAppServer({ root, logger: { error() {} } });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await rm(root, { recursive: true, force: true });
});

test('serves HTML by default and declares Accept variance', async () => {
  const response = await fetch(`${baseUrl}/`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8');
  assert.equal(response.headers.get('vary'), 'Accept, Accept-Encoding');
  assert.equal(await response.text(), '<h1>HTML home</h1>');
});

test('permanently redirects migrated WordPress URLs to existing replacements', async () => {
  const redirects = [
    ['/tag/stoic/', '/category/stoic/'],
    ['/tag/stoic', '/category/stoic/'],
    ['/category/tree-ly/', '/category/tree.ly/'],
    ['/category/food-for-thought/', '/category/food%20for%20thought/'],
    ['/category/climate-change/', '/category/climate%20change/'],
    ['/tag/stoic/feed/', '/rss.xml'],
    ['/category/stoic/feed/', '/rss.xml'],
    ['/author/jodok/feed/', '/rss.xml'],
    ['/feed/', '/rss.xml'],
    ['/page/2/?ref=https://devpick.io', '/posts/?ref=https://devpick.io'],
    ['/page/3/', '/posts/'],
    ['/2020/01/how-to-crate/import-this', '/2020/01/import-this/'],
    ['/wp-content/uploads/2020/01/200119-Appraisal-Interviews.pdf', '/assets/200119-Appraisal-Interviews.pdf'],
  ];
  for (const [source, target] of redirects) {
    const response = await fetch(baseUrl + source, { redirect: 'manual' });
    assert.equal(response.status, 301, source);
    assert.equal(response.headers.get('location'), target, source);
    assert.equal((await fetch(baseUrl + target, { redirect: 'manual' })).status, 200, target);
  }
});

test('canonical page redirects preserve queries and work for HEAD and Markdown', async () => {
  for (const [source, target] of [
    ['/about?ref=test', '/about/?ref=test'],
    ['/about/index.html', '/about/'],
    ['/index.html', '/'],
    ['/category/crate.io', '/category/crate.io/'],
    ['/category/food%20for%20thought', '/category/food%20for%20thought/'],
  ]) {
    const response = await fetch(baseUrl + source, {
      method: 'HEAD', headers: { Accept: 'text/markdown' }, redirect: 'manual',
    });
    assert.equal(response.status, 301, source);
    assert.equal(response.headers.get('location'), target, source);
    assert.equal(await response.text(), '');
  }
});

test('unknown legacy URLs remain 404 and live archives never redirect home', async () => {
  for (const route of ['/tag/unknown/', '/category/unknown/feed/', '/page/999/', '/404/', '/404.html']) {
    const response = await fetch(baseUrl + route, { redirect: 'manual' });
    assert.equal(response.status, 404, route);
    assert.equal(response.headers.get('location'), null, route);
  }
  for (const route of ['/posts/', '/category/stoic/', '/category/tree.ly/']) {
    assert.equal((await fetch(baseUrl + route, { redirect: 'manual' })).status, 200, route);
  }
});

test('serves generated Markdown from the canonical URL', async () => {
  const response = await fetch(`${baseUrl}/about/`, {
    headers: { Accept: 'text/markdown, text/html;q=0.8' },
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'text/markdown; charset=utf-8');
  assert.equal(response.headers.get('vary'), 'Accept, Accept-Encoding');
  assert.equal(await response.text(), '# Markdown about\n');
});

test('serves direct Markdown siblings without negotiation', async () => {
  const response = await fetch(`${baseUrl}/about/index.md`, {
    headers: { Accept: 'text/html' },
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'text/markdown; charset=utf-8');
  assert.equal(await response.text(), '# Markdown about\n');
});

test('negotiates page routes whose path segments contain dots', async () => {
  const html = await fetch(`${baseUrl}/category/crate.io/`);
  assert.equal(html.status, 200);
  assert.equal(html.headers.get('content-type'), 'text/html; charset=utf-8');
  assert.equal(await html.text(), '<h1>HTML dotted category</h1>');

  const markdown = await fetch(`${baseUrl}/category/crate.io/`, {
    headers: { Accept: 'text/markdown' },
  });
  assert.equal(markdown.status, 200);
  assert.equal(markdown.headers.get('content-type'), 'text/markdown; charset=utf-8');
  assert.equal(await markdown.text(), '# Markdown dotted category\n');
});

test('returns a negotiated recovery body with a real 404 status', async () => {
  const response = await fetch(`${baseUrl}/missing`, { headers: { Accept: 'text/markdown' } });
  assert.equal(response.status, 404);
  assert.equal(response.headers.get('content-type'), 'text/markdown; charset=utf-8');
  assert.equal(response.headers.get('vary'), 'Accept, Accept-Encoding');
  assert.equal(await response.text(), '# Markdown not found\n');
});

test('returns 406 when no available representation is acceptable', async () => {
  const response = await fetch(`${baseUrl}/`, { headers: { Accept: 'application/pdf' } });
  assert.equal(response.status, 406);
  assert.equal(response.headers.get('vary'), 'Accept, Accept-Encoding');
});

test('serves static assets directly with immutable caching', async () => {
  const response = await fetch(`${baseUrl}/_astro/app.js`, { headers: { Accept: 'application/pdf' } });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'text/javascript; charset=utf-8');
  assert.equal(response.headers.get('cache-control'), 'public, max-age=31536000, immutable');
});

test('supports health checks and rejects mutating methods', async () => {
  const health = await fetch(`${baseUrl}/healthz`);
  assert.equal(health.status, 200);
  assert.equal(health.headers.get('cache-control'), 'no-store');

  const post = await fetch(`${baseUrl}/`, { method: 'POST' });
  assert.equal(post.status, 405);
  assert.equal(post.headers.get('allow'), 'GET, HEAD');
});

test('HEAD responses include negotiated metadata without a body', async () => {
  const response = await fetch(`${baseUrl}/`, {
    method: 'HEAD',
    headers: { Accept: 'text/markdown' },
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'text/markdown; charset=utf-8');
  assert.equal(await response.text(), '');
});

test('aborted downloads release their stream and leave the server responsive', async () => {
  await writeFile(path.join(root, 'large.bin'), Buffer.alloc(4 * 1024 * 1024, 1));

  await new Promise((resolve, reject) => {
    const request = httpRequest(`${baseUrl}/large.bin`, (response) => {
      response.once('data', () => response.destroy());
      response.once('close', resolve);
      response.once('error', (error) => {
        if (error.code === 'ECONNRESET') resolve();
        else reject(error);
      });
    });
    request.once('error', (error) => {
      if (error.code === 'ECONNRESET') resolve();
      else reject(error);
    });
    request.end();
  });

  const health = await fetch(`${baseUrl}/healthz`);
  assert.equal(health.status, 200);
  assert.equal(await health.text(), 'ok\n');
});
