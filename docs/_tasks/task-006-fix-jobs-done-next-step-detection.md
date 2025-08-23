---
title: "Fix 'Job's done!' Detection in Next Step Blocks (Issue #69)"
order: 6
status: completed
phase: "Bug Fixes and Improvements"
category: "Bot Functionality"
---

- [x] Understand the issue: "Job's done!" only detected in shell output, should also be detected in next_step
- [x] Explore codebase structure and locate relevant files
- [x] Run existing tests to ensure stable baseline (136 tests passing)
- [x] Add "Job's done!" detection in next_step parsing logic
- [x] Add test case to verify new functionality 
- [x] Verify all existing tests still pass (137 tests now passing)
- [x] Manual verification of the fix

**Issue:** The system prompt instructs to state 'Job's done!' in a `<next_step>` block to finish tasks, but the bot only checked for completion in shell command output.

**Solution:** Added 6 lines in `bot.ts` after next_step display to check for "Job's done!" and trigger completion behavior.

**Impact:** Tasks can now complete via next_step blocks as documented, maintaining all existing shell output detection functionality.