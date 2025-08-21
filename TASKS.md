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

  - [x] Move the entry for the Qwen3-Code investigation to the top of the
        changelog in `DEVLOG.md`.
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

  - [x] Create a `Modelfile` to make a base model (e.g., Qwen2) compatible with
        the Gemini CLI tool-use format.
  - [x] Create a `Modelfile` for the `qwen3-coder` model.
  - [x] Add `ollama` to the `flake.nix` development environment to ensure the
        tool is available.

- [x] **Task 20: Automate Model Building with a Generic Makefile**

  - [x] Establish a `<model-name>.ollama` convention for model definition files.
  - [x] Implement a `Makefile` that uses Ollama's internal manifest files for
        dependency tracking.
  - [x] Use a generic pattern rule in the `Makefile` to automatically discover
        and build any `*.ollama` file.

- [x] **Task 21: Refine Local Model Prompts**

  - [x] Update the prompt templates in `morpheum-local.ollama` and
        `qwen3-coder-local.ollama` to improve tool-use instructions.
  - [x] Add untracked local models to the repository.

- [x] **Task 22: Enhance Markdown Task List Rendering**

  - [x] Update `format-markdown.ts` to correctly render GitHub-flavored markdown
        task lists.
  - [x] Add tests to `format-markdown.test.ts` to verify that checked and
        unchecked task list items are rendered correctly.

- [x] **Task 23: Fix Markdown Checkbox Rendering**

  - [x] Modify `format-markdown.ts` to use Unicode characters for checkboxes to
        prevent them from being stripped by the Matrix client's HTML sanitizer.
  - [x] Update `format-markdown.test.ts` to reflect the new Unicode character
        output.

- [x] **Task 24: Suppress Bullets from Task Lists (Abandoned)**

  - [x] Modify `src/morpheum-bot/format-markdown.ts` to suppress the bullets
        from task list items.

- [ ] **Task 27: Investigate incorrect commit**

  - [ ] `AGENTS.md` was checked in incorrectly.
  - [ ] A change to the bot's source was missed.
  - [ ] Investigate what went wrong and document it.

- [x] **Task 25: Fix `gemini-cli` Submodule Build and Crash**

  - [x] Investigate and fix a crash in the `gemini-cli` submodule's
        `shellExecutionService.ts`.
  - [x] Fix the `gemini-cli` submodule's build.

- [x] **Task 26: Handle Matrix Rate-Limiting**

  - [x] Implement a retry mechanism to handle `M_LIMIT_EXCEEDED` errors from the
        Matrix server.

- [x] **Task 27: Implement Message Queue and Throttling**

  - [x] Implement a message queue and throttling system to prevent rate-limiting
        errors.

- [x] **Task 28: Batch Messages in Queue**

  - [x] Modify the message queue to batch multiple messages into a single
        request.

- [x] **Task 29: Improve Pre-commit Hook**

  - [x] Add a check to the pre-commit hook to prevent commits with unstaged
        changes in `src/morpheum-bot`.

- [x] **Task 30: Improve `run_shell_command` Output**

  - [x] Modify the bot to show the command and its output for
        `run_shell_command`.

- [x] **Task 31: Fix Message Queue Mixed-Type Concatenation**

  - [x] Fix a bug in the message queue where text and HTML messages were being
        improperly concatenated.

- [x] **Task 32: Replace Checkbox Input Tags with Unicode Characters**

  - [x] Write a failing test case to assert that the HTML output contains
        Unicode checkboxes instead of `<input>` tags.
  - [x] Modify the `formatMarkdown` function to replace the `<input>` tags with
        Unicode characters.
  - [x] Ensure all tests pass.

- [x] **Task 33: Suppress Bullets from Task Lists (Abandoned)**

  - [x] This task was abandoned because the Matrix client's HTML sanitizer
        strips the `style` attribute, making it impossible to suppress the
        bullets using inline styles.

