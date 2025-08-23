---
title: "Matrix Bot Integration"
order: 50
status: completed
phase: "General Development"
category: "Matrix Bot Development"
---

- [x] **Task 43: Matrix Bot Integration**
  - [x] Modify `src/morpheum-bot/index.ts` to add a new command, `!swe <task>`.
  - [x] When triggered, this command will initialize and run the `sweAgent` loop
        with the provided task.
  - [x] The agent's intermediate "thoughts," commands, and tool outputs will be
        formatted and sent as messages to the Matrix room.
  - [x] Add a corresponding integration test for the `!swe` command.