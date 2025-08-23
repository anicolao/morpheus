import { describe, it, expect, vi } from 'vitest';

// Simple integration test to verify argument parsing works
describe('Bot Gauntlet Unicode Dash Integration', () => {
  
  // Simulate the runGauntletEvaluation argument parsing logic
  async function parseGauntletArgs(args: string[]): Promise<{ model?: string; provider?: string; task?: string; verbose?: boolean }> {
    // Import the normalizer
    const { normalizeArgsArray } = await import('./dash-normalizer');
    
    // Parse arguments - normalize Unicode dashes first
    const normalizedArgs = normalizeArgsArray(args);
    
    let model: string | null = null;
    let provider: 'openai' | 'ollama' = 'ollama';
    let task: string | null = null;
    let verbose = false;

    for (let i = 0; i < normalizedArgs.length; i++) {
      if (normalizedArgs[i] === '--model' || normalizedArgs[i] === '-m') {
        model = normalizedArgs[i + 1] || null;
        i++; // Skip next argument
      } else if (normalizedArgs[i] === '--provider' || normalizedArgs[i] === '-p') {
        const providerArg = normalizedArgs[i + 1];
        if (providerArg && ['openai', 'ollama'].includes(providerArg)) {
          provider = providerArg as 'openai' | 'ollama';
        }
        i++; // Skip next argument
      } else if (normalizedArgs[i] === '--task' || normalizedArgs[i] === '-t') {
        task = normalizedArgs[i + 1] || null;
        i++; // Skip next argument
      } else if (normalizedArgs[i] === '--verbose' || normalizedArgs[i] === '-v') {
        verbose = true;
      }
    }

    return { model, provider, task, verbose };
  }

  it('should parse ASCII double dashes correctly', async () => {
    const args = ['--model', 'gpt-4', '--provider', 'openai', '--verbose'];
    const result = await parseGauntletArgs(args);
    
    expect(result.model).toBe('gpt-4');
    expect(result.provider).toBe('openai');
    expect(result.verbose).toBe(true);
  });

  it('should parse em dash (—) correctly', async () => {
    const args = ['—model', 'gpt-4', '—provider', 'openai', '—verbose'];
    const result = await parseGauntletArgs(args);
    
    expect(result.model).toBe('gpt-4');
    expect(result.provider).toBe('openai');
    expect(result.verbose).toBe(true);
  });

  it('should parse en dash (–) correctly', async () => {
    const args = ['–model', 'gpt-4', '–provider', 'openai', '–verbose'];
    const result = await parseGauntletArgs(args);
    
    expect(result.model).toBe('gpt-4');
    expect(result.provider).toBe('openai');
    expect(result.verbose).toBe(true);
  });

  it('should parse mixed dash types correctly', async () => {
    const args = ['—model', 'llama2', '--provider', 'ollama', '–task', 'add-jq'];
    const result = await parseGauntletArgs(args);
    
    expect(result.model).toBe('llama2');
    expect(result.provider).toBe('ollama');
    expect(result.task).toBe('add-jq');
    expect(result.verbose).toBe(false);
  });

  it('should handle short flags with Unicode dashes', async () => {
    const args = ['—m', 'gpt-4', '—p', 'openai', '—v'];
    const result = await parseGauntletArgs(args);
    
    expect(result.model).toBe('gpt-4');
    expect(result.provider).toBe('openai');
    expect(result.verbose).toBe(true);
  });
});