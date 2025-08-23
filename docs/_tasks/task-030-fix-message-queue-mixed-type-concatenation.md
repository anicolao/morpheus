---
title: "Fix Message Queue Mixed-Type Concatenation"
order: 33
status: completed
phase: "Morpheum v0.1: The Matrix Milestone"
category: "Development"
---

- [x] **Task 30: Fix Message Queue Mixed-Type Concatenation**

  - [x] Fixed a bug in the message queue where text and HTML messages were being
        improperly concatenated.
  - [x] Modified the batching logic to group messages by both `roomId` and
        `msgtype`.
  - [x] Added a new test case to ensure that messages of different types are not
        batched together.