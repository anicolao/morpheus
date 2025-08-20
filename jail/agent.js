"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const net = __importStar(require("net"));
async function runCommand(port, command) {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();
        let output = "";
        // A unique string to signal the end of command output
        const EOC_MARKER = "COMMAND_ENDED_EOC";
        client.connect(port, "localhost", () => {
            console.log(`[Agent] Connected to jail at localhost:${port}.`);
            // Append a marker to detect when the command is finished
            client.write(`${command}\necho '${EOC_MARKER}'\n`);
        });
        client.on("data", (data) => {
            const chunk = data.toString();
            if (chunk.includes(EOC_MARKER)) {
                // Command is done, clean up the output and resolve
                output += chunk.substring(0, chunk.indexOf(EOC_MARKER));
                client.end();
            }
            else {
                output += chunk;
            }
        });
        client.on("close", () => {
            console.log("[Agent] Connection closed.");
            // With a non-interactive shell, we just need to trim the final output.
            resolve(output.trim());
        });
        client.on("error", (err) => {
            reject(err);
        });
    });
}
// Example usage from the command line
async function main() {
    const port = parseInt(process.argv[2], 10);
    const command = process.argv[3];
    if (!port || !command) {
        console.error('Usage: bun agent.ts <port> "<command>"');
        process.exit(1);
    }
    try {
        console.log(`[Agent] Sending command: "${command}"`);
        const result = await runCommand(port, command);
        console.log("--- Command Output ---");
        console.log(result);
        console.log("----------------------");
    }
    catch (error) {
        console.error("An error occurred:", error);
    }
}
main();
//# sourceMappingURL=agent.js.map