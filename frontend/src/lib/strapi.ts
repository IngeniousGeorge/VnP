export const STRAPI_URL = import.meta.env.STRAPI_URL || 'http://localhost:1337';

type StrapiChild =
  | { type: 'hardBreak' }
  | { type: 'text'; text: string; bold?: boolean; italic?: boolean; underline?: boolean; strikethrough?: boolean; code?: boolean }
  | { type: 'link'; url: string; children: StrapiChild[] };

export type StrapiBlock = {
  type: string;
  level?: number;
  children: StrapiChild[];
};

export async function fetchStrapiData(endpoint: string) {
  try {
    const res = await fetch(`${STRAPI_URL}${endpoint}`);
    const json = await res.json();
    return json.data ?? null;
  } catch (e) {
    console.error(`Failed to fetch ${endpoint} from Strapi:`, e);
    return null;
  }
}

export function buildPhotoUrl(photoObj?: { url: string } | null): string | null {
  return photoObj?.url ? `${STRAPI_URL}${photoObj.url}` : null;
}

function renderChildren(children: StrapiChild[]): string {
  return children.map(child => {
    if (child.type === 'hardBreak') return '<br>';
    if (child.type === 'link') return `<a href="${child.url}" target="_blank" rel="noopener noreferrer">${renderChildren(child.children)}</a>`;
    let text = child.text.replace(/\n/g, '<br>');
    if (child.code)          text = `<code>${text}</code>`;
    if (child.bold)          text = `<strong>${text}</strong>`;
    if (child.italic)        text = `<em>${text}</em>`;
    if (child.underline)     text = `<u>${text}</u>`;
    if (child.strikethrough) text = `<s>${text}</s>`;
    return text;
  }).join('');
}

export function blocksToHtml(blocks: StrapiBlock[]): string {
  return blocks
    .map(block => {
      if (block.type === 'paragraph') {
        const text = renderChildren(block.children);
        if (!text.trim()) return '';
        return `<p>${text}</p>`;
      }
      if (block.type === 'heading') {
        const level = block.level ?? 2;
        const text = renderChildren(block.children);
        if (!text.trim()) return '';
        return `<h${level}>${text}</h${level}>`;
      }
      return '';
    })
    .filter(Boolean)
    .join('');
}
