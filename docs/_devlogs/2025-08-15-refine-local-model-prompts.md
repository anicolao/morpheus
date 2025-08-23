---
title: "Refine Local Model Prompts"
date: 2025-08-15
author: "Development Team"
tags: ["development"]
---

- **Actions Taken:**
  - Updated the prompt templates in `morpheum-local.ollama` and
    `qwen3-coder-local.ollama` to improve tool-use instructions.
  - Added new untracked local models to the repository.
- **Friction/Success Points:**
  - A significant amount of time was spent trying to get `gpt-oss:120b` to
    understand the state of the commit it wrote for the markdown fix, but it was
    unable to do so. In contrast, `gemini-pro` was able to understand the commit
    on the first request. This indicates that more work is needed on the local
    model templates, or that the local models themselves are not yet capable of
    this level of assessment.
- **Lessons Learned:**
  - Local models, while promising, may not yet be on par with commercial models
    for complex reasoning tasks.

---