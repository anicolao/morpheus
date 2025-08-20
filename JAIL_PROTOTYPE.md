# [DEPRECATED] Creating a Jailed Agentic Environment for the Morpheum Project

> **⚠️ DEPRECATION NOTICE**: This document describes the prototype design for the jail system. The jail system has since been implemented and is now located in the `jail/` directory with proper automation scripts. This document is preserved for historical reference only. See `jail/README.md` for current usage instructions.

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
        packages = with pkgs; [ bun colima docker nmap ];
      };
    });
}