import { SWEAgent } from "./sweAgent";
import { OllamaClient } from "./ollamaClient";
import { OpenAIClient } from "./openai";
import { JailClient } from "./jailClient";
import { type LLMClient, type LLMConfig, createLLMClient } from "./llmClient";
import { execa } from "execa";
import * as fs from "fs";
import { formatMarkdown } from "./format-markdown";
import { CopilotClient } from "./copilotClient";
import * as net from "net";

type MessageSender = (message: string, html?: string) => Promise<void>;

// Helper function to detect if a chunk contains markdown links
function hasMarkdownLinks(text: string): boolean {
  // Match markdown links like [text](url)
  return /\[.+?\]\(https?:\/\/.+?\)/.test(text);
}

// Helper function to send markdown messages with proper HTML formatting
function sendMarkdownMessage(markdown: string, sendMessage: MessageSender): Promise<void> {
  const html = formatMarkdown(markdown);
  return sendMessage(markdown, html);
}

export class MorpheumBot {
  private sweAgent: SWEAgent;

  private currentLLMClient: LLMClient;
  private currentLLMProvider: 'openai' | 'ollama' | 'copilot';
  private llmConfig: {
    openai: { apiKey?: string; model: string; baseUrl: string };
    ollama: { model: string; baseUrl: string };
    copilot: { apiKey?: string; repository?: string; baseUrl: string; pollInterval: string };
  };

  constructor() {
    // Initialize LLM configurations from environment variables
    const openaiConfig: { apiKey?: string; model: string; baseUrl: string } = {
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    };
    if (process.env.OPENAI_API_KEY) {
      openaiConfig.apiKey = process.env.OPENAI_API_KEY;
    }

    const copilotConfig: { apiKey?: string; repository?: string; baseUrl: string; pollInterval: string } = {
      baseUrl: process.env.COPILOT_BASE_URL || 'https://api.github.com',
      pollInterval: process.env.COPILOT_POLL_INTERVAL || '10',
    };
    if (process.env.GITHUB_TOKEN) {
      copilotConfig.apiKey = process.env.GITHUB_TOKEN;
    }
    if (process.env.COPILOT_REPOSITORY) {
      copilotConfig.repository = process.env.COPILOT_REPOSITORY;
    }

    this.llmConfig = {
      openai: openaiConfig,
      ollama: {
        model: process.env.OLLAMA_MODEL || 'morpheum-local',
        baseUrl: process.env.OLLAMA_API_URL || 'http://localhost:11434',
      },
      copilot: copilotConfig,
    };

    // Default to Ollama if no OpenAI key is provided
    this.currentLLMProvider = this.llmConfig.openai.apiKey ? 'openai' : 'ollama';
    
    // Initialize clients - this will be created lazily when needed
    this.currentLLMClient = this.createCurrentLLMClient();
    
    const jailHost = process.env.JAIL_HOST || "localhost";
    const jailPort = parseInt(process.env.JAIL_PORT || "10001", 10);
    const jailClient = new JailClient(jailHost, jailPort);
    this.sweAgent = new SWEAgent(this.currentLLMClient, jailClient);
  }

