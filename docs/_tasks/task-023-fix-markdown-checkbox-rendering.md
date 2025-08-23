---
title: "Fix Markdown Checkbox Rendering"
order: 17
status: completed
phase: "Morpheum v0.1: The Matrix Milestone"
category: "Documentation"
---

- [x] **Task 23: Fix Markdown Checkbox Rendering**

  - [x] Modify `format-markdown.ts` to use Unicode characters for checkboxes to
        prevent them from being stripped by the Matrix client's HTML sanitizer.
  - [x] Update `format-markdown.test.ts` to reflect the new Unicode character
        output.