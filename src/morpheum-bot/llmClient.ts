/**
 * Common interface for LLM clients (OpenAI, Ollama, etc.)
 */
export interface LLMClient {
  /**
   * Send a prompt to the LLM and get a response
   * @param prompt The text prompt to send
   * @returns Promise that resolves to the LLM's response
   */
  send(prompt: string): Promise<string>;
}

/**
 * Configuration for different LLM providers
 */
export interface LLMConfig {
  provider: 'openai' | 'ollama';
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

/**
 * Factory function to create LLM clients based on configuration
 */
export async function createLLMClient(config: LLMConfig): Promise<LLMClient> {
  switch (config.provider) {
    case 'openai':
      const { OpenAIClient } = await import('./openai');
      if (!config.apiKey) {
        throw new Error('OpenAI API key is required');
      }
      return new OpenAIClient(
        config.apiKey,
        config.model || 'gpt-3.5-turbo',
        config.baseUrl || 'https://api.openai.com/v1'
      );
    
    case 'ollama':
      const { OllamaClient } = await import('./ollamaClient');
      return new OllamaClient(
        config.baseUrl || 'http://localhost:11434',
        config.model || 'morpheum-local'
      );
    
    default:
      throw new Error(`Unsupported LLM provider: ${(config as any).provider}`);
  }
}