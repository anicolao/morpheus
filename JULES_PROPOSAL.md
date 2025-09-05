# Jules Integration Proposal

> **PROPOSED**: This document outlines a proposal to integrate "Jules" as a new LLM provider for the Morpheum bot, using the existing `swe-agent` for a real implementation.

## Overview

This document proposes the integration of "Jules" as a fourth LLM provider for the Morpheum bot. This will allow users to switch to "jules" mode, where the bot will interact with the Jules agent to perform tasks. This integration will leverage the existing `swe-agent` infrastructure to provide a real, functional implementation that can perform software development tasks, rather than a mocked one.

## Proposed Architecture

### Core Components

#### 1. JulesClient Implementation

A new `JulesClient` class will be created to act as a high-level controller for the `swe-agent`. It will implement the `LLMClient` interface, making it compatible with the existing bot infrastructure.

```typescript
import { SWEAgent } from './sweAgent';
import { LLMClient } from './llmClient';

export class JulesClient implements LLMClient {
  constructor(
    private readonly sweAgent: SWEAgent,
  ) {}

  async send(prompt: string): Promise<string> {
    const conversation = await this.sweAgent.run(prompt);
    // The final response could be a summary of the conversation
    // or the last message from the agent.
    return conversation[conversation.length - 1].content;
  }

  async sendStreaming(prompt: string, onChunk: (chunk: string) => void): Promise<string> {
    // For streaming, we can pass the onChunk callback to the sweAgent
    // and have it stream back the conversation as it happens.
    // This will require modifications to the SWEAgent.
    // For now, we can implement it as a non-streaming send.
    const result = await this.send(prompt);
    onChunk(result);
    return result;
  }
}
```

The `JulesClient` will delegate the actual task execution to the `sweAgent`, which is already capable of interacting with a jailed environment to execute commands, edit files, and run tests.

## Integration Points

### 1. LLM Client Factory Extension

Update `llmClient.ts` to support the new `jules` provider. This will involve creating an `SWEAgent` instance and passing it to the `JulesClient`.

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
      const { SWEAgent } = await import('./sweAgent');
      const { JailClient } = await import('./jailClient');
      // The llmClient for the SWEAgent would be the default one (e.g. openai)
      // This needs to be configured appropriately.
      const jailClient = new JailClient();
      const llmClient = await createLLMClient({ provider: 'openai', apiKey: process.env.OPENAI_API_KEY });
      const sweAgent = new SWEAgent(llmClient, jailClient);

      if (!config.repository) {
        throw new Error('Repository name is required for Jules integration');
      }
      // The repository is not directly used by the JulesClient in this new design,
      // but it's part of the LLMConfig interface. We'll keep it for consistency.
      return new JulesClient(sweAgent);
    // ... existing cases
  }
}
```
*Note: The creation of the `llmClient` for the `SWEAgent` needs careful consideration. It should probably use the bot's default LLM configuration.*

### 2. Bot Command Extensions

Add a new command to `bot.ts` to switch to the Jules agent:

```typescript
// Switch to jules mode
!llm switch jules <repository>
```

## Workflow Integration

The workflow will be as follows:

1.  **Agent Activation**: The user switches to the `jules` agent using the `!llm switch jules <repository>` command.
2.  **Task Execution**: The bot, now in `jules` mode, forwards the user's prompts to the `JulesClient`.
3.  **SWE-Agent Invocation**: The `JulesClient`'s `send` method invokes the `sweAgent.run()` method with the user's prompt.
4.  **Task Processing**: The `sweAgent` interacts with its own LLM and the `JailClient` to execute the task, performing actions like reading/writing files, running commands, etc.
5.  **Response**: Once the `sweAgent` completes its execution, it returns the conversation history. The `JulesClient` formats a final response and sends it back to the user through the bot.

### Example Interaction

```
User: !llm switch jules anicolao/morpheum

Bot: 🤖 Switched to jules mode for repository anicolao/morpheum.

User: Please implement a feature to greet the user.

Bot: 🤖 Jules is working on it...
Bot: (Jules, via swe-agent, starts working on the task, potentially sending back progress updates)
Bot: ✅ Jules has completed the task. The changes have been committed. A pull request has been created at <pr_url>.
```

## Required Changes

### New Files

1.  **`src/morpheum-bot/julesClient.ts`**: The `JulesClient` class implementing the `LLMClient` interface and wrapping the `sweAgent`.
2.  **`src/morpheum-bot/julesClient.test.ts`**: Unit tests for the `JulesClient`.

### Modified Files

1.  **`src/morpheum-bot/llmClient.ts`**: Add `jules` to the provider list and update the factory function to instantiate `JulesClient` with an `SWEAgent`.
2.  **`src/morpheum-bot/bot.ts`**: Add the `!llm switch jules` command handler.
3.  **`src/morpheum-bot/bot.test.ts`**: Add tests for the new `jules` command.
4.  **`JULES_PROPOSAL.md`**: This document.

## Testing Strategy

-   **Unit Tests**: The `julesClient.test.ts` will contain unit tests for the `JulesClient`. The `sweAgent` will be mocked to test the client in isolation.
-   **Integration Tests**: The `bot.test.ts` will be updated to include integration tests for the new `jules` command. We will also need integration tests for the `JulesClient` interacting with a real `sweAgent` and `JailClient` in a controlled test environment.

## Conclusion

By integrating Jules as a wrapper for the `swe-agent`, we provide a powerful and "real" implementation that aligns with the Morpheum vision. This approach reuses existing components, ensures a consistent user experience, and delivers a functional AI agent capable of performing meaningful software development tasks.
