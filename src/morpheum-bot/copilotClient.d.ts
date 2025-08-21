import { LLMClient } from './llmClient';
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
export declare class CopilotClient implements LLMClient {
    private readonly githubToken;
    private readonly repository;
    private readonly baseUrl;
    private octokit;
    private owner;
    private repo;
    private pollInterval;
    constructor(githubToken: string, repository: string, baseUrl?: string);
    send(prompt: string): Promise<string>;
    sendStreaming(prompt: string, onChunk: (chunk: string) => void): Promise<string>;
    /**
     * Start a GitHub Copilot session for the given prompt
     */
    private startCopilotSession;
    /**
     * Get the current status of a Copilot session
     */
    private getSessionStatus;
    /**
     * Wait for a session to complete
     */
    private waitForCompletion;
    /**
     * Format a status update message for streaming
     */
    private formatStatusUpdate;
    /**
     * Format the final result message
     */
    private formatFinalResult;
    /**
     * Get all active sessions (utility method for status commands)
     */
    getActiveSessions(): Promise<CopilotSession[]>;
    /**
     * Cancel a specific session (utility method for cancel commands)
     */
    cancelSession(sessionId: string): Promise<boolean>;
}
//# sourceMappingURL=copilotClient.d.ts.map