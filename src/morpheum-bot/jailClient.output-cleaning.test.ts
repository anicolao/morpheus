import { JailClient } from './jailClient';
import { describe, it } from 'vitest';
import { assert } from 'chai';
import * as net from 'net';

describe('JailClient Output Cleaning', () => {
  it('should properly clean output with non-interactive bash simulation', async () => {
    const server = net.createServer((socket) => {
      socket.on('data', (data) => {
        const command = data.toString();
        if (command.includes('echo "hello world"')) {
          // Simulate the actual output we would get from non-interactive bash
          socket.write('hello world\nCOMMAND_ENDED_EOC\n');
        }
        socket.end();
      });
    });

    await new Promise<void>((resolve) => server.listen(12346, 'localhost', resolve));

    const client = new JailClient('localhost', 12346);
    const response = await client.execute('echo "hello world"');

    // Should have clean output without any bash prompts or artifacts
    assert.equal(response, 'hello world');

    server.close();
  });

  it('should handle multiline output correctly', async () => {
    const server = net.createServer((socket) => {
      socket.on('data', (data) => {
        const command = data.toString();
        if (command.includes('multiline')) {
          // Simulate multiline output
          socket.write('line 1\nline 2\nline 3\nCOMMAND_ENDED_EOC\n');
        }
        socket.end();
      });
    });

    await new Promise<void>((resolve) => server.listen(12347, 'localhost', resolve));

    const client = new JailClient('localhost', 12347);
    const response = await client.execute('multiline');

    assert.equal(response, 'line 1\nline 2\nline 3');

    server.close();
  });

  it('should handle output with trailing whitespace correctly', async () => {
    const server = net.createServer((socket) => {
      socket.on('data', (data) => {
        const command = data.toString();
        if (command.includes('whitespace')) {
          // Simulate output with trailing whitespace
          socket.write('output with spaces   \n  \nCOMMAND_ENDED_EOC\n');
        }
        socket.end();
      });
    });

    await new Promise<void>((resolve) => server.listen(12348, 'localhost', resolve));

    const client = new JailClient('localhost', 12348);
    const response = await client.execute('whitespace');

    // Should trim trailing whitespace
    assert.equal(response, 'output with spaces');

    server.close();
  });
});