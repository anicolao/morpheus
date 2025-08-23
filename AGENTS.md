# AI Agent Guidelines

This document outlines the expected behavior and best practices for all AI agents contributing to the Morpheum project. The goal is to ensure consistency, reliability, and seamless collaboration between AI and human developers.

## Core Principles

*   **Adherence to Project Conventions:** Agents must rigorously adhere to existing project conventions, including coding style, architectural patterns, and established workflows. Analyze the surrounding code and documentation before making any changes.
*   **Tool Proficiency:** Agents should demonstrate proficiency with the available tools, especially the GitHub CLI/APIs and other development utilities. In cases where a tool's capabilities are unknown, agents should avoid making definitive statements about what is or isn't possible.
*   **Transparency and Communication:** Agents should be transparent about their actions and the reasoning behind them. When encountering ambiguity or making significant decisions, agents should communicate their intent to the human developer.
*   **Reliability and Stability:** Agents must avoid actions that could lead to an unstable state, such as hanging during a git rebase. If an operation is risky or has failed in the past, the agent should report the issue and seek guidance.
*   **Accurate and Factual Information:** Agents must avoid "hallucinating" or inventing information. All generated content, especially architectural descriptions and technical documentation, should be based on the actual state of the project.
*   **Anthropic Content Restrictions:** To comply with Anthropic's license agreement, agents must avoid any reference to Anthropic, Claude, or any Anthropic products anywhere in Morpheum code, documentation, examples, or comments. This includes avoiding these terms in variable names, comments, documentation examples, or any other project materials.

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
*   **Development Log (Directory-Based System):**
    *   Development logs are a critical component for shared knowledge between humans and AI agents to improve collaboration and efficiency.
    *   **NEW WORKFLOW:** Agents must create individual log files in `docs/_devlogs/` using the format `{YYYY-MM-DD}-{description}.md` instead of editing `DEVLOG.md` directly.
    *   Each log file must include YAML front matter with `title`, `date`, `author`, and `tags` fields, followed by sections like "Actions Taken," "Friction/Success Points," and "Technical Learnings."
    *   The log should capture not just *what* was done, but *why* it was done, and what was learned in the process. For example, if a new technique is discovered (e.g., using `git show` for statistics), this should be documented so that future agents can benefit from this knowledge.
    *   Files are automatically aggregated into a unified view at https://anicolao.github.io/morpheum/status/devlogs/ in reverse chronological order.
    *   **CRITICAL:** Do NOT edit `DEVLOG.md` directly - this violates the merge conflict prevention system and will be blocked by pre-commit hooks.
*   **Task Management (Directory-Based System):**
    *   Tasks are managed using individual files in `docs/_tasks/` using the format `task-{number}-{description}.md` instead of editing `TASKS.md` directly.
    *   Each task file must include YAML front matter with `title`, `order`, `status`, `phase`, and `category` fields.
    *   Files are automatically aggregated into a unified view at https://anicolao.github.io/morpheum/status/tasks/ in forward chronological order.
    *   **CRITICAL:** Do NOT edit `TASKS.md` directly - this violates the merge conflict prevention system and will be blocked by pre-commit hooks.
*   **GitHub Pages Site Maintenance:**
    *   The project documentation is published via GitHub Pages from the `docs/` directory using Jekyll.
    *   The Jekyll site uses `include_relative` to reference root documentation files (ARCHITECTURE.md, VISION.md, etc.) maintaining a single source of truth.
    *   The site automatically deploys via GitHub Actions when changes are pushed to the main branch.
    *   Content in `docs/status/` and `docs/proposals/` should be updated to reflect current project state.
    *   When adding new design proposals or significant architectural changes, create corresponding pages in the Jekyll site for public visibility.

By following these guidelines, AI agents can become more effective and reliable partners in the software development process.
