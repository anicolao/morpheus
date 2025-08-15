import { describe, it, expect } from 'vitest';
import { formatMarkdown } from './format-markdown';

describe('formatMarkdown', () => {
  it('should correctly format basic markdown elements', () => {
    const markdown = '# Hello\n\nThis is **bold** and *italic*.';
    const expectedHtml = '<h1>Hello</h1>\n<p>This is <strong>bold</strong> and <em>italic</em>.</p>\n';
    expect(formatMarkdown(markdown)).toBe(expectedHtml);
  });

  it('should correctly format code blocks', () => {
    const markdown = '```javascript\nconsole.log("Hello, World!");\n```';
    const expectedHtml = '<pre><code class="language-javascript">console.log(&quot;Hello, World!&quot;);\n</code></pre>\n';
    expect(formatMarkdown(markdown)).toBe(expectedHtml);
  });

  it('should correctly format unordered lists', () => {
    const markdown = '* Item 1\n* Item 2';
    const expectedHtml = '<ul>\n<li>Item 1</li>\n<li>Item 2</li>\n</ul>\n';
    expect(formatMarkdown(markdown)).toBe(expectedHtml);
  });

  it('should correctly format ordered lists', () => {
    const markdown = '1. Item 1\n2. Item 2';
    const expectedHtml = '<ol>\n<li>Item 1</li>\n<li>Item 2</li>\n</ol>\n';
    expect(formatMarkdown(markdown)).toBe(expectedHtml);
  });

  // New tests for task‑list rendering
  it('should render unchecked task list items as disabled checkboxes', () => {
    const markdown = '- [ ] Do something';
    const html = formatMarkdown(markdown);
    expect(html).toContain('<input disabled="" type="checkbox"');
    expect(html).not.toContain('checked');
  });

  it('should render checked task list items as disabled checked checkboxes', () => {
    const markdown = '- [x] Completed task';
    const html = formatMarkdown(markdown);
    expect(html).toContain('<input checked="" disabled="" type="checkbox"');
  });
});

