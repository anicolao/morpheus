---
title: "Manual Commit II: Ollama API & Jail design"
date: 2025-08-17
author: "Development Team"
tags: ["development"]
---

- **Actions Taken:**
  - After learning more about how the various APIs work, and looking at
    mini-SWE-agent, I designed a simple "jail" for a simplistic approach where
    the bot will just have a full featured bash shell in a nix environment that
    it can control to take all development actions.
  - This should make it possible for local LLMs to start doing work, without
    continuing to need Gemini CLI.