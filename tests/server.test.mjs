import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
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
  await mkdir(path.join(root, '_astro'), { recursive: true });
  await writeFile(path.join(root, 'index.html'), '<h1>HTML home</h1>');
  await writeFile(path.join(root, 'index.md'), '# Markdown home\n');
  await writeFile(path.join(root, 'about', 'index.html'), '<h1>HTML about</h1>');
  await writeFile(path.join(root, 'about', 'index.md'), '# Markdown about\n');
  await writeFile(path.join(root, '404.html'), '<h1>HTML not found</h1>');
  await writeFile(path.join(root, '404.md'), '# Markdown not found\n');
  await writeFile(path.join(root, 'llms.txt'), '# Agent guide\n');
  await writeFile(path.join(root, '_astro', 'app.js'), 'export {};\n');

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
  assert.equal(response.headers.get('vary'), 'Accept');
  assert.equal(await response.text(), '<h1>HTML home</h1>');
});

test('serves generated Markdown from the canonical URL', async () => {
  const response = await fetch(`${baseUrl}/about/`, {
    headers: { Accept: 'text/markdown, text/html;q=0.8' },
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'text/markdown; charset=utf-8');
  assert.equal(response.headers.get('vary'), 'Accept');
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

test('returns a negotiated recovery body with a real 404 status', async () => {
  const response = await fetch(`${baseUrl}/missing`, { headers: { Accept: 'text/markdown' } });
  assert.equal(response.status, 404);
  assert.equal(response.headers.get('content-type'), 'text/markdown; charset=utf-8');
  assert.equal(response.headers.get('vary'), 'Accept');
  assert.equal(await response.text(), '# Markdown not found\n');
});

test('returns 406 when no available representation is acceptable', async () => {
  const response = await fetch(`${baseUrl}/`, { headers: { Accept: 'application/pdf' } });
  assert.equal(response.status, 406);
  assert.equal(response.headers.get('vary'), 'Accept');
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
