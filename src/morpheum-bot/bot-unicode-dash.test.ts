import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MorpheumBot } from './bot';

// Test that the bot properly handles Unicode dashes in gauntlet commands
describe('MorpheumBot Unicode Dash Support', () => {
  let bot: MorpheumBot;
  let mockSendMessage: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    bot = new MorpheumBot();
    mockSendMessage = vi.fn();
  });

  describe('gauntlet command argument parsing', () => {
    it('should parse regular ASCII double dashes', async () => {
      const command = '!gauntlet run --model gpt-4 --provider openai --verbose';
      
      // Mock the gauntlet import to avoid actual execution
      vi.doMock('../gauntlet/gauntlet', () => ({
        executeGauntlet: vi.fn().mockResolvedValue({})
      }));

      await bot.processMessage(command, 'test-user', mockSendMessage);
      
      // Should not show error about missing model
      const errorMessages = mockSendMessage.mock.calls
        .map(call => call[0])
        .filter(msg => msg.includes('Error: --model is required'));
      
      expect(errorMessages).toHaveLength(0);
    });

    it('should parse em dash (—) as double dash', async () => {
      const command = '!gauntlet run —model gpt-4 —provider openai —verbose';
      
      // Mock the gauntlet import to avoid actual execution
      vi.doMock('../gauntlet/gauntlet', () => ({
        executeGauntlet: vi.fn().mockResolvedValue({})
      }));

      await bot.processMessage(command, 'test-user', mockSendMessage);
      
      // Should not show error about missing model
      const errorMessages = mockSendMessage.mock.calls
        .map(call => call[0])
        .filter(msg => msg.includes('Error: --model is required'));
      
      expect(errorMessages).toHaveLength(0);
    });

    it('should parse en dash (–) as double dash', async () => {
      const command = '!gauntlet run –model gpt-4 –provider openai –verbose';
      
      // Mock the gauntlet import to avoid actual execution
      vi.doMock('../gauntlet/gauntlet', () => ({
        executeGauntlet: vi.fn().mockResolvedValue({})
      }));

      await bot.processMessage(command, 'test-user', mockSendMessage);
      
      // Should not show error about missing model
      const errorMessages = mockSendMessage.mock.calls
        .map(call => call[0])
        .filter(msg => msg.includes('Error: --model is required'));
      
      expect(errorMessages).toHaveLength(0);
    });

    it('should handle mixed dash types', async () => {
      const command = '!gauntlet run —model gpt-4 --provider openai –verbose';
      
      // Mock the gauntlet import to avoid actual execution
      vi.doMock('../gauntlet/gauntlet', () => ({
        executeGauntlet: vi.fn().mockResolvedValue({})
      }));

      await bot.processMessage(command, 'test-user', mockSendMessage);
      
      // Should not show error about missing model
      const errorMessages = mockSendMessage.mock.calls
        .map(call => call[0])
        .filter(msg => msg.includes('Error: --model is required'));
      
      expect(errorMessages).toHaveLength(0);
    });

    it('should still show error when model is missing', async () => {
      const command = '!gauntlet run —provider openai —verbose';
      
      await bot.processMessage(command, 'test-user', mockSendMessage);
      
      // Should show error about missing model
      const errorMessages = mockSendMessage.mock.calls
        .map(call => call[0])
        .filter(msg => msg.includes('Error: --model is required'));
      
      expect(errorMessages).toHaveLength(1);
    });
  });
});