- [x] **Task 34: Add OpenAI API Compatibility**

  - [x] **Subtask 1: Create Failing Test for OpenAI Integration**
    - [x] Create a new test file `src/morpheum-bot/openai.test.ts`.
    - [x] Write a test that attempts to send a prompt to a mock OpenAI server
          and asserts that a valid response is received. This test should fail
          initially as the implementation won't exist.
  - [x] **Subtask 2: Implement OpenAI API Client**
    - [x] Create a new file `src/morpheum-bot/openai.ts`.
    - [x] Implement a function that takes a prompt and an OpenAI API key and
          sends a request to the OpenAI API.
    - [x] This function should handle the response and return it in a structured
          format.
    - [x] Create `OpenAIClient` class implementing `LLMClient` interface.
    - [x] Support custom base URLs for OpenAI-compatible APIs.
  - [x] **Subtask 3: Integrate OpenAI Client into Bot**
    - [x] Enhanced `src/morpheum-bot/bot.ts` to support both OpenAI and Ollama APIs.
    - [x] Added new commands: `!openai`, `!ollama`, `!llm status`, `!llm switch`.
    - [x] Created comprehensive test suite covering all new functionality.
    - [x] Added common `LLMClient` interface and factory pattern.
    - [x] Updated `SWEAgent` to use generic `LLMClient` interface.
    - [x] All tests pass for new integration functionality.

- [x] **Task 28: Fix missing message-queue files**

  - [x] Add `src/morpheum-bot/message-queue.ts` and
        `src/morpheum-bot/message-queue.test.ts` to the commit.
  - [x] Replace all instances of `client.sendMessage` with `queueMessage` in
        `src/morpheum-bot/index.ts` to use the new message queue.

- [x] **Task 29: Refine Ollama Model Prompts for TDD**

  - [x] Update the `SYSTEM` prompt in `gpt-oss-120b.ollama` and
        `gpt-oss-small.ollama` to be more specific to a Test-Driven Development
        (TDD) approach.
  - [x] Reduce the `num_ctx` parameter in `gpt-oss-120b.ollama` to `65536`.
  - [x] Add `bun.lock` and `opencode.json` to the repository.

- [x] **Task 30: Fix Message Queue Mixed-Type Concatenation**

  - [x] Fixed a bug in the message queue where text and HTML messages were being
        improperly concatenated.
  - [x] Modified the batching logic to group messages by both `roomId` and
        `msgtype`.
  - [x] Added a new test case to ensure that messages of different types are not
        batched together.

- [x] **Task 31: Refactor Message Queue Logic**
  - [x] Refactored the message queue to slow down message sending to at most 1
        per second.
  - [x] Implemented new batching logic:
    - Consecutive text messages are concatenated and sent as a single message.
    - HTML messages are sent individually.
  - [x] The queue now only processes one "batch" (either a single HTML message
        or a group of text messages) per interval.
  - [x] Updated the unit tests to reflect the new logic and fixed a bug related
        to shared state between tests.
- [x] ** Task 35: Fix up errors made by local LLMs**

  - [x] Revert CONTRIBUTING.md and ROADMAP.md hallucinations
  - [x] Commit work in progress on `opencode.json` and ollama models

- [x] ** Task 36: Switch gears to integrating directly with Ollama API**
  - [x] Write a basic integration in `src/ollama` with an interactive test
  - [x] Create a design doc for a jail system, and an overview of Gemini's
        architecture

## Phase 1: Implement the Jailed Agent Environment

The goal of this phase is to automate the setup and management of the jailed
agent environment described in `JAIL_PROTOTYPE.md` (now deprecated - see current implementation in `jail/` directory). All scripts and
configurations will be placed in a new `jail/` directory.

- [x] **Task 1: Create the `jail` directory structure.**

  - Create a new top-level directory named `jail`.

- [x] **Task 2: Implement `jail/flake.nix`**

  - Create a `flake.nix` file inside the `jail` directory.
  - Copy the Nix code from `JAIL_PROTOTYPE.md` into this file (now implemented).

- [x] **Task 3: Create `jail/start-vm.sh` script**

  - Create a shell script that automates the `colima start` command with the
    specified port forwarding logic for multiple agent and monitoring ports.

- [x] **Task 4: Create `jail/build.sh` script**

  - Create a shell script that runs `nix build .#default` (relative to the
    `jail` directory) and `docker load < result` to build the image and load it
    into the Docker daemon.

- [x] **Task 5: Create `jail/run.sh` script**

  - Create a shell script that automates the `docker run` command.
  - The script should accept arguments for the container name (e.g., `jail-1`)
    and the port numbers to map, making it easy to launch multiple, distinct
    jails.

- [x] **Task 6: Create `jail/agent.ts` client**

  - Create the TypeScript agent client as `jail/agent.ts`.
  - Copy the TypeScript code from `JAIL_PROTOTYPE.md` into this file (now implemented).

- [x] **Task 7: Create `jail/README.md`**
  - Create a `README.md` file inside the `jail` directory.
  - Document how to use the new scripts (`start-vm.sh`, `build.sh`, `run.sh`,
    and `agent.ts`) to set up and interact with the jailed environment. This
    replaces the manual instructions in the original prototype document.
