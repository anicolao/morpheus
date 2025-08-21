import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CopilotClient } from './copilotClient';

// Mock the @octokit/rest module
const mockOctokit = {
  rest: {
    issues: {
      create: vi.fn(),
      createComment: vi.fn(),
      update: vi.fn(),
      get: vi.fn(),
      listEventsForTimeline: vi.fn()
    },
    pulls: {
      get: vi.fn(),
      listCommits: vi.fn(),
      listFiles: vi.fn()
    },
    reactions: {
      listForIssue: vi.fn()
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
    mockOctokit.rest.issues.get.mockResolvedValue({
      data: { number: 123, state: 'open' }
    });
    mockOctokit.rest.issues.listEventsForTimeline.mockResolvedValue({ data: [] });
    mockOctokit.rest.pulls.get.mockResolvedValue({
      data: { state: 'open', draft: false }
    });
    mockOctokit.rest.pulls.listCommits.mockResolvedValue({ data: [] });
    mockOctokit.rest.pulls.listFiles.mockResolvedValue({ data: [] });
    mockOctokit.rest.reactions.listForIssue.mockResolvedValue({ data: [] });
    
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
        // Mock repository data with Copilot available
        repository: {
          id: 'gid://github/Repository/123456789',
          suggestedActors: {
            nodes: [
              {
                login: 'copilot-swe-agent',
                id: 'gid://github/Bot/copilot-swe-agent',
                __typename: 'Bot'
              }
            ]
          }
        }
      })
      .mockResolvedValueOnce({
        // Mock issue creation response
        createIssue: {
          issue: {
            id: 'gid://github/Issue/123456789',
            number: 123,
            assignees: {
              nodes: [
                {
                  login: 'copilot-swe-agent'
                }
              ]
            }
          }
        }
      });

    // Mock REST API calls for status tracking
    mockOctokit.rest.issues.listEventsForTimeline.mockResolvedValue({
      data: [
        {
          event: 'cross-referenced',
          actor: { login: 'copilot-swe-agent' },
          source: {
            issue: {
              number: 124,
              pull_request: {}
            }
          }
        }
      ]
    });
    mockOctokit.rest.pulls.get.mockResolvedValue({
      data: {
        state: 'open',
        draft: false,
        html_url: 'https://github.com/owner/repo/pull/124',
        body: 'Task completed successfully'
      }
    });
    mockOctokit.rest.pulls.listCommits.mockResolvedValue({
      data: [{ sha: 'abc123' }]
    });
    mockOctokit.rest.pulls.listFiles.mockResolvedValue({
      data: [{ filename: 'src/example.ts' }]
    });

    const response = await client.send('Test prompt');
    
    expect(response).toContain('GitHub Copilot session completed');
    expect(response).toContain('90%'); // confidence percentage
    expect(mockOctokit.graphql).toHaveBeenCalledTimes(2); // Repository data + Issue creation
  });

  it('should fallback to demo mode when GraphQL assignment fails', async () => {
    // Mock GraphQL failure for repository data
    mockOctokit.graphql
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
  }, 10000); // Increase timeout for demo polling

  it('should support streaming with status updates', async () => {
    // Mock demo mode (GraphQL fails)
    mockOctokit.graphql
      .mockRejectedValueOnce(new Error('API not available'));

    const chunks: string[] = [];
    const onChunk = vi.fn((chunk: string) => {
      chunks.push(chunk);
    });

    await client.sendStreaming('Test streaming prompt', onChunk);
    
    expect(onChunk).toHaveBeenCalled();
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0]).toContain('Creating GitHub issue for');
    expect(chunks.some(chunk => chunk.includes('Copilot session started'))).toBe(true);
    expect(chunks.some(chunk => chunk.includes('completed'))).toBe(true);
    expect(chunks.some(chunk => chunk.includes('[DEMO]'))).toBe(true);
  }, 20000); // Increase timeout for async polling

  it('should get active sessions', async () => {
    const sessions = await client.getActiveSessions();
    expect(Array.isArray(sessions)).toBe(true);
  });

  it('should include issue creation and session tracking in streaming updates', async () => {
    // Mock demo mode (GraphQL fails)
    mockOctokit.graphql
      .mockRejectedValueOnce(new Error('API not available'));

    const chunks: string[] = [];
    const onChunk = vi.fn((chunk: string) => {
      chunks.push(chunk);
    });

    await client.sendStreaming('Fix authentication bug', onChunk);
    
    // Check that we get issue creation status updates
    expect(chunks.some(chunk => chunk.includes('Creating GitHub issue for: "Fix authentication bug"'))).toBe(true);
    expect(chunks.some(chunk => chunk.includes('Issue #123 created'))).toBe(true);
    expect(chunks.some(chunk => chunk.includes('Starting GitHub Copilot session for #123'))).toBe(true);
    
    // Check that status updates include session tracking
    expect(chunks.some(chunk => chunk.includes('Track progress: https://github.com/copilot/agents'))).toBe(true);
    
    // Check that all chunks end with newlines (except potentially the final result)
    const statusChunks = chunks.filter(chunk => !chunk.includes('GitHub Copilot session completed!'));
    statusChunks.forEach(chunk => {
      expect(chunk).toMatch(/\n$/);
    });
  }, 20000);

  it('should cancel session', async () => {
    const result = await client.cancelSession('test-session-id');
    expect(result).toBe(true);
  });
});