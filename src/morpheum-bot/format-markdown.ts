import { marked } from 'marked';

// Enable GitHub‑Flavored Markdown (GFM) – this makes task‑list syntax recognizable
marked.setOptions({ gfm: true, breaks: false });

/**
 * Convert markdown to HTML using the default marked renderer.
 * The library already handles task‑list items when GFM is enabled.
 */
export const formatMarkdown = (markdown: string): string => {
  return marked(markdown);
};

