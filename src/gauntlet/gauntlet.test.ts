import { describe, it, expect } from 'vitest';
import { cleanStdoutForJSON, gauntletTasks } from './gauntlet';

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

  it('should handle refine-existing-codebase API response with pollution', () => {
    // Test the specific case for refine-existing-codebase task
    const pollutedApiResponse = '✅ Gauntlet project environment ready\n{"status": "ok", "timestamp": "2025-01-29T12:00:00.000Z"}';
    
    const cleanStdout = cleanStdoutForJSON(pollutedApiResponse);
    const parsed = JSON.parse(cleanStdout);
    
    expect(parsed.status).toBe('ok');
    expect(parsed.timestamp).toBeTruthy();
    expect(cleanStdout.includes('✅')).toBe(false);
    expect(cleanStdout.includes('Gauntlet project environment ready')).toBe(false);
  });

  it('should handle refine-existing-codebase API response with multiline pollution', () => {
    // Test with flake.nix pollution that might occur but clean JSON from the API
    const pollutedApiResponse = `✅ DOCKER_HOST automatically set to Colima's socket.
✅ Gauntlet project environment ready
{"status": "ok", "timestamp": "2025-01-29T12:00:00.000Z"}`;
    
    const cleanStdout = cleanStdoutForJSON(pollutedApiResponse);
    const parsed = JSON.parse(cleanStdout);
    
    expect(parsed.status).toBe('ok');
    expect(parsed.timestamp).toBeTruthy();
    expect(cleanStdout.includes('✅')).toBe(false);
    expect(cleanStdout.includes('DOCKER_HOST')).toBe(false);
    expect(cleanStdout.includes('Gauntlet project environment ready')).toBe(false);
  });
});

describe('Gauntlet Task Order', () => {

  it('should have create-project-dir as the first task', () => {
    expect(gauntletTasks.length).toBeGreaterThan(0);
    expect(gauntletTasks[0]?.id).toBe('create-project-dir');
  });

  it('should have check-sed-available as the second task', () => {
    expect(gauntletTasks.length).toBeGreaterThan(1);
    expect(gauntletTasks[1]?.id).toBe('check-sed-available');
  });

  it('should have add-jq as the third task', () => {
    expect(gauntletTasks.length).toBeGreaterThan(2);
    expect(gauntletTasks[2]?.id).toBe('add-jq');
  });

  it('should maintain the correct task order: create-project-dir, check-sed-available, add-jq', () => {
    const firstThreeTaskIds = gauntletTasks.slice(0, 3).map(task => task.id);
    expect(firstThreeTaskIds).toEqual(['create-project-dir', 'check-sed-available', 'add-jq']);
  });

});