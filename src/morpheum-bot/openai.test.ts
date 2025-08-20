import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendOpenAIRequest, OpenAIClient } from './openai';

describe('OpenAI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendOpenAIRequest (legacy function)', () => {
    it('should send a prompt to the OpenAI API and return a response', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'This is a test response from OpenAI.',
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const response = await sendOpenAIRequest('test prompt', 'test-api-key');
      expect(response).toEqual('This is a test response from OpenAI.');
      
      expect(fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-api-key',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'user',
                content: 'test prompt',
              },
            ],
            stream: false,
          }),
        })
      );
    });
  });

  describe('OpenAIClient', () => {
    it('should send a prompt to the OpenAI API and return a response', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Hello from OpenAI!',
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const client = new OpenAIClient('test-api-key', 'gpt-4');
      const response = await client.send('Test prompt');
      
      expect(response).toEqual('Hello from OpenAI!');
      expect(fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-api-key',
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              {
                role: 'user',
                content: 'Test prompt',
              },
            ],
            stream: false,
          }),
        })
      );
    });

    it('should handle custom base URL', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Hello from custom API!',
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const client = new OpenAIClient('test-api-key', 'gpt-3.5-turbo', 'http://localhost:8000/v1');
      const response = await client.send('Test prompt');
      
      expect(response).toEqual('Hello from custom API!');
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/v1/chat/completions',
        expect.anything()
      );
    });

    it('should handle API errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized'),
      });

      const client = new OpenAIClient('invalid-key');
      
      await expect(client.send('Test prompt')).rejects.toThrow(
        'OpenAI API request failed with status 401: Unauthorized'
      );
    });

    it('should handle empty responses', async () => {
      const mockResponse = {
        choices: [],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const client = new OpenAIClient('test-api-key');
      const response = await client.send('Test prompt');
      
      expect(response).toEqual('');
    });
  });
});
