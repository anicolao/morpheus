---
title: "Switching Development Tools from Gemini CLI to `claudecode`"
date: 2025-08-12
author: "Development Team"
tags: ["development"]
---

I am abandoning the use of Gemini CLI for my development workflow and switching
to `claudecode`, pointed at a local LLM. This decision is driven by several
significant and persistent issues with the Gemini CLI that are hindering
progress.

The primary reasons for this switch are:

- **Token Limit Exhaustion:** The Gemini CLI repeatedly exhausts input token
  limits. This is often caused by failures in the `replace` tool, which then
  defaults to reading and rewriting entire files, consuming a massive number of
  tokens for simple operations. This issue is documented in
  [GitHub Issue #5983](https://github.com/google-gemini/gemini-cli/issues/5983),
  where a bug caused the consumption of 6 million input tokens in about an hour.
- **Procedural Failures:** The CLI consistently fails to follow established
  procedures documented in our `DEVLOG.md` and `AGENTS.md`. This lack of
  adherence to project conventions requires constant correction and slows down
  development.
- **Unexplained Pauses:** The agent frequently pauses in the middle of tasks for
  no apparent reason, requiring manual intervention to resume.
- **Severe Usage Limits:** I am effectively limited to about 60-90 minutes of
  interaction with the Gemini CLI per day, which is a major bottleneck.
- **Lack of Upstream Support:** The aforementioned GitHub issue has seen no
  meaningful traction from the development team. The only responses have been
  pushback on the suggested solutions, indicating that a fix is unlikely in the
  near future.

While the original goal was to use a tool like Gemini CLI to bootstrap its own
replacement, the current state of the tool makes this untenable. By switching to
`claudecode` with a local LLM, I anticipate faster progress towards building a
more reliable and efficient development assistant.

---