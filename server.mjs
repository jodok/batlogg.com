import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { preferredType } from './lib/agent-content.mjs';

const DEFAULT_ROOT = fileURLToPath(new URL('./dist/', import.meta.url));
const NEGOTIATED_VARY = 'Accept, Accept-Encoding';
const TEXT_TYPES = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.md', 'text/markdown; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.svg', 'image/svg+xml; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.xml', 'application/xml; charset=utf-8'],
]);
const BINARY_TYPES = new Map([
  ['.avif', 'image/avif'],
  ['.gif', 'image/gif'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.mp3', 'audio/mpeg'],
  ['.mp4', 'video/mp4'],
  ['.ogg', 'audio/ogg'],
  ['.otf', 'font/otf'],
  ['.pdf', 'application/pdf'],
  ['.png', 'image/png'],
  ['.ttf', 'font/ttf'],
  ['.wav', 'audio/wav'],
  ['.webm', 'video/webm'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
  ['.zip', 'application/zip'],
]);

function contentType(file) {
  const extension = path.extname(file).toLowerCase();
  return TEXT_TYPES.get(extension) ?? BINARY_TYPES.get(extension) ?? 'application/octet-stream';
}

function cacheControl(relativePath) {
  if (relativePath.startsWith('_astro/')) return 'public, max-age=31536000, immutable';
  if (/\.(?:avif|gif|ico|jpe?g|mp3|mp4|ogg|otf|pdf|png|svg|ttf|wav|webm|webp|woff2?|zip)$/i.test(relativePath)) {
    return 'public, max-age=86400';
  }
  return 'public, max-age=0, must-revalidate';
}

function resolveWithinRoot(root, relativePath) {
  const candidate = path.resolve(root, relativePath);
  const prefix = root.endsWith(path.sep) ? root : `${root}${path.sep}`;
  return candidate === root || candidate.startsWith(prefix) ? candidate : null;
}

async function existingFile(root, relativePath) {
  const file = resolveWithinRoot(root, relativePath);
  if (!file) return null;
  try {
    const metadata = await stat(file);
    return metadata.isFile() ? { file, metadata } : null;
  } catch (error) {
    if (error?.code === 'ENOENT' || error?.code === 'ENOTDIR') return null;
    throw error;
  }
}

function sendText(request, response, status, body, headers = {}) {
  const payload = Buffer.from(body);
  response.writeHead(status, {
    'Content-Length': payload.length,
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  });
  response.end(request.method === 'HEAD' ? undefined : payload);
}

async function sendFile(request, response, root, relativePath, status = 200, extraHeaders = {}) {
  const result = await existingFile(root, relativePath);
  if (!result) return false;

  response.writeHead(status, {
    'Cache-Control': cacheControl(relativePath),
    'Content-Length': result.metadata.size,
    'Content-Type': contentType(relativePath),
    'Last-Modified': result.metadata.mtime.toUTCString(),
    'X-Content-Type-Options': 'nosniff',
    ...extraHeaders,
  });

  if (request.method === 'HEAD') {
    response.end();
  } else {
    await pipeline(createReadStream(result.file), response);
  }
  return true;
}

function pageVariant(pathname, representation) {
  const clean = pathname.replace(/^\/+|\/+$/g, '');
  const extension = representation === 'text/markdown' ? 'md' : 'html';
  if (!clean) return `index.${extension}`;
  if (clean === '404') return `404.${extension}`;
  return `${clean}/index.${extension}`;
}

async function handleRequest(request, response, root, logger) {
  if (!['GET', 'HEAD'].includes(request.method)) {
    sendText(request, response, 405, 'Method Not Allowed\n', { Allow: 'GET, HEAD' });
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname).replaceAll('\\', '/');
  } catch {
    sendText(request, response, 400, 'Bad Request\n');
    return;
  }

  if (pathname === '/healthz') {
    sendText(request, response, 200, 'ok\n', { 'Cache-Control': 'no-store' });
    return;
  }

  const directPath = pathname.replace(/^\/+/, '');
  if (path.extname(directPath)) {
    if (await sendFile(request, response, root, directPath)) return;
    await sendFile(request, response, root, '404.html', 404, { Vary: NEGOTIATED_VARY }) ||
      sendText(request, response, 404, 'Not Found\n', { Vary: NEGOTIATED_VARY });
    return;
  }

  const accept = request.headers.accept;
  const representation = preferredType(accept);
  if (representation === null && accept) {
    sendText(request, response, 406, 'Not Acceptable\n\nAvailable: text/html, text/markdown\n', { Vary: NEGOTIATED_VARY });
    return;
  }

  const isExplicit404 = pathname.replace(/^\/+|\/+$/g, '') === '404';
  const relativePath = pageVariant(pathname, representation);
  if (await sendFile(request, response, root, relativePath, isExplicit404 ? 404 : 200, { Vary: NEGOTIATED_VARY })) return;

  const notFoundPath = representation === 'text/markdown' ? '404.md' : '404.html';
  if (await sendFile(request, response, root, notFoundPath, 404, { Vary: NEGOTIATED_VARY })) return;

  logger.error(`Missing 404 representation: ${notFoundPath}`);
  sendText(request, response, 404, 'Not Found\n', { Vary: NEGOTIATED_VARY });
}

export function createAppServer({ root = DEFAULT_ROOT, logger = console } = {}) {
  const resolvedRoot = path.resolve(root);
  return createServer((request, response) => {
    handleRequest(request, response, resolvedRoot, logger).catch((error) => {
      logger.error(error);
      if (!response.headersSent) sendText(request, response, 500, 'Internal Server Error\n');
      else response.destroy();
    });
  });
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : null;
if (invokedPath === fileURLToPath(import.meta.url)) {
  const host = process.env.HOST ?? '0.0.0.0';
  const port = Number.parseInt(process.env.PORT ?? '3000', 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error(`Invalid PORT: ${process.env.PORT}`);

  const server = createAppServer();
  server.listen(port, host, () => console.log(`batlogg.com listening on http://${host}:${port}`));
}
