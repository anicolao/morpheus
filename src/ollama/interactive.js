#!/usr/bin/env node
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
const api_1 = require("./api");
const readline = __importStar(require("readline"));
const url_1 = require("url");
const DEFAULT_BASE_URL = 'http://localhost:11434';
/**
 * Parses command-line arguments to get the base URL and model name.
 * @returns An object containing the baseUrl and model name.
 */
function parseArgs() {
    const args = process.argv.slice(2);
    let baseUrl = DEFAULT_BASE_URL;
    let model = null;
    for (let i = 0; i < args.length; i++) {
        if ((args[i] === '--url' || args[i] === '-u') && i + 1 < args.length) {
            baseUrl = args[i + 1];
            i++;
        }
        else if ((args[i] === '--model' || args[i] === '-m') && i + 1 < args.length) {
            model = args[i + 1];
            i++;
        }
        else {
            console.error(`Unknown argument: ${args[i]}`);
            printUsageAndExit();
        }
    }
    if (!model) {
        console.error('Error: Model name is a required parameter.');
        printUsageAndExit();
    }
    return { baseUrl, model };
}
/**
 * Prints the script's usage instructions and exits.
 */
function printUsageAndExit() {
    console.log('\nUsage:');
    console.log('  cat your_prompt.txt | ts-node src/ollama/interactive.ts --model <model-name> [--url <base-url>]');
    console.log('\nOptions:');
    console.log('  -m, --model <model-name>  The name of the Ollama model to use (required).');
    console.log(`  -u, --url   <base-url>    The URL of the Ollama server (default: "${DEFAULT_BASE_URL}").`);
    process.exit(1);
}
/**
 * Main function to run the interactive prompt session.
 */
async function main() {
    const { baseUrl, model } = parseArgs();
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false, // Operate in non-terminal mode to handle piped input
    });
    let prompt = '';
    rl.on('line', (line) => {
        prompt += line + '\n';
    });
    rl.on('close', async () => {
        const trimmedPrompt = prompt.trim();
        if (trimmedPrompt === '') {
            console.error("Error: No prompt provided via stdin.");
            process.exit(1);
        }
        try {
            const server = (0, api_1.createModelServer)(new url_1.URL(baseUrl), model);
            const response = await server.respond(trimmedPrompt);
            process.stdout.write(response);
        }
        catch (error) {
            console.error(`Error: Could not connect to Ollama server at ${baseUrl}.`);
            console.error('Please ensure the server is running and the URL is correct.');
            process.exit(1);
        }
    });
}
main();
//# sourceMappingURL=interactive.js.map