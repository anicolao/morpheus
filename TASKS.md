# Tasks

This file tracks the current and upcoming tasks for the Morpheum project.

## Morpheum v0.1: The "Matrix Milestone"

### 1. Matrix Bot Development (Morpheum Bot)

- [x] **Task 1: Initial Project Setup for the Bot**

  - [x] Create a new directory for the bot: `src/morpheum-bot`.
  - [x] Install necessary dependencies for a basic Matrix bot (e.g.,
        `matrix-bot-sdk`) at the project root.
  - [x] Install TypeScript at the project root.
  - [x] Create a `tsconfig.json` at the project root if one doesn't exist, or
        update the existing one to include the bot's source files.

- [x] **Task 2: Basic Bot Implementation**

  - [x] Create a `src/morpheum-bot/index.ts` file.
  - [x] Implement the basic bot structure to connect to a Matrix homeserver.
  - [x] Implement a simple `!help` command to verify the bot is working.

- [x] **Task 3: Gemini CLI Integration (Proof of Concept)**

  - [x] Fork the Gemini CLI repository.
  - [x] Investigate how to invoke the Gemini CLI from the TypeScript bot.
  - [x] Implement a command (e.g., `!gemini <prompt>`) that passes the prompt to
        the Gemini CLI and returns the output to the Matrix room.

- [x] **Task 4: GitHub Integration in Gemini CLI**

  - [x] Investigate how to add `gh` as a tool to the forked Gemini CLI.
  - [x] Implement the necessary changes in the forked Gemini CLI to use the `gh`
        tool.
  - [x] Test the integration by running `gh` commands through the `!gemini`
        command in the bot.
  - [x] Document the correct way to invoke the Gemini CLI to execute `gh`
        commands.

- [x] **Task 5: `DEVLOG.md` and `TASKS.md` management**
  - [x] The bot should be able to read and write to the `DEVLOG.md` and
        `TASKS.md` files.
  - [x] Create commands to add entries to the `DEVLOG.md` and to update the
        status of tasks in `TASKS.md`.

### 3. Process and Quality of Life

- [x] **Task 7: Enforce `DEVLOG.md` and `TASKS.md` Updates**

  - [x] Implement a `pre-commit` hook that prevents commits if `DEVLOG.md` and
        `TASKS.md` are not staged.
  - [x] Use `husky` to manage the hook so it's automatically installed for all
        contributors.
  - [x] Address Husky deprecation warning.
  - [x] Verify submodule pushes by checking the status within the submodule
        directory.

- [x] **Task 8: Reformat `DEVLOG.md` for Readability**

  - [x] Restructure the `DEVLOG.md` file to use a more organized format with
        horizontal rules and nested lists to improve scannability.
  - [x] Use git history to date old entries and link all markdown file
        references.
  - [x] Remove redundant "Request" line from entries.

- [x] **Task 9: Implement and Test Markdown to Matrix HTML Formatting**

  - [x] Create a new test suite for markdown formatting logic
        (`src/morpheum-bot/format-markdown.test.ts`).
  - [x] Write a test case for converting basic markdown (headings, bold,
        italics) to Matrix-compatible HTML.
  - [x] Write a test case for handling markdown code blocks (fenced and
        indented).
  - [x] Write a test case for converting markdown lists (ordered and unordered)
        to HTML.
  - [x] Implement the core `formatMarkdown` function that converts markdown text
        to the HTML format required by Matrix.
  - [x] Ensure all tests pass and the output is correctly formatted for Matrix
        messages.

- [x] **Task 11: Update Pre-commit Hook for Submodule Verification**

  - [x] Modify the `.husky/pre-commit` hook to include a check that verifies the
        `src/gemini-cli` submodule is pushed to its remote.

