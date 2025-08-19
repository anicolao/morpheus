import { program } from "commander";
import { MorpheumBot } from "../morpheum-bot/bot";
import { JailClient } from "../morpheum-bot/jailClient";
import { execa } from "execa";
import * as net from "net";

console.log("Gauntlet script started");

// Define the structure for a Gauntlet task
interface GauntletTask {
  id: string;
  skill:
    | "Environment Management & Tooling"
    | "Software Development & Refinement";
  difficulty: "Easy" | "Medium" | "Hard";
  prompt: string;
  successCondition: (containerName: string) => Promise<boolean>;
}

// Define the tasks based on GAUNTLET.md
const tasks: GauntletTask[] = [
  {
    id: "add-jq",
    skill: "Environment Management & Tooling",
    difficulty: "Easy",
    prompt:
      "I need to parse some JSON from the command line. Add the 'jq' tool to my environment.",
    successCondition: async (containerName) => {
      const { stdout } = await execa(
        "nix",
        [
          "develop",
          "-c",
          "docker",
          "exec",
          containerName,
          "sh",
          "-c",
          "cd /project && nix develop -c which jq",
        ],
        { cwd: "./jail" },
      );
      return stdout.includes("/nix/store");
    },
  },
  {
    id: "create-project-dir",
    skill: "Environment Management & Tooling",
    difficulty: "Easy",
    prompt: "create a /project directory if none exists",
    successCondition: async (containerName) => {
      const { stdout } = await execa(
        "nix",
        ["develop", "-c", "docker", "exec", containerName, "ls", "/"],
        { cwd: "./jail" },
      );
      return stdout.includes("project");
    },
  },
  {
    id: "add-xml-converter",
    skill: "Environment Management & Tooling",
    difficulty: "Medium",
    prompt:
      "This project requires converting XML data to JSON. Find and add a command-line tool suitable for this task.",
    successCondition: async (containerName) => {
      const { stdout } = await execa(
        "nix",
        [
          "develop",
          "-c",
          "docker",
          "exec",
          containerName,
          "sh",
          "-c",
          "cd /project && nix develop -c which xmlstarlet",
        ],
        { cwd: "./jail" },
      );
      return stdout.includes("/nix/store");
    },
  },
  {
    id: "resolve-python-dependency",
    skill: "Environment Management & Tooling",
    difficulty: "Hard",
    prompt:
      "A Python script with 'import requests' is failing. Fix the environment so it can run successfully.",
    successCondition: async (containerName) => {
      const { stdout } = await execa(
        "nix",
        [
          "develop",
          "-c",
          "docker",
          "exec",
          containerName,
          "sh",
          "-c",
          "cd /project && nix develop -c python -c 'import requests'",
        ],
        { cwd: "./jail" },
      );
      return stdout === "";
    },
  },
  {
    id: "hello-world-server",
    skill: "Software Development & Refinement",
    difficulty: "Easy",
    prompt:
      "Using Bun, create a simple web server in a file named 'server.js' that responds with 'Hello, Morpheum!' on port 3000.",
    successCondition: async (containerName) => {
      const { stdout } = await execa(
        "nix",
        ["develop", "-c", "docker", "exec", containerName, "cat", "server.js"],
        { cwd: "./jail" },
      );
      return stdout.includes("Hello, Morpheum!");
    },
  },
  {
    id: "create-hugo-site",
    skill: "Software Development & Refinement",
    difficulty: "Medium",
    prompt:
      "Create a simple static website using the Hugo static site generator. The site should be named 'MyAgentSite'.",
    successCondition: async (containerName) => {
      const { stdout } = await execa(
        "nix",
        ["develop", "-c", "docker", "exec", containerName, "ls"],
        { cwd: "./jail" },
      );
      return stdout.includes("MyAgentSite");
    },
  },
  {
    id: "refine-existing-codebase",
    skill: "Software Development & Refinement",
    difficulty: "Hard",
    prompt:
      'Modify the existing web server. Add a new API endpoint at "/api/v1/status" that responds with the JSON object: {"status": "ok", "timestamp": "CURRENT_ISO_TIMESTAMP"}.',
    successCondition: async (containerName) => {
      const { stdout } = await execa(
        "nix",
        ["develop", "-c", "docker", "exec", containerName, "cat", "server.js"],
        { cwd: "./jail" },
      );
      return stdout.includes("/api/v1/status");
    },
  },
];

// Define the scoring rubric
interface GauntletResult {
  [taskId: string]: {
    success: boolean;
  };
}

async function evaluateSuccessCondition(
  task: GauntletTask,
  containerName: string,
  verbose: boolean,
): Promise<boolean> {
  try {
    return await task.successCondition(containerName);
  } catch (error) {
    if (verbose) {
      console.error(
        `Error evaluating success condition for task ${task.id}:`,
        error,
      );
    } else {
      console.error(
        `Task ${task.id} failed: Success condition check threw an error.`,
      );
    }
    return false;
  }
}

