---
title: "Implement Local LLM Workflow with Ollama and Make"
date: 2025-08-14
author: "Development Team"
tags: ["development"]
---

- **Actions Taken:**
  - Established a complete workflow for building and managing local,
    tool-capable Ollama models for use with the Gemini CLI.
  - Created two model definition files (`morpheum-local.ollama`,
    `qwen3-coder-local.ollama`) that instruct a base LLM on how to format tool
    calls for the Gemini CLI.
  - Engineered a generic `Makefile` that automatically discovers any `*.ollama`
    file and builds it if the source is newer than the existing model manifest.
    This avoids unnecessary rebuilds.
  - Added the `ollama` package to `flake.nix` to integrate it into the project's
    declarative development environment.
- **Friction/Success Points:**
  - **Success:** The `Makefile` implementation was iteratively refined from a
    basic concept with dummy files into a robust, scalable solution that uses
    pattern rules and relies on Ollama's own manifest files for dependency
    tracking. This was a significant improvement.
- **Lessons Learned:**
  - `make` is a highly effective tool for automating tasks beyond traditional
    code compilation, including managing AI models.
  - Understanding the internal file structure of a tool like Ollama (e.g., where
    manifests are stored) is key to creating more elegant and reliable
    automation.
  - Using a file-based convention (`<model-name>.ollama`) combined with `make`'s
    pattern rules creates a build system that requires zero changes to add new
    models.
- **Next Steps:**
  - With the local toolchain in place, the next logical step is to configure the
    Gemini CLI to use one of the local models and test its ability to perform a
    representative development task.

---