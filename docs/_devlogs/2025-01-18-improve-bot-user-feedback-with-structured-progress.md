---
title: "Improve Bot User Feedback with Structured Progress Messages"
date: 2025-01-18
author: "Development Team"
tags: ["development", "bot"]
---

- **Actions Taken:**

  - Identified issue where raw LLM streaming chunks were being sent to users
    during task processing, creating verbose and repetitive output
  - Modified `runSWEAgentWithStreaming()` in `src/morpheum-bot/bot.ts` to
    provide structured progress messages instead of raw LLM chunks
  - Changed "Thinking..." message to "Analyzing and planning..." for better
    clarity
  - Added "Analysis complete. Processing response..." message after LLM finishes
    processing
  - **COMPLETED: Implemented markdown spoiler sections with HTML `<details>` and
    `<summary>` tags for command output**
  - **COMPLETED: Increased output limit from 2000 to 64k characters while
    keeping chat clean with collapsible sections**
  - **COMPLETED: Added early task termination detection for "Job's done!" phrase
    to exit iteration loop early**
  - **COMPLETED: Created `sendMarkdownMessage()` helper function for proper HTML
    formatting using existing `formatMarkdown` infrastructure**
  - **COMPLETED: Removed MAX_ITERATIONS display from progress messages - now
    shows "Iteration X:" instead of "Iteration X/10"**
  - **COMPLETED: Added plan and next step display to show bot's thinking process
    to users**
    - Created `parsePlanAndNextStep()` function to extract `<plan>` and
      `<next_step>` blocks from LLM responses
    - Plan displayed with 📋 icon on first iteration showing the bot's strategy
    - Next step displayed with 🎯 icon for each iteration showing what the bot
      will do next
    - Properly formatted using markdown with `sendMarkdownMessage()` for HTML
      rendering
    - Added comprehensive test coverage with 6 new test cases
  - Updated test expectations in `src/morpheum-bot/bot.test.ts` to match new
    message format without MAX_ITERATIONS
  - Verified all 56 tests continue to pass (up from 50 tests)

- **Friction/Success Points:**

  - **Success:** Users now receive clear, structured updates showing exactly
    what the bot is doing at each step
  - **Success:** Eliminated verbose LLM thinking output while maintaining all
    functionality
  - **Success:** Each message provides new, meaningful information without
    repetition
  - **Success:** Command output now uses collapsible spoiler sections with 64k
    limit, allowing users to view full output without cluttering chat
  - **Success:** Early termination when "Job's done!" is detected provides
    faster task completion
  - **Success:** Proper HTML markdown formatting ensures messages display
    correctly in Matrix clients
  - **Success:** Cleaner progress messages without MAX_ITERATIONS display
    improve user experience
  - **Success:** Users can now see the bot's planning process through plan and
    next step displays, making the workflow transparent
  - **Friction:** Had to update test expectations to match new message format,
    but this was straightforward

- **Technical Learnings:**
  - **User Experience:** Structured progress messages (🧠 → 💭 → 📋 → 🎯 → ⚡ →
    📋 → ✅) provide better feedback than raw LLM streams
  - **Message Flow:** Users see: Working on task → Analyzing → Analysis complete
    → Command execution → Results → Task completed
  - **Output Management:** Truncating very long command outputs (>2000 chars)
    prevents chat flooding while preserving full data in conversation history
  - **Direct Commands:** Kept streaming behavior for `!openai` and `!ollama`
    commands since users expect to see raw LLM output for debugging

---