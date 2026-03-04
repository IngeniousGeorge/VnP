export const STRAPI_URL = import.meta.env.STRAPI_URL || 'http://localhost:1337';

type StrapiChild = { type: 'hardBreak' } | { type: string; text: string };

type StrapiBlock = {
  type: string;
  level?: number;
  children: StrapiChild[];
};

export function blocksToHtml(blocks: StrapiBlock[]): string {
  return blocks
    .map(block => {
      const renderChildren = (children: StrapiChild[]) =>
        children.map(child => child.type === 'hardBreak' ? '<br>' : child.text.replace(/\n/g, '<br>')).join('');

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
