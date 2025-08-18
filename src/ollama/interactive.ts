#!/usr/bin/env node

import { createModelServer } from './api';
import * as readline from 'readline';
import { URL } from 'url';

const DEFAULT_BASE_URL = 'http://localhost:11434';

/**
 * Parses command-line arguments to get the base URL and model name.
 * @returns An object containing the baseUrl and model name.
 */
function parseArgs(): { baseUrl: string; model: string } {
  const args = process.argv.slice(2);
  let baseUrl = DEFAULT_BASE_URL;
  let model: string | null = null;

  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '--url' || args[i] === '-u') && i + 1 < args.length) {
      baseUrl = args[i + 1];
      i++;
    } else if ((args[i] === '--model' || args[i] === '-m') && i + 1 < args.length) {
      model = args[i + 1];
      i++;
    } else {
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
function printUsageAndExit(): void {
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
      const server = createModelServer(new URL(baseUrl), model);
      const response = await server.respond(trimmedPrompt);
      process.stdout.write(response);
    } catch (error) {
      console.error(`Error: Could not connect to Ollama server at ${baseUrl}.`);
      console.error('Please ensure the server is running and the URL is correct.');
      process.exit(1);
    }
  });
}

main();
