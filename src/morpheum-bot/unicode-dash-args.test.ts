import { describe, it, expect } from 'vitest';

// Test the Unicode dash argument parsing issue
describe('Unicode Dash Argument Parsing', () => {
  
  // Helper function to simulate argument parsing - this is what we need to fix
  function parseArgsOld(args: string[]): { model?: string; provider?: string; task?: string; verbose?: boolean } {
    const result: { model?: string; provider?: string; task?: string; verbose?: boolean } = {};
    
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--model' || args[i] === '-m') {
        result.model = args[i + 1] || undefined;
        i++; // Skip next argument
      } else if (args[i] === '--provider' || args[i] === '-p') {
        result.provider = args[i + 1] || undefined;
        i++; // Skip next argument
      } else if (args[i] === '--task' || args[i] === '-t') {
        result.task = args[i + 1] || undefined;
        i++; // Skip next argument
      } else if (args[i] === '--verbose' || args[i] === '-v') {
        result.verbose = true;
      }
    }
    
    return result;
  }

  // Helper function to normalize Unicode dashes to ASCII dashes
  function normalizeDashes(arg: string): string {
    return arg
      .replace(/—/g, '--')  // em dash (U+2014) to double dash
      .replace(/–/g, '--'); // en dash (U+2013) to double dash
  }
  
  // New parsing function that handles Unicode dashes
  function parseArgsNew(args: string[]): { model?: string; provider?: string; task?: string; verbose?: boolean } {
    const result: { model?: string; provider?: string; task?: string; verbose?: boolean } = {};
    
    // Normalize dashes in arguments first
    const normalizedArgs = args.map(normalizeDashes);
    
    for (let i = 0; i < normalizedArgs.length; i++) {
      if (normalizedArgs[i] === '--model' || normalizedArgs[i] === '-m') {
        result.model = normalizedArgs[i + 1] || undefined;
        i++; // Skip next argument
      } else if (normalizedArgs[i] === '--provider' || normalizedArgs[i] === '-p') {
        result.provider = normalizedArgs[i + 1] || undefined;
        i++; // Skip next argument
      } else if (normalizedArgs[i] === '--task' || normalizedArgs[i] === '-t') {
        result.task = normalizedArgs[i + 1] || undefined;
        i++; // Skip next argument
      } else if (normalizedArgs[i] === '--verbose' || normalizedArgs[i] === '-v') {
        result.verbose = true;
      }
    }
    
    return result;
  }

  describe('Current argument parsing (broken with Unicode dashes)', () => {
    it('should work with regular ASCII double dashes', () => {
      const args = ['--model', 'gpt-4', '--provider', 'openai', '--verbose'];
      const result = parseArgsOld(args);
      
      expect(result.model).toBe('gpt-4');
      expect(result.provider).toBe('openai');
      expect(result.verbose).toBe(true);
    });

    it('should fail with em dash (—)', () => {
      const args = ['—model', 'gpt-4', '—provider', 'openai', '—verbose'];
      const result = parseArgsOld(args);
      
      // This should fail - the arguments won't be recognized
      expect(result.model).toBeUndefined();
      expect(result.provider).toBeUndefined();
      expect(result.verbose).toBeUndefined();
    });

    it('should fail with en dash (–)', () => {
      const args = ['–model', 'gpt-4', '–provider', 'openai', '–verbose'];
      const result = parseArgsOld(args);
      
      // This should fail - the arguments won't be recognized
      expect(result.model).toBeUndefined();
      expect(result.provider).toBeUndefined();
      expect(result.verbose).toBeUndefined();
    });
  });

  describe('Unicode dash normalization helper', () => {
    it('should convert em dash to double dash', () => {
      expect(normalizeDashes('—model')).toBe('--model');
      expect(normalizeDashes('—verbose')).toBe('--verbose');
    });

    it('should convert en dash to double dash', () => {
      expect(normalizeDashes('–model')).toBe('--model');
      expect(normalizeDashes('–verbose')).toBe('--verbose');
    });

    it('should leave regular dashes unchanged', () => {
      expect(normalizeDashes('--model')).toBe('--model');
      expect(normalizeDashes('-m')).toBe('-m');
      expect(normalizeDashes('regular-text')).toBe('regular-text');
    });
  });

  describe('New argument parsing (fixed with Unicode dash support)', () => {
    it('should work with regular ASCII double dashes', () => {
      const args = ['--model', 'gpt-4', '--provider', 'openai', '--verbose'];
      const result = parseArgsNew(args);
      
      expect(result.model).toBe('gpt-4');
      expect(result.provider).toBe('openai');
      expect(result.verbose).toBe(true);
    });

    it('should work with em dash (—)', () => {
      const args = ['—model', 'gpt-4', '—provider', 'openai', '—verbose'];
      const result = parseArgsNew(args);
      
      // This should now work
      expect(result.model).toBe('gpt-4');
      expect(result.provider).toBe('openai');
      expect(result.verbose).toBe(true);
    });

    it('should work with en dash (–)', () => {
      const args = ['–model', 'gpt-4', '–provider', 'openai', '–verbose'];
      const result = parseArgsNew(args);
      
      // This should now work
      expect(result.model).toBe('gpt-4');
      expect(result.provider).toBe('openai');
      expect(result.verbose).toBe(true);
    });

    it('should work with mixed dash types', () => {
      const args = ['—model', 'gpt-4', '--provider', 'openai', '–verbose'];
      const result = parseArgsNew(args);
      
      // This should now work with mixed dash types
      expect(result.model).toBe('gpt-4');
      expect(result.provider).toBe('openai');
      expect(result.verbose).toBe(true);
    });

    it('should handle task argument with Unicode dashes', () => {
      const args = ['—model', 'llama2', '—task', 'add-jq'];
      const result = parseArgsNew(args);
      
      expect(result.model).toBe('llama2');
      expect(result.task).toBe('add-jq');
    });
  });
});