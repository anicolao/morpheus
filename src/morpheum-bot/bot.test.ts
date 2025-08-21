import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch globally to prevent network calls
global.fetch = vi.fn();

// Mock the modules using vi.hoisted for better mock hoisting
const mockFs = vi.hoisted(() => ({
  promises: {
    readFile: vi.fn().mockImplementation((filename: string) => {
      if (filename === 'TASKS.md') {
        return Promise.resolve('# Tasks\n\nThis file tracks the current and upcoming tasks for the Morpheum project.');
      } else if (filename === 'DEVLOG.md') {
        return Promise.resolve('# DEVLOG\n\n## Morpheum Development Log\n\nThis log tracks the development of morpheum.');
      }
      return Promise.resolve('# Test Content\nThis is test content.');
    }),
  },
}));

vi.mock('fs', () => mockFs);

vi.mock('execa', () => ({
  execa: vi.fn().mockResolvedValue({
    stdout: 'Container created successfully',
    stderr: '',
  }),
}));

vi.mock('./ollamaClient', () => ({
  OllamaClient: vi.fn(() => ({
    send: vi.fn().mockResolvedValue('Ollama response'),
    sendStreaming: vi.fn().mockImplementation((prompt, onChunk) => {
      // Simulate streaming by calling onChunk with parts of the response
      onChunk('Ollama ');
      onChunk('response');
      return Promise.resolve('Ollama response');
    }),
  })),
}));

vi.mock('./openai', () => ({
  OpenAIClient: vi.fn(() => ({
    send: vi.fn().mockResolvedValue('OpenAI response'),
    sendStreaming: vi.fn().mockImplementation((prompt, onChunk) => {
      // Simulate streaming by calling onChunk with parts of the response
      onChunk('OpenAI ');
      onChunk('response');
      return Promise.resolve('OpenAI response');
    }),
  })),
}));

vi.mock('./jailClient', () => ({
  JailClient: vi.fn(() => ({
    execute: vi.fn().mockResolvedValue('Command executed'),
  })),
}));

vi.mock('./sweAgent', () => ({
  SWEAgent: vi.fn(() => ({
    run: vi.fn().mockResolvedValue([
      { role: 'system', content: 'System prompt' },
      { role: 'user', content: 'Test task' },
      { role: 'assistant', content: 'Test response' },
    ]),
  })),
}));

vi.mock('./format-markdown', () => ({
  formatMarkdown: vi.fn((content: string) => {
    // Simple mock that converts the test content to expected HTML
    if (content === '# Test Content\nThis is test content.') {
      return '<h1>Test Content</h1>\n<p>This is test content.</p>\n';
    } else if (content.startsWith('# Tasks')) {
      return '<h1>Tasks</h1>\n<p>This file tracks the current and upcoming tasks for the Morpheum project.</p>\n';
    } else if (content.startsWith('# DEVLOG')) {
      return '<h1>DEVLOG</h1>\n<h2>Morpheum Development Log</h2>\n<p>This log tracks the development of morpheum.</p>\n';
    }
    return '<p>Formatted markdown</p>';
  }),
}));

// Import after mocks are set up
import { MorpheumBot } from './bot';