- [x] **Task 12: Switch to Claude Code with a local LLM for development (manual
      plan)**

  - [x] Set up a Local LLM with an OpenAI-compatible API:

    - [x] Install and run a local LLM provider like Ollama, vLLM, or
          llama-cpp-python.
    - [x] Ensure it exposes an OpenAI-compatible API endpoint (e.g.,
          http://localhost:11434/v1 for Ollama).
    - [x] Download a model to use, for example mistral-small-24b.

  - [x] Install `claudecode`:

    - [x] Find and install the claudecode tool. This might be from a package
          manager or a code repository.

  - [x] Install and Configure the Proxy:

    - [x] Clone the proxy server from the GitHub repository mentioned in the
          [Reddit post.](https://www.reddit.com/r/LocalLLaMA/comments/1m118is/use_claudecode_with_local_models/)

    - [x] Install its dependencies.
    - [x] Edit the proxy's configuration (e.g., a server.py file) to point to
          your local LLM's API endpoint.

  - [x] Run the Proxy:

    - [x] Start the proxy server. It will listen for incoming requests and
          forward them to your local LLM.

  - [x] Configure `claudecode` to Use the Proxy:
    - [x] Set the following environment variables in your shell to direct
          claudecode to the proxy:

```bash
export ANTHROPIC_BASE_URL=http://localhost:8000 # Or whatever port your proxy is on
export ANTHROPIC_AUTH_TOKEN=dummy-token
```

- [x] Test the Setup:
  - [x] Run claudecode to interact with your local model.

### 4. Process Improvement

- [x] **Task 13: Fix DEVLOG.md Entry Order for Qwen3-Code Investigation**

  - [x] Move the entry for the Qwen3-Code investigation to the top of the changelog in `DEVLOG.md`.
  - [x] Ensure the entry is in the correct chronological order.

### 4. New Investigation

- [x] **Task 13: Investigate Qwen3-Code as a Bootstrapping Mechanism**

  - [x] Investigate the `qwen3-code` fork of the Gemini CLI.
  - [x] Determine if `qwen3-code` is a suitable replacement for `claudecode`.
  - [x] Document the findings and next steps.

### 5. Next Steps

- [x] **Task 14: Build a Larger, Tool-Capable Ollama Model**

  - [x] Investigate the process used to create the `kirito1/qwen3-coder` model.
  - [x] Apply this process to build a larger version of an Ollama model.
  - [x] Ensure the new model supports tool usage and has a larger context size.
  - [x] Test the new model for performance and accuracy.
  - [x] Fix web search tool configuration to enable proper web research.

### 6. Local LLM Development Workflow

- [x] **Task 19: Define and Build Local Tool-Capable Models**
  - [x] Create a `Modelfile` to make a base model (e.g., Qwen2) compatible with the Gemini CLI tool-use format.
  - [x] Create a `Modelfile` for the `qwen3-coder` model.
  - [x] Add `ollama` to the `flake.nix` development environment to ensure the tool is available.

- [x] **Task 20: Automate Model Building with a Generic Makefile**
  - [x] Establish a `<model-name>.ollama` convention for model definition files.
  - [x] Implement a `Makefile` that uses Ollama's internal manifest files for dependency tracking.
  - [x] Use a generic pattern rule in the `Makefile` to automatically discover and build any `*.ollama` file.

- [x] **Task 21: Refine Local Model Prompts**
  - [x] Update the prompt templates in `morpheum-local.ollama` and `qwen3-coder-local.ollama` to improve tool-use instructions.
  - [x] Add untracked local models to the repository.

- [x] **Task 22: Enhance Markdown Task List Rendering**
  - [x] Update `format-markdown.ts` to correctly render GitHub-flavored markdown task lists.
  - [x] Add tests to `format-markdown.test.ts` to verify that checked and unchecked task list items are rendered correctly.

- [x] **Task 23: Fix Markdown Checkbox Rendering**
  - [x] Modify `format-markdown.ts` to use Unicode characters for checkboxes to prevent them from being stripped by the Matrix client's HTML sanitizer.
  - [x] Update `format-markdown.test.ts` to reflect the new Unicode character output.

- [ ] **Task 24: Suppress Bullets from Task Lists**
  - [ ] Modify `format-markdown.ts` to suppress the bullets from task list items.

- [ ] **Task 27: Investigate incorrect commit**
  - [ ] `AGENTS.md` was checked in incorrectly.
  - [ ] A change to the bot's source was missed.
  - [ ] Investigate what went wrong and document it.

- [x] **Task 25: Fix `gemini-cli` Submodule Build and Crash**
  - [x] Investigate and fix a crash in the `gemini-cli` submodule's `shellExecutionService.ts`.
  - [x] Fix the `gemini-cli` submodule's build.

- [x] **Task 26: Handle Matrix Rate-Limiting**
  - [x] Implement a retry mechanism to handle `M_LIMIT_EXCEEDED` errors from the Matrix server.

- [x] **Task 27: Implement Message Queue and Throttling**
  - [x] Implement a message queue and throttling system to prevent rate-limiting errors.

- [x] **Task 28: Fix missing message-queue files**
  - [x] Add `src/morpheum-bot/message-queue.ts` and `src/morpheum-bot/message-queue.test.ts` to the commit.
  - [x] Replace all instances of `client.sendMessage` with `queueMessage` in `src/morpheum-bot/index.ts` to use the new message queue.

- [x] **Task 29: Refine Ollama Model Prompts for TDD**
  - [x] Update the `SYSTEM` prompt in `gpt-oss-120b.ollama` and `gpt-oss-small.ollama` to be more specific to a Test-Driven Development (TDD) approach.
  - [x] Reduce the `num_ctx` parameter in `gpt-oss-120b.ollama` to `65536`.
  - [x] Add `bun.lock` and `opencode.json` to the repository.
