import * as net from 'net';

async function runCommand(port: number, command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    let output = '';
    // A unique string to signal the end of command output
    const EOC_MARKER = 'COMMAND_ENDED_EOC';

    client.connect(port, 'localhost', () => {
      console.log(`[Agent] Connected to jail at localhost:${port}.`);
      // Append a marker to detect when the command is finished
      client.write(`${command}; echo "${EOC_MARKER}"\n`);
    });

    client.on('data', (data) => {
      const chunk = data.toString();
      if (chunk.includes(EOC_MARKER)) {
        // Command is done, clean up the output and resolve
        output += chunk.substring(0, chunk.indexOf(EOC_MARKER));
        client.end();
      } else {
        output += chunk;
      }
    });

    client.on('close', () => {
      console.log('[Agent] Connection closed.');
      // With a non-interactive shell, we just need to trim the final output.
      resolve(output.trim());
    });

    client.on('error', (err) => {
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
    console.log('--- Command Output ---');
    console.log(result);
    console.log('----------------------');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();