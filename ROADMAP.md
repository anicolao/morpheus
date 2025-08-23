# Roadmap

This document outlines the development roadmap for Morpheum.

## Morpheum v0.1: The "Matrix Milestone" (Completed)

This initial phase focused on bootstrapping the project and establishing the basic infrastructure for a collaborative, Matrix-based workflow.

### 1. Matrix Room Setup (Done)

*   A dedicated Matrix room for the Morpheum project was created and serves as the central hub for all project-related communication.

### 2. Bot Development: The "Morpheum Bot" (Done)

The core of this milestone was the development of the "Morpheum Bot" to act as the primary interface between developers and the GitHub repository.

*   **Initial Proof of Concept (Done):**
    *   The Gemini CLI was successfully forked and integrated as a library to bootstrap the bot's development. This allowed for an initial proof of concept and has since been replaced by a direct integration with local LLMs, marking this as a successful bootstrapping step.

*   **Basic Bot Infrastructure (Done):**
    *   A basic bot framework using TypeScript and the `matrix-bot-sdk` has been set up.
    *   The bot is configured to join the project's Matrix room and respond to basic commands.

*   **GitHub Integration (Done):**
    *   A comprehensive GitHub integration has been implemented via `CopilotClient` that can create issues, manage pull requests, track GitHub Copilot sessions, and perform repository operations using both REST and GraphQL APIs.

*   **Agent Integration (Done):**
    *   The bot's agent is fully operational and invoked by mentioning the bot's name (`@botname: <prompt>`). The underlying logic handles a wide range of commands including SWE-Agent operations, gauntlet testing, task management, and GitHub operations.

### 3. Workflow Transition (Done)

*   **Dogfooding (Done):** The project is actively using the bot for its own development ("dogfooding") with Matrix-based workflows, GitHub Copilot integration, and automated task management.
*   **Documentation (Done):** Project documentation has been restructured to use directory-based systems (eliminating merge conflicts) and is continuously updated to reflect the current workflow state.

## Morpheum v0.2: Agent Advancement (Current Focus)

The primary goal for the current phase is to enhance the intelligence, reliability, and capabilities of the core SWE-Agent. This involves rigorous testing, targeted improvements, and integration with a wider range of tools.

### 1. Agent Evaluation and Improvement

*   **Gauntlet Testing:**
    *   Systematically run the evaluation gauntlet ([`GAUNTLET.md`](GAUNTLET.md)) against a variety of local and proprietary models to establish performance benchmarks.
    *   Analyze the results to identify common failure points and areas for improvement in the agent's planning and execution logic.
*   **Prompt Engineering:**
    *   Iteratively refine the system prompts in [`prompts.ts`](src/morpheum-bot/prompts.ts) based on gauntlet results to improve the agent's reasoning and tool-use capabilities.
*   **Self-Correction and Learning:**
    *   Investigate and implement mechanisms for the agent to learn from its mistakes. This could involve feeding back summaries of failed tasks into its context or developing a more sophisticated self-correction loop.

### 2. Enhanced Tooling and Environment

*   **OpenAI API Integration (Done):**
    *   Complete integration with the OpenAI API has been implemented, allowing the bot to leverage models like GPT-4 for tasks that require more advanced reasoning. The bot supports both OpenAI and Ollama backends with automatic fallback.
*   **Jail Environment Enhancements (Done):**
    *   A comprehensive jailed development environment has been implemented supporting Nix-based containerization, Docker integration, and TCP-based agent communication for secure, isolated code execution.

### 3. Workflow and Usability

*   **Matrix Interface:**
    *   Improve the user experience in the Matrix room by providing more structured output, better error reporting, and more intuitive commands.
*   **Multi-Agent Collaboration:**
    *   Begin experimenting with multi-agent workflows, where different agents with specialized skills can collaborate on a single task.


