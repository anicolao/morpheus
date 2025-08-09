# Contributing to Morpheum

We welcome contributions to the Morpheum project! By contributing, you help us build a more collaborative and efficient software development ecosystem.

## How to Contribute (Matrix-Centric Workflow)

All human interaction and contribution to Morpheum projects are designed to occur primarily within dedicated Matrix rooms. AI agents will handle the underlying Git mechanics (forking, branching, committing, and creating pull requests) based on human instructions.

### 1. Understand the Vision and Architecture

Before you start, please familiarize yourself with the project's vision and architecture:

*   **[VISION.md](VISION.md):** Understand the long-term goals and philosophy of Morpheum.
*   **[ARCHITECTURE.md](ARCHITECTURE.md):** Learn about the core components and how they interact.
*   **[ROADMAP.md](ROADMAP.md):** See what we're currently working on and our near-term plans.

### 2. Development Environment

**Current (Bootstrapping Phase):**

In the immediate near term, human developers will use a local instance of the Gemini CLI to interact directly with the Morpheum repository, similar to how we are operating now. This is a temporary phase to bootstrap the project.

**Future (Target State - Morpheum v0.1):**

As soon as possible, the development environment will transition to a Matrix-driven workflow. All interactions, including code changes, will be initiated within the Matrix room. AI agents, each with their own GitHub accounts, will manage the forks and pull requests.

### 3. Find and Define a Task

*   **Check the [ROADMAP.md](ROADMAP.md):** Look for tasks that align with your skills and interests.
*   **Browse Issues:** Check the GitHub issues for open tasks. These issues will typically be managed and updated by AI agents based on discussions in the Matrix room.
*   **Propose a New Feature/Bug Fix:** If you have an idea for a new feature or a bug fix, initiate a discussion in the relevant Matrix room. An AI agent will then create a formal GitHub issue based on this discussion.

### 4. Instruct AI Agents to Make Changes

Instead of directly manipulating Git, human contributors will instruct AI agents within the Matrix room to perform the necessary actions:

*   **Provide Clear Instructions:** Clearly articulate the desired changes, bug fixes, or new features in the Matrix room. Be as specific as possible.
*   **AI Agent Action:** An AI agent will interpret your instructions, create a new branch on its own fork, implement the changes, write tests, and adhere to coding standards.
*   **Automated Pull Request:** The AI agent will then create a pull request from its fork to the main Morpheum repository, referencing the relevant issue.

### 5. Review and Iterate

*   **Review Pull Requests:** Human developers will review the pull requests created by AI agents within GitHub.
*   **Provide Feedback:** All feedback and requests for changes should be communicated back in the Matrix room. An AI agent will then iterate on the changes based on this feedback.
*   **Approve and Merge (AI-Assisted):** Once satisfied, a human developer can instruct an AI agent (potentially a different one, or the same one with elevated permissions) within the Matrix room to approve and merge the pull request.

## AI Agent Contributions

AI agents are central to the Morpheum project. Please refer to the [AGENTS.md](AGENTS.md) document for specific guidelines on how AI agents should contribute, including their responsibilities for Git operations.

## Code of Conduct

We expect all contributors to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).