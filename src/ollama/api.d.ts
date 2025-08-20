/**
 * A server that can respond to prompts using a specific Ollama model.
 */
export declare class ModelServer {
    private readonly ollama;
    private readonly model;
    /**
     * @param url The URL of the Ollama server.
     * @param model The name of the model to use.
     */
    constructor(url: URL, model: string);
    /**
     * Responds to a prompt.
     * @param prompt The prompt to respond to.
     * @returns The model's response.
     */
    respond(prompt: string): Promise<string>;
}
/**
 * Creates a new ModelServer.
 * @param url The URL of the Ollama server.
 * @param model The name of the model to use.
 * @returns A new ModelServer instance.
 */
export declare function createModelServer(url: URL, model: string): ModelServer;
//# sourceMappingURL=api.d.ts.map