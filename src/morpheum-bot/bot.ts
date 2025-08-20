import { SWEAgent } from "./sweAgent";
import { OllamaClient } from "./ollamaClient";
import { OpenAIClient } from "./openai";
import { JailClient } from "./jailClient";
import { LLMClient, LLMConfig, createLLMClient } from "./llmClient";
import { execa } from "execa";
import * as fs from "fs";
import { formatMarkdown } from "./format-markdown";

type MessageSender = (message: string, html?: string) => Promise<void>;

export class MorpheumBot {
  private sweAgent: SWEAgent;
  private currentLLMClient: LLMClient;
  private currentLLMProvider: 'openai' | 'ollama';
  private llmConfig: {
    openai: { apiKey?: string; model: string; baseUrl: string };
    ollama: { model: string; baseUrl: string };
  };

  constructor() {
    // Initialize LLM configurations from environment variables
    this.llmConfig = {
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      },
      ollama: {
        model: process.env.OLLAMA_MODEL || 'morpheum-local',
        baseUrl: process.env.OLLAMA_API_URL || 'http://localhost:11434',
      },
    };

    // Default to Ollama if no OpenAI key is provided
    this.currentLLMProvider = this.llmConfig.openai.apiKey ? 'openai' : 'ollama';
    
    // Initialize clients
    this.currentLLMClient = this.createCurrentLLMClient();
    
