import { LLMClient } from './llmClient';
export declare class OllamaClient implements LLMClient {
    private readonly apiUrl;
    private readonly model;
    constructor(apiUrl: string, model: string);
    send(prompt: string): Promise<string>;
    sendStreaming(prompt: string, onChunk: (chunk: string) => void): Promise<string>;
}
//# sourceMappingURL=ollamaClient.d.ts.map