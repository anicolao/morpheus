---
title: "Fix missing message-queue files"
order: 31
status: completed
phase: "Morpheum v0.1: The Matrix Milestone"
category: "Development"
---

- [x] **Task 28: Fix missing message-queue files**

  - [x] Add `src/morpheum-bot/message-queue.ts` and
        `src/morpheum-bot/message-queue.test.ts` to the commit.
  - [x] Replace all instances of `client.sendMessage` with `queueMessage` in
        `src/morpheum-bot/index.ts` to use the new message queue.