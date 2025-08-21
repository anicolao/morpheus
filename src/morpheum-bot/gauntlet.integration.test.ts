import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MorpheumBot } from './bot';
import { SWEAgent } from './sweAgent';
import { JailClient } from './jailClient';
import { executeGauntlet, gauntletTasks } from '../gauntlet/gauntlet';

// Mock the gauntlet module to avoid Docker dependencies in tests
vi.mock('../gauntlet/gauntlet', () => ({
  executeGauntlet: vi.fn(),
  gauntletTasks: [
    {
      id: 'test-task',
      skill: 'Environment Management & Tooling',
      difficulty: 'Easy',
      prompt: 'Test task for validation',
      successCondition: vi.fn()
    }
  ]
}));

// Mock external dependencies
vi.mock('./jailClient');

describe('Gauntlet Integration', () => {
  let bot: MorpheumBot;
  let mockSendMessage: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockSendMessage = vi.fn();
    bot = new MorpheumBot();
    vi.clearAllMocks();
  });

  it('should export gauntlet tasks for bot integration', () => {
    expect(gauntletTasks).toBeDefined();
    expect(Array.isArray(gauntletTasks)).toBe(true);
    expect(gauntletTasks.length).toBeGreaterThan(0);
  });

  it('should export executeGauntlet function for bot integration', () => {
    expect(executeGauntlet).toBeDefined();
    expect(typeof executeGauntlet).toBe('function');
  });

  it('should preserve jail client when switching LLM providers', () => {
    // Create a mock jail client
    const mockJailClient = new JailClient('localhost', 12345);
    
    // Verify that SWEAgent has a currentJailClient getter in the real implementation
    // (This test is just verifying the interface exists, actual behavior is tested in integration)
    const mockSweAgent = new SWEAgent(vi.fn() as any, mockJailClient);
    expect(mockSweAgent.currentJailClient).toBeDefined();
    expect(mockSweAgent.currentJailClient).toBe(mockJailClient);
  });

  it('should handle gauntlet run command with proper argument parsing', async () => {
    const mockExecuteGauntlet = vi.mocked(executeGauntlet);
    mockExecuteGauntlet.mockResolvedValue({
      'test-task': { success: true }
    });

    // Test the gauntlet run command
    await bot.processMessage('!gauntlet run --model test-model --task test-task', 'test-user', mockSendMessage);

    // Verify executeGauntlet was called with correct arguments (default provider is ollama)
    expect(mockExecuteGauntlet).toHaveBeenCalledWith('test-model', 'ollama', 'test-task', false);
  });

  it('should handle gauntlet run command without task (all tasks)', async () => {
    const mockExecuteGauntlet = vi.mocked(executeGauntlet);
    mockExecuteGauntlet.mockResolvedValue({
      'test-task': { success: true }
    });

    await bot.processMessage('!gauntlet run --model test-model --verbose', 'test-user', mockSendMessage);

    // Verify executeGauntlet was called with undefined task (all tasks) and verbose=true
    expect(mockExecuteGauntlet).toHaveBeenCalledWith('test-model', 'ollama', undefined, true);
  });

  it('should handle gauntlet run command with provider option', async () => {
    const mockExecuteGauntlet = vi.mocked(executeGauntlet);
    mockExecuteGauntlet.mockResolvedValue({
      'test-task': { success: true }
    });

    // Test with OpenAI provider - need to set API key to pass validation
    process.env.OPENAI_API_KEY = 'test-key';
    const testBot = new MorpheumBot();

    await testBot.processMessage('!gauntlet run --model gpt-4 --provider openai --task test-task', 'test-user', mockSendMessage);

    // Verify executeGauntlet was called with openai provider
    expect(mockExecuteGauntlet).toHaveBeenCalledWith('gpt-4', 'openai', 'test-task', false);
    
    // Clean up
    delete process.env.OPENAI_API_KEY;
  });

  it('should require model parameter for gauntlet run', async () => {
    await bot.processMessage('!gauntlet run --task test-task', 'test-user', mockSendMessage);

    // Should show error message for missing model
    expect(mockSendMessage).toHaveBeenCalledWith(
      expect.stringContaining('Error: --model is required')
    );
  });

  it('should validate provider parameter for gauntlet run', async () => {
    await bot.processMessage('!gauntlet run --model test-model --provider invalid', 'test-user', mockSendMessage);

    // Should show error message for invalid provider
    expect(mockSendMessage).toHaveBeenCalledWith(
      expect.stringContaining('Error: --provider must be either "openai" or "ollama"')
    );
  });

  it('should validate OpenAI provider requirements', async () => {
    // Ensure no OpenAI API key is set
    delete process.env.OPENAI_API_KEY;
    const testBot = new MorpheumBot();

    await testBot.processMessage('!gauntlet run --model gpt-4 --provider openai', 'test-user', mockSendMessage);

    // Should show error about missing API key
    expect(mockSendMessage).toHaveBeenCalledWith(
      expect.stringContaining('Error: OpenAI provider requires OPENAI_API_KEY environment variable to be set.')
    );
  });

  it('should prevent gauntlet execution with copilot provider', async () => {
    // Set up environment for copilot to work
    process.env.GITHUB_TOKEN = 'test-token';
    
    // Create a new bot instance with the environment set
    const testBot = new MorpheumBot();
    
    // Switch to copilot provider
    await testBot.processMessage('!llm switch copilot owner/repo', 'test-user', mockSendMessage);
    
    // Clear previous calls
    mockSendMessage.mockClear();

    // Try to run gauntlet with copilot
    await testBot.processMessage('!gauntlet run --model test-model', 'test-user', mockSendMessage);

    // Should show error about copilot incompatibility
    expect(mockSendMessage).toHaveBeenCalledWith(
      expect.stringContaining('Error: Gauntlet cannot be run with Copilot provider')
    );
    
    // Clean up
    delete process.env.GITHUB_TOKEN;
  });

  it('should display gauntlet results with pass/fail status', async () => {
    const mockExecuteGauntlet = vi.mocked(executeGauntlet);
    mockExecuteGauntlet.mockResolvedValue({
      'task1': { success: true },
      'task2': { success: false },
      'task3': { success: true }
    });

    await bot.processMessage('!gauntlet run --model test-model', 'test-user', mockSendMessage);

    // Should show results with pass/fail status and success rate
    const resultCall = mockSendMessage.mock.calls.find(call => 
      call[0].includes('Gauntlet Evaluation Complete')
    );
    expect(resultCall).toBeDefined();
    expect(resultCall[0]).toContain('2/3 passed');
    expect(resultCall[0]).toContain('67%'); // Success rate
    expect(resultCall[0]).toContain('✅ PASS');
    expect(resultCall[0]).toContain('❌ FAIL');
  });
});