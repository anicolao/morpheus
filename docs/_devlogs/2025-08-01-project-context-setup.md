---
title: "Project Context Setup"
date: 2025-08-01
author: "Development Team"
tags: ["development"]
---

- **Actions Taken:**
  - We started by setting up the development environment and and giving the
    `morpheus` CLI its current context.

## Tools Used

- **`tmux`**: For managing multiple terminals.
- **`Gemini CLI`**: Our main AI agent for content creation.
- **`glow`**: For previewing markdown before pushing.
- `google_web_search`: For research and finding license text.
- `web_fetch`: For getting web content.
- `write_file`: For creating and updating files.

## Frustrations

- **Agent getting distracted by LICENSE file:** The agent paused unnecessarily
  each time it encountered the `LICENSE` file. This is a distraction and should
  be avoided. Future agents should be instructed to ignore the `LICENSE` file
  unless specifically asked to interact with it.
- **`gh` CLI Limitations:** No direct `gh` command to add licenses, forcing
  manual steps.
- **`web_fetch` Behavior:** Initially returned summaries instead of raw text,
  requiring more specific requests.
- **CLI Instability (Git):** The Gemini CLI hung during a git rebase attempt.
- **Inconsistent CLI Behavior:** The license addition process wasn't as smooth
  this time, leading to manual intervention.

## Experience Building Morpheum with Morpheum

It's been a mixed bag. The CLI's ability to interact with the file system and
web is powerful. But issues like hallucinated content, CLI hangs, and
inconsistent behavior show that `morpheum` still needs human oversight. While
functional, the process can be indirect and sometimes unreliable, sometimes
requiring manual workarounds (like adding the license via GitHub UI). All
commits to the repository will now be reflected with at least one comment in
this worklog to reflect the work done and any challenges encountered.