    const jailHost = process.env.JAIL_HOST || "localhost";
    const jailPort = parseInt(process.env.JAIL_PORT || "10001", 10);
    const jailClient = new JailClient(jailHost, jailPort);
    this.sweAgent = new SWEAgent(this.currentLLMClient, jailClient);
  }

  private createCurrentLLMClient(): LLMClient {
    if (this.currentLLMProvider === 'openai') {
      if (!this.llmConfig.openai.apiKey) {
        throw new Error('OpenAI API key is required but not provided');
      }
      return new OpenAIClient(
        this.llmConfig.openai.apiKey,
        this.llmConfig.openai.model,
        this.llmConfig.openai.baseUrl
      );
    } else {
      return new OllamaClient(
        this.llmConfig.ollama.baseUrl,
        this.llmConfig.ollama.model
      );
    }
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
      const jailHost = process.env.JAIL_HOST || "localhost";
      const newJailClient = new JailClient(jailHost, parseInt(port, 10));
      this.sweAgent = new SWEAgent(this.currentLLMClient, newJailClient);
      await sendMessage(
        `Agent reset to talk to the new container on port ${port}`,
      );
      return containerName;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await sendMessage(`Error creating environment: ${errorMessage}`);
    }
  }

  private async handleInfoCommand(body: string, sendMessage: MessageSender) {
    if (body.startsWith("!help")) {
      const message = `Hello! I am the Morpheum Bot. I am still under development.

Available commands:
- \`!help\` - Show this help message
- \`!tasks\` - Show current tasks
- \`!devlog\` - Show development log
- \`!llm status\` - Show current LLM provider and configuration
- \`!llm switch openai [model] [baseUrl]\` - Switch to OpenAI (requires OPENAI_API_KEY env var)
- \`!llm switch ollama [model] [baseUrl]\` - Switch to Ollama
- \`!openai <prompt>\` - Send a direct prompt to OpenAI (requires API key)
- \`!ollama <prompt>\` - Send a direct prompt to Ollama

For regular tasks, just type your request without a command prefix.`;
      await sendMessage(message);
    } else if (body.startsWith("!tasks")) {
      const content = await fs.promises.readFile("TASKS.md", "utf8");
      const html = formatMarkdown(content);
      await sendMessage(content, html);
    } else if (body.startsWith("!devlog")) {
      const content = await fs.promises.readFile("DEVLOG.md", "utf8");
      const html = formatMarkdown(content);
      await sendMessage(content, html);
    } else if (body.startsWith("!llm")) {
      await this.handleLLMCommand(body, sendMessage);
    } else if (body.startsWith("!openai")) {
      await this.handleDirectOpenAICommand(body, sendMessage);
    } else if (body.startsWith("!ollama")) {
      await this.handleDirectOllamaCommand(body, sendMessage);
    }
  }

  private async handleLLMCommand(body: string, sendMessage: MessageSender) {
    const parts = body.split(' ');
    const subcommand = parts[1];

    if (subcommand === 'status') {
      const status = `Current LLM Provider: ${this.currentLLMProvider}
Configuration:
- OpenAI: model=${this.llmConfig.openai.model}, baseUrl=${this.llmConfig.openai.baseUrl}, apiKey=${this.llmConfig.openai.apiKey ? 'configured' : 'not configured'}
- Ollama: model=${this.llmConfig.ollama.model}, baseUrl=${this.llmConfig.ollama.baseUrl}`;
      await sendMessage(status);
    } else if (subcommand === 'switch') {
      const provider = parts[2] as 'openai' | 'ollama';
      if (!provider || !['openai', 'ollama'].includes(provider)) {
        await sendMessage('Usage: !llm switch <openai|ollama> [model] [baseUrl]');
        return;
      }

      try {
        if (provider === 'openai' && !this.llmConfig.openai.apiKey) {
          await sendMessage('Error: OpenAI API key is not configured. Set OPENAI_API_KEY environment variable.');
          return;
        }

        // Update configuration if additional parameters provided
        if (parts[3]) {
          this.llmConfig[provider].model = parts[3];
        }
        if (parts[4]) {
          this.llmConfig[provider].baseUrl = parts[4];
        }

        this.currentLLMProvider = provider;
        this.currentLLMClient = this.createCurrentLLMClient();
        
        // Update the SWE agent with new LLM client
        const jailHost = process.env.JAIL_HOST || "localhost";
        const jailPort = parseInt(process.env.JAIL_PORT || "10001", 10);
        const jailClient = new JailClient(jailHost, jailPort);
        this.sweAgent = new SWEAgent(this.currentLLMClient, jailClient);

        await sendMessage(`Switched to ${provider} (model: ${this.llmConfig[provider].model}, baseUrl: ${this.llmConfig[provider].baseUrl})`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        await sendMessage(`Error switching LLM provider: ${errorMessage}`);
      }
    } else {
      await sendMessage('Usage: !llm <status|switch>');
    }
  }

  private async handleDirectOpenAICommand(body: string, sendMessage: MessageSender) {
    const prompt = body.substring('!openai '.length).trim();
    if (!prompt) {
      await sendMessage('Usage: !openai <prompt>');
      return;
    }

    if (!this.llmConfig.openai.apiKey) {
      await sendMessage('Error: OpenAI API key is not configured. Set OPENAI_API_KEY environment variable.');
      return;
    }

    try {
      const client = new OpenAIClient(
        this.llmConfig.openai.apiKey,
        this.llmConfig.openai.model,
        this.llmConfig.openai.baseUrl
      );
      const response = await client.send(prompt);
      await sendMessage(`OpenAI Response:\n${response}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await sendMessage(`Error calling OpenAI: ${errorMessage}`);
    }
  }

  private async handleDirectOllamaCommand(body: string, sendMessage: MessageSender) {
    const prompt = body.substring('!ollama '.length).trim();
    if (!prompt) {
      await sendMessage('Usage: !ollama <prompt>');
      return;
    }

    try {
      const client = new OllamaClient(
        this.llmConfig.ollama.baseUrl,
        this.llmConfig.ollama.model
      );
      const response = await client.send(prompt);
      await sendMessage(`Ollama Response:\n${response}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await sendMessage(`Error calling Ollama: ${errorMessage}`);
    }
  }

  private async handleTask(task: string, sendMessage: MessageSender) {
    await sendMessage(`Working on: "${task}" using ${this.currentLLMProvider}...`);
    const history = await this.sweAgent.run(task);
    const result = history.map((h) => `${h.role}: ${h.content}`).join("\n\n");
    await sendMessage(result);
    return history;
  }
}
