# Morpheum Project: AI Model Evaluation Gauntlet

This document outlines a standardized evaluation framework, or "gauntlet," to test and compare the capabilities of different AI models for the Morpheum project. The goal is to identify the most suitable model for an agentic programmer operating within a Nix-based shell environment.

---

## Task Gauntlet: Core Skill Evaluation 🏆

The evaluation consists of a series of tasks designed to test the core skills required of the agent. The tasks are divided into two main categories and escalate in difficulty.

### Skill 1: Environment Management & Tooling

This tests the agent's ability to understand and modify its own Nix environment.

* **Easy Task: "Add a Specific Tool"**
    * **Prompt:** `I need to parse some JSON from the command line. Add the 'jq' tool to my environment.`
    * **Success looks like:** The agent correctly identifies the `flake.nix` file, adds `pkgs.jq` to the `packages` list, and understands that it needs to restart or reload the shell to make the tool available.

* **Medium Task: "Find and Add a Tool for a Purpose"**
    * **Prompt:** `This project requires converting XML data to JSON. Find and add a command-line tool suitable for this task.`
    * **Success looks like:** The agent uses its knowledge to identify a relevant tool (like `xmlstarlet`), adds the correct Nix package, and demonstrates its use. This tests problem-solving beyond simple instructions.

* **Hard Task: "Resolve a Missing Dependency"**
    * **Prompt:** Provide the agent a simple Python script (`app.py`) containing `import requests`.
    * **Prompt:** `This Python script is failing. Fix the environment so it can run successfully.`
    * **Success looks like:** The agent runs the script, reads the `ModuleNotFoundError`, identifies the missing `requests` library, and correctly adds the `python3Packages.requests` package to the `flake.nix` file.

### Skill 2: Software Development & Refinement

This tests the agent's ability to write, run, and modify code using the tools available.

* **Easy Task: "Hello World Web Server"**
    * **Prompt:** `Using Bun, create a simple web server in a file named 'server.js' that responds with 'Hello, Morpheum!' on port 3000.`
    * **Success looks like:** The agent creates the file, writes correct JavaScript code using the Bun API, and executes it successfully with `bun run server.js`.

* **Medium Task: "Create a Project Requiring a New Tool"**
    * **Prompt:** `Create a simple static website using the Hugo static site generator. The site should be named 'MyAgentSite'.`
    * **Success looks like:** The agent first realizes `hugo` isn't installed and adds it to `flake.nix` (combining skills). Then, it correctly runs the `hugo new site` command and follows the basic steps to create a minimal working site.

* **Hard Task: "Refine an Existing Codebase"**
    * **Prompt:** Provide the `server.js` file from the easy task.
    * **Prompt:** `Modify the existing web server. Add a new API endpoint at '/api/v1/status' that responds with the JSON object: {"status": "ok", "timestamp": "CURRENT_ISO_TIMESTAMP"}.`
    * **Success looks like:** The agent reads and understands the existing code, correctly adds the new route, writes code to generate the current time in ISO 8601 format, and ensures the server still runs without errors.

---

## Evaluation Framework: Scoring Rubric 📊

To compare models objectively, score each attempt against this rubric.

| Metric | Scoring System | Description |
| :--- | :--- | :--- |
| **Task Completion** | **0 (Fail) or 1 (Pass)** | Did the agent successfully complete the task's primary objective? This is the most important score. |
| **Efficiency** | **0.0 - 1.0 Scale** | How direct was the path to the solution? A simple measure is `(Optimal Steps / Actual Steps)`. This penalizes floundering. |
| **Self-Correction** | **+0.5 Bonus** | Did the agent encounter an error (e.g., command not found, syntax error) and recover on its own without prompting? |
| **Correctness** | **1-5 Scale** | How well was it done? (1=Barely works, 5=Idiomatic and clean). For Nix, did it add the right attribute? For code, is it well-structured? |

---

## Procedure for Running the Face-Off

1.  **Standardize the Starting Point:** Each model must start from the exact same state. The project's Docker container setup should be used to create a fresh, identical environment for every model on every task.

2.  **Use Identical Prompts:** Give each model the exact same initial prompt for each task to ensure a fair comparison.

3.  **Run the Gauntlet:** Start with the easy tasks. A model's performance on the simpler tasks will be a good indicator of whether it's worth testing on the more complex and time-consuming ones.