---
title: "Fix Multiline Command Formatting in Bot Output"
date: 2025-01-18
author: "Development Team"
tags: ["development", "bug-fix", "bot"]
---

- **Actions Taken:**

  - Identified issue where multiline commands in "Executing command" messages
    were incorrectly formatted with single backticks, causing poor markdown
    rendering
  - Modified command formatting logic in `src/morpheum-bot/bot.ts` to detect
    multiline commands using `includes('\n')`
  - **Single line commands**: Wrapped in single backticks `` `command` `` for
    inline display
  - **Multi-line commands**: Wrapped in triple backticks with newlines
    ` ```\ncommand\n``` ` for proper code block rendering
  - Maintained use of `sendMarkdownMessage()` for proper HTML formatting in
    Matrix clients
  - Verified all 56 tests continue to pass

- **Friction/Success Points:**

  - **Success:** Multiline commands now display as properly formatted code
    blocks instead of broken inline text
  - **Success:** Single line commands maintain clean inline display with single
    backticks
  - **Success:** Logic is simple and reliable using string `includes()` method
    to detect newlines
  - **Success:** All existing tests pass without modification, indicating change
    is backward compatible

- **Technical Learnings:**
  - **Markdown Formatting:** Single backticks work well for inline commands but
    fail for multiline text
  - **Code Block Rendering:** Triple backticks with surrounding newlines create
    proper markdown code blocks
  - **Matrix HTML Rendering:** The `sendMarkdownMessage()` helper properly
    converts both formats to HTML for Matrix clients
  - **Command Parsing:** The `parseBashCommands()` function can return multiline
    commands from LLM responses, making this formatting fix necessary

---