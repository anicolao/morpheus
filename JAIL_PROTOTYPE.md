# Creating a Jailed Agentic Environment for the Morpheum Project

## Introduction

Inspired by mini-SWE-Agent, I wanted to create a contained shell environment for use as a highly generic programming environment for an agentic AI. This containerized effort is the first attempt to bring this to life for the Morpheum project. I will then try to use the environment to get an agent to check this into the underlying repository.

## Overview

This guide details how to create multiple, isolated, and jailed shell environments using **Nix**, **Colima**, and **Docker** on macOS. The goal is to produce containerized shells that can be controlled remotely, with full support for capturing command output.

The environment exposes two ports per container:
1.  **Agent Port:** A port for programmatic, two-way communication. Each connection starts a new, clean shell, and the output is streamed back to the client.
2.  **Monitoring Port:** A port for sending one-way commands to a single, persistent shell that can be observed with `dtach` for debugging.

---

### Step 1: Define the Environment with `flake.nix`

This `flake.nix` now defines a more advanced container that runs two `socat` services. It also adds TypeScript to the host's `devShell` for the agent script.

```nix
# flake.nix
{
  description = "A Nix-built, jailed container environment for the Morpheum project";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = nixpkgs.legacyPackages.${system};

      # This script runs when a container starts. It launches two services.
      entrypoint = pkgs.writeShellScriptBin "entrypoint.sh" ''
        #!${pkgs.stdenv.shell}
        AGENT_PORT="''${AGENT_PORT:-12001}"
        MONITOR_PORT="''${MONITOR_PORT:-12002}"
        FIFO=/tmp/command.pipe
        mkfifo $FIFO

        echo "✅ Jailed services starting in container..."

        # --- Service 1: Monitoring Port ---
        # A persistent shell for interactive monitoring via dtach.
        echo "   -> Monitoring service starting on port $MONITOR_PORT"
        ${pkgs.dtach}/bin/dtach -n /tmp/mysession.dtach ${pkgs.bash}/bin/bash -c "tail -f $FIFO | ${pkgs.bash}/bin/bash"
        ${pkgs.socat}/bin/socat TCP-LISTEN:$MONITOR_PORT,fork,reuseaddr FILE:$FIFO,create &

        # --- Service 2: Agent Port ---
        # Forks a new, interactive bash shell for each connection. This is for the agent.
        echo "   -> Agent service starting on port $AGENT_PORT"
        exec ${pkgs.socat}/bin/socat TCP-LISTEN:$AGENT_PORT,fork,reuseaddr EXEC:"${pkgs.bash}/bin/bash -li",pty,stderr,setsid,ctty
      '';

    in {
      packages.default = pkgs.dockerTools.buildImage {
        name = "jailed-nix-env";
        tag = "latest";
        contents = [ pkgs.bun pkgs.coreutils pkgs.dtach pkgs.socat pkgs.bash ];
        runAsRoot = ''
          #!${pkgs.stdenv.shell}
          mkdir -p /bin
          cp ${entrypoint}/bin/entrypoint.sh /bin/
          exec /bin/entrypoint.sh
        '';
      };

      devShells.default = pkgs.mkShell {
        packages = with pkgs; [ colima docker nmap typescript ts-node ];
      };
    });
}
```

---

### Step 2: Start the VM with Port Forwarding

This script forwards two port ranges: **10000s** for the agent and **20000s** for monitoring.

```shell
# Enter the management shell
nix develop

# Prepare and run the `colima start` command
AGENT_PORTS=5
MONITOR_PORTS=5
COLIMA_ARGS=""

# Forward agent ports (e.g., Mac :10001 -> VM :11001)
for i in $(seq 1 $AGENT_PORTS); do
  HOST_PORT=$((10000 + i))
  VM_PORT=$((11000 + i))
  COLIMA_ARGS="$COLIMA_ARGS --port $HOST_PORT:$VM_PORT"
done

# Forward monitoring ports (e.g., Mac :20001 -> VM :21001)
for i in $(seq 1 $MONITOR_PORTS); do
  HOST_PORT=$((20000 + i))
  VM_PORT=$((21000 + i))
  COLIMA_ARGS="$COLIMA_ARGS --port $HOST_PORT:$VM_PORT"
done

echo "Starting Colima and forwarding ports..."
colima start ${COLIMA_ARGS:1}
```

---

### Step 3: Build and Load the Docker Image

This step is the same. Build the image with Nix and load it into Docker.

```shell
nix build .#default
docker load < result
```

---

### Step 4: Run a Jailed Container

Run a container, publishing both the agent and monitoring ports.

```shell
# Launch a container named "jail-1"
docker run -d --rm \
  -p 11001:12001 \
  -p 21001:12002 \
  -e AGENT_PORT=12001 \
  -e MONITOR_PORT=12002 \
  --name jail-1 \
  jailed-nix-env:latest
```
* **Agent traffic path:** Mac `:10001` → VM `:11001` → Container `:12001`
* **Monitor traffic path:** Mac `:20001` → VM `:21001` → Container `:12002`

---

### Step 5: Interact with the Jail

You now have two ways to interact with the container.

#### A) Interactive Monitoring with `dtach`

This uses the **monitoring port** (`20001`) to send fire-and-forget commands. You can then attach to the `dtach` session to see the cumulative output.

1.  **Send a command:**
    ```shell
    echo "echo 'Running a long process...'; sleep 5; echo 'Done.'" | ncat localhost 20001
    ```
2.  **Watch the output:**
    ```shell
    # First, SSH into the Colima VM
    colima ssh

    # Then, exec into the container and attach to the dtach session
    docker exec -it jail-1 dtach -a /tmp/mysession.dtach
    ```

#### B) Programmatic Control and Output Capture

This uses the **agent port** (`10001`) for two-way communication. Each connection gets a fresh shell.

Create a file named `agent.ts` to act as your command sender:

```typescript
// agent.ts
import * as net from 'net';

async function runCommand(port: number, command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    let output = '';
    // A unique string to signal the end of command output
    const EOC_MARKER = 'COMMAND_ENDED_EOC';

    client.connect(port, 'localhost', () => {
      console.log(`[Agent] Connected to jail on port ${port}.`);
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
      // Remove the initial shell prompt and the command itself from the output
      const lines = output.split('\n');
      const cleanOutput = lines.slice(1, -1).join('\n').trim();
      resolve(cleanOutput);
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
    console.error('Usage: npx ts-node agent.ts <port> "<command>"');
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
```

Now, you can programmatically execute commands and capture their output:
```shell
# Run the TypeScript agent to interact with jail-1
npx ts-node agent.ts 10001 "bun --version"
npx ts-node agent.ts 10001 "ls -la"
```