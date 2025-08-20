"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelServer = void 0;
exports.createModelServer = createModelServer;
const ollama_1 = require("ollama");
/**
 * A server that can respond to prompts using a specific Ollama model.
 */
class ModelServer {
    ollama;
    model;
    /**
     * @param url The URL of the Ollama server.
     * @param model The name of the model to use.
     */
    constructor(url, model) {
        this.ollama = new ollama_1.Ollama({ host: url.toString() });
        this.model = model;
    }
    /**
     * Responds to a prompt.
     * @param prompt The prompt to respond to.
     * @returns The model's response.
     */
    async respond(prompt) {
        try {
            const response = await this.ollama.chat({
                model: this.model,
                messages: [{ role: 'user', content: prompt }],
            });
            return response.message.content;
        }
        catch (error) {
            console.error('Error responding to prompt:', error);
            throw error;
        }
    }
}
exports.ModelServer = ModelServer;
/**
 * Creates a new ModelServer.
 * @param url The URL of the Ollama server.
 * @param model The name of the model to use.
 * @returns A new ModelServer instance.
 */
function createModelServer(url, model) {
    return new ModelServer(url, model);
}
//# sourceMappingURL=api.js.map