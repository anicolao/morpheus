export declare class JailClient {
    private readonly address;
    private readonly port;
    constructor(address: string, port: number);
    execute(command: string): Promise<string>;
}
//# sourceMappingURL=jailClient.d.ts.map