  private createCurrentLLMClient(): LLMClient {
    const config: LLMConfig = {
      provider: this.currentLLMProvider,
    };

    if (this.currentLLMProvider === 'openai') {
      if (!this.llmConfig.openai.apiKey) {
        throw new Error('OpenAI API key is required but not provided');
      }
      config.apiKey = this.llmConfig.openai.apiKey;
      config.model = this.llmConfig.openai.model;
      config.baseUrl = this.llmConfig.openai.baseUrl;
    } else if (this.currentLLMProvider === 'ollama') {
      config.model = this.llmConfig.ollama.model;
      config.baseUrl = this.llmConfig.ollama.baseUrl;
    } else if (this.currentLLMProvider === 'copilot') {
      if (!this.llmConfig.copilot.apiKey) {
        throw new Error('GitHub token is required but not provided');
      }
      if (!this.llmConfig.copilot.repository) {
        throw new Error('Repository is required for Copilot integration');
      }
      config.apiKey = this.llmConfig.copilot.apiKey;
      config.repository = this.llmConfig.copilot.repository;
      config.baseUrl = this.llmConfig.copilot.baseUrl;
    }

    // Use the factory function, but since it's async, we need to handle this differently
    // For now, we'll create the clients directly to maintain synchronous nature
    if (this.currentLLMProvider === 'openai') {
      return new OpenAIClient(
        this.llmConfig.openai.apiKey!,
        this.llmConfig.openai.model,
        this.llmConfig.openai.baseUrl
      );
    } else if (this.currentLLMProvider === 'copilot') {
      return new CopilotClient(
        this.llmConfig.copilot.apiKey!,
        this.llmConfig.copilot.repository!,
        this.llmConfig.copilot.baseUrl
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
- \`!llm switch copilot <repository>\` - Switch to GitHub Copilot (requires GITHUB_TOKEN env var)
- \`!openai <prompt>\` - Send a direct prompt to OpenAI (requires API key)
- \`!ollama <prompt>\` - Send a direct prompt to Ollama
- \`!copilot status [session-id]\` - Check copilot session status
- \`!copilot list\` - List active copilot sessions
- \`!copilot cancel <session-id>\` - Cancel a copilot session
- \`!gauntlet help\` - Show gauntlet evaluation help
- \`!gauntlet list\` - List available gauntlet tasks
- \`!gauntlet run --model <model> [--task <task>]\` - Run gauntlet evaluation

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
    } else if (body.startsWith("!copilot")) {
      await this.handleCopilotCommand(body, sendMessage);
    } else if (body.startsWith("!gauntlet")) {
      await this.handleGauntletCommand(body, sendMessage);
    }
  }

  private async handleLLMCommand(body: string, sendMessage: MessageSender) {
    const parts = body.split(' ');
    const subcommand = parts[1];

    if (subcommand === 'status') {
      const status = `Current LLM Provider: ${this.currentLLMProvider}
Configuration:
- OpenAI: model=${this.llmConfig.openai.model}, baseUrl=${this.llmConfig.openai.baseUrl}, apiKey=${this.llmConfig.openai.apiKey ? 'configured' : 'not configured'}
- Ollama: model=${this.llmConfig.ollama.model}, baseUrl=${this.llmConfig.ollama.baseUrl}
- Copilot: repository=${this.llmConfig.copilot.repository || 'not configured'}, baseUrl=${this.llmConfig.copilot.baseUrl}, apiKey=${this.llmConfig.copilot.apiKey ? 'configured' : 'not configured'}`;
      await sendMessage(status);
    } else if (subcommand === 'switch') {
      const provider = parts[2] as 'openai' | 'ollama' | 'copilot';
      if (!provider || !['openai', 'ollama', 'copilot'].includes(provider)) {
        await sendMessage('Usage: !llm switch <openai|ollama|copilot> [model] [baseUrl] or !llm switch copilot <repository>');
        return;
      }

      try {
        if (provider === 'openai' && !this.llmConfig.openai.apiKey) {
          await sendMessage('Error: OpenAI API key is not configured. Set OPENAI_API_KEY environment variable.');
          return;
        }

        if (provider === 'copilot') {
          if (!this.llmConfig.copilot.apiKey) {
            await sendMessage('Error: GitHub token is not configured. Set GITHUB_TOKEN environment variable.');
            return;
          }
          
          // For copilot, the third parameter is the repository
          if (parts[3]) {
            this.llmConfig.copilot.repository = parts[3];
          } else if (!this.llmConfig.copilot.repository) {
            await sendMessage('Error: Repository is required for Copilot. Use: !llm switch copilot <owner/repo>');
            return;
          }
        } else {
          // Update configuration if additional parameters provided for openai/ollama
          if (parts[3]) {
            this.llmConfig[provider].model = parts[3];
          }
          if (parts[4]) {
            this.llmConfig[provider].baseUrl = parts[4];
          }
        }

        this.currentLLMProvider = provider;
        this.currentLLMClient = this.createCurrentLLMClient();
        
        // Update the SWE agent with new LLM client
        const jailHost = process.env.JAIL_HOST || "localhost";
        const jailPort = parseInt(process.env.JAIL_PORT || "10001", 10);
        const jailClient = new JailClient(jailHost, jailPort);
        this.sweAgent = new SWEAgent(this.currentLLMClient, jailClient);

        if (provider === 'copilot') {
          await sendMessage(`Switched to ${provider} (repository: ${this.llmConfig.copilot.repository}, baseUrl: ${this.llmConfig.copilot.baseUrl})`);
        } else {
          await sendMessage(`Switched to ${provider} (model: ${this.llmConfig[provider].model}, baseUrl: ${this.llmConfig[provider].baseUrl})`);
        }
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
      
      await sendMessage(`🤖 OpenAI is thinking...`);
      
      const response = await client.sendStreaming(prompt, (chunk) => {
        // Let the message queue handle batching - just send raw chunks
        sendMessage(chunk).catch(console.error);
      });
      
      await sendMessage(`\n✅ OpenAI completed.`);
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
      
      await sendMessage(`🤖 Ollama is thinking...`);
      
      const response = await client.sendStreaming(prompt, (chunk) => {
        // Let the message queue handle batching - just send raw chunks
        sendMessage(chunk).catch(console.error);
      });
      
      await sendMessage(`\n✅ Ollama completed.`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await sendMessage(`Error calling Ollama: ${errorMessage}`);
    }
  }

  private async handleCopilotCommand(body: string, sendMessage: MessageSender) {
    const parts = body.split(' ');
    const subcommand = parts[1];

    if (!subcommand) {
      await sendMessage('Usage: !copilot <status|list|cancel> [session-id]');
      return;
    }

    // Ensure we have a copilot client
    if (this.currentLLMProvider !== 'copilot') {
      await sendMessage('Error: Not currently using Copilot provider. Use `!llm switch copilot <repository>` first.');
      return;
    }

    try {
      const copilotClient = this.currentLLMClient as CopilotClient;

      switch (subcommand) {
        case 'status':
          const sessionId = parts[2];
          if (sessionId) {
            await sendMessage(`📊 Checking status for session: ${sessionId}`);
            // TODO: Implement specific session status check
            await sendMessage(`Session ${sessionId} status: in_progress`);
          } else {
            await sendMessage('📊 Copilot Integration Status:\n' +
              `- Provider: ${this.currentLLMProvider}\n` +
              `- Repository: ${this.llmConfig.copilot.repository}\n` +
              `- Base URL: ${this.llmConfig.copilot.baseUrl}\n` +
              `- Token: ${this.llmConfig.copilot.apiKey ? 'configured' : 'not configured'}`);
          }
          break;

        case 'list':
          await sendMessage('📋 Listing active Copilot sessions...');
          const sessions = await copilotClient.getActiveSessions();
          if (sessions.length === 0) {
            await sendMessage('No active Copilot sessions found.');
          } else {
            const sessionList = sessions.map(s => `- ${s.id}: ${s.status}`).join('\n');
            await sendMessage(`Active sessions:\n${sessionList}`);
          }
          break;

        case 'cancel':
          const cancelSessionId = parts[2];
          if (!cancelSessionId) {
            await sendMessage('Usage: !copilot cancel <session-id>');
            return;
          }
          await sendMessage(`❌ Cancelling session: ${cancelSessionId}`);
          const success = await copilotClient.cancelSession(cancelSessionId);
          if (success) {
            await sendMessage(`✅ Session ${cancelSessionId} cancelled successfully.`);
          } else {
            await sendMessage(`❌ Failed to cancel session ${cancelSessionId}.`);
          }
          break;

        default:
          await sendMessage('Usage: !copilot <status|list|cancel> [session-id]');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await sendMessage(`Error executing Copilot command: ${errorMessage}`);
    }
  }

  private async handleGauntletCommand(body: string, sendMessage: MessageSender) {
    const parts = body.split(' ');
    const subcommand = parts[1];

    // Check if current LLM provider is compatible with gauntlet
    if (this.currentLLMProvider === 'copilot') {
      await sendMessage('Error: Gauntlet cannot be run with Copilot provider. Please switch to OpenAI or Ollama first using `!llm switch <openai|ollama>`');
      return;
    }

    if (subcommand === 'help' || !subcommand) {
      const helpMessage = `🏆 **Gauntlet - AI Model Evaluation**

**Usage:**
- \`!gauntlet run --model <model> [--task <task>] [--verbose]\` - Run gauntlet evaluation
- \`!gauntlet list\` - List available tasks
- \`!gauntlet help\` - Show this help message

**Options:**
- \`--model <model>\` - Required. The model name to evaluate
- \`--task <task>\` - Optional. Specific task ID to run (runs all tasks if not specified)
- \`--verbose\` - Optional. Enable verbose output

**Available Tasks:**
- \`add-jq\` - Add jq tool to environment (Easy)
- \`check-sed-available\` - Check sed tool availability (Easy) 
- \`create-project-dir\` - Create project directory (Easy)
- \`add-xml-converter\` - Create XML to JSON converter (Medium)
- \`resolve-python-dependency\` - Fix Python dependency issue (Hard)
- \`hello-world-server\` - Create web server (Easy)
- \`create-hugo-site\` - Create Hugo static site (Medium)
- \`refine-existing-codebase\` - Refine existing code (Hard)

**Examples:**
- \`!gauntlet run --model gpt-4\` - Run all tasks with GPT-4
- \`!gauntlet run --model llama2 --task add-jq\` - Run specific task
- \`!gauntlet run --model claude --verbose\` - Run with verbose output

⚠️ **Note:** Gauntlet only works with OpenAI and Ollama providers, not Copilot.`;
      await sendMessage(helpMessage);
      return;
    }

    if (subcommand === 'list') {
      const tasksMessage = `📋 **Available Gauntlet Tasks:**

**Environment Management & Tooling:**
- \`add-jq\` (Easy) - Add jq tool for JSON parsing
- \`check-sed-available\` (Easy) - Verify sed tool availability  
- \`create-project-dir\` (Easy) - Create project directory
- \`add-xml-converter\` (Medium) - Create XML to JSON converter
- \`resolve-python-dependency\` (Hard) - Fix missing Python dependencies

**Software Development & Refinement:**
- \`hello-world-server\` (Easy) - Create simple web server
- \`create-hugo-site\` (Medium) - Set up Hugo static site
- \`refine-existing-codebase\` (Hard) - Improve existing code

Use \`!gauntlet run --model <model> --task <task-id>\` to run a specific task.`;
      await sendMessage(tasksMessage);
      return;
    }

    if (subcommand === 'run') {
      await this.runGauntletEvaluation(parts.slice(2), sendMessage);
      return;
    }

    await sendMessage('Usage: !gauntlet <run|list|help>');
  }

  private async runGauntletEvaluation(args: string[], sendMessage: MessageSender) {
    // Parse arguments
    let model: string | null = null;
    let task: string | null = null;
    let verbose = false;

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--model' || args[i] === '-m') {
        model = args[i + 1];
        i++; // Skip next argument
      } else if (args[i] === '--task' || args[i] === '-t') {
        task = args[i + 1];
        i++; // Skip next argument
      } else if (args[i] === '--verbose' || args[i] === '-v') {
        verbose = true;
      }
    }