async function checkContainerReadiness(port: number, host: string): Promise<boolean> {
  console.log(`Polling for container readiness on ${host}:${port}...`);
  for (let i = 0; i < 60; i++) {
    try {
      const jailClient = new JailClient(host, port);
      const response = await jailClient.execute('echo "Ready"');
      if (response.trim() === "Ready") {
        console.log("Container is ready.");
        return true;
      }
    } catch (error) {
      // Ignore errors (like ECONNREFUSED) and retry
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.error("Container did not become ready in time.");
  return false;
}

// Placeholder for the evaluation logic
async function runGauntlet(
  model: string,
  taskId: string,
  results: GauntletResult,
  verbose: boolean,
) {
  console.log(`Running gauntlet for model: ${model}, task: ${taskId}`);

  const bot = new MorpheumBot();
  const task = tasks.find((t) => t.id === taskId);
  if (!task) {
    console.error(`Task with id ${taskId} not found.`);
    return;
  }

  const capturedOutput: { role: string; content: string }[] = [];
  const messageSender = async (message: string, html?: string) => {
    console.log("BOT:", message);
    if (html) {
      console.log("BOT (HTML):", html);
    }
  };

  console.log("Stopping previous test containers...");
  // 1. Stop any previous test containers
  try {
    const { stdout } = await execa(
      "nix",
      [
        "develop",
        "-c",
        "docker",
        "ps",
        "-a",
        "--filter",
        "name=gauntlet-test-",
        "--format",
        "{{.Names}}",
      ],
      { cwd: "./jail", timeout: 5000 },
    );
    const containers = stdout
      .split("\n")
      .filter((line) => line.startsWith("gauntlet-test-"));
    if (containers.length > 0) {
      console.log(`Stopping ${containers.length} previous test containers...`);
      try {
        await execa("nix", ["develop", "-c", "docker", "stop", ...containers], {
          cwd: "./jail",
          timeout: 5000,
        });

        // Verify that all gauntlet containers are gone
        const { stdout: stoppedCheck } = await execa(
          "nix",
          [
            "develop",
            "-c",
            "docker",
            "ps",
            "-a",
            "--filter",
            "name=gauntlet-test-",
            "--format",
            "{{.Names}}",
          ],
          { cwd: "./jail", timeout: 5000 },
        );
        const stoppedContainers = stoppedCheck
          .split("\n")
          .filter((line) => line.startsWith("gauntlet-test-"));
        if (stoppedContainers.length > 0) {
          console.warn(
            `Warning: ${stoppedContainers.length} gauntlet containers were not removed and need manual cleanup:`,
            stoppedContainers,
          );
        } else {
          console.log(
            "Successfully stopped and removed all previous gauntlet containers.",
          );
        }
      } catch (error) {
        console.error("Error stopping containers, but continuing...", error);
      }
    }
  } catch (error) {
    console.error(
      "Error stopping previous test containers. Is docker running?",
      error,
    );
  }
  console.log("Previous test containers stopped.");

  console.log("Creating new environment...");
  // 2. Create a new environment
  const port = 10000 + (Date.now() % 1000);
  const containerName = await bot.processMessage(
    `!create ${port}`,
    "gauntlet",
    messageSender,
  );
  if (!containerName) {
    console.error("Failed to create container.");
    results[taskId] = { success: false };
    return;
  }
  console.log(`New environment created: ${containerName}`);

  // Wait for the container to be ready
  const isReady = await checkContainerReadiness(port, "localhost");
  if (!isReady) {
    results[taskId] = { success: false };
    return;
  }


  // 3. Run the task
  const result = await bot.processMessage(
    task.prompt,
    "gauntlet",
    messageSender,
  );

  // 4. Capture the model's output and actions
  if (Array.isArray(result)) {
    capturedOutput.push(...result);
  }

  console.log("\n--- CAPTURED OUTPUT ---");
  console.log(JSON.stringify(capturedOutput, null, 2));
  console.log("--- END CAPTURED OUTPUT ---\n");

  // 4. Evaluate the output against the success condition
  const success = await evaluateSuccessCondition(task, containerName, verbose);
  console.log(`\n--- TASK ${task.id} ---`);
  console.log(`Success: ${success}`);
  console.log("--- END TASK ---\\n");
  results[taskId] = { success };
}

program
  .name("gauntlet")
  .description("A CLI tool to run the Morpheum AI Model Evaluation Gauntlet");

program
  .command("run")
  .description("Run the gauntlet for a specific model and task")
  .requiredOption("-m, --model <model>", "The model to evaluate")
  .option("-t, --task <task>", "The task to run (defaults to all tasks)")
  .option("-v, --verbose", "Enable verbose logging", false)
  .action(async (options) => {
    const results: GauntletResult = {};
    if (options.task) {
      await runGauntlet(options.model, options.task, results, options.verbose);
    } else {
      for (const task of tasks) {
        await runGauntlet(options.model, task.id, results, options.verbose);
      }
    }

    console.log("\n--- GAUNTLET RESULTS ---");
    console.log(JSON.stringify(results, null, 2));
    console.log("--- END GAUNTLET RESULTS ---\n");
  });

program.parse(process.argv);
