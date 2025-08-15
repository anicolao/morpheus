import { marked } from 'marked';

/**
 * Convert markdown to HTML using the default marked renderer.
 * The library already handles task‑list items when GFM is enabled.
 */
export const formatMarkdown = (markdown: string): string => {
  const formattedMarkdown = markdown
    .replace(/- \[ \] /g, '☐ ')
    .replace(/- \[x\] /g, '☑ ');
  return marked(formattedMarkdown);
};

