---
title: "Handle Matrix Rate-Limiting"
date: 2025-08-16
author: "Development Team"
tags: ["development", "matrix"]
---

- **Actions Taken:**
  - Implemented a retry mechanism in `src/morpheum-bot/index.ts` to handle
    `M_LIMIT_EXCEEDED` errors from the Matrix server.
  - Created a `sendMessageWithRetry` function that wraps the
    `client.sendMessage` call and retries with an exponential backoff if it
    receives a rate-limiting error.
  - Replaced all instances of `client.sendMessage` with the new
    `sendMessageWithRetry` function.
- **Friction/Success Points:**
  - The bot was crashing due to unhandled rate-limiting errors from the Matrix
    server.
  - The new retry mechanism makes the bot more resilient and prevents it from
    crashing when it sends too many messages in a short period.
- **Lessons Learned:**
  - When interacting with external APIs, it's important to handle rate-limiting
    and other transient errors gracefully.
  - Implementing a retry mechanism with exponential backoff is a standard and
    effective way to handle these types of errors.

---