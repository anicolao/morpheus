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

*   [ ] **Task 6: Integrate Gemini CLI Source Code**
    *   [ ] **Identify Gemini CLI Source:** Determine the exact location of the Gemini CLI's source code.
    *   [ ] **Clone/Copy Relevant Code:** Copy essential files/directories from the Gemini CLI into a new project directory (e.g., `src/gemini-cli-core/`).
    *   [ ] **Adapt for Direct Invocation:** Modify copied code to remove terminal interactions, expose a clear API for the bot, and handle configuration.
    *   [ ] **Integrate into `src/morpheum-bot/index.ts`:** Replace `exec` call with direct invocation of the new Gemini CLI core module.
    *   [ ] **Update Dependencies:** Add any necessary Gemini CLI dependencies to `package.json`.
    *   [ ] **Testing:** Thoroughly test the direct integration.
