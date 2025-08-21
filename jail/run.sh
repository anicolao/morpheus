#!/bin/bash
set -e

JAIL_NAME=$1
AGENT_PORT_HOST=$2
MONITOR_PORT_HOST=$3

if [ -z "$JAIL_NAME" ] || [ -z "$AGENT_PORT_HOST" ] || [ -z "$MONITOR_PORT_HOST" ]; then
  echo "Usage: $0 <jail-name> <agent-host-port> <monitor-host-port>"
  exit 1
fi

echo "Starting container '$JAIL_NAME'..."
echo "  Agent:   Colima IP:$AGENT_PORT_HOST -> Container:12001"
echo "  Monitor: Colima IP:$MONITOR_PORT_HOST -> Container:12002"

# This command will be executed inside the container on startup.
# It installs the necessary tools and then starts the agent and monitoring services.
STARTUP_COMMAND=$(cat <<'EOF'
set -e
echo "✅ Configuring Nix in container..."
echo 'experimental-features = nix-command flakes' > /etc/nix/nix.conf

echo "✅ Installing tools with Nix..."
nix profile install nixpkgs#{bash,bun,coreutils,dtach,procps,gnused,socat}

echo "✅ Jailed services starting in container..."
AGENT_PORT="12001"
MONITOR_PORT="12002"
FIFO=/tmp/command.pipe
mkfifo $FIFO

# --- Service 1: Monitoring Port ---
echo "   -> Monitoring service starting on port $MONITOR_PORT"
dtach -n /tmp/mysession.dtach bash -c "tail -f $FIFO | bash -l 2>&1"
socat TCP-LISTEN:$MONITOR_PORT,fork,reuseaddr FILE:$FIFO,create &

# --- Service 2: Agent Port ---
echo "   -> Agent service starting on port $AGENT_PORT"
exec socat TCP-LISTEN:$AGENT_PORT,fork,reuseaddr SYSTEM:"bash -l 2>&1"
EOF
)

docker run -d --rm \
  -p "$AGENT_PORT_HOST:12001" \
  -p "$MONITOR_PORT_HOST:12002" \
  --name "$JAIL_NAME" \
  nixos/nix:latest \
  sh -c "$STARTUP_COMMAND"

echo "Container '$JAIL_NAME' started."
echo "Note: It may take a minute for the tools to be installed inside the container before it is ready."
