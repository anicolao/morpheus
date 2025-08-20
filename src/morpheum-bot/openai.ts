import { LLMClient } from './llmClient';

export class OpenAIClient implements LLMClient {
  constructor(
    private readonly apiKey: string,
    private readonly model: string = 'gpt-3.5-turbo',
    private readonly baseUrl: string = 'https://api.openai.com/v1'
  ) {}

  async send(prompt: string): Promise<string> {
    console.log(`--- OPENAI REQUEST (${this.model} @ ${this.baseUrl}) ---`);
    console.log(prompt.split('\n').map(line => `  ${line}`).join('\n'));
    console.log("----------------------");
    
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenAI API request failed with status ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    console.log(`--- OPENAI RESPONSE (${this.model} @ ${this.baseUrl}) ---`);
    console.log(content.split('\n').map(line => `  ${line}`).join('\n'));
    console.log("-----------------------");
    
    return content;
  }
}

// Legacy function for backward compatibility
export async function sendOpenAIRequest(prompt: string, apiKey: string): Promise<string> {
  const client = new OpenAIClient(apiKey);
  return client.send(prompt);
}
