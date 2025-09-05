# Jules Integration Proposal

> **PROPOSED**: This document outlines a proposal to integrate "Jules" as a new, fully interactive LLM provider for the Morpheum bot.

## 1. Overview

This document proposes the integration of "Jules" as a fourth LLM provider for the Morpheum bot. This will allow users to switch to "jules" mode and interact directly with the Jules agent to perform complex software development tasks.

This proposal supersedes previous versions and presents a design for a **real implementation**, not a mocked one, and does not use other LLMs as a backend. The core of this design is a novel communication mechanism between the Morpheum bot process and the Jules agent process, running within the same sandboxed environment.

## 2. The Execution Environment

A key concept for this integration is understanding the execution environment. The platform that runs the Jules agent is designed as follows:

-   **Sandbox**: For each task, a dedicated, isolated sandbox environment (like a container) is created.
-   **Co-location**: Within this single sandbox, three key components are co-located:
    1.  **The Target Repository**: The file system of the target repository (e.g., `anicolao/morpheum`) is mounted.
    2.  **The Morpheum Bot**: A process running the Morpheum bot application is started.
    3.  **The Jules Agent**: The Jules agent (me) is given a set of tools (`read_file`, `run_in_bash_session`, etc.) that all execute within this same sandbox.

This co-location is what makes a direct integration possible. The bot and the Jules agent, while being separate logical entities, share the same filesystem and process space, allowing them to communicate.

## 3. Proposed Architecture: File-Based Communication

Since there is no traditional API to call the Jules agent, we will establish a communication channel using the shared filesystem.

### Core Components

#### 3.1. JulesClient Implementation

A new `JulesClient` class will be created. Instead of making a network request, it will use files to send a prompt to Jules and receive a response.

```typescript
import { promises as fs } from 'fs';
import { join } from 'path';

const INBOX_PATH = join('/tmp', 'jules_inbox.txt');
const OUTBOX_PATH = join('/tmp', 'jules_outbox.txt');
const POLLING_INTERVAL_MS = 1000;

export class JulesClient implements LLMClient {
  constructor() {}

  async send(prompt: string): Promise<string> {
    // 1. Write the prompt to the inbox file for Jules to read.
    await fs.writeFile(INBOX_PATH, prompt);

    // 2. Poll for the outbox file to appear.
    while (true) {
      try {
        const response = await fs.readFile(OUTBOX_PATH, 'utf-8');

        // 4. Cleanup and return the response.
        await fs.unlink(INBOX_PATH);
        await fs.unlink(OUTBOX_PATH);

        return response;
      } catch (error) {
        // File doesn't exist yet, wait and try again.
        if (error.code === 'ENOENT') {
          await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
        } else {
          throw error; // Rethrow other errors.
        }
      }
    }
  }

  async sendStreaming(prompt: string, onChunk: (chunk: string) => void): Promise<string> {
    // For simplicity, the initial implementation will not support streaming.
    const result = await this.send(prompt);
    onChunk(result);
    return result;
  }
}
```

## 4. Integration Points

### 4.1. LLM Client Factory Extension

Update `llmClient.ts` to support the new `jules` provider:

```typescript
// ...
export async function createLLMClient(config: LLMConfig): Promise<LLMClient> {
  switch (config.provider) {
    case 'jules':
      const { JulesClient } = await import('./julesClient');
      return new JulesClient();
    // ... existing cases
  }
}
```

### 4.2. Bot Command Extensions

The `!llm switch jules <repository>` command will be handled by `bot.ts` to switch the active `llmClient` to the `JulesClient`.

## 5. End-to-End Workflow

This is how a typical interaction would work, illustrating the two parallel processes:

| Step | Morpheum Bot Process (`JulesClient`) | Jules Agent Process (Me) |
| :--- | :--- | :--- |
| 1 | User sends `!llm switch jules ...` in Matrix. Bot switches its `llmClient` to `JulesClient`. | (Idle) |
| 2 | User sends prompt: "Refactor the login function." | (Idle) |
| 3 | `JulesClient.send()` is called. It writes the prompt to `/tmp/jules_inbox.txt`. | (Idle) |
| 4 | `JulesClient` begins polling for `/tmp/jules_outbox.txt` in a loop. The bot process is now effectively waiting. | (Idle, but my control plane is notified that the bot process is idle) |
| 5 | (Waiting...) | My turn to act. I see that `/tmp/jules_inbox.txt` exists. |
| 6 | (Waiting...) | I use my `read_file` tool to read the prompt from the inbox. |
| 7 | (Waiting...) | I perform the refactoring using my software development tools (`read_file`, `replace_with_git_merge_diff`, etc.). |
| 8 | (Waiting...) | Once the task is complete, I use my `create_file_with_block` tool to write the result (e.g., "Refactoring complete. See PR #123.") to `/tmp/jules_outbox.txt`. |
| 9 | The polling loop finds `/tmp/jules_outbox.txt`, reads the content, and breaks the loop. | (Idle, my turn is over) |
| 10 | The `JulesClient` deletes both files and returns the response string to the bot. | (Idle) |
| 11 | The bot sends the response back to the user in Matrix. | (Idle) |


## 6. Required Changes

### New Files
1.  **`src/morpheum-bot/julesClient.ts`**: The file-based `JulesClient` implementation.
2.  **`src/morpheum-bot/julesClient.test.ts`**: Unit tests for the `JulesClient`.

### Modified Files
1.  **`src/morpheum-bot/llmClient.ts`**: Add `jules` to the provider list and update the factory.
2.  **`src/morpheum-bot/bot.ts`**: Ensure the `!llm switch jules` command works correctly.
3.  **`JULES_PROPOSAL.md`**: This document.

## 7. Conclusion

This design provides a robust and genuine integration of the Jules agent into the Morpheum bot. By using a simple file-based communication mechanism, we bridge the gap between the bot's runtime and the agent's control plane, enabling users to delegate real software development tasks to Jules directly from their chat client.
