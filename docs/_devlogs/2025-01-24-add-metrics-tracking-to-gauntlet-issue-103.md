---
title: "Add Metrics Tracking to Gauntlet (Issue #103)"
date: 2025-01-24
author: "GitHub Copilot"
tags: ["development", "gauntlet", "metrics"]
---

- **High-Level Request:**

  - Add metrics tracking to the gauntlet that counts requests, input tokens, and output tokens, and displays these in the status table.

- **Actions Taken:**

  - **Created Metrics Infrastructure:**
    - Built `src/morpheum-bot/metrics.ts` with `MetricsTracker` class for accumulating LLM usage data
    - Added `estimateTokens()` utility function using 4-characters-per-token heuristic for providers without token counts
    - Implemented `LLMMetrics` interface with requests, inputTokens, and outputTokens fields
  - **Extended LLM Client Interface:**
    - Updated `LLMClient` interface with optional `getMetrics()` and `resetMetrics()` methods
    - Maintained backward compatibility by making metrics methods optional
  - **Updated All LLM Client Implementations:**
    - **OpenAI Client:** Tracks actual token usage from API responses when available, falls back to estimation for streaming
    - **Ollama Client:** Uses `prompt_eval_count` and `eval_count` from responses when available, estimates otherwise
    - **Copilot Client:** Tracks estimated tokens for GitHub API interactions and session workflows
  - **Enhanced Gauntlet Progress Table:**
    - Expanded from 2 columns (Task, Status) to 5 columns (Task, Status, Requests, Input Tokens, Output Tokens)
    - Added cumulative totals row showing aggregated metrics across all completed tasks
    - Reset metrics before each task execution to capture per-task usage accurately
  - **Comprehensive Testing:**
    - Created `metrics.test.ts` with 11 tests covering MetricsTracker functionality and token estimation
    - Added `llm-metrics.integration.test.ts` with 5 tests validating client metrics tracking
    - Created `gauntlet-metrics.test.ts` with 6 tests for progress table formatting with metrics
    - All 216 tests pass, ensuring no regressions

- **Friction/Success Points:**

  - **Success:** Implementation is completely backward compatible - existing code continues to work unchanged
  - **Success:** Metrics provide valuable insights into LLM usage costs and efficiency during evaluations
  - **Success:** Token estimation fallback ensures metrics work even when APIs don't provide usage data
  - **Learning:** Different LLM providers return usage data in different formats (OpenAI uses `usage.prompt_tokens`, Ollama uses `prompt_eval_count`)
  - **Success:** Progress table enhancement makes metrics immediately visible to users without additional commands
  - **Success:** Clean separation of concerns - metrics tracking is isolated in dedicated classes and doesn't complicate LLM client logic

- **Technical Learnings:**

  - **Token Estimation:** The 4-characters-per-token rule provides reasonable estimates for English text when actual counts aren't available
  - **Interface Design:** Optional methods in TypeScript interfaces enable backward compatibility while adding new functionality
  - **Metrics Aggregation:** Tracking cumulative metrics across tasks provides valuable insights into total resource usage
  - **Testing Strategy:** Integration tests validate the full metrics pipeline from LLM clients through gauntlet display

**Sample Enhanced Progress Table:**
```
📊 **Gauntlet Progress Table**

| Task | Status | Requests | Input Tokens | Output Tokens |
|------|--------|----------|--------------|---------------|
| add-jq | ✅ PASS | 1 | 9 | 26 |
| hello-world-server | ✅ PASS | 1 | 27 | 66 |
| check-sed-available | ❌ FAIL | 1 | 15 | 22 |
| create-project-dir | ▶️ NEXT | — | — | — |
| **TOTAL** | **3/4** | **3** | **51** | **114** |
```

---