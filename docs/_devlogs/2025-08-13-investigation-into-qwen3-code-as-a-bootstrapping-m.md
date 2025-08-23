---
title: "Investigation into Qwen3-Code as a Bootstrapping Mechanism"
date: 2025-08-13
author: "Development Team"
tags: ["development"]
---

- **Actions Taken:**
  - Investigated using `claude` for a bootstrapping UI.
  - Discovered that `claude`'s license restricts its use for building
    potentially competing systems.
  - Concluded that `claude` is not a viable option for the project.
  - Decided to investigate using the `qwen3-code` fork of the Gemini CLI as an
    alternative bootstrapping mechanism.
  - Created a new task in `TASKS.md` to track this investigation.
  - Tested `qwen3-code` both with Alibaba's hosted model and with a local model
    `kirito1/qwen3-coder`.
  - Found that `qwen3-code` works more or less correctly in both cases, similar
    to how well `claudecode` was working, but with the promise of local
    operation.
  - The `kirito1/qwen3-coder` model is small and pretty fast, but it remains to
    be seen if it is accurate enough.
- **Friction/Success Points:**
  - The license restriction on `claude` was an unexpected dead end.
  - Identified `qwen3-code` as a promising alternative.
  - Successfully tested both hosted and local versions of `qwen3-code`.
- **Lessons Learned:**
  - Licensing restrictions are a critical factor to consider when selecting
    tools for AI development.
  - Having a backup plan is essential when initial tooling choices don't work
    out.
  - Local models like `kirito1/qwen3-coder` offer the potential for private,
    fast operation, but accuracy needs further evaluation.
- **Next Steps:**
  - Investigate how to build a larger version of an Ollama model (similar to how
    `kirito1/qwen3-coder` was made) to use tools and have a larger context size.
  - Add an incomplete task for this to `TASKS.md`.

---