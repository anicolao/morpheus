# Tasks

This file tracks the current and upcoming tasks for the Morpheum project.

## Morpheum v0.1: The "Matrix Milestone"

### 1. Matrix Bot Development (Morpheum Bot)

*   [x] **Task 1: Initial Project Setup for the Bot**
    *   [x] Create a new directory for the bot: `src/morpheum-bot`.
    *   [x] Install necessary dependencies for a basic Matrix bot (e.g., `matrix-bot-sdk`) at the project root.
    *   [x] Install TypeScript at the project root.
    *   [x] Create a `tsconfig.json` at the project root if one doesn't exist, or update the existing one to include the bot's source files.

*   [x] **Task 2: Basic Bot Implementation**
    *   [x] Create a `src/morpheum-bot/index.ts` file.
    *   [x] Implement the basic bot structure to connect to a Matrix homeserver.
    *   [x] Implement a simple `!help` command to verify the bot is working.

*   [x] **Task 3: Gemini CLI Integration (Proof of Concept)**
    *   [x] Fork the Gemini CLI repository.
    *   [x] Investigate how to invoke the Gemini CLI from the TypeScript bot.
    *   [x] Implement a command (e.g., `!gemini <prompt>`) that passes the prompt to the Gemini CLI and returns the output to the Matrix room.

*   [x] **Task 4: GitHub Integration in Gemini CLI**
    *   [x] Investigate how to add `gh` as a tool to the forked Gemini CLI.
    *   [x] Implement the necessary changes in the forked Gemini CLI to use the `gh` tool.
    *   [x] Test the integration by running `gh` commands through the `!gemini` command in the bot.
    *   [x] Document the correct way to invoke the Gemini CLI to execute `gh` commands.

*   [x] **Task 5: `DEVLOG.md` and `TASKS.md` management**
    *   [x] The bot should be able to read and write to the `DEVLOG.md` and `TASKS.md` files.
    *   [x] Create commands to add entries to the `DEVLOG.md` and to update the status of tasks in `TASKS.md`.

### 2. Gemini CLI Direct Integration

*   [ ] **Task 6: Deep Integration with Gemini CLI for Interactive Chat**
    *   [ ] **Add Gemini CLI as a Git Submodule:** Execute `git submodule add git@github.com:anicolao/gemini-cli.git src/gemini-cli`.
    *   [ ] **Install Submodule Dependencies:** Navigate into the `src/gemini-cli` directory and run `npm install` (or `bun install`).
    *   [ ] **Develop a Chat-Based Interface for Gemini CLI:**
        *   Create a new interface within the Gemini CLI (e.g., in `packages/cli/src/bot-interface.ts`) that is designed for chat-based interaction.
        *   This interface will need to accept a prompt and a callback function (e.g., `(message: string) => void`).
        *   Modify the Gemini CLI's core logic to call this callback function at key points during its execution, such as:
            *   When a tool is called, with the tool's name and arguments.
            *   When a tool returns a result.
            *   When the model returns a partial or final response.
            *   When the status bar content changes.
        *   The `run` function in the CLI will need to be refactored to use this new event-driven architecture instead of directly writing to the console.
    *   [ ] **Adapt Bot to Handle Interactive Messages:**
        *   Modify the bot's code (`src/morpheum-bot/index.ts`) to import and use the new chat-based interface from the Gemini CLI submodule.
        *   The bot will pass a callback function to the Gemini CLI that sends each message it receives to the Matrix chat room.
    *   [ ] **Testing:**
        *   Thoroughly test the integration to ensure that the interactive messages are being sent to the chat room in a timely and accurate manner.
        *   Verify that the chat experience is as close as possible to the experience of using the Gemini CLI directly in the terminal.
