---
title: "Fix `gemini-cli` Submodule Build and Crash"
date: 2025-08-16
author: "Development Team"
tags: ["development", "bug-fix"]
---

- **Actions Taken:**
  - Investigated and fixed a crash in the `gemini-cli` submodule's
    `shellExecutionService.ts`.
  - The crash was caused by calling an undefined `onOutputEvent` function. The
    fix involved adding a check to ensure the function exists before calling it.
  - Went through a lengthy debugging process to fix the `gemini-cli` submodule's
    build, which was failing due to outdated types and a broken state.
  - The debugging process involved:
    - Reverting local changes.
    - Reinstalling dependencies with `npm ci`.
    - Resetting the submodule to the latest commit.
    - A fresh install of dependencies after deleting `node_modules` and
      `package-lock.json`.
    - Finally, fixing the build errors by updating the code to match the new
      types.
- **Friction/Success Points:**
  - The `gemini-cli` submodule was in a very broken state, which made the
    debugging process difficult and time-consuming.
  - The final solution involved a combination of git commands, dependency
    management, and code changes.
- **Lessons Learned:**
  - When a submodule is in a broken state, it's often necessary to take a
    multi-pronged approach to fixing it.
  - It's important to be systematic when debugging, and to try different
    solutions until the problem is resolved.

---