import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MorpheumBot } from './bot';

describe('Bot Iframe Dual Message Handling', () => {
  let bot: MorpheumBot;
  let mockSendMessage: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock environment variables for Copilot
    process.env.GITHUB_TOKEN = 'mock-token';
    process.env.COPILOT_REPOSITORY = 'owner/repo';
    
    bot = new MorpheumBot();
    mockSendMessage = vi.fn();
  });

  it('should handle dual message format for iframe content', async () => {
    // Create a mock dual message as it would come from CopilotClient
    const dualMessageData = {
      text: '📊 **GitHub Copilot Progress Tracking**\n\n🔗 **Issue:** [#123](https://github.com/owner/repo/issues/123)\n',
      html: '<div>Test iframe HTML content</div>'
    };
    
    const dualMessageChunk = `__DUAL_MESSAGE__${JSON.stringify(dualMessageData)}`;
    
    // Test the runCopilotSession method's chunk handler indirectly
    // by creating a mock LLM client that sends the dual message
    const mockLLMClient = {
      sendStreaming: vi.fn().mockImplementation(async (prompt: string, onChunk: (chunk: string) => void) => {
        // Simulate sending a dual message chunk
        onChunk(dualMessageChunk);
        return 'Test response';
      }),
      send: vi.fn()
    };

    // Replace the current LLM client with our mock
    (bot as any).currentLLMClient = mockLLMClient;
    (bot as any).currentLLMProvider = 'copilot';

    // Call the runCopilotSession method indirectly through handleTask
    await (bot as any).runCopilotSession('Test task', mockSendMessage);

    // Verify that the sendMessage was called with both text and HTML
    expect(mockSendMessage).toHaveBeenCalledWith(
      dualMessageData.text,
      dualMessageData.html
    );
  });

  it('should handle regular messages normally when not dual message format', async () => {
    const regularChunk = '🤖 Regular status message\n';
    
    // Test with a regular message (not dual format)
    const mockLLMClient = {
      sendStreaming: vi.fn().mockImplementation(async (prompt: string, onChunk: (chunk: string) => void) => {
        // Simulate sending a regular chunk
        onChunk(regularChunk);
        return 'Test response';
      }),
      send: vi.fn()
    };

    // Replace the current LLM client with our mock
    (bot as any).currentLLMClient = mockLLMClient;
    (bot as any).currentLLMProvider = 'copilot';

    // Call the runCopilotSession method
    await (bot as any).runCopilotSession('Test task', mockSendMessage);

    // Verify that the sendMessage was called with just text (no HTML)
    expect(mockSendMessage).toHaveBeenCalledWith(regularChunk);
  });

  it('should handle malformed dual message gracefully', async () => {
    const malformedDualMessage = '__DUAL_MESSAGE__{invalid json}';
    
    const mockLLMClient = {
      sendStreaming: vi.fn().mockImplementation(async (prompt: string, onChunk: (chunk: string) => void) => {
        // Simulate sending a malformed dual message
        onChunk(malformedDualMessage);
        return 'Test response';
      }),
      send: vi.fn()
    };

    // Replace the current LLM client with our mock
    (bot as any).currentLLMClient = mockLLMClient;
    (bot as any).currentLLMProvider = 'copilot';

    // Call the runCopilotSession method
    await (bot as any).runCopilotSession('Test task', mockSendMessage);

    // Verify that it falls back to treating it as a regular message
    // The sendMarkdownMessage function will process it and might add HTML
    expect(mockSendMessage).toHaveBeenCalledWith(
      malformedDualMessage,
      expect.any(String) // HTML version will be generated
    );
  });
});