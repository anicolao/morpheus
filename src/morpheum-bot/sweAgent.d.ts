import { LLMClient } from './llmClient';
import { JailClient } from './jailClient';
export declare class SWEAgent {
    private readonly llmClient;
    private readonly jailClient;
    private conversationHistory;
    constructor(llmClient: LLMClient, jailClient: JailClient);
    run(task: string): Promise<{
        role: string;
        content: string;
    }[]>;
    private getPrompt;
}
//# sourceMappingURL=sweAgent.d.ts.map