import * as net from 'net';

export class JailClient {
  constructor(private readonly address: string, private readonly port: number) {}

  execute(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const client = new net.Socket();
      let output = '';
      const EOC_MARKER = 'COMMAND_ENDED_EOC';

      client.connect(this.port, this.address, () => {
        client.write(`${command}; echo "${EOC_MARKER}"
`);
      });

      client.on('data', (data) => {
        const chunk = data.toString();
        if (chunk.includes(EOC_MARKER)) {
          output += chunk.substring(0, chunk.indexOf(EOC_MARKER));
          client.end();
        } else {
          output += chunk;
        }
      });

      client.on('close', () => {
        resolve(output.trim());
      });

      client.on('error', (err) => {
        reject(err);
      });
    });
  }
}
