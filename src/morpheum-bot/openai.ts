import { type LLMClient } from './llmClient';
import { type LLMMetrics, MetricsTracker, estimateTokens } from './metrics';

export class OpenAIClient implements LLMClient {
  private metricsTracker = new MetricsTracker();

  constructor(
    private readonly apiKey: string,
    private readonly model: string = 'gpt-3.5-turbo',
    private readonly baseUrl: string = 'https://api.openai.com/v1'
  ) {}

  getMetrics(): LLMMetrics | null {
    return this.metricsTracker.getMetrics();
  }

  resetMetrics(): void {
    this.metricsTracker.reset();
  }

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
    
    // Track metrics - OpenAI provides token usage in response
    const inputTokens = data.usage?.prompt_tokens || estimateTokens(prompt);
    const outputTokens = data.usage?.completion_tokens || estimateTokens(content);
    this.metricsTracker.addRequest(inputTokens, outputTokens);
    
    console.log(`--- OPENAI RESPONSE (${this.model} @ ${this.baseUrl}) ---`);
    console.log(content.split('\n').map((line: string) => `  ${line}`).join('\n'));
    console.log("-----------------------");
    
    return content;
  }

  async sendStreaming(prompt: string, onChunk: (chunk: string) => void): Promise<string> {
    console.log(`--- OPENAI STREAMING REQUEST (${this.model} @ ${this.baseUrl}) ---`);
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
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenAI API request failed with status ${response.status}: ${errorData}`);
    }

    let fullContent = '';
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('Response body is not readable');
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            
            if (data === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              
              if (content) {
                fullContent += content;
                onChunk(content);
              }
            } catch (e) {
              // Skip invalid JSON lines
              console.warn('Failed to parse OpenAI streaming response line:', data);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
    
    // Track metrics for streaming - estimate tokens since OpenAI streaming doesn't provide usage
    const inputTokens = estimateTokens(prompt);
    const outputTokens = estimateTokens(fullContent);
    this.metricsTracker.addRequest(inputTokens, outputTokens);
    
    console.log(`--- OPENAI STREAMING RESPONSE COMPLETE (${this.model} @ ${this.baseUrl}) ---`);
    console.log(fullContent.split('\n').map(line => `  ${line}`).join('\n'));
    console.log("-----------------------");
    
    return fullContent;
  }
}

// Legacy function for backward compatibility
export async function sendOpenAIRequest(prompt: string, apiKey: string): Promise<string> {
  const client = new OpenAIClient(apiKey);
  return client.send(prompt);
}
