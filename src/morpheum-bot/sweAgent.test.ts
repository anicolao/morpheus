import { SWEAgent } from './sweAgent';
import { describe, it, vi } from 'vitest';
import { assert } from 'chai';
import { OllamaClient } from './ollamaClient';
import { JailClient } from './jailClient';
import { SYSTEM_PROMPT } from './prompts';

describe('SWEAgent', () => {
  it('should run the main agent loop', async () => {
    const ollamaClient = new OllamaClient('', '');
    const jailClient = new JailClient('', 0);

    const ollamaMock = vi.spyOn(ollamaClient, 'send').mockResolvedValueOnce('```bash\nls -la\n```');
    const jailMock = vi.spyOn(jailClient, 'execute').mockResolvedValueOnce('total 0');

    const agent = new SWEAgent(ollamaClient, jailClient);
    const finalResult = await agent.run('list all files');

    const lastMessage = finalResult[finalResult.length - 1];
    assert.equal(lastMessage.role, 'tool');
    assert.equal(lastMessage.content, 'total 0');
    assert.lengthOf(ollamaMock.mock.calls, 1);
    assert.lengthOf(jailMock.mock.calls, 1);
  });
});
