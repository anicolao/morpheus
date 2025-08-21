import { type LLMClient } from './llmClient';
import { Octokit } from '@octokit/rest';

/**
 * GitHub Copilot session status
 */
export type CopilotSessionStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

/**
 * GitHub Copilot session information
 */
export interface CopilotSession {
  id: string;
  status: CopilotSessionStatus;
  issueNumber?: number;
  createdAt: Date;
  updatedAt: Date;
  result?: CopilotResult;
  pullRequestUrl?: string; // Track PR URL for notifications
  pullRequestState?: 'draft' | 'ready' | 'merged' | 'closed'; // Track PR state for notifications
}

/**
 * GitHub Copilot session result
 */
export interface CopilotResult {
  summary: string;
  pullRequestUrl?: string;
  commitSha?: string;
  filesChanged: string[];
  confidence: number;
}

/**
 * GitHub repository data from GraphQL API
 */
export interface RepositoryData {
  repository: {
    id: string;
    suggestedActors: {
      nodes: Array<{
        login: string;
        id?: string; // Optional since id is only available on concrete types, not Actor interface
        __typename: string;
      }>;
    };
  };
}

/**
 * GitHub Copilot issue creation response from GraphQL API
 */
export interface CopilotIssueResponse {
  createIssue: {
    issue: {
      id: string;
      number: number;
      assignees: {
        nodes: Array<{
          login: string;
        }>;
      };
    };
  };
}

/**
 * GitHub Copilot client implementing the LLMClient interface
 */
export class CopilotClient implements LLMClient {
  private octokit: Octokit;
  private owner: string;
  private repo: string;
  private pollInterval: number;

  constructor(
    private readonly githubToken: string,
    private readonly repository: string,
    private readonly baseUrl: string = 'https://api.github.com'
  ) {
    this.octokit = new Octokit({
      auth: githubToken,
      baseUrl: baseUrl,
    });

    // Parse repository owner/repo
    const parts = repository.split('/');
    if (parts.length !== 2) {
      throw new Error('Repository must be in format "owner/repo"');
    }
    this.owner = parts[0];
    this.repo = parts[1];
    
    // Poll interval in seconds (from env or default 30 seconds)
    this.pollInterval = parseInt(process.env.COPILOT_POLL_INTERVAL || '30', 10) * 1000;
  }

  async send(prompt: string): Promise<string> {
    console.log(`--- GITHUB COPILOT REQUEST (${this.repository} @ ${this.baseUrl}) ---`);
    console.log(prompt.split('\n').map(line => `  ${line}`).join('\n'));
    console.log("----------------------");

    try {
      // Start copilot session and wait for completion
      const session = await this.startCopilotSession(prompt);
      const completedSession = await this.waitForCompletion(session);
      
      const result = await this.formatFinalResult(completedSession);
      
      console.log(`--- GITHUB COPILOT RESPONSE (${this.repository} @ ${this.baseUrl}) ---`);
      console.log(result.split('\n').map(line => `  ${line}`).join('\n'));
      console.log("-----------------------");
      
      return result;
    } catch (error) {
      console.error('GitHub Copilot request failed:', error);
      throw error;
    }
  }

