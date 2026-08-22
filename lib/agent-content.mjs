export function parseAccept(header) {
  return header
    .split(',')
    .map((raw) => {
      const parts = raw.trim().split(';').map((part) => part.trim());
      const type = parts[0]?.toLowerCase();
      if (!type) return null;

      let q = 1;
      for (const parameter of parts.slice(1)) {
        const [name, value] = parameter.split('=').map((part) => part.trim());
        if (name?.toLowerCase() !== 'q') continue;
        const parsed = Number(value);
        if (!Number.isNaN(parsed)) q = Math.max(0, Math.min(1, parsed));
      }

      const specificity = type === '*/*' ? 0 : type.endsWith('/*') ? 1 : 2;
      return { type, q, specificity };
    })
    .filter(Boolean);
}

function matches(entry, candidate) {
  if (entry.type === '*/*') return true;
  if (entry.type.endsWith('/*')) return candidate.startsWith(entry.type.slice(0, -1));
  return entry.type === candidate;
}

export function preferredType(header, produces = ['text/html', 'text/markdown']) {
  if (!header) return produces[0] ?? null;
  const entries = parseAccept(header);
  if (entries.length === 0) return produces[0] ?? null;

  let bestType = null;
  let bestQ = -1;
  let bestPosition = Number.POSITIVE_INFINITY;

  for (const candidate of produces) {
    let matched = null;
    let matchedPosition = Number.POSITIVE_INFINITY;

    for (const [position, entry] of entries.entries()) {
      if (!matches(entry, candidate)) continue;
      if (
        matched === null ||
        entry.specificity > matched.specificity ||
        (entry.specificity === matched.specificity && position < matchedPosition)
      ) {
        matched = entry;
        matchedPosition = position;
      }
    }

    if (!matched || matched.q <= 0) continue;
    if (matched.q > bestQ || (matched.q === bestQ && matchedPosition < bestPosition)) {
      bestType = candidate;
      bestQ = matched.q;
      bestPosition = matchedPosition;
    }
  }

  return bestType;
}

function decodeEntities(value) {
  const named = {
    amp: '&',
    apos: "'",
    gt: '>',
    hellip: '…',
    ldquo: '“',
    lsquo: '‘',
    lt: '<',
    mdash: '—',
    nbsp: ' ',
    ndash: '–',
    quot: '"',
    rdquo: '”',
    rsquo: '’',
  };

  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, code) => {
    if (code[0] === '#') {
      const hex = code[1]?.toLowerCase() === 'x';
      const point = Number.parseInt(code.slice(hex ? 2 : 1), hex ? 16 : 10);
      return Number.isNaN(point) ? entity : String.fromCodePoint(point);
    }
    return named[code.toLowerCase()] ?? entity;
  });
}

function attributes(value) {
  const result = {};
  for (const match of value.matchAll(/([:\w-]+)\s*=\s*(['"])(.*?)\2/g)) {
    result[match[1].toLowerCase()] = decodeEntities(match[3]);
  }
  return result;
}

function imageMarkdown(tag) {
  const attrs = attributes(tag);
  if (!attrs.src) return attrs.alt ?? '';
  return `![${attrs.alt ?? ''}](${attrs.src})`;
}

function inlineMarkdown(value) {
  return value
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, '')
    .replace(/<img\b[^>]*>/gi, imageMarkdown)
    .replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (_match, attrs, label) => {
      const href = attributes(attrs).href;
      const text = inlineMarkdown(label).trim();
      return href && text ? `[${text}](${href})` : text;
    })
    .replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**')
    .replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*')
    .replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, '`$1`')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/[ \t]+/g, ' ');
}

export function htmlToMarkdown(html) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? html;
  let markdown = main
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<pre\b[^>]*>\s*<code\b[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi, (_match, code) => `\n\n\`\`\`\n${decodeEntities(code).trim()}\n\`\`\`\n\n`)
    .replace(/<a\b([^>]*)>((?:(?!<\/a>)[\s\S])*?<h[1-6]\b[\s\S]*?)<\/a>/gi, (_match, attrs, body) => {
      const href = attributes(attrs).href;
      const heading = body.match(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i)?.[1];
      const label = heading ? inlineMarkdown(heading).trim() : 'this page';
      return href ? `${body}\n\n[Read ${label}](${href})\n\n` : body;
    });

  for (let level = 1; level <= 6; level += 1) {
    const heading = new RegExp(`<h${level}\\b[^>]*>([\\s\\S]*?)<\\/h${level}>`, 'gi');
    markdown = markdown.replace(heading, (_match, body) => `\n\n${'#'.repeat(level)} ${inlineMarkdown(body).trim()}\n\n`);
  }

  markdown = markdown
    .replace(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi, (_match, body) => `\n\n> ${inlineMarkdown(body).trim()}\n\n`)
    .replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (_match, body) => `\n- ${inlineMarkdown(body).trim()}`)
    .replace(/<(p|figcaption)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_match, _tag, body) => `\n\n${inlineMarkdown(body).trim()}\n\n`)
    .replace(/<img\b[^>]*>/gi, (tag) => `\n\n${imageMarkdown(tag)}\n\n`)
    .replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (_match, attrs, label) => {
      const href = attributes(attrs).href;
      const text = inlineMarkdown(label).trim();
      return href && text ? `[${text}](${href})` : text;
    })
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n');

  return `${decodeEntities(markdown).replace(/\n{3,}/g, '\n\n').trim()}\n`;
}
