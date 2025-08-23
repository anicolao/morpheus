---
title: "Completion of Task 14 and Investigation into Local Tool-Capable Models"
date: 2025-08-14
author: "Development Team"
tags: ["development"]
---

- **Actions Taken:**
  - Used the Gemini CLI to update the results from Task 14.
  - Investigated the local Ollama model files in `~/.ollama/models`.
  - Created a new Modelfile to enable tool usage for the `qwen3-coder` model.
  - Built a new, larger model named `anicolao/large` with tool-calling
    capabilities and an expanded context window.
  - Discovered that the web search issue in the `qwen3-code` fork of the Gemini
    CLI is a bug/missing feature, not a configuration problem, as documented in
    [QwenLM/qwen-code#147](https://github.com/QwenLM/qwen-code/issues/147).
- **Friction/Success Points:**
  - Successfully created a local model that can invoke tools.
  - The model's performance and accuracy were unsatisfactory, as it did not
    respond to prompts as expected.
  - While using the Gemini CLI to make these updates, it hallucinated
    non-existent tasks, which was reported in
    [google-gemini/gemini-cli#6231](https://github.com/google-gemini/gemini-cli/issues/6231).
- **Lessons Learned:**
  - It is possible to create a local, tool-capable model with Ollama.
  - The `qwen3-code` fork of the Gemini CLI is not yet capable of using the web
    search tool due to a bug.
  - Further investigation is required to improve the prompt interpretation and
    response quality of the custom model.
- **Next Steps:**
  - Investigate methods for improving the prompt response of the local
    `anicolao/large` model.
  - Monitor the `qwen3-code` fork for a fix to the web search bug.

---