  async sendStreaming(prompt: string, onChunk: (chunk: string) => void): Promise<string> {
    console.log(`--- GITHUB COPILOT STREAMING REQUEST (${this.repository} @ ${this.baseUrl}) ---`);
    console.log(prompt.split('\n').map(line => `  ${line}`).join('\n'));
    console.log("----------------------");

    try {
      // Send issue creation status
      onChunk(`🤖 Creating GitHub issue for: "${prompt}"\n`);
      
      // Create issue and start Copilot session
      const session = await this.startCopilotSession(prompt);
      
      // Send issue created status with link
      if (session.issueNumber) {
        const issueUrl = this.buildIssueUrl(session.issueNumber);
        onChunk(`✅ **Issue [#${session.issueNumber}](${issueUrl}) created**\n`);
        onChunk(`🚀 Starting GitHub Copilot session for [#${session.issueNumber}](${issueUrl})...\n`);
      }
      
      // Send initial status
      const initialUpdate = this.formatStatusUpdate(session);
      onChunk(initialUpdate);
      
      // Poll for updates and stream them
      let currentSession = session;
      while (currentSession.status !== 'completed' && currentSession.status !== 'failed') {
        await new Promise(resolve => setTimeout(resolve, this.pollInterval));
        const updatedSession = await this.getSessionStatus(currentSession.id, currentSession.issueNumber);
        
        // Check for new PR creation (not in current session but in updated session)
        if (updatedSession.pullRequestUrl && !currentSession.pullRequestUrl) {
          const isDemo = updatedSession.id.startsWith('cop_demo_');
          const prefix = isDemo ? '[DEMO] ' : '';
          const prNumber = this.extractPRNumber(updatedSession.pullRequestUrl);
          if (prNumber) {
            const prUrl = this.buildPRUrl(prNumber);
            onChunk(`🔗 ${prefix}**Pull Request [#${prNumber}](${prUrl}) created**\n`);
          } else {
            onChunk(`🔗 ${prefix}**Pull Request created**: ${updatedSession.pullRequestUrl}\n`);
          }
        }
        
        // Check for PR ready state change (from draft to ready)
        if (updatedSession.pullRequestUrl && 
            updatedSession.pullRequestState === 'ready' && 
            currentSession.pullRequestState !== 'ready') {
          const prReadyUpdate = this.formatPRReadyUpdate(updatedSession);
          onChunk(prReadyUpdate);
        }
        
        if (updatedSession.status !== currentSession.status) {
          const statusUpdate = this.formatStatusUpdate(updatedSession);
          onChunk(statusUpdate);
        }
        
        currentSession = updatedSession;
      }
      
      const finalResult = await this.formatFinalResult(currentSession);
      
      // Send the final result as a chunk so it reaches the chat room
      onChunk(finalResult);
      
      console.log(`--- GITHUB COPILOT STREAMING RESPONSE COMPLETE (${this.repository} @ ${this.baseUrl}) ---`);
      console.log(finalResult.split('\n').map(line => `  ${line}`).join('\n'));
      console.log("-----------------------");
      
      return finalResult;
    } catch (error) {
      console.error('GitHub Copilot streaming request failed:', error);
      throw error;
    }
  }

