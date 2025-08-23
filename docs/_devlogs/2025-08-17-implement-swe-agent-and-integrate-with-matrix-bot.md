---
title: "Implement SWE-Agent and Integrate with Matrix Bot"
date: 2025-08-17
author: "Development Team"
tags: ["development", "matrix", "bot"]
---

- **Actions Taken:**

  - Implemented a new SWE-Agent workflow inspired by `mini-swe-agent` directly
    within the `morpheum-bot`.
  - Followed a Test-Driven Development (TDD) approach for all new components.
  - Created a new `ollamaClient.ts` to interact with local Ollama models.
  - Re-implemented the jail interaction logic in a new `jailClient.ts`.
  - Created a `responseParser.ts` utility to extract bash commands from the
    model's markdown output.
  - Drafted a core `prompts.ts` file to define the agent's behavior.
  - Implemented the main agent loop in `sweAgent.ts`, orchestrating the clients,
    parser, and conversation history.
  - Integrated the new agent into the Matrix bot with a `!swe <task>` command.
  - Deprecated and removed the old Gemini CLI integration code.

- **Friction/Success Points:**

  - The TDD approach proved highly effective, catching several minor bugs and
    logic errors early in the development of each module.
  - Ran into several issues with the `vitest` mocking framework, requiring a
    more robust mocking strategy to be implemented in the
    `ollamaClient.test.ts`.
  - The new, integrated agent is a significant step forward, moving the project
    away from reliance on an external CLI and towards a self-contained,
    locally-run agent.

- **Lessons Learned:**
  - A strict TDD workflow is invaluable for building complex, interconnected
    modules, as it ensures each component is reliable before integration.
  - When a mocking library proves difficult, creating a simple, explicit mock
    implementation can be a faster and more reliable path forward.

---