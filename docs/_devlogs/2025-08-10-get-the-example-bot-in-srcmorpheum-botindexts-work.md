---
title: "Get the example bot in src/morpheum-bot/index.ts working and commit the working state"
date: 2025-08-10
author: "Development Team"
tags: ["development", "bot"]
---

- **Actions Taken:**
  - Attempted automatic registration on `tchncs.de` and `envs.net` using
    `matrix-js-sdk`. Both failed with `401 Unauthorized` errors due to
    server-side registration requirements (e.g., reCAPTCHA).
  - Created `src/morpheum-bot/register_morpheum.ts` for registration attempts.
  - Installed `matrix-js-sdk` and `@matrix-org/olm` dependencies.
  - Developed a separate utility `src/morpheum-bot/get_token.ts` to obtain an
    access token from username/password, as direct registration was not
    feasible. This approach allows for secure handling of credentials by
    obtaining a short-lived token.
  - Modified `.gitignore` to exclude generated files (`bot.json`, compiled
    JavaScript files) and the `register_morpheum.ts` attempt.
  - Verified that the bot can log in using an access token and send basic
    messages (help, devlog).
- **Friction/Success Points:**
  - Initial attempts to modify `index.ts` directly for username/password login
    were problematic due to complexity and risk of breaking existing bot logic.
  - Encountered `429 Too Many Requests` during token generation, indicating
    rate-limiting on the homeserver.
  - Successfully implemented a separate token generation utility, which is a
    cleaner and more secure approach.
  - Learned the importance of carefully reviewing `git status` and `replace`
    operations to avoid unintended changes (e.g., overwriting `.gitignore`).
- **Lessons Learned:**
  - For complex tasks involving external services (like Matrix homeservers),
    always investigate their specific requirements (e.g., registration flows,
    CAPTCHA).
  - When modifying existing code, prefer creating separate utilities or modules
    for new functionality (like token generation) to maintain modularity and
    reduce risk to the main application.
  - Always double-check `replace` tool parameters, especially `old_string` and
    `new_string`, and verify `git status` after staging to ensure only intended
    changes are committed.

---