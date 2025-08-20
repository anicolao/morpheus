import { OllamaClient } from './ollamaClient';
import { describe, it, vi } from 'vitest';
import { assert } from 'chai';

describe('OllamaClient', () => {
  it('should send a prompt to a mock Ollama API and receive a response', async () => {
    let capturedUrl: string | undefined;
    let capturedOptions: RequestInit | undefined;

    const mockFetch = vi.fn((url: string, options: RequestInit) => {
      capturedUrl = url;
      capturedOptions = options;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ response: 'Hello from Ollama!' }),
      });
    });

    global.fetch = mockFetch;

    const client = new OllamaClient('http://localhost:11434', 'test-model');
    const response = await client.send('Test prompt');

    assert.equal(response, 'Hello from Ollama!');
    assert.equal(capturedUrl, 'http://localhost:11434/api/generate');
    assert.isDefined(capturedOptions);
    assert.deepEqual(JSON.parse(capturedOptions!.body as string), {
      model: 'test-model',
      prompt: 'Test prompt',
      stream: false,
    });
  });

  it('should handle streaming responses', async () => {
    const streamingData = [
      '{"response":"Hello","done":false}\n',
      '{"response":" from","done":false}\n',
      '{"response":" Ollama!","done":false}\n',
      '{"response":"","done":true}\n'
    ];

    const mockResponse = {
      ok: true,
      body: {
        getReader: () => {
          let index = 0;
          return {
            read: async () => {
              if (index >= streamingData.length) {
                return { done: true, value: undefined };
              }
              const chunk = new TextEncoder().encode(streamingData[index++]);
              return { done: false, value: chunk };
            },
            releaseLock: () => {}
          };
        }
      }
    };

    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    const client = new OllamaClient('http://localhost:11434', 'test-model');
    const chunks: string[] = [];
    const response = await client.sendStreaming('Test prompt', (chunk) => {
      chunks.push(chunk);
    });
    
    assert.equal(response, 'Hello from Ollama!');
    assert.deepEqual(chunks, ['Hello', ' from', ' Ollama!']);
    assert.isTrue((fetch as any).mock.calls.length > 0);
    const callArgs = (fetch as any).mock.calls[0];
    assert.equal(callArgs[0], 'http://localhost:11434/api/generate');
    assert.deepEqual(JSON.parse(callArgs[1].body), {
      model: 'test-model',
      prompt: 'Test prompt',
      stream: true,
    });
  });

  it('should handle streaming API errors', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error'),
    });

    const client = new OllamaClient('http://localhost:11434', 'test-model');
    
    try {
      await client.sendStreaming('Test prompt', () => {});
      assert.fail('Expected error to be thrown');
    } catch (error) {
      assert.equal((error as Error).message, 'Ollama API request failed with status 500');
    }
  });
});
