---
title: "Gauntlet Testing Framework"
order: 55
status: completed
phase: "General Development"
category: "Gauntlet Testing"
---

- [x] **Task 48: Gauntlet Testing Framework**

  - [x] Create a `gauntlet.ts` script to automate the evaluation process.
  - [x] Implement a scoring system to rank models based on performance.
  - [x] Run the gauntlet on various models and document the results.
  - [x] Add a TODO item in `TASKS.md` for this task.
  - [x] Check in the new `GAUNTLET.md` file.
  - [x] Create a `DEVLOG.md` entry for this task.
  - [x] Follow the rules in `AGENTS.md`.
  - [ ] Test the gauntlet script with a local model, getting it to pass.
  - [x] Add Gauntlet chat UI integration (Issue #34) - Enable running gauntlet from chat interface when using OpenAI/Ollama providers with commands: `!gauntlet help`, `!gauntlet list`, `!gauntlet run --model <model> [--task <task>] [--verbose]`