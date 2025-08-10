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

*   [ ] **Task 3: Gemini CLI Integration (Proof of Concept)**
    *   [ ] Fork the Gemini CLI repository.
    *   [ ] Investigate how to invoke the Gemini CLI from the TypeScript bot.
    *   [ ] Implement a command (e.g., `!gemini <prompt>`) that passes the prompt to the Gemini CLI and returns the output to the Matrix room.

*   [ ] **Task 4: GitHub Integration**
    *   [ ] Research and select a suitable GitHub API library for TypeScript/JavaScript.
    *   [ ] Install the selected GitHub library at the project root.
    *   [ ] Implement OAuth for the bot to authenticate with GitHub.
    *   [ ] Create a command to allow the bot to create a GitHub repository.

*   [ ] **Task 5: `DEVLOG.md` and `TASKS.md` management**
    *   [ ] The bot should be able to read and write to the `DEVLOG.md` and `TASKS.md` files.
    *   [ ] Create commands to add entries to the `DEVLOG.md` and to update the status of tasks in `TASKS.md`.
