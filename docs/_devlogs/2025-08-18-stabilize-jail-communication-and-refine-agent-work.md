---
title: "Stabilize Jail Communication and Refine Agent Workflow"
date: 2025-08-18
author: "Development Team"
tags: ["development"]
---

- **Actions Taken:**

  - **Jail Communication:**
    - Engaged in an extensive debugging process to create a stable shell
      environment inside the Docker container.
    - Correctly identified that `socat`'s `SYSTEM` command was the key to
      enabling a shell that could handle `stderr` redirection (`2>&1`).
    - Implemented a robust readiness probe in the gauntlet script that polls the
      container with an `echo` command, ensuring tests only run when the jail is
      fully initialized.
    - This finally resolved a series of complex, cascading issues including
      empty responses, connection timeouts, and hangs.
  - **Agent Workflow:**
    - Refactored the `sweAgent` to use an iterative loop, allowing it to see the
      output of its commands and decide on subsequent actions.
    - Greatly simplified the system prompt to be more direct and plan-oriented,
      instructing the agent to create a plan, show the next step, and then act
      or ask for approval.
  - **Gauntlet & Model:**
    - Added a new, simple gauntlet task (`create-project-dir`) to act as a
      baseline test for agent capability.
    - Updated all gauntlet success conditions to correctly check for tools
      inside the `nix develop` environment.
    - Updated the local `morpheum-local` model to use `qwen`.

- **Friction/Success Points:**

  - **Friction:** The jail communication issue was extremely difficult to debug
    due to the subtle interactions between `socat`, `bash` (interactive vs.
    non-interactive), `stderr` redirection, and the `JailClient`'s TCP logic.
    This led to many failed attempts and required deep analysis of the user's
    expert feedback.
  - **Success:** The final `SYSTEM:"bash -li 2>&1"` solution is robust, stable,
    and correctly captures `stderr`, which is a major step forward for the
    project. The new agent workflow is much more intelligent and collaborative.

- **Lessons Learned:**
  - The distinction between `socat`'s `EXEC` and `SYSTEM` options is critical
    when shell features like redirection are required.
  - A robust readiness probe that validates the entire communication round-trip
    is essential when dealing with services that have a slow or unpredictable
    startup time.
  - A clear, focused system prompt is vital for guiding the agent's behavior.
    The new plan-based prompt is a significant improvement.

---