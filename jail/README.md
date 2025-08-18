# Jailed Agent Environment

This directory contains the scripts and configuration to create isolated, containerized shell environments for AI agents.

## Quick Start

### 1. Enter the Development Environment

From the `jail/` directory, enter the Nix shell. This provides all necessary tools and automatically configures Docker to connect to Colima.

```shell
nix develop
```
You should see a message confirming that `DOCK-ER_HOST` has been set.

### 2. Start Colima

Once inside the Nix shell, start the Colima VM if it's not already running.

```shell
colima start
```

### 3. Run a Jailed Container

Now you can launch one or more jailed environments. Use the `run.sh` script, providing a unique name, an agent port, and a monitoring port. This script will pull a standard Nix container and install the required tools on the first run.

**Example:**

```shell
# Launch a container named "jail-1"
# Agent port: 10001
# Monitoring port: 20001
./run.sh jail-1 10001 20001

# Launch another container named "jail-2"
# Agent port: 10002
# Monitoring port: 20002
./run.sh jail-2 10002 20002
```
*Note: It may take a minute for the tools to be installed inside the container the first time you run it.*

### 4. Find the Colima IP Address

The agent script needs the IP address of the Colima VM to connect to the jailed containers. Find it by running:

```shell
colima status
```
Look for the `address:` field in the output (e.g., `192.168.106.2`).

### 5. Interact with the Jail

You can interact with the jailed containers in two ways:

#### Programmatic Control (Agent Port)

Use the `agent.ts` script with the Colima IP address to send commands and receive their output. This is the primary way an AI agent will interact with the environment.

```shell
# Get the Colima IP address
COLIMA_IP=$(colima status | grep 'address:' | awk '{print $2}')

# Run a command in jail-1
bun agent.ts $COLIMA_IP 10001 "bun --version"

# Run a command in jail-2
bun agent.ts $COLIMA_IP 10002 "ls -la"
```

#### Interactive Monitoring (Monitoring Port)

You can send "fire-and-forget" commands to the monitoring port. Note that this still connects to `localhost`.

1.  **Send a command:**
    ```shell
    echo "echo 'Hello from the monitor'" | ncat localhost 20001
    ```

2.  **Watch the output:**
    ```shell
    # SSH into the Colima VM
    colima ssh

    # Exec into the container and attach to the dtach session
    docker exec -it jail-1 dtach -a /tmp/mysession.dtach
    ```