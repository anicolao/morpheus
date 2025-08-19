import { SWEAgent } from './sweAgent';
import { describe, it, vi } from 'vitest';
import { assert } from 'chai';
import { OllamaClient } from './ollamaClient';
import { JailClient } from './jailClient';
import { SYSTEM_PROMPT } from './prompts';

describe('SWEAgent', () => {
  it('should run the main agent loop until the task is done', async () => {
    const ollamaClient = new OllamaClient('', '');
    const jailClient = new JailClient('', 0);

    const ollamaMock = vi.spyOn(ollamaClient, 'send')
      .mockResolvedValueOnce('```bash\nls -la\n```')
      .mockResolvedValueOnce('All done!');
    const jailMock = vi.spyOn(jailClient, 'execute').mockResolvedValueOnce('total 0');

    const agent = new SWEAgent(ollamaClient, jailClient);
    const finalResult = await agent.run('list all files');

    // Check that the final response is what we expect
    const lastMessage = finalResult[finalResult.length - 1];
    assert.equal(lastMessage.role, 'assistant');
    assert.equal(lastMessage.content, 'All done!');

    // Check that the conversation history has the correct number of turns
    assert.lengthOf(finalResult, 5); // system, user, assistant, tool, assistant

    // Check that the mocks were called the correct number of times
    assert.lengthOf(ollamaMock.mock.calls, 2);
    assert.lengthOf(jailMock.mock.calls, 1);
  });
});
