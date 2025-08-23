---
title: "Implement Automatic Matrix Token Refresh (Issue #30)"
date: 2025-01-21
author: "Development Team"
tags: ["development", "matrix"]
---

- **High-Level Request:**
  
  - If it is possible, automatically refresh the Matrix access token so it doesn't keep constantly expiring. If that is not possible, propose alternative solutions.

- **Actions Taken:**

  - **Problem Analysis:** Investigated current Matrix bot token handling and discovered the bot was using static `ACCESS_TOKEN` from environment variables with no automatic refresh capability
  - **Research Phase:** Studied Matrix protocol authentication, error codes (`M_UNKNOWN_TOKEN`, `M_MISSING_TOKEN`, `M_FORBIDDEN`), and matrix-bot-sdk/matrix-js-sdk capabilities for token management
  - **TokenManager Implementation:** Created `src/morpheum-bot/token-manager.ts` with:
    - Automatic token refresh using username/password authentication
    - Detection of Matrix token errors vs other errors (rate limiting, network issues)
    - Wrapper function for automatic retry after token refresh
    - Prevention of concurrent refresh attempts with proper error handling
  - **Bot Integration:** Modified `src/morpheum-bot/index.ts` to:
    - Support multiple authentication scenarios (ACCESS_TOKEN only, MATRIX_USERNAME/MATRIX_PASSWORD only, or both)
    - Automatically obtain initial token if not provided
    - Handle graceful client reconnection after token refresh
    - Wrap message handlers with token refresh capability while maintaining backward compatibility
  - **Comprehensive Testing:** Implemented thorough test coverage with:
    - Unit tests for TokenManager functionality (`token-manager.test.ts`)
    - Integration tests demonstrating complete workflows (`token-manager-integration.test.ts`)
    - Error detection, refresh workflow, and edge case handling validation
  - **Documentation:** Created detailed documentation (`docs/matrix-token-refresh.md`) covering usage scenarios, security considerations, and implementation details

- **Friction/Success Points:**

  - **Success:** Matrix SDK provided exactly the right error detection capabilities (`MatrixError` with `errcode` field) to distinguish token errors from other issues
  - **Learning:** Discovered that Matrix doesn't use traditional OAuth refresh tokens - instead uses username/password re-authentication for token refresh, which actually works well for bot scenarios
  - **Success:** The wrapper pattern with `withTokenRefresh()` provides a clean way to add token refresh to any Matrix API call without modifying existing code extensively
  - **Friction:** Initial test setup required understanding Vitest mocking patterns, particularly the `vi.hoisted()` pattern for proper module mocking
  - **Success:** The solution maintains full backward compatibility - existing bots using only `ACCESS_TOKEN` continue to work unchanged
  - **Learning:** Matrix bot reconnection requires stopping the old client, creating a new one with the fresh token, and restarting - the Matrix SDK handles state persistence through the storage provider

- **Technical Learnings:**

  - **Matrix Error Handling:** Matrix protocol uses specific error codes (`M_UNKNOWN_TOKEN`, `M_MISSING_TOKEN`, `M_FORBIDDEN`) for authentication failures vs other errors like `M_LIMIT_EXCEEDED` for rate limiting
  - **Client Recreation Pattern:** Matrix clients need to be recreated (not just updated) when tokens change, requiring careful handling of event handlers and message queues
  - **Token Security:** Username/password credentials should only be used for token refresh, never stored beyond environment variables, with immediate token replacement after refresh
  - **Concurrent Refresh Protection:** Multiple simultaneous Matrix operations can trigger concurrent token refresh attempts, requiring proper synchronization to prevent race conditions

---