describe('MorpheumBot', () => {
  let bot: MorpheumBot;
  let mockSendMessage: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock fetch responses
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('openai') || url.includes('test-openai.com')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            choices: [
              {
                message: {
                  content: 'OpenAI response',
                },
              },
            ],
          }),
        });
      }
      if (url.includes('ollama') || url.includes('test-ollama')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            response: 'Ollama response',
          }),
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });
    
    // Set up environment variables for testing
    process.env.OLLAMA_API_URL = 'http://test-ollama:11434';
    process.env.OLLAMA_MODEL = 'test-ollama-model';
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.OPENAI_MODEL = 'gpt-4-test';
    process.env.OPENAI_BASE_URL = 'https://test-openai.com/v1';
    
    mockSendMessage = vi.fn().mockResolvedValue(undefined);
    bot = new MorpheumBot();
  });

  describe('Constructor', () => {
    it('should initialize with OpenAI when API key is available', () => {
      expect(bot).toBeDefined();
    });

    it('should fall back to Ollama when no OpenAI key is provided', () => {
      delete process.env.OPENAI_API_KEY;
      const botWithoutOpenAI = new MorpheumBot();
      expect(botWithoutOpenAI).toBeDefined();
    });
  });

  describe('Help Command', () => {
    it('should show help message with all available commands', async () => {
      await bot.processMessage('!help', 'user', mockSendMessage);
      
      expect(mockSendMessage).toHaveBeenCalledWith(
        expect.stringContaining('Available commands:')
      );
      expect(mockSendMessage).toHaveBeenCalledWith(
        expect.stringContaining('!llm switch')
      );
      expect(mockSendMessage).toHaveBeenCalledWith(
        expect.stringContaining('!openai')
      );
      expect(mockSendMessage).toHaveBeenCalledWith(
        expect.stringContaining('!ollama')
      );
    });
  });

  describe('LLM Status Command', () => {
    it('should show current LLM status', async () => {
      await bot.processMessage('!llm status', 'user', mockSendMessage);
      
      expect(mockSendMessage).toHaveBeenCalledWith(
        expect.stringContaining('Current LLM Provider: openai')
      );
      expect(mockSendMessage).toHaveBeenCalledWith(
        expect.stringContaining('model=gpt-4-test')
      );
    });
  });

  describe('LLM Switch Command', () => {
    it('should switch to Ollama', async () => {
      await bot.processMessage('!llm switch ollama', 'user', mockSendMessage);
      
      expect(mockSendMessage).toHaveBeenCalledWith(
        expect.stringContaining('Switched to ollama')
      );
    });

    it('should switch to OpenAI with custom model', async () => {
      await bot.processMessage('!llm switch openai gpt-4-turbo', 'user', mockSendMessage);
      
      expect(mockSendMessage).toHaveBeenCalledWith(
        expect.stringContaining('Switched to openai (model: gpt-4-turbo')
      );
    });

    it('should show error for invalid provider', async () => {
      await bot.processMessage('!llm switch invalid', 'user', mockSendMessage);
      
      expect(mockSendMessage).toHaveBeenCalledWith(
        expect.stringContaining('Usage: !llm switch <openai|ollama|copilot>')
      );
    });

    it('should show error when switching to OpenAI without API key', async () => {
      delete process.env.OPENAI_API_KEY;
      const botWithoutKey = new MorpheumBot();
      
      await botWithoutKey.processMessage('!llm switch openai', 'user', mockSendMessage);
      
      expect(mockSendMessage).toHaveBeenCalledWith(
        expect.stringContaining('OpenAI API key is not configured')
      );
    });
  });

  describe('Direct OpenAI Command', () => {
    it('should send prompt directly to OpenAI', async () => {
      await bot.processMessage('!openai Hello, how are you?', 'user', mockSendMessage);
      
      expect(mockSendMessage).toHaveBeenCalledWith('🤖 OpenAI is thinking...');
      expect(mockSendMessage).toHaveBeenCalledWith('OpenAI ');
      expect(mockSendMessage).toHaveBeenCalledWith('response');
      expect(mockSendMessage).toHaveBeenCalledWith('\n✅ OpenAI completed.');
    });

    it('should show usage for empty prompt', async () => {
      await bot.processMessage('!openai', 'user', mockSendMessage);
      
      expect(mockSendMessage).toHaveBeenCalledWith('Usage: !openai <prompt>');
    });

    it('should show error when OpenAI key is not configured', async () => {
      delete process.env.OPENAI_API_KEY;
      const botWithoutKey = new MorpheumBot();
      
      await botWithoutKey.processMessage('!openai test prompt', 'user', mockSendMessage);
      
      expect(mockSendMessage).toHaveBeenCalledWith(
        expect.stringContaining('OpenAI API key is not configured')
      );
    });
  });

  describe('Direct Ollama Command', () => {
    it('should send prompt directly to Ollama', async () => {
      await bot.processMessage('!ollama Hello, how are you?', 'user', mockSendMessage);
      
      expect(mockSendMessage).toHaveBeenCalledWith('🤖 Ollama is thinking...');
      expect(mockSendMessage).toHaveBeenCalledWith('Ollama ');
      expect(mockSendMessage).toHaveBeenCalledWith('response');
      expect(mockSendMessage).toHaveBeenCalledWith('\n✅ Ollama completed.');
    });

    it('should show usage for empty prompt', async () => {
      await bot.processMessage('!ollama', 'user', mockSendMessage);
      
      expect(mockSendMessage).toHaveBeenCalledWith('Usage: !ollama <prompt>');
    });
  });

  describe('Task Processing', () => {
    it('should process regular tasks with current LLM provider', async () => {
      await bot.processMessage('Create a simple hello world program', 'user', mockSendMessage);
      
      expect(mockSendMessage).toHaveBeenCalledWith(
        expect.stringContaining('Working on: "Create a simple hello world program" using openai (gpt-4-test)...')
      );
      expect(mockSendMessage).toHaveBeenCalledWith(
        expect.stringContaining('Iteration 1: Analyzing and planning...')
      );
      expect(mockSendMessage).toHaveBeenCalledWith(
        expect.stringContaining('Analysis complete. Processing response...')
      );
      expect(mockSendMessage).toHaveBeenCalledWith(
        expect.stringContaining("Job's done!")
      );
    });
  });

  describe('File Commands', () => {
    it('should show tasks from TASKS.md', async () => {
      await bot.processMessage('!tasks', 'user', mockSendMessage);
      
      expect(mockSendMessage).toHaveBeenCalledWith(
        expect.stringContaining('# Tasks'),
        expect.stringContaining('<h1>Tasks</h1>')
      );
    });

    it('should show devlog from DEVLOG.md', async () => {
      await bot.processMessage('!devlog', 'user', mockSendMessage);
      
      expect(mockSendMessage).toHaveBeenCalledWith(
        expect.stringContaining('# DEVLOG'),
        expect.stringContaining('<h1>DEVLOG</h1>')
      );
    });
  });
});