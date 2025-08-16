import MarkdownIt from 'markdown-it';
import checkbox from 'markdown-it-task-checkbox';

const md = new MarkdownIt().use(checkbox);

export function formatMarkdown(markdown: string): string {
  return md.render(markdown);
}