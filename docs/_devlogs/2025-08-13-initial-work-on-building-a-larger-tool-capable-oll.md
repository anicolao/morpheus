---
title: "Initial Work on Building a Larger, Tool-Capable Ollama Model"
date: 2025-08-13
author: "Development Team"
tags: ["development"]
---

- **Actions Taken:**
  - Started work on Task 14: "Build a Larger, Tool-Capable Ollama Model".
  - Created `Modelfile-qwen3-tools-large` as a starting point for a larger model
    with more context.
  - Identified that Ollama doesn't natively support tool definitions in
    Modelfiles.
- **Friction/Success Points:**
  - Unable to find specific information about `kirito1/qwen3-coder` due to web
    search tool issues.
  - Lack of documentation on how to properly integrate tools with Ollama models.
  - Web search tools are not functioning properly, returning errors about tool
    configuration.
  - Diagnosed the issue with web search tools and found that they may be
    misconfigured or lack proper API keys.
- **Lessons Learned:**
  - Ollama doesn't natively support tool definitions in Modelfiles, so tools are
    typically handled by the application layer.
  - Need to find a larger version of the Qwen3-Coder model (e.g., 7b, 14b
    parameters).
  - Need to understand how to increase the context size for the model.
  - Web search functionality is critical for research tasks but is currently not
    working due to configuration issues.
- **Next Steps:**
  - Need to find a larger version of the Qwen3-Coder model (e.g., 7b, 14b
    parameters).
  - Need to learn how to properly integrate tools with Ollama models.
  - Need to understand how to increase the context size for the model.
  - Need to fix the web search tool configuration to enable proper web research.

---