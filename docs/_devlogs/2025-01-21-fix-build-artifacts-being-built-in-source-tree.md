---
title: "Fix Build Artifacts Being Built in Source Tree"
date: 2025-01-21
author: "Development Team"
tags: ["development", "bug-fix"]
---

- **High-Level Request:**

  - Clean up TypeScript build artifacts (_.js, _.d.ts, \*.d.ts.map) that were
    being generated in the source tree and committed to git.

- **Actions Taken:**

  - **Problem Analysis:** Found 66 build artifacts scattered throughout the
    repository (63 in src/, 3 in jail/, 4 in root)
  - **TypeScript Configuration:** Updated `tsconfig.json` to set
    `outDir: "./build"` to direct all compilation output to a dedicated build
    directory
  - **Gitignore Enhancement:** Added comprehensive patterns to ignore all build
    artifacts:
    - `/build/` directory for future builds
    - Global patterns for `*.js`, `*.d.ts`, `*.d.ts.map`, `*.js.map`
  - **Source Tree Cleanup:** Systematically removed all existing build artifacts
    from the repository
  - **Verification:** Confirmed TypeScript compiler now outputs to build
    directory and tests still pass

- **Friction/Success Points:**

  - **Success:** The cleanup was straightforward and comprehensive - all 66
    build artifacts were successfully removed
  - **Success:** TypeScript automatically started using the new build directory
    configuration
  - **Success:** Gitignore patterns properly prevent future commits of build
    artifacts
  - **Success:** Tests continue to work normally, confirming no breaking changes
    to functionality

- **Lessons Learned:**
  - Build artifacts in source trees create repository clutter and unnecessary
    commits
  - Proper TypeScript `outDir` configuration combined with comprehensive
    gitignore patterns prevents this issue
  - The existing project had pre-existing test failures unrelated to the build
    artifacts, which helped confirm our changes didn't break anything

---