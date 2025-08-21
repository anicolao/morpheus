---
title: "Add Gauntlet Command Support to Chat UI (Issue #34)"
date: 2025-01-21
author: "AI Agent"
tags: ["gauntlet", "chat-ui", "feature"]
---

- **High-Level Request:**
  
  - Make it possible to "run the gauntlet" from the chat UI, if one of `ollama` or `openai` is the current LLM (the copilot agent cannot run the gauntlet). Perhaps a command like !gauntlet with the same arguments as running it from the command line would be best, plus a !gauntlet help for usage.

- **Actions Taken:**

  - **Code Analysis:** Examined the existing gauntlet implementation in `src/gauntlet/gauntlet.ts` to understand the CLI structure, task definitions, and command-line argument patterns (--model, --task, --verbose)
  - **Bot Command Integration:** Added gauntlet command handling to the MorpheumBot class in `src/morpheum-bot/bot.ts` following the existing pattern for other bot commands like `!llm`, `!copilot`, etc.
  - **Command Implementation:** Created comprehensive `handleGauntletCommand` method with three subcommands:
    - `!gauntlet help` - Shows detailed help with usage, options, examples, and task descriptions
    - `!gauntlet list` - Lists all available evaluation tasks organized by category and difficulty
    - `!gauntlet run --model <model> [--task <task>] [--verbose]` - Runs gauntlet evaluation with proper argument parsing
  - **LLM Provider Validation:** Implemented provider compatibility check that prevents gauntlet execution when using Copilot (as required), only allowing OpenAI and Ollama providers
  - **Argument Parsing:** Built robust argument parser supporting both short (-m, -t, -v) and long (--model, --task, --verbose) flag formats, matching the CLI interface
  - **Help Integration:** Updated the main bot help message to include the new gauntlet commands for discoverability
  - **Error Handling:** Added comprehensive error messages for missing required arguments and incompatible LLM providers

- **Friction/Success Points:**

  - **Success:** The existing bot command structure made integration straightforward - simply adding the new command to the `handleInfoCommand` method and following the established pattern
  - **Success:** The gauntlet task definitions were already well-structured in the CLI version, making it easy to extract task information for the help and list commands
  - **Success:** Argument parsing logic was implemented to exactly match the CLI version, ensuring consistent user experience between chat and command-line interfaces
  - **Learning:** The bot's LLM provider checking mechanism was perfect for implementing the Copilot restriction requirement
  - **Success:** Created comprehensive help text that provides examples and usage guidance, making the feature immediately usable
  - **Success:** The implementation is minimal and surgical - only adds the necessary functionality without modifying existing working code