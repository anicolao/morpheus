import { describe, it, expect } from 'vitest';
import { normalizeArgsArray } from './dash-normalizer';

// Demonstration test showing real-world usage scenarios
describe('Unicode Dash Feature Demonstration', () => {
  
  // This test demonstrates the exact issue described in GitHub issue #75
  it('should handle chat app auto-conversion of dashes', () => {
    // Scenario: User types "!gauntlet run --model gpt-4 --verbose" in chat
    // Chat app converts it to Unicode dashes automatically
    const chatAppInput = ['!gauntlet', 'run', '—model', 'gpt-4', '—verbose'];
    
    // Extract just the argument portion (skip !gauntlet run)
    const args = chatAppInput.slice(2);
    
    // The bot should normalize these automatically
    const normalized = normalizeArgsArray(args);
    
    // Should produce the expected ASCII arguments
    expect(normalized).toEqual(['--model', 'gpt-4', '--verbose']);
  });

  it('should work with real gauntlet command examples', () => {
    // Examples from the help text that users would actually type
    const examples = [
      {
        description: 'Basic OpenAI gauntlet run',
        input: ['—model', 'gpt-4', '—provider', 'openai', '—verbose'],
        expected: ['--model', 'gpt-4', '--provider', 'openai', '--verbose']
      },
      {
        description: 'Ollama with specific task',
        input: ['–model', 'llama2', '–task', 'add-jq'],
        expected: ['--model', 'llama2', '--task', 'add-jq']
      },
      {
        description: 'Mixed Unicode dashes',
        input: ['—model', 'gpt-4', '--provider', 'openai', '–verbose'],
        expected: ['--model', 'gpt-4', '--provider', 'openai', '--verbose']
      },
      {
        description: 'Short flags',
        input: ['—m', 'gpt-4', '—v'],
        expected: ['-m', 'gpt-4', '-v']
      }
    ];

    examples.forEach(example => {
      const result = normalizeArgsArray(example.input);
      expect(result).toEqual(example.expected);
    });
  });

  it('should preserve non-dash arguments unchanged', () => {
    // Ensure we don't accidentally modify model names, task names, etc.
    const input = ['—model', 'gpt-4-turbo', '—task', 'add-xml-converter', '—provider', 'openai'];
    const result = normalizeArgsArray(input);
    
    expect(result).toEqual(['--model', 'gpt-4-turbo', '--task', 'add-xml-converter', '--provider', 'openai']);
    
    // Verify specific values are preserved
    expect(result[1]).toBe('gpt-4-turbo'); // Model name unchanged
    expect(result[3]).toBe('add-xml-converter'); // Task name unchanged
  });

  it('should handle empty and edge cases gracefully', () => {
    expect(normalizeArgsArray([])).toEqual([]);
    expect(normalizeArgsArray(['—'])).toEqual(['--']);
    expect(normalizeArgsArray(['regular', 'args'])).toEqual(['regular', 'args']);
  });
});