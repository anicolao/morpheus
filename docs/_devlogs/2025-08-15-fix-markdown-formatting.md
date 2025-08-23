---
title: "Fix Markdown Formatting"
date: 2025-08-15
author: "Development Team"
tags: ["development", "bug-fix"]
---

- **Actions Taken:**
  - Replaced direct calls to `marked()` in `src/morpheum-bot/index.ts` with the
    centralized `formatMarkdown()` function.
  - This ensures that all markdown formatting correctly renders GFM task lists.
- **Friction/Success Points:**
  - The previous developer (`gpt-oss`) had correctly added the `formatMarkdown`
    function but failed to actually use it, leaving the fix incomplete. This
    required a final step to actually apply the fix.

---