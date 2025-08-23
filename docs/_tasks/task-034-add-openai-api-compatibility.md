---
title: "Add OpenAI API Compatibility"
order: 30
status: completed
phase: "Morpheum v0.1: The Matrix Milestone"
category: "Development"
---

- [x] **Task 34: Add OpenAI API Compatibility**

  - [x] **Subtask 1: Create Failing Test for OpenAI Integration**
    - [x] Create a new test file `src/morpheum-bot/openai.test.ts`.
    - [x] Write a test that attempts to send a prompt to a mock OpenAI server
          and asserts that a valid response is received. This test should fail
          initially as the implementation won't exist.
  - [x] **Subtask 2: Implement OpenAI API Client**
    - [x] Create a new file `src/morpheum-bot/openai.ts`.
    - [x] Implement a function that takes a prompt and an OpenAI API key and
          sends a request to the OpenAI API.
    - [x] This function should handle the response and return it in a structured
          format.
    - [x] Create `OpenAIClient` class implementing `LLMClient` interface.
    - [x] Support custom base URLs for OpenAI-compatible APIs.
  - [x] **Subtask 3: Integrate OpenAI Client into Bot**
    - [x] Enhanced `src/morpheum-bot/bot.ts` to support both OpenAI and Ollama
          APIs.
    - [x] Added new commands: `!openai`, `!ollama`, `!llm status`,
          `!llm switch`.
    - [x] Created comprehensive test suite covering all new functionality.
    - [x] Added common `LLMClient` interface and factory pattern.
    - [x] Updated `SWEAgent` to use generic `LLMClient` interface.
    - [x] All tests pass for new integration functionality.