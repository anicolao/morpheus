import { LLMClient } from './llmClient';
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
      // Create issue and start Copilot session
      const session = await this.startCopilotSession(prompt);
      
      // Send initial status
      const initialUpdate = this.formatStatusUpdate(session);
      onChunk(initialUpdate);
      
      // Poll for updates and stream them
      let currentSession = session;
      while (currentSession.status !== 'completed' && currentSession.status !== 'failed') {
        await new Promise(resolve => setTimeout(resolve, this.pollInterval));
        const updatedSession = await this.getSessionStatus(currentSession.id, currentSession.issueNumber);
        
        if (updatedSession.status !== currentSession.status) {
          const statusUpdate = this.formatStatusUpdate(updatedSession);
          onChunk(statusUpdate);
          currentSession = updatedSession;
        }
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
    // Create GitHub issue for the prompt
    const issue = await this.octokit.rest.issues.create({
      owner: this.owner,
      repo: this.repo,
      title: `[DEMO] Copilot Task: ${prompt.slice(0, 80)}${prompt.length > 80 ? '...' : ''}`,
      body: `**GitHub Copilot Integration Demo**\n\nThis is a demonstration of how GitHub Copilot integration would work once the actual API is available.\n\n**Task Request:**\n${prompt}\n\n*Note: This issue was created as part of a Copilot integration demo. No actual automated code changes will be made.*`,
      labels: ['copilot-session', 'demo'],
    });

    // TODO: Start actual GitHub Copilot session via API
    // DEMO MODE: For now, we'll simulate a session by creating a mock session ID
    const sessionId = `cop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: CopilotSession = {
      id: sessionId,
      status: 'pending',
      issueNumber: issue.data.number,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add comment to issue with session information
    await this.octokit.rest.issues.createComment({
      owner: this.owner,
      repo: this.repo,
      issue_number: issue.data.number,
      body: `🤖 **GitHub Copilot Integration Demo**\n\nSession ID: ${sessionId}\nStatus: ${session.status}\n\n*This is a simulation demonstrating how GitHub Copilot sessions would work with the actual API.*`,
    });

    return session;
  }

  /**
   * Get the current status of a Copilot session
   */
  private async getSessionStatus(sessionId: string, issueNumber?: number): Promise<CopilotSession> {
    // TODO: Implement actual GitHub Copilot API status polling
    // DEMO MODE: This is a simulation of how GitHub Copilot sessions would work
    
    // This is a mock implementation that simulates a session lifecycle
    const sessionAge = Date.now() - parseInt(sessionId.split('_')[1]);
    
    let status: CopilotSessionStatus;
    let result: CopilotResult | undefined;
    
    if (sessionAge < 5000) {
      status = 'pending';
    } else if (sessionAge < 15000) {
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
      createdAt: new Date(parseInt(sessionId.split('_')[1])),
      updatedAt: new Date(),
      result,
    };
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
    
    switch (session.status) {
      case 'pending':
        return `${emoji} Copilot session started (ID: ${session.id}) - Status: pending`;
      case 'in_progress':
        return `${emoji} Copilot session status: in_progress - Analyzing codebase...`;
      case 'completed':
        return `${emoji} Copilot session completed! Working on final result...`;
      case 'failed':
        return `${emoji} Copilot session failed. Please try again.`;
      default:
        return `Status: ${session.status}`;
    }
  }

  /**
   * Format the final result message
   */
  private async formatFinalResult(session: CopilotSession): Promise<string> {
    if (session.status === 'failed') {
      // Close the issue when failed
      if (session.issueNumber) {
        await this.closeIssue(session.issueNumber, 'Session failed');
      }
      return '❌ GitHub Copilot session failed. Please try again or contact support.';
    }
    
    if (session.status !== 'completed' || !session.result) {
      return '⏳ GitHub Copilot session is still in progress...';
    }
    
    const result = session.result;
    let message = `✅ GitHub Copilot session completed!\n\n`;
    message += `📊 Confidence: ${Math.round(result.confidence * 100)}%\n`;
    
    if (result.filesChanged.length > 0) {
      message += `🔧 Files changed: ${result.filesChanged.join(', ')}\n`;
    }
    
    // Only show PR and commit info if they exist (not in demo mode)
    if (result.pullRequestUrl) {
      message += `🔗 Pull Request: ${result.pullRequestUrl}\n`;
    }
    
    if (result.commitSha) {
      message += `📝 Commit: ${result.commitSha}\n`;
    }
    
    message += `\n${result.summary}`;
    
    // Close the issue when completed
    if (session.issueNumber) {
      await this.closeIssue(session.issueNumber, 'Session completed successfully');
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
    // TODO: Implement session tracking/storage
    // For now, return empty array
    return [];
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