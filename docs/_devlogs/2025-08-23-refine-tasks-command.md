---
title: "Refine !tasks Command for New Directory Structure"
date: 2025-08-23
author: "GitHub Copilot Agent"
tags: ["bot-enhancement", "tasks-command", "directory-structure"]
---

- **High-Level Request:**

  - Refine the !tasks command for the new structure. It should find task files with uncompleted tasks and assemble markdown for only those, then convert that markdown into HTML and send it to the chat.

- **Actions Taken:**

  - **Created Task Utilities Module:** Implemented `src/morpheum-bot/task-utils.ts` with comprehensive utilities for reading and processing task files:
    - `parseTaskFile()` function to extract front matter and content from task markdown files
    - `scanTaskDirectory()` function to read all task files from `docs/_tasks/` directory
    - `filterTasksByStatus()` function to filter tasks by completion status (completed vs uncompleted)
    - `assembleTasksMarkdown()` function to generate organized markdown grouped by phase and sorted by order
  - **Enhanced Bot Command Handler:** Updated the !tasks command in `src/morpheum-bot/bot.ts`:
    - Replaced direct TASKS.md reading with new task directory scanning logic
    - Added filtering to show only uncompleted tasks (status != "completed")
    - Maintained proper markdown to HTML conversion for Matrix chat
    - Added graceful fallback message when no uncompleted tasks exist
  - **Comprehensive Testing:** Created extensive test suite in `src/morpheum-bot/task-utils.test.ts`:
    - Tests for front matter parsing with various formats
    - Tests for directory scanning and file processing
    - Tests for status filtering and markdown assembly
    - Tests for proper grouping by phase and sorting by order
  - **Integration Testing:** Updated `src/morpheum-bot/bot.test.ts` to verify the new !tasks command functionality works correctly

- **Friction/Success Points:**

  - **Success:** The new directory-based approach provides much more flexibility for task management and reduces noise by showing only relevant uncompleted tasks
  - **Success:** Comprehensive front matter parsing supports the full range of task metadata (title, status, phase, order, category)
  - **Success:** All existing tests continue to pass while new functionality is thoroughly tested (152 tests passing)
  - **Success:** The command maintains backward compatibility with existing Matrix chat integration and HTML formatting
  - **Learning:** Gray-matter library provides robust front matter parsing for markdown files with YAML metadata
  - **Success:** Grouping tasks by phase and sorting by order creates a logical presentation structure for users

- **Technical Learnings:**
  - **Front Matter Processing:** The gray-matter library efficiently separates YAML metadata from markdown content in task files
  - **Directory Scanning:** Node.js fs.readdirSync() with path filtering enables reliable discovery of task files
  - **Status Filtering:** Simple string comparison on front matter status field provides flexible task completion tracking
  - **Markdown Assembly:** Template-based markdown generation with proper escaping ensures clean output for HTML conversion