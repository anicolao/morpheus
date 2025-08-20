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
    /**
     * Send a prompt to the LLM with streaming support
     * @param prompt The text prompt to send
     * @param onChunk Callback function called for each chunk of the response
     * @returns Promise that resolves to the complete LLM response
     */
    sendStreaming(prompt: string, onChunk: (chunk: string) => void): Promise<string>;
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
export declare function createLLMClient(config: LLMConfig): Promise<LLMClient>;
//# sourceMappingURL=llmClient.d.ts.map