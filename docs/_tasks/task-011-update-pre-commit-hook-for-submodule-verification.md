---
title: "Update Pre-commit Hook for Submodule Verification"
order: 9
status: completed
phase: "Morpheum v0.1: The Matrix Milestone"
category: "Development"
---

- [x] **Task 11: Update Pre-commit Hook for Submodule Verification**

  - [x] Modify the `.husky/pre-commit` hook to include a check that verifies the
        `src/gemini-cli` submodule is pushed to its remote.

- [x] **Task 12: Switch to Claude Code with a local LLM for development (manual
      plan)**

  - [x] Set up a Local LLM with an OpenAI-compatible API:

    - [x] Install and run a local LLM provider like Ollama, vLLM, or
          llama-cpp-python.
    - [x] Ensure it exposes an OpenAI-compatible API endpoint (e.g.,
          http://localhost:11434/v1 for Ollama).
    - [x] Download a model to use, for example mistral-small-24b.

  - [x] Install `claudecode`:

    - [x] Find and install the claudecode tool. This might be from a package
          manager or a code repository.

  - [x] Install and Configure the Proxy:

    - [x] Clone the proxy server from the GitHub repository mentioned in the
          [Reddit post.](https://www.reddit.com/r/LocalLLaMA/comments/1m118is/use_claudecode_with_local_models/)

    - [x] Install its dependencies.
    - [x] Edit the proxy's configuration (e.g., a server.py file) to point to
          your local LLM's API endpoint.

  - [x] Run the Proxy:

    - [x] Start the proxy server. It will listen for incoming requests and
          forward them to your local LLM.

  - [x] Configure `claudecode` to Use the Proxy:
    - [x] Set the following environment variables in your shell to direct
          claudecode to the proxy: