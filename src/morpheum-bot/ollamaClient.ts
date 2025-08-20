import { LLMClient } from './llmClient';

export class OllamaClient implements LLMClient {
  constructor(private readonly apiUrl: string, private readonly model: string) {}

  async send(prompt: string): Promise<string> {
    console.log(`--- OLLAMA REQUEST (${this.model} @ ${this.apiUrl}) ---`);
    console.log(prompt.split('\n').map(line => `  ${line}`).join('\n'));
    console.log("----------------------");
    const response = await fetch(`${this.apiUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log(`--- OLLAMA RESPONSE (${this.model} @ ${this.apiUrl}) ---`);
    console.log(data.response.split('\n').map(line => `  ${line}`).join('\n'));
    console.log("-----------------------");
    return data.response;
  }
}
