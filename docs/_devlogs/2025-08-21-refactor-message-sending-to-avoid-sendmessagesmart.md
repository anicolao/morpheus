---
title: "Refactor Message Sending to Avoid sendMessageSmart Function (Issue #40 Follow-up)"
date: 2025-08-21
author: "Development Team"
tags: ["development"]
---

- **High-Level Request:**
  
  - User feedback: "I didn't want `sendMessage` renamed to `sendMessageSmart`. This just has a high chance of creating merge conflicts for minimal cognitive benefit on what the method does."

- **Actions Taken:**

  - **Function Refactoring:** Instead of creating a new `sendMessageSmart()` function, enhanced the existing `sendMarkdownMessage()` function to be smart:
    - Added automatic markdown detection using the existing `hasMarkdown()` function
    - Route to HTML formatting if markdown is detected, plain text otherwise
    - Maintains the same function name to reduce merge conflict potential
  - **Code Cleanup:** 
    - Removed the `sendMessageSmart()` function entirely
    - Replaced all `sendMessageSmart()` calls with `sendMarkdownMessage()` calls throughout the codebase
    - Kept `sendPlainTextMessage()` for explicit plain text sending when needed
  - **Comprehensive Testing:** All 110 tests continue to pass, including the markdown streaming tests
  - **Smart Detection Preserved:** The comprehensive markdown detection logic (links, code blocks, bold, italic, headings) is preserved in the `hasMarkdown()` function

- **Friction/Success Points:**

  - **Success:** Avoided creating new function names that could cause cognitive overhead and merge conflicts
  - **Success:** Maintained backward compatibility by enhancing existing functions rather than replacing them
  - **Success:** All existing test coverage continues to work without modification
  - **Learning:** User feedback emphasized that function naming changes should be avoided for minimal cognitive benefit
  - **Success:** The smart detection is now seamlessly integrated into the existing `sendMarkdownMessage()` function, making it the default choice for any message that might contain markdown

---