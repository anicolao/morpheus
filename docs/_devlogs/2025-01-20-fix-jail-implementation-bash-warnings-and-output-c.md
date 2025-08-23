---
title: "Fix Jail Implementation Bash Warnings and Output Cleanup"
date: 2025-01-20
author: "Development Team"
tags: ["development", "bug-fix"]
---

- **Actions Taken:**

  - Changed jail implementation from interactive bash (`bash -li`) to
    non-interactive bash (`bash -l`) in `jail/run.sh`
  - Applied the fix to both the agent service (port 12001) and monitoring
    service (port 12002)
  - Added comprehensive tests in `jailClient.output-cleaning.test.ts` to
    validate clean output behavior
  - Verified existing output cleaning logic properly handles trimming and EOC
    marker detection

- **Friction/Success Points:**

  - **Success:** The fix was minimal and surgical - only 2 character changes in
    the shell script (`-li` to `-l`)
  - **Success:** No changes needed to the output cleaning logic as it was
    already working correctly
  - **Success:** All existing tests continue to pass, showing backward
    compatibility is maintained

- **Lessons Learned:**
  - Interactive bash shells produce unwanted prompts and warnings when used
    programmatically without a TTY
  - Non-interactive login shells (`bash -l`) provide clean I/O for programmatic
    control while still loading user environment
  - The existing EOC marker approach combined with `substring()` and `trim()`
    already provided robust output cleaning
  - Comprehensive test coverage helps validate that minimal changes don't break
    existing functionality

---