- [x] **Task 37: Improve Pre-commit Hook**
  - [x] Add a check to the pre-commit hook to prevent commits with unstaged
        changes.
  - [x] Add a check to the pre-commit hook to prevent commits with untracked
        files.

## Phase 2: TypeScript SWE-Agent

The goal is to replace the bot's current Gemini CLI integration with a new,
self-contained agentic workflow inspired by `mini-swe-agent`. This new agent
will use local Ollama models and the `jail` environment to execute tasks, with
the Matrix bot serving as its primary user interface.

### Foundational Modules (TDD Approach)

- [x] **Task 38: Ollama API Client**

  - [x] Create a test file: `src/morpheum-bot/ollamaClient.test.ts`. Write a
        failing test that attempts to send a prompt to a mock Ollama API
        endpoint.
  - [x] Create the client module: `src/morpheum-bot/ollamaClient.ts`.
  - [x] Implement a function to send a system prompt and conversation history to
        a specified model via the Ollama API.
  - [x] Make the test pass.

- [x] **Task 39: Jailed Shell Client**

  - [x] Create a test file: `src/morpheum-bot/jailClient.test.ts`. Write a
        failing test that attempts to send a command to a mock TCP server and
        receive a response.
  - [x] Create the client module: `src/morpheum-bot/jailClient.ts`.
  - [x] **Reimplement** the TCP socket logic from `jail/agent.ts` directly
        within this module, creating a clean programmatic interface.
  - [x] Make the test pass.

- [x] **Task 40: Response Parser Utility**
  - [x] Create a test file: `src/morpheum-bot/responseParser.test.ts`. Write
        failing tests for extracting bash commands from various
        markdown-formatted strings.
  - [x] Create the utility module: `src/morpheum-bot/responseParser.ts`.
  - [x] Implement a function to reliably parse `bash ...` blocks from the
        model's text output.
  - [x] Make all tests pass.

### Agent Logic and Bot Integration

- [x] **Task 41: System Prompt Definition**

  - [x] Create a new file, `src/morpheum-bot/prompts.ts`, to store the core
        system prompt.
  - [x] Draft a system prompt inspired by `mini-swe-agent`, instructing the
        model to think step-by-step and use bash commands to solve software
        engineering tasks.

- [x] **Task 42: Core Agent Logic**

  - [x] Create a test file: `src/morpheum-bot/sweAgent.test.ts`. Write failing
        tests for the agent's main loop, mocking the Ollama and Jail clients.
  - [x] Create the agent module: `src/morpheum-bot/sweAgent.ts`.
  - [x] Implement the main agent loop, which will manage the conversation
        history and orchestrate calls to the Ollama client, parser, and jail
        client.

- [x] **Task 43: Matrix Bot Integration**
  - [x] Modify `src/morpheum-bot/index.ts` to add a new command, `!swe <task>`.
  - [x] When triggered, this command will initialize and run the `sweAgent` loop
        with the provided task.
  - [x] The agent's intermediate "thoughts," commands, and tool outputs will be
        formatted and sent as messages to the Matrix room.
  - [x] Add a corresponding integration test for the `!swe` command.

### Configuration and Cleanup

- [x] **Task 44: Configuration**

  - [x] Integrate necessary settings (e.g., Ollama model name, API URL, default
        jail port) into the bot's existing configuration system (using
        environment variables).

- [x] **Task 45: Deprecate Old Integration**

  - [x] Once the new `!swe` command is stable, remove the old Gemini CLI
        integration code and the `!gemini` command from
        `src/morpheum-bot/index.ts`.
  - [x] Remove any other now-unused files or dependencies related to the old
        implementation.

- [x] **Task 46: Fix Test Suite**
  - [x] Correct mock assertions in `vitest`.
  - [x] Install missing dependencies.
  - [x] Skip incomplete tests.
- [x] **Task 47: Bot Self-Sufficiency**

  - [x] Implement mention-based interaction for the bot.
  - [x] Add detailed logging for Ollama and Jail clients.
  - [x] Correct bugs related to user profile fetching.

- [x] **Task 48: Gauntlet Testing Framework**

  - [x] Create a `gauntlet.ts` script to automate the evaluation process.
  - [x] Implement a scoring system to rank models based on performance.
  - [x] Run the gauntlet on various models and document the results.
  - [x] Add a TODO item in `TASKS.md` for this task.
  - [x] Check in the new `GAUNTLET.md` file.
  - [x] Create a `DEVLOG.md` entry for this task.
  - [x] Follow the rules in `AGENTS.md`.
  - [ ] Test the gauntlet script with a local model, getting it to pass.

