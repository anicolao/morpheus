import { Ollama } from 'ollama';

/**
 * A server that can respond to prompts using a specific Ollama model.
 */
export class ModelServer {
  private readonly ollama: Ollama;
  private readonly model: string;

  /**
   * @param url The URL of the Ollama server.
   * @param model The name of the model to use.
   */
  constructor(url: URL, model: string) {
    this.ollama = new Ollama({ host: url.toString() });
    this.model = model;
  }

  /**
   * Responds to a prompt.
   * @param prompt The prompt to respond to.
   * @returns The model's response.
   */
  async respond(prompt: string): Promise<string> {
    try {
      const response = await this.ollama.chat({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
      });
      return response.message.content;
    } catch (error) {
      console.error('Error responding to prompt:', error);
      throw error;
    }
  }
}

/**
 * Creates a new ModelServer.
 * @param url The URL of the Ollama server.
 * @param model The name of the model to use.
 * @returns A new ModelServer instance.
 */
export function createModelServer(url: URL, model: string): ModelServer {
  return new ModelServer(url, model);
}
