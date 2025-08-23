---
title: "Refactor Message Queue Logic"
date: 2025-08-16
author: "Development Team"
tags: ["development"]
---

- **Actions Taken:**
  - Refactored the message queue to slow down message sending to at most 1 per
    second.
  - Implemented new batching logic:
    - Consecutive text messages are concatenated and sent as a single message.
    - HTML messages are sent individually.
  - The queue now only processes one "batch" (either a single HTML message or a
    group of text messages) per interval.
  - Updated the unit tests to reflect the new logic and fixed a bug related to
    shared state between tests.
- **Friction/Success Points:**
  - The existing tests made it easy to validate the new logic.
  - A bug was introduced where test state was leaking between tests, but it was
    quickly identified and fixed.
- **Lessons Learned:**
  - It's important to ensure that tests are isolated and do not share state.
  - When refactoring, having a solid test suite is invaluable.

---