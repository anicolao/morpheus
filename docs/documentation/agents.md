---
layout: page
title: Agent Guidelines
permalink: /documentation/agents/
---

# AI Agent Guidelines

This document outlines the expected behavior and best practices for all AI agents contributing to the Morpheum project. The goal is to ensure consistency, reliability, and seamless collaboration between AI and human developers.

## Core Principles

### Adherence to Project Conventions
Agents must rigorously adhere to existing project conventions, including coding style, architectural patterns, and established workflows. Analyze the surrounding code and documentation before making any changes.

### Tool Proficiency
Agents should demonstrate proficiency with the available tools, especially the GitHub CLI/APIs and other development utilities. In cases where a tool's capabilities are unknown, agents should avoid making definitive statements about what is or isn't possible.

### Transparency and Communication
Agents should be transparent about their actions and the reasoning behind them. When encountering ambiguity or making significant decisions, agents should communicate their intent to the human developer.

### Reliability and Stability
Agents must avoid actions that could lead to an unstable state, such as hanging during a git rebase. If an operation is risky or has failed in the past, the agent should report the issue and seek guidance.

### Accurate and Factual Information
Agents must avoid "hallucinating" or inventing information. All generated content, especially architectural descriptions and technical documentation, should be based on the actual state of the project.

## Specific Guidelines

### File Operations
- Before modifying any file, agents should read its content to ensure they have the latest version
- When creating new files, agents should follow the established naming conventions and directory structure

### Version Control
- Agents should be proficient with basic git operations, including `git add`, `git commit`, and `git push`
- Commit messages should be clear, concise, and follow the project's established format
- Agents should not attempt complex git operations like `git rebase` without explicit instructions and a clear understanding of the potential consequences
- Agents should prefer SSH over HTTPS for git repositories

### Package Management
Prefer `bun` over `npm` for running scripts and managing packages (note: while the current development environment primarily uses `bun`, `npm` also works if necessary).

### Content Generation
- When generating documentation, agents should ensure the content is accurate and reflects the current state of the project
- When fetching content from the web, agents should be instructed to retrieve the raw text rather than a summary, unless a summary is explicitly requested

### Error Handling
- If an agent encounters an error or is unable to complete a task, it should report the issue clearly and provide any relevant context or logs
- Agents should not attempt to work around errors without first reporting them and seeking guidance

## Development Log (DEVLOG.md)

The `DEVLOG.md` is a critical component of this project. It serves as a shared knowledge base for both humans and AI agents to improve collaboration and efficiency.

### Requirements
- Agents must log a summary of their work in `DEVLOG.md`, including the high-level request from the human, the actions taken, and any friction or success points
- The log should capture not just *what* was done, but *why* it was done, and what was learned in the process
- If a new technique is discovered (e.g., using `git show` for statistics), this should be documented so that future agents can benefit from this knowledge

### Goal
The goal is to create a virtuous cycle of learning and improvement, where the `DEVLOG.md` becomes a repository of best practices and lessons learned.

## Interaction Patterns

### Matrix Communication
- Respond clearly and concisely to human instructions
- Ask for clarification when tasks are ambiguous
- Provide status updates during long-running operations
- Report completion with summary of changes made

### GitHub Operations
- Create meaningful commit messages that describe the changes
- Use appropriate branch names for feature work
- Include relevant issue references in commits and PRs
- Ensure all changes are properly tested before submission

### Code Quality
- Follow existing code style and patterns
- Add appropriate tests for new functionality
- Update documentation when making changes
- Handle edge cases and error conditions

## Best Practices

### Before Starting Work
1. Read and understand the task requirements
2. Review related code and documentation
3. Check for existing tests and patterns
4. Plan the approach and identify potential issues

### During Development
1. Make small, focused commits
2. Test changes incrementally
3. Document any new patterns or decisions
4. Communicate progress and blockers

### After Completion
1. Verify all tests pass
2. Update relevant documentation
3. Log work summary in DEVLOG.md
4. Ensure clean git history

By following these guidelines, AI agents can become more effective and reliable partners in the software development process.