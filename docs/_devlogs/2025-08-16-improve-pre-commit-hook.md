---
title: "Improve Pre-commit Hook"
date: 2025-08-16
author: "Development Team"
tags: ["development"]
---

- **Actions Taken:**
  - Updated the pre-commit hook to check for unstaged changes in
    `src/morpheum-bot`.
- **Friction/Success Points:**
  - I made a mistake and forgot to stage all the files in a commit.
  - The new pre-commit hook will prevent this from happening in the future.
- **Lessons Learned:**
  - It's important to have robust checks in place to prevent common mistakes.

---