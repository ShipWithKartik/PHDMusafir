// Story descriptions are stored as plain text. Inline photos are embedded as
// Markdown-style image lines:   ![](https://res.cloudinary.com/...)
// Stories written before inline photos existed contain no such lines, so they
// render exactly as before.

const IMAGE_LINE_RE = /^\s*!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)\s*$/;
const IMAGE_ANY_RE = /!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/g;

/** Build the text token for an inline photo. */
export const imageToken = (url) => `![](${url})`;

/**
 * Split a description into renderable blocks:
 *   { type: 'text', value } | { type: 'image', url }
 * Consecutive text lines are kept together so `white-space: pre-line`
 * rendering of plain stories is unchanged.
 */
export function parseStoryContent(text = '') {
  const blocks = [];
  let buffer = [];

  const flush = () => {
    const value = buffer.join('\n').replace(/^\n+|\n+$/g, '');
    if (value.trim()) blocks.push({ type: 'text', value });
    buffer = [];
  };

  String(text).split('\n').forEach((line) => {
    const m = line.match(IMAGE_LINE_RE);
    if (m) {
      flush();
      blocks.push({ type: 'image', url: m[1] });
    } else {
      buffer.push(line);
    }
  });
  flush();
  return blocks;
}

/** Description with inline photo tokens removed — for excerpts / word counts. */
export function stripStoryImages(text = '') {
  return String(text).replace(IMAGE_ANY_RE, ' ').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** Word count of the readable text (ignores inline photo tokens). */
export function storyWordCount(text = '') {
  const clean = stripStoryImages(text);
  return clean ? clean.split(/\s+/).length : 0;
}

/**
 * Serialise a contenteditable editor into the stored text format.
 * Line breaks follow the same block/<br> structure the browser renders,
 * and every <img data-inline-url> becomes an image token on its own line.
 */
export function serializeEditor(root) {
  if (!root) return '';
  let out = '';
  const BLOCKS = new Set(['DIV', 'P', 'BLOCKQUOTE', 'LI', 'UL', 'OL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'FIGURE', 'PRE']);
  const newline = () => { if (out && !out.endsWith('\n')) out += '\n'; };

  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      out += node.nodeValue.replace(/\u00A0/g, ' '); // non-breaking spaces from contenteditable
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const tag = node.tagName;
    if (tag === 'BR') { out += '\n'; return; }
    if (tag === 'BUTTON') return; // editor-only controls (e.g. "remove photo")
    if (tag === 'IMG') {
      // Only photos inserted through the editor's photo tool are kept
      const url = node.getAttribute('data-inline-url');
      if (url && /^https?:\/\//.test(url)) {
        newline();
        out += `${imageToken(url)}\n`;
      }
      return;
    }
    const isBlock = BLOCKS.has(tag);
    if (isBlock) newline();
    node.childNodes.forEach(walk);
    if (isBlock) newline();
  };

  root.childNodes.forEach(walk);
  return out.replace(/\n{3,}/g, '\n\n').trim();
}
