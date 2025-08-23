---
title: "Fix Deep Linking in Copilot Session Started Message (Issue #42)"
date: 2025-01-21
author: "GitHub Copilot Agent"
tags: ["development", "bug-fix"]
---

- **High-Level Request:**
  
  - The 'Copilot session started' doesn't deep link to the session details like it is supposed to.

- **Actions Taken:**

  - **Problem Analysis:** Investigated the `formatStatusUpdate` method in `copilotClient.ts` and found that the 'pending' status message uses a generic `https://github.com/copilot/agents` URL instead of linking to the specific issue where session details are tracked
  - **Root Cause Identification:** The logic only creates specific URLs when a pull request exists, but during the 'pending' phase, no PR has been created yet - however, an issue number is available at that point
  - **Minimal Fix Implementation:** Modified the URL generation logic to check for `session.issueNumber` as a fallback when no PR exists, using the existing `buildIssueUrl()` helper method
  - **Test Updates:** Updated the corresponding test expectation to verify the fix - changed from expecting the generic copilot URL to the specific issue URL (`https://github.com/owner/repo/issues/123`)
  - **Verification:** Confirmed all tests pass and the deep linking now works correctly

- **Friction/Success Points:**

  - **Success:** The existing `buildIssueUrl()` helper method made the fix clean and consistent with the existing codebase
  - **Success:** The test suite provided immediate feedback to verify the fix was working correctly
  - **Success:** The change was surgical and minimal - only 3 lines of new code plus improved comment
  - **Learning:** The session object already contained all necessary information (issueNumber) to create meaningful deep links
  - **Success:** Maintained backward compatibility - the generic URL is still used as a final fallback when neither PR nor issue exists

---