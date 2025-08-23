---
title: "Implement and Test Markdown to Matrix HTML Formatting"
date: 2025-08-11
author: "Development Team"
tags: ["development", "testing", "matrix"]
---

- **Actions Taken:**
  - Created a new test suite for markdown formatting logic in
    `src/morpheum-bot/format-markdown.test.ts`.
  - Implemented the `formatMarkdown` function in
    `src/morpheum-bot/format-markdown.ts` using the `marked` library.
  - Installed `jsdom` and configured `vitest` to use it as the test environment
    to resolve DOM-related errors in other tests.
  - Configured `vitest` to exclude tests from the `gemini-cli` submodule and
    `node_modules`.
  - Corrected the tests to match the output of the `marked` library, including
    newlines and HTML entity encoding.
  - Removed the old, redundant markdown test from
    `src/morpheum-bot/index.test.ts` and then deleted the empty test file.
  - Fixed a bug where the bot would not correctly format markdown files read by
    the `read_file` tool and would enter an infinite loop.
  - Updated the `BotMessage` type in `gemini-cli/packages/cli/src/library.ts` to
    include the `request` in `tool_result` messages.
  - Updated the `streamQuery` function in
    `gemini-cli/packages/cli/src/library.ts` to include the `request` in the
    `tool_result` message.
  - Updated the `callback` function in `src/morpheum-bot/index.ts` to correctly
    handle markdown files from the `read_file` tool.
- **Friction/Success Points:**
  - The initial test run revealed that many unrelated tests were failing due to
    a misconfigured test environment.
  - The `marked` library's output was slightly different than initially
    expected, requiring adjustments to the tests.
  - Successfully isolated the tests to the `morpheum-bot` project, ignoring the
    submodule.
  - Manual testing revealed a critical bug that was not caught by the automated
    tests.
- **Lessons Learned:**
  - It is important to have a properly configured test environment that matches
    the needs of the code being tested (e.g., using `jsdom` for DOM-related
    code).
  - When using third-party libraries, it is important to write tests against
    their actual output, rather than an idealized version.
  - Manual testing is crucial for catching bugs that are not covered by
    automated tests.

---