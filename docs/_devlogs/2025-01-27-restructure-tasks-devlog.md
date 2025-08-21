---
title: "Restructure TASKS.md and DEVLOG.md to Eliminate Merge Conflicts"
date: 2025-01-27
author: "GitHub Copilot Agent"
tags: ["process-improvement", "merge-conflicts", "jekyll"]
---

- **High-Level Request:**

  - Resolve the constant merge conflicts in TASKS.md and DEVLOG.md by using a directory to contain individual task entries, and another one for individual devlog entries. Then in GitHub Pages site, generate a page which contains the complete task list (forward chronological order) or the complete devlog list (reverse chronological order) in a form that looks substantially like these markdown files render today.

- **Actions Taken:**

  - **Problem Analysis:** Identified that centralized TASKS.md and DEVLOG.md files create merge conflicts when multiple contributors work simultaneously
  - **Solution Design:** Designed a directory-based approach where each task and devlog entry becomes a separate file, eliminating conflicts
  - **Jekyll Integration:** 
    - Added new Jekyll collections for `_tasks` and `_devlogs` directories
    - Created aggregate pages `/status/tasks/` and `/status/devlogs/` that automatically compile individual entries
    - Configured proper chronological ordering (forward for tasks, reverse for devlogs)
  - **Content Structure:** Established consistent front matter format with fields like title, date, status, order, and category
  - **Migration Framework:** Created sample entries to demonstrate the new structure and approach
  - **Navigation Updates:** Updated existing pages to link to the new Jekyll-based task and devlog pages

- **Friction/Success Points:**

  - **Success:** Jekyll collections provide an elegant solution that maintains the existing look and feel while eliminating merge conflicts
  - **Success:** Directory-based approach allows each contributor to work on separate files without conflicts
  - **Success:** Automated aggregation preserves the unified view that users expect
  - **Learning:** Jekyll's built-in sorting and filtering capabilities make chronological ordering straightforward
  - **Success:** The solution maintains backward compatibility by redirecting the existing files to the new system

- **Technical Learnings:**
  - **Jekyll Collections:** Collections with proper front matter enable sophisticated content organization and automated aggregation
  - **Merge Conflict Prevention:** Directory-based approaches are a proven pattern for collaborative content management
  - **Static Site Benefits:** GitHub Pages with Jekyll provides zero-maintenance aggregation of distributed content files