import { describe, it, expect, vi } from 'vitest';
import { sendOpenAIRequest } from './openai';

describe.skip('openai', () => {
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
      json: () => Promise.resolve(mockResponse),
    });

    const response = await sendOpenAIRequest('test prompt', 'test-api-key');
    expect(response).toEqual('This is a test response from OpenAI.');
  });
});
