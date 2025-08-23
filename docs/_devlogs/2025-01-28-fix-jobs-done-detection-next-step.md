---
title: "Fix 'Job's done!' Detection in Next Step Blocks"
date: 2025-01-28
author: "GitHub Copilot Agent"
tags: ["bot", "completion-detection", "bug-fix", "next-step"]
---

- **High-Level Request:**
  
  - Fix issue #69: "Job's done!" was only recognized as task complete by the gauntlet if it appeared in shell output, but should also be detected when stated in a `<next_step>` block as instructed by the system prompt.

- **Actions Taken:**

  - **Root Cause Analysis:** Discovered the system prompt in `prompts.ts` line 26 instructs: "To finish the task, state 'Job's done!' in a `<next_step>` block." However, the bot only checked for "Job's done!" in shell command output, not in the LLM's next_step responses.
  - **Surgical Fix Implementation:** Added 6 lines of code in `/src/morpheum-bot/bot.ts` (lines 682-688) to check for "Job's done!" after parsing and displaying the next_step content:
    ```typescript
    // Check for task completion phrase in next step
    if (nextStep.includes("Job's done!")) {
      await sendMessage("✓ Job's done!");
      break;
    }
    ```
  - **Comprehensive Test Coverage:** Added 40-line test case `should detect Job's done! in next_step block and complete task` that verifies:
    - Plan display with 📋 icon
    - Next step display with 🎯 icon  
    - Completion detection and loop termination
  - **Verified No Regressions:** All 137 tests passing (1 new test added, 0 failures)

- **Friction/Success Points:**

  - **Success:** The fix was minimal and surgical - preserves all existing functionality while adding the missing detection
  - **Success:** Shell output detection still works (existing test confirms), next step detection now works (new test confirms)
  - **Success:** The implementation follows the existing code patterns and integrates seamlessly with current message flow
  - **Success:** Comprehensive test coverage ensures the functionality works as expected
  - **Learning:** System prompts and actual bot behavior must be kept in sync - prompts that instruct specific completion phrases need corresponding detection logic

- **Technical Implementation Details:**

  - **Precise Location:** Added the check immediately after displaying the next step but before command parsing
  - **Consistent Behavior:** Uses the same completion message format (`✓ Job's done!`) as shell output detection
  - **Loop Control:** Properly breaks the iteration loop when completion is detected, avoiding unnecessary processing
  - **Test Strategy:** Mock-based testing with proper isolation to verify the specific detection pathway