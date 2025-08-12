import { marked } from 'marked';

export function formatMarkdown(markdown: string): string {
  const html = marked(markdown) as string;
  return html;
}
