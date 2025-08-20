# GitHub Copilot Integration Proposal

## Overview

This proposal outlines the integration of GitHub Copilot as a third LLM provider for the Morpheum bot, extending beyond traditional chat completions to leverage GitHub's AI service for issue resolution. This integration would allow users to switch to "copilot" mode where the bot creates GitHub Copilot sessions for issues and provides real-time status updates back to the Matrix chat.

## Context

The Morpheum project currently supports two LLM providers:
- **OpenAI API**: For GPT models and compatible APIs
- **Ollama**: For local model execution

Both providers implement the `LLMClient` interface and use a factory pattern for instantiation. The bot operates within a Matrix chat environment and can execute development tasks in a jailed environment using the SWE-Agent.

## Proposed Architecture

### Core Components

#### 1. CopilotClient Implementation

```typescript
export class CopilotClient implements LLMClient {
  constructor(
    private readonly githubToken: string,
    private readonly repository: string,
    private readonly baseUrl: string = 'https://api.github.com'
  ) {}

  async send(prompt: string): Promise<string>
  async sendStreaming(prompt: string, onChunk: (chunk: string) => void): Promise<string>
}
```

#### 2. GitHub Copilot Session Management

```typescript
interface CopilotSession {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  issueNumber?: number;
  createdAt: Date;
  updatedAt: Date;
  result?: CopilotResult;
}

interface CopilotResult {
  summary: string;
  pullRequestUrl?: string;
  commitSha?: string;
  filesChanged: string[];
  confidence: number;
}
```

#### 3. Status Polling and Updates

```typescript
class CopilotSessionTracker {
  private sessions: Map<string, CopilotSession> = new Map();
  private pollingInterval: NodeJS.Timeout | null = null;

  async trackSession(sessionId: string, sendMessage: MessageSender): Promise<void>
  private async pollSessionStatus(sessionId: string): Promise<CopilotSession>
  private async notifyStatusChange(session: CopilotSession, sendMessage: MessageSender): Promise<void>
}
```

## Integration Points

### 1. LLM Client Factory Extension

Update `llmClient.ts` to support the new copilot provider:

```typescript
export interface LLMConfig {
  provider: 'openai' | 'ollama' | 'copilot';
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  repository?: string; // New field for GitHub repo
}

export async function createLLMClient(config: LLMConfig): Promise<LLMClient> {
  switch (config.provider) {
    case 'copilot':
      const { CopilotClient } = await import('./copilotClient');
      if (!config.apiKey) {
        throw new Error('GitHub token is required for Copilot integration');
      }
      if (!config.repository) {
        throw new Error('Repository name is required for Copilot integration');
      }
      return new CopilotClient(
        config.apiKey,
        config.repository,
        config.baseUrl || 'https://api.github.com'
      );
    // ... existing cases
  }
}
```

### 2. Bot Command Extensions

Add new commands to `bot.ts`:

```typescript
// Switch to copilot mode
!llm switch copilot <repository>

// Check copilot session status
!copilot status [session-id]

// List active copilot sessions
!copilot list

// Cancel a copilot session
!copilot cancel <session-id>
```

### 3. Environment Configuration

New environment variables:

```bash
# GitHub token with Copilot access
export GITHUB_TOKEN="ghp_..."

# Default repository for Copilot sessions
export COPILOT_REPOSITORY="owner/repo"

# Copilot API base URL (for GitHub Enterprise)
export COPILOT_BASE_URL="https://api.github.com"

# Session polling interval in seconds
export COPILOT_POLL_INTERVAL="30"
```

## Workflow Integration

### Issue Resolution Flow

1. **User Request**: User provides a prompt describing an issue
2. **Issue Creation**: CopilotClient creates a GitHub issue from the prompt
3. **Copilot Session**: Initiates a GitHub Copilot session for the issue
4. **Status Tracking**: Begins polling for session status updates
5. **Real-time Updates**: Sends Matrix messages as status changes
6. **Completion**: Notifies when Copilot completes with results/PR links

### Example Interaction

```
User: Fix the authentication bug in the login component

Bot: 🤖 Creating GitHub issue for: "Fix the authentication bug in the login component"
Bot: ✅ Issue #123 created: https://github.com/owner/repo/issues/123
Bot: 🚀 Starting GitHub Copilot session for issue #123...
Bot: ⏳ Copilot session started (ID: cop_abc123) - Status: pending
Bot: 🔄 Copilot session status: in_progress - Analyzing codebase...
Bot: 🔄 Copilot session status: in_progress - Generating fix...
Bot: ✅ Copilot session completed! 
     📊 Confidence: 87%
     🔧 Files changed: src/auth/login.ts, tests/auth.test.ts
     🔗 Pull Request: https://github.com/owner/repo/pull/124
```

### Streaming Implementation

For the streaming interface, status updates are delivered as chunks:

```typescript
async sendStreaming(prompt: string, onChunk: (chunk: string) => void): Promise<string> {
  // Create issue and start Copilot session
  const session = await this.startCopilotSession(prompt);
  
  // Poll for updates and stream them
  while (session.status !== 'completed' && session.status !== 'failed') {
    await new Promise(resolve => setTimeout(resolve, this.pollInterval));
    const updatedSession = await this.getSessionStatus(session.id);
    
    if (updatedSession.status !== session.status) {
      const statusUpdate = this.formatStatusUpdate(updatedSession);
      onChunk(statusUpdate);
      Object.assign(session, updatedSession);
    }
  }
  
  return this.formatFinalResult(session);
}
```

