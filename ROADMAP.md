# Roadmap

This document outlines the development roadmap for Morpheum, focusing on the near-term tasks required to transition from a single-developer, local CLI-based workflow to a collaborative, Matrix-based workflow.

## Morpheum v0.1: The "Matrix Milestone"

The primary goal for the near future is to establish the basic infrastructure for Matrix-based collaboration. This will involve the following tasks:

### 1. Matrix Room Setup

*   **Create a dedicated Matrix room for the Morpheum project.** This room will serve as the central hub for all project-related communication.
*   **Invite the initial developer(s) to the room.**

### 2. Bot Development: The "Morpheum Bot"

The core of the Matrix milestone is the development of a bot, tentatively named the "Morpheum Bot," that will act as the primary interface between the developers and the GitHub repository. This bot will be developed in TypeScript/JavaScript, leveraging the forked Gemini CLI.

*   **Initial Proof of Concept:**
    *   Fork the Gemini CLI (TypeScript/JavaScript-based) to create the initial version of the Morpheum Bot. This will allow the bot to directly be the Gemini CLI for an initial proof of concept, working within its native language environment.

*   **Basic Bot Infrastructure (TypeScript/JavaScript):**
    *   Set up a basic bot framework using appropriate TypeScript/JavaScript libraries for Matrix interaction (e.g., `matrix-bot-sdk` or similar).
    *   Configure the bot to join the project's Matrix room.
    *   Implement a simple command handler to respond to basic commands (e.g., `!help`).

*   **GitHub Integration (TypeScript/JavaScript):**
    *   Each AI agent should have its own GitHub account, which it will use to fork repositories and create pull requests.
    *   Human developers can then use an AI agent with their own accounts for the purposes of accepting pull requests into the project.
    *   Implement OAuth or a similar mechanism to allow the bot to authenticate with GitHub on behalf of the user, using TypeScript/JavaScript libraries.
    *   Develop a set of commands for interacting with the GitHub repository, including:
        *   `!create-repo <repo-name>`: Creates a new GitHub repository.
        *   `!create-issue <title> <description>`: Creates a new issue in the repository.
        *   `!list-issues`: Lists the open issues in the repository.
        *   `!create-pr <branch> <title> <description>`: Creates a new pull request.
        *   `!approve-pr <pr-number>`: Approves a pull request.
        *   `!merge-pr <pr-number>`: Merges a pull request.

*   **Agent Integration:**
    *   Develop a mechanism for the bot to invoke AI agents (like the Gemini CLI) to perform tasks.
    *   For example, a command like `!refactor-code <file> <instructions>` would trigger the bot to call the Gemini CLI with the appropriate prompts and context.

### 3. Workflow Transition

*   **Dogfooding:** As soon as the basic bot functionality is in place, we will begin "dogfooding" the new workflow. All project-related tasks will be initiated and managed through the Matrix room.
*   **Documentation:** The `README.md` and other documentation will be updated to reflect the new Matrix-based workflow.

## Future Goals

Once the Matrix milestone is complete, we will focus on the following long-term goals:

*   **Decentralized Agent Marketplace:** Develop a marketplace for AI agents, where developers can contribute their own agents and users can discover and use them.
*   **Decentralized Hardware Marketplace:** Develop a marketplace for hardware providers, where users can contribute their own hardware resources for running the AI agents.
*   **Enhanced Collaboration Features:** Develop more advanced collaboration features, such as real-time collaborative editing of code and documents.

By focusing on these near-term and long-term goals, we can progressively build towards the vision of a decentralized and collaborative software development ecosystem.
