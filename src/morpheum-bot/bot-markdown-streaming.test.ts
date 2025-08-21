import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formatMarkdown } from './format-markdown';

// Helper function to detect if text contains any markdown formatting
function hasMarkdown(text: string): boolean {
  // Check for various markdown patterns:
  // - Links: [text](url)
  // - Code blocks: ``` or `code`
  // - Bold: **text** or __text__
  // - Italic: *text* or _text_
  // - Headings: # ## ### etc.
  return (
    /\[.+?\]\(https?:\/\/.+?\)/.test(text) ||  // Links
    /```[\s\S]*?```/.test(text) ||             // Code blocks
    /`[^`]+?`/.test(text) ||                   // Inline code
    /\*\*[^*]+?\*\*/.test(text) ||             // Bold with **
    /__[^_]+?__/.test(text) ||                 // Bold with __
    /\*[^*]+?\*/.test(text) ||                 // Italic with *
    /_[^_]+?_/.test(text) ||                   // Italic with _
    /^#{1,6}\s/.test(text.trim())              // Headings
  );
}

describe('Comprehensive Markdown Detection in Streaming', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should detect various markdown patterns', () => {
    const testCases = [
      // Links
      { text: '✅ **Issue [#123](https://github.com/owner/repo/issues/123) created**', expected: true },
      { text: 'See [documentation](https://docs.github.com) for more info', expected: true },
      
      // Code blocks
      { text: 'Here is a code block:\n```javascript\nconsole.log("hello");\n```', expected: true },
      { text: 'This has `inline code` in it', expected: true },
      
      // Bold
      { text: 'This is **bold text** here', expected: true },
      { text: 'This is __bold text__ here', expected: true },
      
      // Italic
      { text: 'This is *italic text* here', expected: true },
      { text: 'This is _italic text_ here', expected: true },
      
      // Headings
      { text: '# This is a heading', expected: true },
      { text: '## This is a heading', expected: true },
      { text: '### This is a heading', expected: true },
      
      // Plain text
      { text: 'Just regular text without any formatting', expected: false },
      { text: '🤖 Creating GitHub issue for: "Test task"', expected: false },
      { text: 'Status: completed successfully', expected: false }
    ];

    testCases.forEach(({ text, expected }) => {
      expect(hasMarkdown(text)).toBe(expected);
    });
  });

  it('should detect markdown links in copilot status messages', () => {
    const testChunks = [
      '🤖 Creating GitHub issue for: "Test task"\n',
      '✅ **Issue [#123](https://github.com/owner/repo/issues/123) created**\n',
      '🚀 Starting GitHub Copilot session for [#123](https://github.com/owner/repo/issues/123)...\n',
      '⏳ Copilot session started (ID: test-session) - Status: pending\n📊 Track progress: https://github.com/copilot/agents\n',
      '🔗 **Pull Request [#124](https://github.com/owner/repo/pull/124) created**\n',
      'Regular text without links'
    ];

    const markdownChunks = testChunks.filter(hasMarkdown);
    
    expect(markdownChunks.length).toBe(3); // Three chunks have markdown
    expect(markdownChunks[0]).toContain('[#123](https://github.com/owner/repo/issues/123)');
    expect(markdownChunks[1]).toContain('[#123](https://github.com/owner/repo/issues/123)');
    expect(markdownChunks[2]).toContain('[#124](https://github.com/owner/repo/pull/124)');
  });

  it('should format markdown chunks to HTML correctly', () => {
    const markdownChunk = '✅ **Issue [#123](https://github.com/owner/repo/issues/123) created**\n';
    const html = formatMarkdown(markdownChunk);
    
    expect(html).toContain('<strong>Issue <a href="https://github.com/owner/repo/issues/123">#123</a> created</strong>');
    expect(html).toContain('✅');
  });

  it('should handle chunk with multiple markdown elements', () => {
    const complexChunk = '🚀 Starting GitHub Copilot session for [#123](https://github.com/owner/repo/issues/123)...\nSee [documentation](https://docs.github.com) for more info.\n';
    const html = formatMarkdown(complexChunk);
    
    expect(html).toContain('<a href="https://github.com/owner/repo/issues/123">#123</a>');
    expect(html).toContain('<a href="https://docs.github.com">documentation</a>');
  });

  it('should handle streaming logic correctly - send HTML for markdown, plain text otherwise', async () => {
    const mockSendMessage = vi.fn();
    
    // Simulate the bot's streaming callback logic with comprehensive markdown detection
    const chunks = [
      '🤖 Creating GitHub issue for: "Test task"\n',  // No markdown
      '✅ **Issue [#123](https://github.com/owner/repo/issues/123) created**\n',  // Has links and bold
      'Regular message without links',  // No markdown
      '🔗 **Pull Request [#124](https://github.com/owner/repo/pull/124) created**\n',  // Has links and bold
      'This has `inline code` in it',  // Has inline code
      '# This is a heading'  // Has heading
    ];
    
    // Simulate the fixed streaming callback with smart detection
    for (const chunk of chunks) {
      if (hasMarkdown(chunk)) {
        const html = formatMarkdown(chunk);
        await mockSendMessage(chunk, html);
      } else {
        await mockSendMessage(chunk);
      }
    }
    
    // Verify the calls
    expect(mockSendMessage).toHaveBeenCalledTimes(6);
    
    // First call: no markdown, only one argument
    expect(mockSendMessage.mock.calls[0]).toEqual(['🤖 Creating GitHub issue for: "Test task"\n']);
    
    // Second call: has markdown (links + bold), two arguments (text and HTML)
    expect(mockSendMessage.mock.calls[1]).toHaveLength(2);
    expect(mockSendMessage.mock.calls[1][0]).toBe('✅ **Issue [#123](https://github.com/owner/repo/issues/123) created**\n');
    expect(mockSendMessage.mock.calls[1][1]).toContain('<a href="https://github.com/owner/repo/issues/123">#123</a>');
    
    // Third call: no markdown, only one argument
    expect(mockSendMessage.mock.calls[2]).toEqual(['Regular message without links']);
    
    // Fourth call: has markdown (links + bold), two arguments (text and HTML)
    expect(mockSendMessage.mock.calls[3]).toHaveLength(2);
    expect(mockSendMessage.mock.calls[3][0]).toBe('🔗 **Pull Request [#124](https://github.com/owner/repo/pull/124) created**\n');
    expect(mockSendMessage.mock.calls[3][1]).toContain('<a href="https://github.com/owner/repo/pull/124">#124</a>');
    
    // Fifth call: has markdown (inline code), two arguments (text and HTML)
    expect(mockSendMessage.mock.calls[4]).toHaveLength(2);
    expect(mockSendMessage.mock.calls[4][0]).toBe('This has `inline code` in it');
    expect(mockSendMessage.mock.calls[4][1]).toContain('<code>inline code</code>');
    
    // Sixth call: has markdown (heading), two arguments (text and HTML)
    expect(mockSendMessage.mock.calls[5]).toHaveLength(2);
    expect(mockSendMessage.mock.calls[5][0]).toBe('# This is a heading');
    expect(mockSendMessage.mock.calls[5][1]).toContain('<h1>This is a heading</h1>');
  });
});