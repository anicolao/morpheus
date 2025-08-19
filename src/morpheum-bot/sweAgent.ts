import { OllamaClient } from './ollamaClient';
import { JailClient } from './jailClient';
import { parseBashCommands } from './responseParser';
import { SYSTEM_PROMPT } from './prompts';

export class SWEAgent {
  private conversationHistory: { role: string; content: string }[] = [];

  constructor(
    private readonly ollamaClient: OllamaClient,
    private readonly jailClient: JailClient
  ) {
    this.conversationHistory.push({ role: 'system', content: SYSTEM_PROMPT });
  }

  async run(task: string): Promise<{ role: string; content: string }[]> {
    this.conversationHistory.push({ role: 'user', content: task });

    const modelResponse = await this.ollamaClient.send(this.getPrompt());
    this.conversationHistory.push({ role: 'assistant', content: modelResponse });

    const commands = parseBashCommands(modelResponse);

    if (commands.length > 0) {
      const commandOutput = await this.jailClient.execute(commands[0]);
      this.conversationHistory.push({ role: 'tool', content: commandOutput });
    }

    return this.conversationHistory;
  }

  private getPrompt(): string {
    return this.conversationHistory.map((msg) => `${msg.role}: ${msg.content}`).join('\n\n');
  }
}
