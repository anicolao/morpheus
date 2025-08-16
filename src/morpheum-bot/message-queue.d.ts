import { MatrixClient } from "matrix-bot-sdk";
export declare const messageQueue: {
    roomId: string;
    content: any;
}[] & {
    clear?: () => void;
};
export declare function startMessageQueue(client: MatrixClient): void;
export declare function stopMessageQueue(): void;
export declare function queueMessage(roomId: string, content: any): void;
//# sourceMappingURL=message-queue.d.ts.map