- [x] **Task 49: Remove `gemini-cli` Submodule**
  - [x] Verify that there are no remaining code dependencies on the submodule.
  - [x] Update configuration files to remove references to the submodule.
  - [x] De-initialize and remove the submodule from the repository.

## Phase 3: Agent and Workflow Refinement

- [x] **Task 50: Implement Iterative Agent Loop**
  - [x] Refactor the `sweAgent` to loop, feeding back command output to the LLM.
  - [x] The loop terminates when the LLM responds without a command.
- [x] **Task 51: Simplify and Improve System Prompt**
  - [x] Distill the system prompt to be clearer, more concise, and plan-oriented.
- [x] **Task 52: Stabilize Jail Communication**
  - [x] Fix `socat` configuration to reliably capture both `stdout` and `stderr`.
  - [x] Implement a robust readiness probe in the gauntlet to prevent race conditions.
- [x] **Task 53: Update Gauntlet for Nix Workflow**
  - [x] Modify gauntlet success conditions to check for tools within the `nix develop` environment.
- [x] **Task 54: Update Local Model**
  - [x] Update the `morpheum-local` model to use `qwen`.
- [x] **Task 55: Correct Documentation Inconsistencies**
  - [x] Analyzed all `.md` files for inconsistencies.
  - [x] Updated `ROADMAP.md` to reflect the completion of v0.1 and the current focus on v0.2.
  - [x] Updated `CONTRIBUTING.md` to describe the active Matrix-based workflow.

- [x] **Task 56: Apply PR Review Comments**
  - [x] Addressed feedback from PR #1 regarding package management preferences in documentation.
  - [x] Updated test script configuration for better compatibility.
  - [x] Enhanced bot status messages to include model information (PR #2 feedback).
  - [x] Ensured all changes maintain existing functionality while improving user experience.

- [x] **Task 57: Implement Streaming API Support**
  - [x] Extended `LLMClient` interface with `sendStreaming()` method for real-time feedback
  - [x] Implemented OpenAI streaming using Server-Sent Events (SSE) format
  - [x] Implemented Ollama streaming using JSONL format
  - [x] Added real-time progress indicators with emojis for enhanced user experience
  - [x] Maintained backward compatibility with existing `send()` method (2025-01-18)

- [x] **Task 58: Fix Jail Implementation Output Issues**
  - [x] Resolved bash warnings from interactive shell attempting to control non-existent terminal
  - [x] Cleaned up command output by switching from interactive (`bash -li`) to non-interactive (`bash -l`) shells
  - [x] Added comprehensive tests to validate clean output behavior (2025-01-20)

- [x] **Task 59: Design GitHub Copilot Integration**
  - [x] Created comprehensive design proposal for GitHub Copilot as third LLM provider
  - [x] Designed CopilotClient following existing LLMClient interface patterns
  - [x] Planned GitHub authentication and session management architecture
  - [x] Specified real-time status update mechanisms using polling and streaming
  - [x] Documented complete implementation plan with file-by-file changes
  - [x] Created `COPILOT_PROPOSAL.md` with technical specifications and rollout strategy (2025-01-27)

- [x] **Task 59: Enhance Bot User Feedback with Plan and Next Step Display**
  - [x] Added `parsePlanAndNextStep()` function to extract structured thinking from LLM responses
  - [x] Implemented plan display with 📋 icon showing bot's strategy on first iteration
  - [x] Implemented next step display with 🎯 icon showing bot's immediate action plan
  - [x] Used existing `sendMarkdownMessage()` helper for proper HTML formatting in Matrix
  - [x] Added comprehensive test coverage with 6 new test cases for parsing functionality
  - [x] Enhanced user transparency by showing the bot's thinking process in structured format

- [x] **Ad Hoc: Add sed as Default Tool in Jail Environment**
  - [x] Added `sed` to the nixpkgs package list in `jail/run.sh`
  - [x] Created gauntlet test case to verify sed availability
  - [x] Verified no regressions in existing functionality

- [x] **Ad Hoc: Fix Build Artifacts Being Built in Source Tree**
  - [x] Removed 66 build artifacts (*.js, *.d.ts, *.d.ts.map) from source tree
  - [x] Configured tsconfig.json to use outDir: './build' for all compilation output
  - [x] Updated .gitignore with comprehensive patterns to prevent future artifact commits
  - [x] Verified TypeScript compilation and tests work with new build directory configuration


