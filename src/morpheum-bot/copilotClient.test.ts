import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CopilotClient } from './copilotClient';

// Mock the @octokit/rest module
const mockOctokit = {
  rest: {
    issues: {
      create: vi.fn().mockResolvedValue({
        data: { number: 123 }
      }),
      createComment: vi.fn().mockResolvedValue({})
    }
  }
};

vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn().mockImplementation(() => mockOctokit)
}));

describe('CopilotClient', () => {
  let client: CopilotClient;
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Set poll interval to very short for testing
    process.env.COPILOT_POLL_INTERVAL = '0.1';
    client = new CopilotClient('test-token', 'owner/repo');
  });

  it('should create client with valid configuration', () => {
    expect(client).toBeDefined();
  });

  it('should throw error for invalid repository format', () => {
    expect(() => {
      new CopilotClient('test-token', 'invalid-repo-format');
    }).toThrow('Repository must be in format "owner/repo"');
  });

  it('should send prompt and return response', async () => {
    const response = await client.send('Test prompt');
    expect(response).toContain('GitHub Copilot session completed');
    expect(mockOctokit.rest.issues.create).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      title: 'Copilot Task: Test prompt',
      body: 'GitHub Copilot task request:\n\nTest prompt',
      labels: ['copilot-session'],
    });
  });

  it('should support streaming with status updates', async () => {
    const chunks: string[] = [];
    const onChunk = vi.fn((chunk: string) => {
      chunks.push(chunk);
    });

    await client.sendStreaming('Test streaming prompt', onChunk);
    
    expect(onChunk).toHaveBeenCalled();
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0]).toContain('Copilot session started');
    expect(chunks.some(chunk => chunk.includes('completed'))).toBe(true);
  }, 20000); // Increase timeout for async polling

  it('should get active sessions', async () => {
    const sessions = await client.getActiveSessions();
    expect(Array.isArray(sessions)).toBe(true);
  });

  it('should cancel session', async () => {
    const result = await client.cancelSession('test-session-id');
    expect(result).toBe(true);
  });
});