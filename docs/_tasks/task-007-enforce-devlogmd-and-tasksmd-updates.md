---
title: "Enforce `DEVLOG.md` and `TASKS.md` Updates"
order: 6
status: completed
phase: "Morpheum v0.1: The Matrix Milestone"
category: "Development"
---

- [x] **Task 7: Enforce `DEVLOG.md` and `TASKS.md` Updates**

  - [x] Implement a `pre-commit` hook that prevents commits if `DEVLOG.md` and
        `TASKS.md` are not staged.
  - [x] Use `husky` to manage the hook so it's automatically installed for all
        contributors.
  - [x] Address Husky deprecation warning.
  - [x] Verify submodule pushes by checking the status within the submodule
        directory.