  /**
   * Start a GitHub Copilot session for the given prompt
   */
  private async startCopilotSession(prompt: string): Promise<CopilotSession> {
    try {
      // Step 1: Check if Copilot is available and get repository/bot IDs
      const repositoryData = await this.octokit.graphql(`
        query GetRepositoryData($owner: String!, $repo: String!) {
          repository(owner: $owner, name: $repo) {
            id
            suggestedActors(capabilities: [CAN_BE_ASSIGNED], first: 100) {
              nodes {
                login
                __typename
                ... on Bot {
                  id
                }
                ... on User {
                  id
                }
              }
            }
          }
        }
      `, {
        owner: this.owner,
        repo: this.repo,
      }) as RepositoryData;

      // Find Copilot bot in suggested actors
      const copilotActor = repositoryData.repository.suggestedActors.nodes.find(
        actor => actor.login === 'copilot-swe-agent'
      );

      if (!copilotActor) {
        throw new Error('Copilot coding agent is not available for this repository');
      }

      if (!copilotActor.id) {
        throw new Error('Unable to get Copilot actor ID from GraphQL response');
      }

      const repositoryId = repositoryData.repository.id;
      const copilotBotId = copilotActor.id;

      // Step 2: Create issue with Copilot assigned using GraphQL
      const createIssueMutation = `
        mutation CreateIssueWithCopilot($repositoryId: ID!, $title: String!, $body: String!, $assigneeIds: [ID!]!) {
          createIssue(input: {
            repositoryId: $repositoryId,
            title: $title,
            body: $body,
            assigneeIds: $assigneeIds
          }) {
            issue {
              id
              number
              assignees(first: 10) {
                nodes {
                  login
                }
              }
            }
          }
        }
      `;

      const issueTitle = `Copilot Task: ${prompt.slice(0, 80)}${prompt.length > 80 ? '...' : ''}`;
      const issueBody = `**GitHub Copilot Coding Agent Task**\n\nThis issue has been assigned to GitHub Copilot for automated resolution.\n\n**Task Request:**\n${prompt}\n\n*This issue will be automatically processed by GitHub Copilot's coding agent.*`;

      const issueResponse = await this.octokit.graphql(createIssueMutation, {
        repositoryId: repositoryId,
        title: issueTitle,
        body: issueBody,
        assigneeIds: [copilotBotId],
      }) as CopilotIssueResponse;

      const issue = issueResponse.createIssue.issue;
      const issueNumber = issue.number;

      // Verify Copilot was assigned (note: assignment may take a moment to reflect)
      const copilotAssigned = issue.assignees.nodes.some(assignee => assignee.login === 'copilot-swe-agent');
      
      if (!copilotAssigned) {
        // Log warning but don't fail - assignment may be working even if not immediately reflected
        console.warn('Copilot assignment not immediately reflected in response, but assignment request was sent successfully');
      }

      // Generate session ID based on issue (since we don't get a separate session ID from the API)
      const sessionId = `cop_real_${issueNumber}_${Date.now()}`;
      
      const session: CopilotSession = {
        id: sessionId,
        status: 'pending',
        issueNumber: issueNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add comment to issue with session information
      await this.octokit.rest.issues.createComment({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
        body: `🤖 **GitHub Copilot Coding Agent Assigned**\n\nSession ID: ${sessionId}\nStatus: ${session.status}\n\nThe GitHub Copilot coding agent is now working on this issue. You can track progress at https://github.com/copilot/agents`,
      });

      return session;
    } catch (error) {
      console.warn('Failed to assign issue to Copilot coding agent, falling back to demo mode:', error);
      
      // Fallback to demo mode if the GraphQL API is not available or fails
      // Create GitHub issue for the prompt using REST API
      const issue = await this.octokit.rest.issues.create({
        owner: this.owner,
        repo: this.repo,
        title: `Copilot Task: ${prompt.slice(0, 80)}${prompt.length > 80 ? '...' : ''}`,
        body: `**GitHub Copilot Coding Agent Task**\n\nThis issue has been assigned to GitHub Copilot for automated resolution.\n\n**Task Request:**\n${prompt}\n\n*This issue will be automatically processed by GitHub Copilot's coding agent.*`,
        labels: ['copilot-session'],
      });

      const sessionId = `cop_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const session: CopilotSession = {
        id: sessionId,
        status: 'pending',
        issueNumber: issue.data.number,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Update issue title and add demo notice
      await this.octokit.rest.issues.update({
        owner: this.owner,
        repo: this.repo,
        issue_number: issue.data.number,
        title: `[DEMO] ${issue.data.title}`,
      });

      // Add comment to issue with session information
      await this.octokit.rest.issues.createComment({
        owner: this.owner,
        repo: this.repo,
        issue_number: issue.data.number,
        body: `🤖 **GitHub Copilot Integration Demo**\n\nSession ID: ${sessionId}\nStatus: ${session.status}\n\n*Note: This is a simulation demonstrating how GitHub Copilot sessions would work. The actual Copilot coding agent API assignment failed or is not yet available.*\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });

      return session;
    }
  }

  /**
   * Get the current status of a Copilot session
   */
  private async getSessionStatus(sessionId: string, issueNumber?: number): Promise<CopilotSession> {
    // Check if this is a real Copilot session or demo session
    if (sessionId.startsWith('cop_demo_')) {
      // Demo mode simulation
      const sessionAge = Date.now() - parseInt(sessionId.split('_')[2]);
      
      let status: CopilotSessionStatus;
      let result: CopilotResult | undefined;
      
      if (sessionAge < 1000) {
        status = 'pending';
      } else if (sessionAge < 2000) {
        status = 'in_progress';
      } else {
        status = 'completed';
        result = {
          summary: 'DEMO: GitHub Copilot simulation completed. This is a mock response showing how the integration would work with real GitHub Copilot API.',
          // Remove fake PR URL to avoid confusion
          pullRequestUrl: undefined,
          commitSha: undefined,
          filesChanged: ['[simulated] src/example.ts', '[simulated] tests/example.test.ts'],
          confidence: 0.85,
        };
      }
      
      return {
        id: sessionId,
        status,
        issueNumber: issueNumber || undefined,
        createdAt: new Date(parseInt(sessionId.split('_')[2])),
        updatedAt: new Date(),
        result,
        pullRequestUrl: undefined, // No PR in demo mode
        pullRequestState: undefined,
      };
    }

    try {
      // Real Copilot session - track progress by monitoring the issue
      if (!issueNumber) {
        throw new Error('Issue number required for real Copilot session tracking');
      }

      // Get issue details and check for linked pull requests
      const issue = await this.octokit.rest.issues.get({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
      });

      // Check issue timeline for Copilot activity
      const timeline = await this.octokit.rest.issues.listEventsForTimeline({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
      });

      // Look for events that indicate Copilot activity
      const copilotEvents = timeline.data.filter(event => 
        (event.actor && event.actor.login === 'copilot-swe-agent') ||
        (event.event === 'cross-referenced' && event.source?.issue?.pull_request)
      );

      // Check if there's a linked pull request from Copilot (could be from any actor if Copilot created it)
      const pullRequestEvent = timeline.data.find(event => 
        event.event === 'cross-referenced' && 
        event.source?.issue?.pull_request
      );

      let status: CopilotSessionStatus = 'pending';
      let result: CopilotResult | undefined;
      let pullRequestUrl: string | undefined;
      let pullRequestState: 'draft' | 'ready' | 'merged' | 'closed' | undefined;

      if (pullRequestEvent && pullRequestEvent.source?.issue?.pull_request) {
        // Copilot has created a PR, check its status
        const prNumber = pullRequestEvent.source.issue.number;
        try {
          const pr = await this.octokit.rest.pulls.get({
            owner: this.owner,
            repo: this.repo,
            pull_number: prNumber,
          });

          pullRequestUrl = pr.data.html_url;

          if (pr.data.state === 'open' && pr.data.draft) {
            status = 'in_progress';
            pullRequestState = 'draft';
          } else if (pr.data.state === 'open' && !pr.data.draft) {
            status = 'completed';
            pullRequestState = 'ready';
            
            // Get commit details
            const commits = await this.octokit.rest.pulls.listCommits({
              owner: this.owner,
              repo: this.repo,
              pull_number: prNumber,
            });

            // Get files changed
            const files = await this.octokit.rest.pulls.listFiles({
              owner: this.owner,
              repo: this.repo,
              pull_number: prNumber,
            });

            result = {
              summary: pr.data.body || 'GitHub Copilot has completed the task and created a pull request.',
              pullRequestUrl: pr.data.html_url,
              commitSha: commits.data[commits.data.length - 1]?.sha,
              filesChanged: files.data.map(file => file.filename),
              confidence: 0.9, // Default confidence for real Copilot sessions
            };
          } else if (pr.data.state === 'closed') {
            status = pr.data.merged ? 'completed' : 'failed';
            pullRequestState = pr.data.merged ? 'merged' : 'closed';
          }
        } catch (prError) {
          console.warn(`Failed to fetch PR #${prNumber}, but treating as in_progress:`, prError);
          status = 'in_progress'; // Assume it's still working if we can't fetch PR details
        }
      } else {
        // Check if Copilot has reacted to the issue (👀 reaction indicates it's working)
        const reactions = await this.octokit.rest.reactions.listForIssue({
          owner: this.owner,
          repo: this.repo,
          issue_number: issueNumber,
        });

        const copilotReaction = reactions.data.find(reaction => 
          reaction.user?.login === 'copilot-swe-agent' && reaction.content === 'eyes'
        );

        if (copilotReaction) {
          status = 'in_progress';
        } else {
          // Check if Copilot is assigned to the issue (indicates it's working even without reaction)
          const issueAssignees = issue.data.assignees || [];
          const copilotAssigned = issueAssignees.some(assignee => assignee.login === 'copilot-swe-agent');
          
          if (copilotAssigned) {
            // Check session age - extend timeout since Copilot might take longer
            const sessionAge = Date.now() - parseInt(sessionId.split('_')[2]);
            if (sessionAge > 900000) { // 15 minutes instead of 5
              status = 'failed';
              result = {
                summary: 'GitHub Copilot coding agent did not complete the task within the expected timeframe.',
                filesChanged: [],
                confidence: 0.0,
              };
            } else {
              status = 'in_progress'; // Still assigned, assume it's working
            }
          } else {
            // Not assigned and no reaction - likely failed assignment
            status = 'failed';
            result = {
              summary: 'GitHub Copilot coding agent assignment appears to have failed.',
              filesChanged: [],
              confidence: 0.0,
            };
          }
        }
      }
      
      return {
        id: sessionId,
        status,
        issueNumber: issueNumber,
        createdAt: new Date(parseInt(sessionId.split('_')[2])),
        updatedAt: new Date(),
        result,
        pullRequestUrl,
        pullRequestState,
      };
    } catch (error) {
      console.warn('Failed to get Copilot session status from API, returning error status:', error);
      
      // If the API call fails, return a failed status
      return {
        id: sessionId,
        status: 'failed',
        issueNumber: issueNumber || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        result: {
          summary: 'Failed to get session status from GitHub API.',
          filesChanged: [],
          confidence: 0.0,
        },
        pullRequestUrl: undefined,
        pullRequestState: undefined,
      };
    }
  }

  /**
   * Wait for a session to complete
   */
  private async waitForCompletion(session: CopilotSession): Promise<CopilotSession> {
    let currentSession = session;
    
    while (currentSession.status !== 'completed' && currentSession.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, this.pollInterval));
      currentSession = await this.getSessionStatus(currentSession.id, currentSession.issueNumber);
    }
    
    return currentSession;
  }

  /**
   * Format a status update message for streaming
   */
  private formatStatusUpdate(session: CopilotSession): string {
    const statusEmoji = {
      pending: '⏳',
      in_progress: '🔄',
      completed: '✅',
      failed: '❌',
    };

    const emoji = statusEmoji[session.status];
    const isDemo = session.id.startsWith('cop_demo_');
    const prefix = isDemo ? '[DEMO] ' : '';
    
    // Create specific session progress URL if we have a PR, otherwise use generic URL
    let progressUrl = `https://github.com/copilot/agents`;
    if (session.pullRequestUrl) {
      const prNumber = this.extractPRNumber(session.pullRequestUrl);
      if (prNumber) {
        progressUrl = `https://github.com/${this.owner}/${this.repo}/pull/${prNumber}/agent-sessions/${session.id}`;
      }
    }
    
    switch (session.status) {
      case 'pending':
        return `${emoji} ${prefix}Copilot session started (ID: ${session.id}) - Status: pending\n📊 Track progress: ${progressUrl}\n`;
      case 'in_progress':
        return `${emoji} ${prefix}Copilot session status: in_progress - Analyzing codebase...\n`;
      case 'completed':
        return `${emoji} ${prefix}Copilot session completed! Working on final result...\n`;
      case 'failed':
        return `${emoji} ${prefix}Copilot session failed. Please try again.\n`;
      default:
        return `${prefix}Status: ${session.status}\n`;
    }
  }

  /**
   * Extract PR number from GitHub PR URL
   */
  private extractPRNumber(pullRequestUrl: string): number | null {
    const match = pullRequestUrl.match(/\/pull\/(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Build GitHub issue URL
   */
  private buildIssueUrl(issueNumber: number): string {
    return `https://github.com/${this.owner}/${this.repo}/issues/${issueNumber}`;
  }

  /**
   * Build GitHub PR URL  
   */
  private buildPRUrl(prNumber: number): string {
    return `https://github.com/${this.owner}/${this.repo}/pull/${prNumber}`;
  }

  /**
   * Format a PR ready for review notification
   */
  private formatPRReadyUpdate(session: CopilotSession): string {
    const isDemo = session.id.startsWith('cop_demo_');
    const prefix = isDemo ? '[DEMO] ' : '';
    
    if (session.pullRequestUrl) {
      const prNumber = this.extractPRNumber(session.pullRequestUrl);
      if (prNumber) {
        const prUrl = this.buildPRUrl(prNumber);
        return `🔗 ${prefix}**Pull Request [#${prNumber}](${prUrl}) ready for review**\n`;
      }
    }
    
    return `🔗 ${prefix}**Pull Request ready for review**: ${session.pullRequestUrl}\n`;
  }

  /**
   * Format the final result message
   */
  private async formatFinalResult(session: CopilotSession): Promise<string> {
    const isDemo = session.id.startsWith('cop_demo_');
    const prefix = isDemo ? '[DEMO] ' : '';
    
    if (session.status === 'failed') {
      // Close the issue when failed
      if (session.issueNumber) {
        await this.closeIssue(session.issueNumber, 'Session failed');
      }
      return `❌ ${prefix}GitHub Copilot session failed. Please try again or contact support.`;
    }
    
    if (session.status !== 'completed' || !session.result) {
      return `⏳ ${prefix}GitHub Copilot session is still in progress...`;
    }
    
    const result = session.result;
    let message = `✅ ${prefix}GitHub Copilot session completed!\n\n`;
    message += `📊 Confidence: ${Math.round(result.confidence * 100)}%\n`;
    
    if (result.filesChanged.length > 0) {
      message += `🔧 Files changed: ${result.filesChanged.join(', ')}\n`;
    }
    
    // Only show PR and commit info if they exist (not in demo mode)
    if (result.pullRequestUrl) {
      const prNumber = this.extractPRNumber(result.pullRequestUrl);
      if (prNumber) {
        const prUrl = this.buildPRUrl(prNumber);
        message += `🔗 **Pull Request [#${prNumber}](${prUrl}) ready for review**\n`;
      } else {
        message += `🔗 **Pull Request ready for review**: ${result.pullRequestUrl}\n`;
      }
    }
    
    if (result.commitSha) {
      message += `📝 Commit: ${result.commitSha}\n`;
    }
    
    message += `\n${result.summary}`;
    
    // Close the issue when completed
    if (session.issueNumber) {
      const reason = isDemo ? 'Demo session completed' : 'Session completed successfully';
      await this.closeIssue(session.issueNumber, reason);
    }
    
    return message;
  }

  /**
   * Close a GitHub issue with a resolution comment
   */
  private async closeIssue(issueNumber: number, reason: string): Promise<void> {
    try {
      // Add final comment explaining closure
      await this.octokit.rest.issues.createComment({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
        body: `🔒 **Session Resolution**\n\n${reason}\n\n*This issue is being automatically closed as the GitHub Copilot session has been resolved.*`,
      });

      // Close the issue
      await this.octokit.rest.issues.update({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
        state: 'closed',
      });
    } catch (error) {
      console.error(`Failed to close issue #${issueNumber}:`, error);
    }
  }

  /**
   * Get all active sessions (utility method for status commands)
   */
  async getActiveSessions(): Promise<CopilotSession[]> {
    try {
      // Query for open issues assigned to copilot-swe-agent
      const issues = await this.octokit.rest.issues.listForRepo({
        owner: this.owner,
        repo: this.repo,
        assignee: 'copilot-swe-agent',
        state: 'open',
        per_page: 100, // Get up to 100 recent sessions
      });

      const activeSessions: CopilotSession[] = [];

      for (const issue of issues.data) {
        try {
          // Get issue comments to find session ID
          const comments = await this.octokit.rest.issues.listComments({
            owner: this.owner,
            repo: this.repo,
            issue_number: issue.number,
          });

          // Look for session ID in comments (specifically the bot's assignment comment)
          let sessionId: string | undefined;
          for (const comment of comments.data) {
            const sessionMatch = comment.body?.match(/Session ID: (cop_(?:real|demo)_[^\s\n]+)/);
            if (sessionMatch) {
              sessionId = sessionMatch[1];
              break;
            }
          }

          // If no session ID found in comments, try to construct one from issue number
          // This handles cases where the session was created but comment format changed
          if (!sessionId) {
            // Check if this looks like a copilot issue
            if (issue.title?.includes('Copilot Task:') || 
                issue.body?.includes('GitHub Copilot Coding Agent Task')) {
              // Try to extract timestamp from issue creation for real sessions
              const issueCreatedTime = new Date(issue.created_at).getTime();
              sessionId = `cop_real_${issue.number}_${issueCreatedTime}`;
            }
          }

          if (sessionId) {
            // Get current status for this session
            const session = await this.getSessionStatus(sessionId, issue.number);
            
            // Only include sessions that are pending or in progress
            if (session.status === 'pending' || session.status === 'in_progress') {
              activeSessions.push(session);
            }
          }
        } catch (error) {
          // Skip this issue if we can't process it, but don't fail the whole operation
          console.warn(`Failed to process issue #${issue.number} for session tracking:`, error);
        }
      }

      return activeSessions;
    } catch (error) {
      console.error('Failed to fetch active sessions:', error);
      return []; // Return empty array on error to maintain compatibility
    }
  }

  /**
   * Cancel a specific session (utility method for cancel commands)
   */
  async cancelSession(sessionId: string): Promise<boolean> {
    // TODO: Implement session cancellation via GitHub API
    console.log(`Cancelling session ${sessionId}`);
    return true;
  }
}