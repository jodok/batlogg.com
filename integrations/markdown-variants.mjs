import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { htmlToMarkdown } from '../lib/agent-content.mjs';

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.isFile() && entry.name.endsWith('.html') ? [path] : [];
  }));
  return nested.flat();
}

export default function markdownVariants() {
  return {
    name: 'batlogg-markdown-variants',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const files = await htmlFiles(dir);
        await Promise.all(files.map(async (htmlUrl) => {
          const html = await readFile(htmlUrl, 'utf8');
          const markdownUrl = new URL(htmlUrl.href.replace(/\.html$/, '.md'));
          await writeFile(markdownUrl, htmlToMarkdown(html), 'utf8');
        }));
        logger.info(`Generated ${files.length} Markdown page variants in ${fileURLToPath(dir)}`);
      },
    },
  };
}
