---
title: "Jailed Shell Client"
order: 46
status: completed
phase: "Phase 1: Implement the Jailed Agent Environment"
category: "Environment Setup"
---

- [x] **Task 39: Jailed Shell Client**

  - [x] Create a test file: `src/morpheum-bot/jailClient.test.ts`. Write a
        failing test that attempts to send a command to a mock TCP server and
        receive a response.
  - [x] Create the client module: `src/morpheum-bot/jailClient.ts`.
  - [x] **Reimplement** the TCP socket logic from `jail/agent.ts` directly
        within this module, creating a clean programmatic interface.
  - [x] Make the test pass.