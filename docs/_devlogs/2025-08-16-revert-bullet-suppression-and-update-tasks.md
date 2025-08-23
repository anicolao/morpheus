---
title: "Revert Bullet Suppression and Update Tasks"
date: 2025-08-16
author: "Development Team"
tags: ["development"]
---

- **Actions Taken:**
  - Reverted the changes to `format-markdown.ts` and `format-markdown.test.ts`
    that attempted to suppress bullets from task list items.
  - Removed the `devlog.patch` file.
  - Updated `TASKS.md` to reflect that the bullet suppression task is no longer
    being pursued.
- **Friction/Success Points:**
  - The HTML sanitizer in the Matrix client is stripping the `style` attribute
    from the `<li>` and `<ul>` tags, making it impossible to suppress the
    bullets using inline styles.
- **Lessons Learned:**
  - It's important to be aware of the limitations of the environment in which
    the code will be running.
  - Sometimes, it's better to accept a minor cosmetic issue than to spend a lot
    of time trying to work around a platform limitation.

---