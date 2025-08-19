import { SWEAgent } from "./sweAgent";
import { OllamaClient } from "./ollamaClient";
import { JailClient } from "./jailClient";
import { execa } from "execa";
import * as fs from "fs";
import { formatMarkdown } from "./format-markdown";

type MessageSender = (message: string, html?: string) => Promise<void>;

export class MorpheumBot {
  private sweAgent: SWEAgent;

  constructor() {
    const ollamaApiUrl = process.env.OLLAMA_API_URL || "http://localhost:11434";
    const ollamaModel = process.env.OLLAMA_MODEL || "morpheum-local";
    const jailHost = process.env.JAIL_HOST || "localhost";
    const jailPort = parseInt(process.env.JAIL_PORT || "10001", 10);

    const ollamaClient = new OllamaClient(ollamaApiUrl, ollamaModel);
    const jailClient = new JailClient(jailHost, jailPort);
    this.sweAgent = new SWEAgent(ollamaClient, jailClient);
  }

  public async processMessage(
    body: string,
    sender: string,
    sendMessage: MessageSender,
  ): Promise<any> {
    if (body.startsWith("!create")) {
      const port = body.split(" ")[1] || "10001";
      return await this.handleCreateCommand(sendMessage, port);
    } else if (body.startsWith("!")) {
      await this.handleInfoCommand(body, sendMessage);
    } else {
      return await this.handleTask(body, sendMessage);
    }
  }

  private async handleCreateCommand(sendMessage: MessageSender, port: string) {
    try {
      await sendMessage("Creating a new environment...");
      const containerName = `gauntlet-test-${Date.now()}`;
      const { stdout, stderr } = await execa(
        "nix",
        ["develop", "-c", "./run.sh", containerName, port, `${parseInt(port) + 1}`],
        { cwd: "./jail", stdio: "pipe" },
      );
      await sendMessage(
        `Successfully created container: ${containerName}\nStdout:\n${stdout}\nStderr:\n${stderr}`,
      );
      return containerName;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await sendMessage(`Error creating environment: ${errorMessage}`);
    }
  }

  private async handleInfoCommand(body: string, sendMessage: MessageSender) {
    if (body.startsWith("!help")) {
      const message = "Hello! I am the Morpheum Bot. I am still under development. You can use `!tasks` to see the current tasks, `!devlog` to see the development log.";
      await sendMessage(message);
    } else if (body.startsWith("!tasks")) {
      const content = await fs.promises.readFile("TASKS.md", "utf8");
      const html = formatMarkdown(content);
      await sendMessage(content, html);
    } else if (body.startsWith("!devlog")) {
      const content = await fs.promises.readFile("DEVLOG.md", "utf8");
      const html = formatMarkdown(content);
      await sendMessage(content, html);
    }
  }

  private async handleTask(task: string, sendMessage: MessageSender) {
    await sendMessage(`Working on: "${task}"...`);
    const history = await this.sweAgent.run(task);
    const result = history.map((h) => `${h.role}: ${h.content}`).join("\n\n");
    await sendMessage(result);
    return history;
  }
}
