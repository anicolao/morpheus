import { LLMClient } from './llmClient';
export declare class OpenAIClient implements LLMClient {
    private readonly apiKey;
    private readonly model;
    private readonly baseUrl;
    constructor(apiKey: string, model?: string, baseUrl?: string);
    send(prompt: string): Promise<string>;
    sendStreaming(prompt: string, onChunk: (chunk: string) => void): Promise<string>;
}
export declare function sendOpenAIRequest(prompt: string, apiKey: string): Promise<string>;
//# sourceMappingURL=openai.d.ts.map