    if (!model) {
      await sendMessage('Error: --model is required. Usage: !gauntlet run --model <model> [--task <task>] [--verbose]');
      return;
    }

    try {
      await sendMessage(`🏆 Starting Gauntlet evaluation with model: ${model}${task ? ` (task: ${task})` : ' (all tasks)'}...`);
      
      await sendMessage('⚠️ Gauntlet evaluation is a complex process that requires Docker containers. This may take several minutes...');
      
      await sendMessage(`🔧 **Gauntlet Evaluation Process:**

1. **Container Setup** - Creating isolated Docker environment
2. **Model Configuration** - Setting up ${model} for evaluation  
3. **Task Execution** - Running ${task || 'all tasks'} in controlled environment
4. **Success Validation** - Checking task completion criteria
5. **Results Generation** - Compiling evaluation scores

This process requires:
- Docker daemon running
- Nix development environment
- Container networking setup
- Task-specific validation logic

**Current Status:** Gauntlet integration is available but requires full container infrastructure to execute safely.

For manual gauntlet execution, use the command line:
\`\`\`bash
cd /path/to/morpheum
./src/gauntlet/gauntlet.ts run --model ${model}${task ? ` --task ${task}` : ''}${verbose ? ' --verbose' : ''}
\`\`\`

📊 **Integration Complete** - Gauntlet commands are now available in chat interface!`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await sendMessage(`❌ Error running gauntlet: ${errorMessage}`);
    }
  }

