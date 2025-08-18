import { JailClient } from './jailClient';
import { describe, it } from 'vitest';
import { assert } from 'chai';
import * as net from 'net';

describe('JailClient', () => {
  it('should send a command to a mock TCP server and receive a response', async () => {
    const server = net.createServer((socket) => {
      socket.on('data', (data) => {
        const command = data.toString();
        if (command.includes('test command')) {
          socket.write('Command output\nCOMMAND_ENDED_EOC\n');
        }
        socket.end();
      });
    });

    await new Promise<void>((resolve) => server.listen(12345, 'localhost', resolve));

    const client = new JailClient('localhost', 12345);
    const response = await client.execute('test command');

    assert.equal(response, 'Command output');

    server.close();
  });
});
