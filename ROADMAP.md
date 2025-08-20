# Roadmap

This document outlines the development roadmap for Morpheum.

## Morpheum v0.1: The "Matrix Milestone" (Completed)

This initial phase focused on bootstrapping the project and establishing the basic infrastructure for a collaborative, Matrix-based workflow.

### 1. Matrix Room Setup (Done)

*   A dedicated Matrix room for the Morpheum project was created and serves as the central hub for all project-related communication.

### 2. Bot Development: The "Morpheum Bot" (In Progress)

The core of this milestone was the development of the "Morpheum Bot" to act as the primary interface between developers and the GitHub repository.

*   **Initial Proof of Concept (Done):**
    *   The Gemini CLI was successfully forked and integrated as a library to bootstrap the bot's development. This allowed for an initial proof of concept and has since been replaced by a direct integration with local LLMs, marking this as a successful bootstrapping step.

*   **Basic Bot Infrastructure (Done):**
    *   A basic bot framework using TypeScript and the `matrix-bot-sdk` has been set up.
    *   The bot is configured to join the project's Matrix room and respond to basic commands.

*   **GitHub Integration (To Do):**
    *   A mechanism for instructing AI agents to perform GitHub-related actions (e.g., creating repositories, issues, pull requests, and managing their approval and merging) still needs to be implemented.

*   **Agent Integration (To Do):**
    *   The bot's agent is now invoked by mentioning the bot's name (`@botname: <prompt>`). The underlying logic to handle a wide range of commands is the current focus of development.

### 3. Workflow Transition (To Do)

*   **Dogfooding:** The project is actively using the bot for its own development ("dogfooding"), but this is an ongoing process.
*   **Documentation:** Project documentation is continuously updated to reflect the latest workflow.

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

*   **OpenAI API Integration:**
    *   Complete the integration with the OpenAI API, allowing the bot to leverage models like GPT-4 for tasks that require more advanced reasoning.
*   **Jail Environment Enhancements:**
    *   Improve the jailed development environment to support a wider range of project types and dependencies.

### 3. Workflow and Usability

*   **Matrix Interface:**
    *   Improve the user experience in the Matrix room by providing more structured output, better error reporting, and more intuitive commands.
*   **Multi-Agent Collaboration:**
    *   Begin experimenting with multi-agent workflows, where different agents with specialized skills can collaborate on a single task.


