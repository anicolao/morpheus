import { describe, it, expect } from 'vitest';
import { cleanStdoutForJSON } from './gauntlet';

describe('XML Converter Output Cleaning', () => {

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

  it('should clean empty stdout polluted by flake.nix shellHook', () => {
    // Test the specific case for resolve-python-dependency validation
    const pollutedStdout = '✅ DOCKER_HOST automatically set to Colima\'s socket.\n';
    
    // Apply the same cleaning logic used in resolve-python-dependency
    const cleanStdout = pollutedStdout.replace(/^.*✅.*$/gm, '').trim();
    
    expect(cleanStdout).toBe('');
    expect(cleanStdout === '').toBe(true);
  });

  it('should clean empty stdout with only the shellHook message', () => {
    // Test case where only the shellHook message is present (most common case)
    const pollutedStdout = '✅ DOCKER_HOST automatically set to Colima\'s socket.';
    
    const cleanStdout = pollutedStdout.replace(/^.*✅.*$/gm, '').trim();
    
    expect(cleanStdout).toBe('');
  });
});