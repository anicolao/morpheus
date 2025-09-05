# Jules Integration Proposal

> **PROPOSED**: This document outlines a proposal to integrate "Jules" as a new LLM provider for the Morpheum bot.

## Overview

This document proposes the integration of "Jules" as a fourth LLM provider for the Morpheum bot. This will allow users to switch to "jules" mode, where the bot will interact with the Jules agent to perform tasks. This integration will be similar to the existing Copilot integration, allowing for a seamless transition between different AI agents.

## Proposed Architecture

### Core Components

#### 1. JulesClient Implementation

A new `JulesClient` class will be created to handle communication with the Jules agent. It will implement the `LLMClient` interface.

```typescript
export class JulesClient implements LLMClient {
  constructor(
    private readonly repository: string,
  ) {}

  async send(prompt: string): Promise<string>
  async sendStreaming(prompt: string, onChunk: (chunk: string) => void): Promise<string>
}
```

Initially, the `JulesClient` will have a mocked implementation for development and testing purposes, as a dedicated Jules API is not yet available.

#### 2. Session Management (Future consideration)

While the initial implementation will be stateless, we can consider adding session management in the future, similar to the Copilot integration, to handle long-running tasks.

## Integration Points

### 1. LLM Client Factory Extension

Update `llmClient.ts` to support the new `jules` provider:

```typescript
export interface LLMConfig {
  provider: 'openai' | 'ollama' | 'copilot' | 'jules';
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  repository?: string;
}

export async function createLLMClient(config: LLMConfig): Promise<LLMClient> {
  switch (config.provider) {
    case 'jules':
      const { JulesClient } = await import('./julesClient');
      if (!config.repository) {
        throw new Error('Repository name is required for Jules integration');
      }
      return new JulesClient(config.repository);
    // ... existing cases
  }
}
```

### 2. Bot Command Extensions

Add a new command to `bot.ts` to switch to the Jules agent:

```typescript
// Switch to jules mode
!llm switch jules <repository>
```

Further commands for status checking and session management can be added in the future.

## Workflow Integration

The workflow will be straightforward:

1.  **User Request**: A user in a Matrix room sends a request to the bot.
2.  **Agent Activation**: The user switches to the `jules` agent using the `!llm switch jules <repository>` command.
3.  **Task Execution**: The bot, now in `jules` mode, forwards the user's prompts to the `JulesClient`.
4.  **Response**: The `JulesClient` processes the prompt (initially with a mocked response) and sends the result back to the user in the Matrix room.

### Example Interaction

```
User: !llm switch jules anicolao/morpheum

Bot: 🤖 Switched to jules mode for repository anicolao/morpheum.

User: Please implement a feature to greet the user.

Bot: 🤖 Jules is working on it... (mocked response)
Bot: ✅ Jules has completed the task. A pull request has been created at <pr_url>.
```

## Required Changes

### New Files

1.  **`src/morpheum-bot/julesClient.ts`**: The `JulesClient` class implementing the `LLMClient` interface.
2.  **`src/morpheum-bot/julesClient.test.ts`**: Unit tests for the `JulesClient`.

### Modified Files

1.  **`src/morpheum-bot/llmClient.ts`**: Add `jules` to the provider list and update the factory function.
2.  **`src/morpheum-bot/bot.ts`**: Add the `!llm switch jules` command handler.
3.  **`src/morpheum-bot/bot.test.ts`**: Add tests for the new `jules` command.
4.  **`JULES_PROPOSAL.md`**: This document.

## Testing Strategy

-   **Unit Tests**: The `julesClient.test.ts` will contain unit tests for the `JulesClient`, mocking any external dependencies.
-   **Integration Tests**: The `bot.test.ts` will be updated to include integration tests for the new `jules` command, ensuring it works correctly within the bot's command processing logic.

## Conclusion

Integrating Jules as a new LLM provider will enhance the capabilities of the Morpheum bot by offering another powerful AI agent for users to choose from. The proposed architecture follows the existing design patterns, ensuring a smooth and consistent integration.
