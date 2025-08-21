# AI Agent Guidelines

This document outlines the expected behavior and best practices for all AI agents contributing to the Morpheum project. The goal is to ensure consistency, reliability, and seamless collaboration between AI and human developers.

## Core Principles

*   **Adherence to Project Conventions:** Agents must rigorously adhere to existing project conventions, including coding style, architectural patterns, and established workflows. Analyze the surrounding code and documentation before making any changes.
*   **Tool Proficiency:** Agents should demonstrate proficiency with the available tools, especially the GitHub CLI/APIs and other development utilities. In cases where a tool's capabilities are unknown, agents should avoid making definitive statements about what is or isn't possible.
*   **Transparency and Communication:** Agents should be transparent about their actions and the reasoning behind them. When encountering ambiguity or making significant decisions, agents should communicate their intent to the human developer.
*   **Reliability and Stability:** Agents must avoid actions that could lead to an unstable state, such as hanging during a git rebase. If an operation is risky or has failed in the past, the agent should report the issue and seek guidance.
*   **Accurate and Factual Information:** Agents must avoid "hallucinating" or inventing information. All generated content, especially architectural descriptions and technical documentation, should be based on the actual state of the project.

## Specific Guidelines

*   **File Operations:**
    *   Before modifying any file, agents should read its content to ensure they have the latest version.
    *   When creating new files, agents should follow the established naming conventions and directory structure.
*   **Version Control:**
    *   Agents should be proficient with basic git operations, including `git add`, `git commit`, and `git push`.
    *   Commit messages should be clear, concise, and follow the project's established format.
    *   Agents should not attempt complex git operations like `git rebase` without explicit instructions and a clear understanding of the potential consequences.
    *   Agents should prefer SSH over HTTPS for git repositories.
*   **Package Management:** Prefer `bun` over `npm` for running scripts and managing packages (note: while the current development environment primarily uses `bun`, `npm` also works if necessary).
*   **Content Generation:**
    *   When generating documentation, agents should ensure the content is accurate and reflects the current state of the project.
    *   When fetching content from the web, agents should be instructed to retrieve the raw text rather than a summary, unless a summary is explicitly requested.
*   **Error Handling:**
    *   If an agent encounters an error or is unable to complete a task, it should report the issue clearly and provide any relevant context or logs.
    *   Agents should not attempt to work around errors without first reporting them and seeking guidance.
*   **Development Log (`DEVLOG.md`):**
    *   The [`DEVLOG.md`](DEVLOG.md) is a critical component of this project. It serves as a shared knowledge base for both humans and AI agents to improve collaboration and efficiency.
    *   Agents must log a summary of their work in [`DEVLOG.md`](DEVLOG.md), including the high-level request from the human, the actions taken, and any friction or success points.
    *   The log should capture not just *what* was done, but *why* it was done, and what was learned in the process. For example, if a new technique is discovered (e.g., using `git show` for statistics), this should be documented so that future agents can benefit from this knowledge.
    *   The goal is to create a virtuous cycle of learning and improvement, where the `DEVLOG.md` becomes a repository of best practices and lessons learned.
*   **GitHub Pages Site Maintenance:**
    *   The project documentation is published via GitHub Pages from the `docs/` directory using Jekyll.
    *   When updating project documentation (README.md, ARCHITECTURE.md, etc.), corresponding changes should be made to the Jekyll site in `docs/` to keep the public-facing documentation current.
    *   The site automatically deploys via GitHub Actions when changes are pushed to the main branch.
    *   Content in `docs/documentation/`, `docs/status/`, and `docs/proposals/` should be updated to reflect current project state.
    *   When adding new design proposals or significant architectural changes, create corresponding pages in the Jekyll site for public visibility.

By following these guidelines, AI agents can become more effective and reliable partners in the software development process.
