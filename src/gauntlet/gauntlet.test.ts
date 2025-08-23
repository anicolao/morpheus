import { describe, it, expect } from 'vitest';

describe('XML Converter Output Cleaning', () => {
  // Helper function that mimics the cleaning logic in gauntlet.ts
  function cleanStdoutForJSON(stdout: string): string {
    let cleanStdout = stdout;
    
    // Remove lines containing flake.nix shellHook messages
    cleanStdout = cleanStdout.replace(/^.*✅.*$/gm, '').trim();
    
    // If the output still doesn't look like JSON, try to extract JSON block
    if (!cleanStdout.startsWith('{') && !cleanStdout.startsWith('[')) {
      const jsonMatch = cleanStdout.match(/(\{.*\}|\[.*\])/s);
      if (jsonMatch) {
        cleanStdout = jsonMatch[1];
      }
    }
    
    return cleanStdout;
  }

  it('should clean flake.nix shellHook output from stdout', () => {
    // Simulate stdout with flake.nix pollution and JSON output
    const pollutedStdout = '✅ DOCKER_HOST automatically set to Colima\'s socket.\n{"users":[{"name":"John Doe","email":"john@example.com"}]}';
    
    const cleanStdout = cleanStdoutForJSON(pollutedStdout);
    
    // Should successfully parse as JSON
    const parsed = JSON.parse(cleanStdout);
    
    expect(parsed).toBeDefined();
    expect(typeof parsed === 'object').toBe(true);
    expect(cleanStdout.includes('John Doe')).toBe(true);
    expect(cleanStdout.includes('✅')).toBe(false);
  });

  it('should handle stdout with only JSON (no pollution)', () => {
    const cleanInput = '{"users":[{"name":"John Doe","email":"john@example.com"}]}';
    
    const cleanStdout = cleanStdoutForJSON(cleanInput);
    
    // Should still work fine
    const parsed = JSON.parse(cleanStdout);
    
    expect(parsed).toBeDefined();
    expect(typeof parsed === 'object').toBe(true);
    expect(cleanStdout.includes('John Doe')).toBe(true);
  });

  it('should handle multiline pollution and extract JSON', () => {
    const pollutedStdout = `some other output
✅ DOCKER_HOST automatically set to Colima's socket.
more output
{"users":[{"name":"Jane Smith","email":"jane@example.com"}]}
even more output`;
    
    const cleanStdout = cleanStdoutForJSON(pollutedStdout);
    
    const parsed = JSON.parse(cleanStdout);
    
    expect(parsed).toBeDefined();
    expect(typeof parsed === 'object').toBe(true);
    expect(cleanStdout.includes('Jane Smith')).toBe(true);
    expect(cleanStdout.includes('✅')).toBe(false);
    expect(cleanStdout.includes('more output')).toBe(false);
  });

  it('should handle JSON that spans multiple lines', () => {
    const pollutedStdout = `✅ DOCKER_HOST automatically set to Colima's socket.
{
  "users": [
    {
      "name": "John Doe",
      "email": "john@example.com"
    }
  ]
}`;
    
    const cleanStdout = cleanStdoutForJSON(pollutedStdout);
    
    const parsed = JSON.parse(cleanStdout);
    
    expect(parsed).toBeDefined();
    expect(typeof parsed === 'object').toBe(true);
    expect(cleanStdout.includes('John Doe')).toBe(true);
    expect(cleanStdout.includes('✅')).toBe(false);
  });
});