# Jailed Agent Environment

This directory contains the scripts and configuration to create isolated, containerized shell environments for AI agents.

## Quick Start

### 1. Enter the Development Environment

From the `jail/` directory, enter the Nix shell. This provides all necessary tools (`colima`, `docker`) and automatically configures Docker to connect to the Colima daemon.

```shell
nix develop
```
You should see a message confirming that `DOCKER_HOST` has been set.

### 2. Start Colima

Once inside the Nix shell, start the Colima VM if it's not already running.

```shell
colima start
```

### 3. Run a Jailed Container

Use the `run.sh` script to launch a jailed environment. This script pulls a standard Nix container and installs the required tools on the first run.

**Example:**

```shell
# Launch a container named "jail-1" on ports 10001 (agent) and 20001 (monitor)
./run.sh jail-1 10001 20001
```
*Note: It may take a minute for the tools to be installed inside the container the first time you run it.*

### 4. Interact with the Jail

You can now interact with the container from your host machine.

#### Programmatic Control (Agent Port)

Use the `agent.ts` script to send commands to `localhost` and receive their output.

```shell
# Run a command in jail-1
bun agent.ts 10001 "bun --version"

# Run another command
bun agent.ts 10001 "ls -la"
```

#### Interactive Monitoring (Monitoring Port)

You can send "fire-and-forget" commands to the monitoring port and attach to a `dtach` session inside the container to observe the output.

1.  **Send a command:**
    ```shell
    echo "echo 'Hello from the monitor'" | ncat localhost 20001
    ```

2.  **Watch the output:**
    ```shell
    # SSH into the Colima VM first
    colima ssh

    # Then, exec into the container and attach to the dtach session
    docker exec -it jail-1 dtach -a /tmp/mysession.dtach
    ```
