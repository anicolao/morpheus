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
});
