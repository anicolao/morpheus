import * as net from "net";

export class JailClient {
  constructor(
    private readonly address: string,
    private readonly port: number,
  ) {}

  execute(command: string): Promise<string> {
    console.log(`--- JAIL REQUEST (${this.address}:${this.port}) ---`);
    console.log(command);
    console.log("-------------------- ");
    return new Promise((resolve, reject) => {
      const client = new net.Socket();
      let output = "";
      const EOC_MARKER = "COMMAND_ENDED_EOC";

      client.connect(this.port, this.address, () => {
        client.write(`${command}\necho \"${EOC_MARKER}\"\n`);
      });

      client.on("data", (data) => {
        const chunk = data.toString();
        if (chunk.includes(EOC_MARKER)) {
          output += chunk.substring(0, chunk.indexOf(EOC_MARKER));
          client.end();
        } else {
          output += chunk;
        }
      });

      client.on("close", () => {
        const trimmedOutput = output.trim();
        console.log(`--- JAIL RESPONSE (${this.address}:${this.port}) ---`);
        console.log(
          trimmedOutput
            .split("\n")
            .map((line) => `  ${line}`)
            .join("\n"),
        );
        console.log("---------------------");
        resolve(trimmedOutput);
      });

      client.on("error", (err) => {
        console.error(`Error in jail client: ${err.message}`);
        reject(err);
      });
    });
  }
}