## Required Changes

### New Files

1. **`src/morpheum-bot/copilotClient.ts`**
   - CopilotClient class implementing LLMClient interface
   - GitHub API integration for issue creation and Copilot sessions
   - Status polling and session management

2. **`src/morpheum-bot/copilotClient.test.ts`**
   - Unit tests for CopilotClient functionality
   - Mock GitHub API responses
   - Session lifecycle testing

3. **`src/morpheum-bot/githubApi.ts`**
   - Utility functions for GitHub API interactions
   - Issue creation, PR management, repository operations
   - Authentication handling

### Modified Files

1. **`src/morpheum-bot/llmClient.ts`**
   - Add 'copilot' to provider union type
   - Update LLMConfig interface with repository field
   - Extend createLLMClient factory function

2. **`src/morpheum-bot/bot.ts`**
   - Add copilot-specific command handlers
   - Update constructor to support GitHub token configuration
   - Add session tracking capabilities

3. **`src/morpheum-bot/bot.test.ts`**
   - Add tests for new copilot commands
   - Test session tracking and status updates
   - Mock copilot session responses

4. **`MORPHEUM_BOT_API.md`**
   - Document new copilot commands and configuration
   - Add examples of copilot workflows
   - Update environment variable documentation

5. **`package.json`**
   - Add @octokit/rest dependency for GitHub API integration
   - Add any additional type definitions needed

### Configuration Updates

1. **Environment Variables**
   - GITHUB_TOKEN: Required for authentication
   - COPILOT_REPOSITORY: Default repository for sessions
   - COPILOT_BASE_URL: Optional GitHub API endpoint
   - COPILOT_POLL_INTERVAL: Session polling frequency

2. **Bot Configuration**
   - Update llmConfig structure to include copilot settings
   - Add GitHub token validation
   - Repository name validation and parsing

## Technical Considerations

### GitHub API Integration

- Use `@octokit/rest` for robust GitHub API interactions
- Implement proper error handling for rate limits and API failures
- Support both GitHub.com and GitHub Enterprise Server
- Handle authentication token validation and refresh

### Session Management

- Implement persistent session storage for bot restarts
- Add cleanup for orphaned or expired sessions
- Handle multiple concurrent sessions per user
- Provide session history and audit trails

### Status Updates

- Use efficient polling with exponential backoff
- Implement webhooks if supported by GitHub Copilot API
- Batch status updates to avoid message flooding
- Provide detailed progress information

### Error Handling

- Graceful degradation when GitHub API is unavailable
- Clear error messages for authentication failures
- Timeout handling for long-running sessions
- Fallback to other LLM providers if Copilot fails

### Security

- Secure storage of GitHub tokens
- Repository access validation
- User permission checking for repository operations
- Audit logging for all GitHub operations

## Testing Strategy

### Unit Tests

- CopilotClient functionality with mocked GitHub API
- Session lifecycle management
- Status polling and update mechanisms
- Error handling scenarios

### Integration Tests

- End-to-end workflow with test repository
- Matrix bot command integration
- Real GitHub API interactions (in test environment)
- Session persistence across bot restarts

### Manual Testing

- User experience in Matrix chat
- Multiple concurrent sessions
- Error scenarios and recovery
- Performance with large repositories

## Rollout Plan

### Phase 1: Core Implementation
- Implement CopilotClient with basic functionality
- Add GitHub API integration utilities
- Update LLM factory for copilot provider
- Basic session management

### Phase 2: Bot Integration
- Add copilot commands to bot
- Implement status tracking and updates
- Add comprehensive error handling
- Update documentation

### Phase 3: Advanced Features
- Session persistence and history
- Advanced configuration options
- Performance optimizations
- Enhanced user experience features

### Phase 4: Production Readiness
- Security review and hardening
- Performance testing and optimization
- Comprehensive documentation updates
- User training and onboarding

## Success Metrics

- **Functionality**: Users can successfully switch to copilot mode and resolve issues
- **Usability**: Clear status updates and intuitive commands
- **Reliability**: Robust error handling and session management
- **Performance**: Responsive status updates and efficient API usage
- **Integration**: Seamless experience within existing Morpheum workflow

## Future Enhancements

- **Multi-Repository Support**: Handle sessions across multiple repositories
- **Copilot Chat Integration**: Direct chat interface with GitHub Copilot
- **Advanced Analytics**: Session success rates and performance metrics
- **Workflow Automation**: Automated PR reviews and merging
- **Team Collaboration**: Multi-user sessions and collaborative editing

## Conclusion

This GitHub Copilot integration would significantly expand Morpheum's capabilities by adding GitHub's AI service as a specialized provider for issue resolution. The proposed architecture maintains consistency with existing patterns while adding powerful new functionality for GitHub-centric development workflows.

The integration leverages Morpheum's existing strengths (Matrix communication, LLM abstraction, SWE-Agent capabilities) while adding GitHub's specialized AI capabilities for code generation and issue resolution. This creates a powerful combination for collaborative software development with real-time status updates and seamless workflow integration.