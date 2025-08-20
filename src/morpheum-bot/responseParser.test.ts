import { parseBashCommands, parsePlanAndNextStep } from './responseParser';
import { describe, it } from 'vitest';
import { assert } from 'chai';

describe('responseParser', () => {
  it('should extract a single bash command', () => {
    const input = 'Here is the command:\n```bash\nls -la\n```';
    const commands = parseBashCommands(input);
    assert.deepEqual(commands, ['ls -la']);
  });

  it('should extract only the last bash command when multiple are present', () => {
    const input = 'First, do this:\n```bash\necho "hello"\n```\nThen, do this:\n```bash\ncd /tmp\n```';
    const commands = parseBashCommands(input);
    assert.deepEqual(commands, ['cd /tmp']);
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

  describe('parsePlanAndNextStep', () => {
    it('should extract plan and next step blocks', () => {
      const input = `<plan>
1. First, do this
2. Then do that
3. Finally, complete the task
</plan>

<next_step>
Execute the first command to list files
</next_step>`;
      
      const result = parsePlanAndNextStep(input);
      assert.equal(result.plan, '1. First, do this\n2. Then do that\n3. Finally, complete the task');
      assert.equal(result.nextStep, 'Execute the first command to list files');
    });

    it('should extract plan only when next_step is missing', () => {
      const input = `<plan>
1. Complete this task
2. Move to next step
</plan>

Some other content without next_step.`;
      
      const result = parsePlanAndNextStep(input);
      assert.equal(result.plan, '1. Complete this task\n2. Move to next step');
      assert.isUndefined(result.nextStep);
    });

    it('should extract next_step only when plan is missing', () => {
      const input = `Some content here.

<next_step>
Run the ls command to see files
</next_step>

More content.`;
      
      const result = parsePlanAndNextStep(input);
      assert.isUndefined(result.plan);
      assert.equal(result.nextStep, 'Run the ls command to see files');
    });

    it('should handle single line blocks', () => {
      const input = `<plan>Check the directory structure</plan>
<next_step>List files in current directory</next_step>`;
      
      const result = parsePlanAndNextStep(input);
      assert.equal(result.plan, 'Check the directory structure');
      assert.equal(result.nextStep, 'List files in current directory');
    });

    it('should be case insensitive', () => {
      const input = `<PLAN>
Check system status
</PLAN>

<Next_Step>
Run system check
</Next_Step>`;
      
      const result = parsePlanAndNextStep(input);
      assert.equal(result.plan, 'Check system status');
      assert.equal(result.nextStep, 'Run system check');
    });

    it('should return empty object when no blocks are found', () => {
      const input = 'Just some regular text without any special blocks.';
      
      const result = parsePlanAndNextStep(input);
      assert.isUndefined(result.plan);
      assert.isUndefined(result.nextStep);
    });
  });
});
