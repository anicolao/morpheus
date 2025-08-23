---
title: "Fix DEVLOG.md and TASKS.md Editing Workflow to Prevent Agent Errors"
date: 2025-01-30
author: "GitHub Copilot Agent"
tags: ["process-improvement", "workflow", "pre-commit-hooks", "documentation"]
---

- **High-Level Request:**

  - Search all the markdown for misinformation about the DEVLOG.md and TASKS.md workflow and propose a set of changes that will stop agents from incorrectly editing these files forevermore. Make precommit hook errors explicit about what to read/what to do when they detect attempts to edit these legacy files.

- **Actions Taken:**

  - **Problem Analysis:** Identified root causes of agents still editing legacy DEVLOG.md and TASKS.md files:
    - Pre-commit hook enforced old workflow requiring both files to be updated together
    - AGENTS.md contained outdated instructions telling agents to edit DEVLOG.md directly
    - Error messages didn't explain the new directory-based workflow
    - Mixed messaging throughout codebase between old and new workflows

  - **Pre-commit Hook Overhaul:** Completely replaced the old logic in `.husky/pre-commit`:
    - Removed requirement to update both DEVLOG.md and TASKS.md together
    - Added detection for any attempts to edit these files directly
    - Implemented comprehensive error message explaining the new workflow with:
      - Clear explanation of what files to create instead
      - Links to contributing documentation
      - URLs to unified views on GitHub Pages
      - Visual formatting to make guidance easy to follow

  - **Agent Guidelines Update:** Fixed `docs/_includes/AGENTS.md` and `AGENTS.md`:
    - Replaced "Development Log (DEVLOG.md)" section with "Development Log (Directory-Based System)"
    - Added explicit instructions to create files in `docs/_devlogs/` with proper YAML front matter
    - Added new "Task Management (Directory-Based System)" section with instructions for `docs/_tasks/`
    - Added **CRITICAL** warnings that editing the legacy files is blocked by pre-commit hooks

  - **Task Documentation Fix:** Updated `docs/_tasks/task-005-devlog-tasks-management.md`:
    - Changed task description from "read and write to DEVLOG.md and TASKS.md files" to "read legacy files and create new files in directories"
    - Updated bot commands from "add entries to DEVLOG.md" to "add entries to docs/_devlogs/"

- **Friction/Success Points:**

  - **Success:** Pre-commit hook now provides crystal-clear guidance when agents attempt to edit legacy files
  - **Success:** Error message includes all necessary information - no need to hunt for documentation
  - **Success:** Hook testing confirmed both blocking incorrect edits and allowing legitimate changes
  - **Success:** Documentation is now consistent throughout the codebase about the new workflow
  - **Learning:** The key was removing the enforcement of the old workflow entirely rather than just adding new guidance
  - **Learning:** Comprehensive error messages prevent confusion and provide actionable next steps

- **Technical Implementation:**

  - **Pre-commit Hook Logic:** Simple detection of any staged changes to DEVLOG.md or TASKS.md triggers detailed guidance message
  - **Documentation Consistency:** All references to editing these files directly have been updated to point to the directory-based approach
  - **Error Prevention:** The hook exit code 1 ensures no commits can proceed with legacy file edits
  - **Future-Proof:** Clear guidance ensures both human and AI contributors understand the correct workflow

This solution addresses the root cause by making incorrect behavior impossible rather than just documenting the correct behavior.