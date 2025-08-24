import { type LLMClient } from './llmClient';
import { type LLMMetrics, MetricsTracker, estimateTokens } from './metrics';

export class OllamaClient implements LLMClient {
  private metricsTracker = new MetricsTracker();

  constructor(private readonly apiUrl: string, private readonly model: string) {}

  getMetrics(): LLMMetrics | null {
    return this.metricsTracker.getMetrics();
  }

  resetMetrics(): void {
    this.metricsTracker.reset();
  }

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
    
    // Track metrics - Ollama may provide token counts in response
    const inputTokens = data.prompt_eval_count || estimateTokens(prompt);
    const outputTokens = data.eval_count || estimateTokens(data.response);
    this.metricsTracker.addRequest(inputTokens, outputTokens);
    
    console.log(`--- OLLAMA RESPONSE (${this.model} @ ${this.apiUrl}) ---`);
    console.log(data.response.split('\n').map((line: string) => `  ${line}`).join('\n'));
    console.log("-----------------------");
    return data.response;
  }

  async sendStreaming(prompt: string, onChunk: (chunk: string) => void): Promise<string> {
    console.log(`--- OLLAMA STREAMING REQUEST (${this.model} @ ${this.apiUrl}) ---`);
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
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API request failed with status ${response.status}`);
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
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            
            if (parsed.response) {
              fullContent += parsed.response;
              onChunk(parsed.response);
            }
            
            // Check if this is the final chunk
            if (parsed.done) {
              break;
            }
          } catch (e) {
            // Skip invalid JSON lines
            console.warn('Failed to parse Ollama streaming response line:', line);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
    
    // Track metrics for streaming - estimate since Ollama streaming may not include token counts
    const inputTokens = estimateTokens(prompt);
    const outputTokens = estimateTokens(fullContent);
    this.metricsTracker.addRequest(inputTokens, outputTokens);
    
    console.log(`--- OLLAMA STREAMING RESPONSE COMPLETE (${this.model} @ ${this.apiUrl}) ---`);
    console.log(fullContent.split('\n').map(line => `  ${line}`).join('\n'));
    console.log("-----------------------");
    
    return fullContent;
  }
}
