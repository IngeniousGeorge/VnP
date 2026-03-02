export const STRAPI_URL = import.meta.env.STRAPI_URL || 'http://localhost:1337';

type StrapiBlock = {
  type: string;
  children: { type: string; text: string }[];
};

export function blocksToHtml(blocks: StrapiBlock[]): string {
  return blocks
    .map(block => {
      if (block.type === 'paragraph') {
        const text = block.children.map(child => child.text).join('');
        if (!text.trim()) return '';
        return `<p>${text}</p>`;
      }
      return '';
    })
    .filter(Boolean)
    .join('');
}
