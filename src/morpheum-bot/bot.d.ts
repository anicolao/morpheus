type MessageSender = (message: string, html?: string) => Promise<void>;
export declare class MorpheumBot {
    private sweAgent;
    private currentLLMClient;
    private currentLLMProvider;
    private llmConfig;
    constructor();
    private createCurrentLLMClient;
    processMessage(body: string, sender: string, sendMessage: MessageSender): Promise<any>;
    private handleCreateCommand;
    private handleInfoCommand;
    private handleLLMCommand;
    private handleDirectOpenAICommand;
    private handleDirectOllamaCommand;
    private handleTask;
}
export {};
//# sourceMappingURL=bot.d.ts.map