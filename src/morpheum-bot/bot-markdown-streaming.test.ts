import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formatMarkdown } from './format-markdown';

// Helper function to detect if a chunk contains markdown links
function hasMarkdownLinks(text: string): boolean {
  // Match markdown links like [text](url)
  return /\[.+?\]\(https?:\/\/.+?\)/.test(text);
}

describe('Markdown Links in Streaming', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    const markdownChunks = testChunks.filter(hasMarkdownLinks);
    
    expect(markdownChunks.length).toBe(3); // Three chunks have markdown links
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
    
    // Simulate the bot's streaming callback logic
    const chunks = [
      '🤖 Creating GitHub issue for: "Test task"\n',  // No markdown links
      '✅ **Issue [#123](https://github.com/owner/repo/issues/123) created**\n',  // Has markdown links
      'Regular message without links',  // No markdown links
      '🔗 **Pull Request [#124](https://github.com/owner/repo/pull/124) created**\n'  // Has markdown links
    ];
    
    // Simulate the fixed streaming callback
    for (const chunk of chunks) {
      if (hasMarkdownLinks(chunk)) {
        const html = formatMarkdown(chunk);
        await mockSendMessage(chunk, html);
      } else {
        await mockSendMessage(chunk);
      }
    }
    
    // Verify the calls
    expect(mockSendMessage).toHaveBeenCalledTimes(4);
    
    // First call: no markdown, only one argument
    expect(mockSendMessage.mock.calls[0]).toEqual(['🤖 Creating GitHub issue for: "Test task"\n']);
    
    // Second call: has markdown, two arguments (text and HTML)
    expect(mockSendMessage.mock.calls[1]).toHaveLength(2);
    expect(mockSendMessage.mock.calls[1][0]).toBe('✅ **Issue [#123](https://github.com/owner/repo/issues/123) created**\n');
    expect(mockSendMessage.mock.calls[1][1]).toContain('<a href="https://github.com/owner/repo/issues/123">#123</a>');
    
    // Third call: no markdown, only one argument
    expect(mockSendMessage.mock.calls[2]).toEqual(['Regular message without links']);
    
    // Fourth call: has markdown, two arguments (text and HTML)
    expect(mockSendMessage.mock.calls[3]).toHaveLength(2);
    expect(mockSendMessage.mock.calls[3][0]).toBe('🔗 **Pull Request [#124](https://github.com/owner/repo/pull/124) created**\n');
    expect(mockSendMessage.mock.calls[3][1]).toContain('<a href="https://github.com/owner/repo/pull/124">#124</a>');
  });
});