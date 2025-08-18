import { parseBashCommands } from './responseParser';
import { describe, it } from 'vitest';
import { assert } from 'chai';

describe('responseParser', () => {
  it('should extract a single bash command', () => {
    const input = 'Here is the command:\n```bash\nls -la\n```';
    const commands = parseBashCommands(input);
    assert.deepEqual(commands, ['ls -la']);
  });

  it('should extract multiple bash commands', () => {
    const input = 'First, do this:\n```bash\necho "hello"\n```\nThen, do this:\n```bash\ncd /tmp\n```';
    const commands = parseBashCommands(input);
    assert.deepEqual(commands, ['echo "hello"', 'cd /tmp']);
  });

  it('should return an empty array if no commands are found', () => {
    const input = 'There are no commands here.';
    const commands = parseBashCommands(input);
    assert.deepEqual(commands, []);
  });

  it('should handle commands with multiple lines', () => {
    const input = '```bash\n' +
      'echo "line 1"\n' +
      'echo "line 2"\n' +
      '```';
    const commands = parseBashCommands(input);
    assert.deepEqual(commands, ['echo "line 1"\necho "line 2"']);
  });

  it('should be case-insensitive to the language specifier', () => {
    const input = '```BASH\nls\n```';
    const commands = parseBashCommands(input);
    assert.deepEqual(commands, ['ls']);
  });
});
