export class OllamaClient {
  constructor(private readonly apiUrl: string, private readonly model: string) {}

  async send(prompt: string): Promise<string> {
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
    return data.response;
  }
}
