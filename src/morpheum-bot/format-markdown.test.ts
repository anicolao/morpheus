import { describe, it, expect } from 'vitest';
import { formatMarkdown } from './format-markdown';

describe('formatMarkdown', () => {
  it('should correctly format basic markdown elements', () => {
    const markdown = '# Hello\n\nThis is **bold** and *italic*.';
    const expectedHtml = '<h1>Hello</h1>\n<p>This is <strong>bold</strong> and <em>italic</em>.</p>\n';
    expect(formatMarkdown(markdown)).toBe(expectedHtml);
  });

  it('should correctly format code blocks', () => {
    const markdown = "```javascript\nconsole.log('Hello, World!');\n```";
    const expectedHtml = "<pre><code class=\"language-javascript\">console.log('Hello, World!');\n</code></pre>\n";
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

  it('should render task list items with unicode characters', () => {
    const markdown = '- [ ] Do something';
    const html = formatMarkdown(markdown);
    expect(html).toContain('☐');
    expect(html).not.toContain('<input');
  });

  it('should render markdown inside task list items', () => {
    const markdown = '- [x] **Completed** task with [a link](http://example.com)';
    const html = formatMarkdown(markdown);
    expect(html).toContain('<strong>Completed</strong>');
    expect(html).toContain('<a href="http://example.com">a link</a>');
  });

  it('should handle nested task lists', () => {
    const markdown = '- [x] Task 1\n  - [ ] Subtask 1\n  - [x] Subtask 2';
    const html = formatMarkdown(markdown);
    expect(html).toContain('Task 1');
    expect(html).toContain('Subtask 1');
    expect(html).toContain('Subtask 2');
  });

  it('should suppress bullets for task list items', () => {
    const markdown = '- [ ] Do something';
    const html = formatMarkdown(markdown);
    expect(html).toContain('<ul style="list-style-type: none;">');
  });
});