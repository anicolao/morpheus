---
title: "Fix Markdown Checkbox Rendering"
date: 2025-08-15
author: "Development Team"
tags: ["development", "bug-fix"]
---

- **Actions Taken:**
  - Modified `format-markdown.ts` to replace GitHub-flavored markdown checkboxes
    (`- [ ]` and `- [x]`) with Unicode characters (`☐` and `☑`).
  - Updated `format-markdown.test.ts` to reflect the new Unicode character
    output.
- **Friction/Success Points:**
  - This change prevents the Matrix client's HTML sanitizer from stripping the
    checkboxes from the rendered markdown, ensuring they are displayed correctly
    to the user.

---