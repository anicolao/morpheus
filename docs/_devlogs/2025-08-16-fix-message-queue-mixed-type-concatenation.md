---
title: "Fix Message Queue Mixed-Type Concatenation"
date: 2025-08-16
author: "Development Team"
tags: ["development", "bug-fix"]
---

- **Actions Taken:**
  - Fixed a bug in the message queue where text and HTML messages were being
    improperly concatenated.
  - Modified the batching logic to group messages by both `roomId` and
    `msgtype`.
  - Added a new test case to ensure that messages of different types are not
    batched together.
- **Friction/Success Points:**
  - The pre-commit hook correctly prevented a commit without updating the
    devlog.
- **Lessons Learned:**
  - It's important to consider all message types when designing a message queue.
  - Test-driven development is a great way to ensure that bugs are fixed and do
    not regress.

---