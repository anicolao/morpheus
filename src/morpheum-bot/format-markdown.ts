import MarkdownIt from 'markdown-it';
import unicodeCheckbox from './markdown-it-unicode-checkboxes';

const md = new MarkdownIt().use(unicodeCheckbox);

export function formatMarkdown(markdown: string): string {
  return md.render(markdown);
}
