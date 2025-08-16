import { marked } from 'marked';

const renderer = new marked.Renderer();

renderer.checkbox = (checked: any) => {
  return checked.checked ? '☑' : '☐';
};

export function formatMarkdown(markdown: string): string {
  return marked(markdown, { renderer });
}