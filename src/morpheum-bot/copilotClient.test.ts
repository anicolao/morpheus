import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CopilotClient } from './copilotClient';

// Mock the @octokit/rest module
const mockOctokit = {
  rest: {
    issues: {
      create: vi.fn(),
      createComment: vi.fn(),
      update: vi.fn()
    }
  },
  graphql: vi.fn()
};

vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn().mockImplementation(() => mockOctokit)
}));

describe('CopilotClient', () => {
  let client: CopilotClient;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up default mocks for REST API
    mockOctokit.rest.issues.create.mockResolvedValue({
      data: { 
        number: 123,
        title: 'Test Issue'
      }
    });
    mockOctokit.rest.issues.createComment.mockResolvedValue({});
    mockOctokit.rest.issues.update.mockResolvedValue({});
    
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

  it('should send prompt and return response with real Copilot API', async () => {
    // Mock successful GraphQL responses
    mockOctokit.graphql
      .mockResolvedValueOnce({
        // Mock issue ID query response
        repository: {
          issue: {
            id: 'gid://github/Issue/123456789'
          }
        }
      })
      .mockResolvedValueOnce({
        // Mock Copilot assignment response
        assignIssueToCopilot: {
          issue: {
            id: 'gid://github/Issue/123456789',
            number: 123
          },
          copilotSession: {
            id: 'cop_real_session_123',
            status: 'pending'
          }
        }
      })
      .mockResolvedValueOnce({
        // Mock session status query
        copilotSession: {
          id: 'cop_real_session_123',
          status: 'completed',
          result: {
            summary: 'Task completed successfully',
            pullRequestUrl: 'https://github.com/owner/repo/pull/124',
            commitSha: 'abc123',
            filesChanged: ['src/example.ts'],
            confidence: 0.9
          },
          updatedAt: new Date().toISOString()
        }
      });

    const response = await client.send('Test prompt');
    
    expect(response).toContain('GitHub Copilot session completed');
    expect(response).toContain('90%'); // confidence percentage
    expect(mockOctokit.rest.issues.create).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      title: 'Copilot Task: Test prompt',
      body: expect.stringContaining('GitHub Copilot Coding Agent Task'),
      labels: ['copilot-session'],
    });
    expect(mockOctokit.graphql).toHaveBeenCalledTimes(3); // Issue ID + Assignment + Status
  });

  it('should fallback to demo mode when GraphQL assignment fails', async () => {
    // Mock GraphQL failure for assignment
    mockOctokit.graphql
      .mockResolvedValueOnce({
        repository: {
          issue: {
            id: 'gid://github/Issue/123456789'
          }
        }
      })
      .mockRejectedValueOnce(new Error('Copilot API not available'));

    const response = await client.send('Test prompt');
    
    expect(response).toContain('[DEMO]');
    expect(response).toContain('GitHub Copilot session completed');
    expect(mockOctokit.rest.issues.update).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      issue_number: 123,
      title: '[DEMO] Test Issue',
    });
  });

  it('should support streaming with status updates', async () => {
    // Mock demo mode (GraphQL fails)
    mockOctokit.graphql
      .mockResolvedValueOnce({
        repository: {
          issue: {
            id: 'gid://github/Issue/123456789'
          }
        }
      })
      .mockRejectedValueOnce(new Error('API not available'));

    const chunks: string[] = [];
    const onChunk = vi.fn((chunk: string) => {
      chunks.push(chunk);
    });

    await client.sendStreaming('Test streaming prompt', onChunk);
    
    expect(onChunk).toHaveBeenCalled();
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0]).toContain('Copilot session started');
    expect(chunks.some(chunk => chunk.includes('completed'))).toBe(true);
    expect(chunks.some(chunk => chunk.includes('[DEMO]'))).toBe(true);
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