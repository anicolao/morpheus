import { program } from "commander";
import { MorpheumBot } from "../morpheum-bot/bot";
import { SWEAgent } from "../morpheum-bot/sweAgent";
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
    id: "check-sed-available",
    skill: "Environment Management & Tooling",
    difficulty: "Easy",
    prompt: "Check if the 'sed' tool is available for text processing.",
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
          "which sed",
        ],
        { cwd: "./jail" },
      );
      return stdout.includes("/nix/store") && stdout.includes("sed");
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
      "This project requires converting XML data to JSON. Write an xml2json script in /project that can convert XML files to JSON format.",
    successCondition: async (containerName) => {
      // First, copy test XML file to the container
      await execa(
        "nix",
        [
          "develop",
          "-c",
          "docker",
          "cp",
          "./test.xml",
          `${containerName}:/project/test.xml`,
        ],
        { cwd: "./jail" },
      );
      
      // Test if the xml2json script exists and works
      try {
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
            "cd /project && nix develop -c ./xml2json test.xml",
          ],
          { cwd: "./jail" },
        );
        
        // Check if output is valid JSON and contains expected data
        const parsed = JSON.parse(stdout);
        return parsed && typeof parsed === 'object' && 
               (stdout.includes('John Doe') || stdout.includes('john@example.com'));
      } catch (error) {
        // Try alternative script name or execution method
        try {
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
              "cd /project && nix develop -c bash xml2json test.xml",
            ],
            { cwd: "./jail" },
          );
          
          const parsed = JSON.parse(stdout);
          return parsed && typeof parsed === 'object' && 
                 (stdout.includes('John Doe') || stdout.includes('john@example.com'));
        } catch (secondError) {
          return false;
        }
      }
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
      try {
        // Start the server in the background without awaiting
        const serverProcess = execa(
          "nix",
          [
            "develop",
            "-c",
            "docker",
            "exec",
            containerName,
            "sh",
            "-c",
            "cd /project && nix develop -c bun run server.js",
          ],
          { cwd: "./jail" },
        );

        // Wait for server to start
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Test the server endpoint
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
            "curl -s localhost:3000",
          ],
          { cwd: "./jail" },
        );

        // Kill the server process
        serverProcess.kill();

        return stdout.includes("Hello, Morpheum!");
      } catch (error) {
        return false;
      }
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
        [
          "develop",
          "-c",
          "docker",
          "exec",
          containerName,
          "sh",
          "-c",
          "cd /project && ls",
        ],
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
      'Here is a basic web server file in /project/server.js:\n\n```javascript\nimport Bun from "bun";\n\nBun.serve({\n  port: 3000,\n  fetch(request) {\n    return new Response("Hello, Morpheum!");\n  },\n});\n\nconsole.log("Server running on http://localhost:3000");\n```\n\nModify the existing web server. Add a new API endpoint at "/api/v1/status" that responds with the JSON object: {"status": "ok", "timestamp": "CURRENT_ISO_TIMESTAMP"}.',
    successCondition: async (containerName) => {
      try {
        // First, create the initial server.js file
        await execa(
          "nix",
          [
            "develop",
            "-c",
            "docker",
            "exec",
            containerName,
            "sh",
            "-c",
            `cd /project && cat > server.js << 'EOF'
import Bun from "bun";

Bun.serve({
  port: 3000,
  fetch(request) {
    return new Response("Hello, Morpheum!");
  },
});

console.log("Server running on http://localhost:3000");
EOF`,
          ],
          { cwd: "./jail" },
        );

        // Start the modified server in the background
        const serverProcess = execa(
          "nix",
          [
            "develop",
            "-c",
            "docker",
            "exec",
            containerName,
            "sh",
            "-c",
            "cd /project && nix develop -c bun run server.js",
          ],
          { cwd: "./jail" },
        );

        // Wait for server to start
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Test the /api/v1/status endpoint
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
            "curl -s localhost:3000/api/v1/status",
          ],
          { cwd: "./jail" },
        );

        // Kill the server process
        serverProcess.kill();

        // Check if response is valid JSON with expected fields
        try {
          const response = JSON.parse(stdout);
          return response.status === "ok" && response.timestamp;
        } catch {
          return false;
        }
      } catch (error) {
        return false;
      }
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
      if (response.includes("Ready")) {
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
  provider: 'openai' | 'ollama',
  taskId: string,
  results: GauntletResult,
  verbose: boolean,
) {
  console.log(`Running gauntlet for model: ${model}, provider: ${provider}, task: ${taskId}`);

  // Create a bot instance configured with the specified model and provider
  const bot = new MorpheumBot();
  
  try {
    // Configure the bot to use the specified provider and model
    bot.configureForGauntlet(model, provider);
  } catch (error) {
    console.error(`Error configuring bot: ${error.message}`);
    results[taskId] = { success: false };
    return;
  }

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

// Export function for use by the bot
export async function executeGauntlet(
  model: string,
  provider: 'openai' | 'ollama' = 'ollama',
  taskId?: string,
  verbose: boolean = false
): Promise<GauntletResult> {
  const results: GauntletResult = {};
  
  if (taskId) {
    await runGauntlet(model, provider, taskId, results, verbose);
  } else {
    for (const task of tasks) {
      await runGauntlet(model, provider, task.id, results, verbose);
    }
  }
  
  return results;
}

// Export tasks list for the bot to use
export { tasks as gauntletTasks };

program
  .name("gauntlet")
  .description("A CLI tool to run the Morpheum AI Model Evaluation Gauntlet");

program
  .command("run")
  .description("Run the gauntlet for a specific model and task")
  .requiredOption("-m, --model <model>", "The model to evaluate")
  .option("-p, --provider <provider>", "The LLM provider to use (openai|ollama)", "ollama")
  .option("-t, --task <task>", "The task to run (defaults to all tasks)")
  .option("-v, --verbose", "Enable verbose logging", false)
  .action(async (options) => {
    // Validate provider option
    if (!['openai', 'ollama'].includes(options.provider)) {
      console.error('Error: --provider must be either "openai" or "ollama"');
      process.exit(1);
    }

    const results: GauntletResult = {};
    if (options.task) {
      await runGauntlet(options.model, options.provider, options.task, results, options.verbose);
    } else {
      for (const task of tasks) {
        await runGauntlet(options.model, options.provider, task.id, results, options.verbose);
      }
    }

    console.log("\n--- GAUNTLET RESULTS ---");
    console.log(JSON.stringify(results, null, 2));
    console.log("--- END GAUNTLET RESULTS ---\n");
  });

program.parse(process.argv);
