---
title: "Refactor the gemini-cli into a library, integrate it with the morpheum-bot, and debug the integration"
date: 2025-08-11
author: "Development Team"
tags: ["development", "bug-fix", "bot"]
---

- **Actions Taken:**
  - Refactored the `gemini-cli`'s core logic into a new `library.ts` file,
    exposing `initialize` and `streamQuery` functions.
  - Created a non-React `ToolScheduler` to execute tools like
    `run_shell_command`, `read_file`, `write_file`, and `replace`.
  - Wrote unit and integration tests for the new library interface to ensure its
    correctness.
  - Integrated the new library into the `morpheum-bot`, replacing the old
    `exec`-based implementation.
  - Debugged and fixed several critical issues during the integration, including
    crashes related to uninitialized clients, incorrect authentication flows,
    and missing tool implementations.
  - Refined the bot's output to be more user-friendly, suppressing unhelpful
    messages and ensuring tool results are displayed.
- **Friction/Success Points:**
  - The refactoring was a complex but successful effort, resulting in a much
    cleaner and more robust integration.
  - The test-driven approach, prompted by the user, was crucial in identifying
    and fixing bugs early.
  - Repeatedly struggled with the `replace` tool, indicating a need for
    improvement in my own tooling.
  - The debugging process was iterative and highlighted the importance of clear
    error messages and careful attention to initialization order.
- **Lessons Learned:**
  - A library-first approach to integration is superior to shelling out to a
    CLI.
  - Thorough testing is not just a "nice-to-have," but a critical part of the
    development process.
  - When debugging, it's important to look at the entire lifecycle of the
    application, including initialization and authentication.

---