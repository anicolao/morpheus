import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAIClient } from './openai';
import { OllamaClient } from './ollamaClient';
import { CopilotClient } from './copilotClient';

// Mock fetch for all clients
global.fetch = vi.fn();

describe('LLM Client Metrics Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('OpenAIClient', () => {
    it('should track metrics for send method', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Test response' } }],
          usage: { prompt_tokens: 10, completion_tokens: 5 }
        })
      };
      
      (global.fetch as any).mockResolvedValue(mockResponse);
      
      const client = new OpenAIClient('test-key');
      
      // Initial metrics should be zero
      const initialMetrics = client.getMetrics();
      expect(initialMetrics?.requests).toBe(0);
      expect(initialMetrics?.inputTokens).toBe(0);
      expect(initialMetrics?.outputTokens).toBe(0);
      
      await client.send('Test prompt');
      
      // Metrics should be updated
      const metrics = client.getMetrics();
      expect(metrics?.requests).toBe(1);
      expect(metrics?.inputTokens).toBe(10);
      expect(metrics?.outputTokens).toBe(5);
    });

    it('should track metrics for streaming method', async () => {
      const mockResponse = {
        ok: true,
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n') })
              .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: [DONE]\n\n') })
              .mockResolvedValueOnce({ done: true }),
            releaseLock: vi.fn()
          })
        }
      };
      
      (global.fetch as any).mockResolvedValue(mockResponse);
      
      const client = new OpenAIClient('test-key');
      client.resetMetrics();
      
      let chunks: string[] = [];
      await client.sendStreaming('Test prompt', (chunk) => chunks.push(chunk));
      
      const metrics = client.getMetrics();
      expect(metrics?.requests).toBe(1);
      expect(metrics?.inputTokens).toBeGreaterThan(0); // Should be estimated
      expect(metrics?.outputTokens).toBeGreaterThan(0); // Should be estimated
    });

    it('should reset metrics correctly', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Test response' } }],
          usage: { prompt_tokens: 10, completion_tokens: 5 }
        })
      };
      
      (global.fetch as any).mockResolvedValue(mockResponse);
      
      const client = new OpenAIClient('test-key');
      await client.send('Test prompt');
      
      client.resetMetrics();
      
      const metrics = client.getMetrics();
      expect(metrics?.requests).toBe(0);
      expect(metrics?.inputTokens).toBe(0);
      expect(metrics?.outputTokens).toBe(0);
    });
  });

  describe('OllamaClient', () => {
    it('should track metrics for send method', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          response: 'Test response',
          prompt_eval_count: 8,
          eval_count: 4
        })
      };
      
      (global.fetch as any).mockResolvedValue(mockResponse);
      
      const client = new OllamaClient('http://localhost:11434', 'test-model');
      
      await client.send('Test prompt');
      
      const metrics = client.getMetrics();
      expect(metrics?.requests).toBe(1);
      expect(metrics?.inputTokens).toBe(8);
      expect(metrics?.outputTokens).toBe(4);
    });
  });

  describe('CopilotClient', () => {
    it('should track metrics for send method', async () => {
      const client = new CopilotClient('test-token', 'owner/repo');
      
      // Mock the internal methods to avoid actual GitHub API calls
      vi.spyOn(client as any, 'startCopilotSession').mockResolvedValue({
        id: 'test-session',
        status: 'completed'
      });
      vi.spyOn(client as any, 'waitForCompletion').mockResolvedValue({
        id: 'test-session',
        status: 'completed'
      });
      vi.spyOn(client as any, 'formatFinalResult').mockResolvedValue('Final result');
      
      await client.send('Test prompt');
      
      const metrics = client.getMetrics();
      expect(metrics?.requests).toBe(1);
      expect(metrics?.inputTokens).toBeGreaterThan(0);
      expect(metrics?.outputTokens).toBeGreaterThan(0);
    });
  });
});