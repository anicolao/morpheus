import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MorpheumBot } from './bot';

// Mock the file system
vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn().mockResolvedValue('# Test Content\nThis is test content.'),
  },
}));

// Mock execa
vi.mock('execa', () => ({
  execa: vi.fn().mockResolvedValue({
    stdout: 'Container created successfully',
    stderr: '',
  }),
}));

// Mock the clients
vi.mock('./ollamaClient', () => ({
  OllamaClient: vi.fn().mockImplementation(() => ({
    send: vi.fn().mockResolvedValue('Ollama response'),
  })),
}));

vi.mock('./openai', () => ({
  OpenAIClient: vi.fn().mockImplementation(() => ({
    send: vi.fn().mockResolvedValue('OpenAI response'),
  })),
}));

vi.mock('./jailClient', () => ({
  JailClient: vi.fn().mockImplementation(() => ({
    execute: vi.fn().mockResolvedValue('Command executed'),
  })),
}));

vi.mock('./sweAgent', () => ({
  SWEAgent: vi.fn().mockImplementation(() => ({
    run: vi.fn().mockResolvedValue([
      { role: 'system', content: 'System prompt' },
      { role: 'user', content: 'Test task' },
      { role: 'assistant', content: 'Test response' },
    ]),
  })),
}));

vi.mock('./format-markdown', () => ({
  formatMarkdown: vi.fn().mockReturnValue('<p>Formatted markdown</p>'),
}));

describe('MorpheumBot', () => {
  let bot: MorpheumBot;
  let mockSendMessage: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Set up environment variables for testing
    process.env.OLLAMA_API_URL = 'http://test-ollama:11434';
    process.env.OLLAMA_MODEL = 'test-ollama-model';
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.OPENAI_MODEL = 'gpt-4-test';
    process.env.OPENAI_BASE_URL = 'https://test-openai.com/v1';
    
    mockSendMessage = vi.fn();
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
        expect.stringContaining('Usage: !llm switch <openai|ollama>')
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
      
      expect(mockSendMessage).toHaveBeenCalledWith(
        expect.stringContaining('OpenAI Response:\nOpenAI response')
      );
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
      
      expect(mockSendMessage).toHaveBeenCalledWith(
        expect.stringContaining('Ollama Response:\nOllama response')
      );
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
        expect.stringContaining('Working on: "Create a simple hello world program" using openai...')
      );
      expect(mockSendMessage).toHaveBeenCalledWith(
        expect.stringContaining('system: System prompt')
      );
    });
  });

  describe('File Commands', () => {
    it('should show tasks from TASKS.md', async () => {
      await bot.processMessage('!tasks', 'user', mockSendMessage);
      
      expect(mockSendMessage).toHaveBeenCalledWith(
        '# Test Content\nThis is test content.',
        '<p>Formatted markdown</p>'
      );
    });

    it('should show devlog from DEVLOG.md', async () => {
      await bot.processMessage('!devlog', 'user', mockSendMessage);
      
      expect(mockSendMessage).toHaveBeenCalledWith(
        '# Test Content\nThis is test content.',
        '<p>Formatted markdown</p>'
      );
    });
  });
});