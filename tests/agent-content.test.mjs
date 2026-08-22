import assert from 'node:assert/strict';
import test from 'node:test';
import { htmlToMarkdown, preferredType } from '../lib/agent-content.mjs';

const html = `<!doctype html>
<html><body>
  <nav>Browser navigation</nav>
  <main>
    <h1>Jodok Batlogg</h1>
    <p>Entrepreneur and engineer, building where technology meets impact.</p>
    <h2>Where to look next</h2>
    <img src="/portrait.webp" alt="Portrait of Jodok Batlogg">
    <ul><li><a href="/llms.txt">Agent guide</a></li></ul>
  </main>
  <script>window.notForAgents = true</script>
</body></html>`;

test('preferredType honors quality values, specificity, and client order', () => {
  assert.equal(preferredType('text/markdown, text/html;q=0.8'), 'text/markdown');
  assert.equal(preferredType('text/html, text/markdown;q=0.5'), 'text/html');
  assert.equal(preferredType('text/html;q=0, */*;q=1'), 'text/markdown');
  assert.equal(preferredType('text/markdown;q=0, text/html'), 'text/html');
  assert.equal(preferredType('application/pdf'), null);
  assert.equal(preferredType('*/*'), 'text/html');
});

test('htmlToMarkdown keeps main content and removes browser chrome', () => {
  const markdown = htmlToMarkdown(html);
  assert.match(markdown, /^# Jodok Batlogg/m);
  assert.match(markdown, /!\[Portrait of Jodok Batlogg\]\(\/portrait\.webp\)/);
  assert.match(markdown, /\[Agent guide\]\(\/llms\.txt\)/);
  assert.doesNotMatch(markdown, /Browser navigation/);
  assert.doesNotMatch(markdown, /notForAgents/);
});