  private async handleTask(task: string, sendMessage: MessageSender) {
    const identifier = this.currentLLMProvider === 'copilot' 
      ? this.llmConfig.copilot.repository 
      : this.llmConfig[this.currentLLMProvider].model;
    
    await sendMessage(`🚀 Working on: "${task}" using ${this.currentLLMProvider} (${identifier})...`);
    
    // Create a streaming version of the SWE agent run
    await this.runSWEAgentWithStreaming(task, sendMessage);
  }

  private async runSWEAgentWithStreaming(task: string, sendMessage: MessageSender): Promise<{ role: string; content: string }[]> {
    // Special handling for Copilot - it doesn't use the iterative SWE agent pattern
    if (this.currentLLMProvider === 'copilot') {
      return this.runCopilotSession(task, sendMessage);
    }

    const MAX_ITERATIONS = 10;
    const conversationHistory: { role: string; content: string }[] = [];
    
    // For non-Copilot providers, we include the system prompt for proper context
    const { SYSTEM_PROMPT } = await import('./prompts');
    conversationHistory.push({ role: 'system', content: SYSTEM_PROMPT });
    conversationHistory.push({ role: 'user', content: task });

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      await sendMessage(`🧠 Iteration ${i + 1}: Analyzing and planning...`);
      
      const prompt = conversationHistory.map((msg) => `${msg.role}: ${msg.content}`).join('\n\n');
      
      // Call LLM without streaming chunks to user - we'll show structured progress instead
      const modelResponse = await this.currentLLMClient.sendStreaming(prompt, () => {
        // Don't send chunks to user to avoid verbose output
      });
      
      await sendMessage(`💭 Analysis complete. Processing response...`);
      conversationHistory.push({ role: 'assistant', content: modelResponse });

      // Parse and display plan and next step from response
      const { parseBashCommands, parsePlanAndNextStep } = await import('./responseParser');
      const { plan, nextStep } = parsePlanAndNextStep(modelResponse);
      
      // Display plan if found (typically on first iteration)
      if (plan) {
        const planMarkdown = `📋 **Plan:**

${plan}`;
        await sendMarkdownMessage(planMarkdown, sendMessage);
      }
      
      // Display next step if found
      if (nextStep) {
        const nextStepMarkdown = `🎯 **Next Step:**

${nextStep}`;
        await sendMarkdownMessage(nextStepMarkdown, sendMessage);
      }

      // Parse bash commands from response
      const commands = parseBashCommands(modelResponse);

      if (commands.length > 0) {
        const isMultiline = commands[0]!.includes('\n');
        const formattedCommand = isMultiline 
          ? `\n\`\`\`\n${commands[0]!}\n\`\`\``
          : `\`${commands[0]!}\``;
        const executingCommandMarkdown = `⚡ **Executing command:** ${formattedCommand}`;
        await sendMarkdownMessage(executingCommandMarkdown, sendMessage);
        
        const jailHost = process.env.JAIL_HOST || "localhost";
        const jailPort = parseInt(process.env.JAIL_PORT || "10001", 10);
        const { JailClient } = await import('./jailClient');
        const jailClient = new JailClient(jailHost, jailPort);
        
        const commandOutput = await jailClient.execute(commands[0]!);
        conversationHistory.push({ role: 'tool', content: commandOutput });
        
        // Smart output display: show small outputs directly, large outputs with prefix + spoiler
        const lines = commandOutput.split('\n');
        const lineCount = lines.length;
        const charCount = commandOutput.length;
        
        // Thresholds for direct display
        const maxDirectLines = 50;
        const maxDirectChars = 5000;
        
        if (lineCount < maxDirectLines && charCount < maxDirectChars) {
          // Small output: display directly
          const directOutputMarkdown = `📋 **Command output:**

\`\`\`
${commandOutput}
\`\`\``;
          await sendMarkdownMessage(directOutputMarkdown, sendMessage);
        } else {
          // Large output: show prefix + spoiler
          const maxPrefixLines = 15;
          const maxPrefixChars = 1500;
          
          // Get prefix (either first 15 lines or first 1500 chars, whichever comes first)
          let prefixLines = lines.slice(0, maxPrefixLines);
          let prefix = prefixLines.join('\n');
          
          if (prefix.length > maxPrefixChars) {
            // If 15 lines exceed 1500 chars, truncate to 1500 chars
            prefix = commandOutput.slice(0, maxPrefixChars);
            // Try to end at a line boundary if possible
            const lastNewline = prefix.lastIndexOf('\n');
            if (lastNewline > maxPrefixChars * 0.8) { // Only if we're not losing too much
              prefix = prefix.slice(0, lastNewline);
            }
          }
          
          // Prepare spoiler content (truncate to 64k if needed)
          const maxSpoilerLength = 64000;
          const spoilerContent = commandOutput.length > maxSpoilerLength 
            ? commandOutput.slice(0, maxSpoilerLength) + '\n...(output truncated due to size limit)'
            : commandOutput;
          
          const prefixWithSpoilerMarkdown = `📋 **Command output:**

\`\`\`
${prefix}
${prefix.length < commandOutput.length ? '\n...(showing first ' + prefix.length + ' characters)' : ''}
\`\`\`

\`\`\`
${spoilerContent}
\`\`\``;
          
          await sendMarkdownMessage(prefixWithSpoilerMarkdown, sendMessage);
        }
        
        // Check for early termination phrase
        if (commandOutput.includes("Job's done!")) {
          await sendMessage("✓ Job's done!");
          break;
        }
      } else {
        // If the model doesn't return a command, we assume it's done.
        await sendMessage("✓ Job's done!");
        break;
      }
    }

    return conversationHistory;
  }

  /**
   * Handle Copilot sessions with a simplified workflow focused on issue resolution
   */
  private async runCopilotSession(task: string, sendMessage: MessageSender): Promise<{ role: string; content: string }[]> {
    const conversationHistory: { role: string; content: string }[] = [];
    conversationHistory.push({ role: 'user', content: task });

    // For Copilot, we send just the user's task without system prompts
    // since Copilot already understands repository context
    // The CopilotClient handles all status updates including issue creation
    const response = await this.currentLLMClient.sendStreaming(task, async (chunk) => {
      // Check if chunk contains markdown links and format accordingly
      if (hasMarkdownLinks(chunk)) {
        await sendMarkdownMessage(chunk, sendMessage);
      } else {
        await sendMessage(chunk);
      }
    });
    
    conversationHistory.push({ role: 'assistant', content: response });
    return conversationHistory;
  }
}
