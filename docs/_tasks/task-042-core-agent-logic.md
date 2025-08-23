---
title: "Core Agent Logic"
order: 49
status: completed
phase: "Phase 2: TypeScript SWE-Agent"
category: "Development"
---

- [x] **Task 42: Core Agent Logic**

  - [x] Create a test file: `src/morpheum-bot/sweAgent.test.ts`. Write failing
        tests for the agent's main loop, mocking the Ollama and Jail clients.
  - [x] Create the agent module: `src/morpheum-bot/sweAgent.ts`.
  - [x] Implement the main agent loop, which will manage the conversation
        history and orchestrate calls to the Ollama client, parser, and jail
        client.