---
title: "Refactor Message Queue Logic"
order: 34
status: completed
phase: "Morpheum v0.1: The Matrix Milestone"
category: "Development"
---

- [x] **Task 31: Refactor Message Queue Logic**
  - [x] Refactored the message queue to slow down message sending to at most 1
        per second.
  - [x] Implemented new batching logic:
    - Consecutive text messages are concatenated and sent as a single message.
    - HTML messages are sent individually.
  - [x] The queue now only processes one "batch" (either a single HTML message
        or a group of text messages) per interval.
  - [x] Updated the unit tests to reflect the new logic and fixed a bug related
        to shared state between tests.