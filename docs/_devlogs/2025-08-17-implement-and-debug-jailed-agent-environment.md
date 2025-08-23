---
title: "Implement and Debug Jailed Agent Environment"
date: 2025-08-17
author: "Development Team"
tags: ["development", "bug-fix"]
---

- **Actions Taken:**

  - Created a `jail/` directory to house a new, scripted agent environment based
    on the `JAIL_PROTOTYPE.md` design.
  - Implemented a `flake.nix` to provide a consistent development shell with
    `colima`, `docker`, and other necessary tools.
  - Created a `run.sh` script to launch a jailed container using a pre-built
    `nixos/nix` image, which installs tools like `socat`, `dtach`, and `bun` on
    startup.
  - Created an `agent.ts` script to programmatically send commands to the jailed
    container and receive output.
  - Wrote `jail/README.md` to document the new, simplified workflow.

- **Friction/Success Points:**

  - The development process was a lengthy and iterative debugging session that
    uncovered multiple layers of issues.
  - **Initial Approach (Failure):** The first attempt to build a custom Docker
    image using `nix build` on macOS failed due to Linux-specific dependencies
    (`virtiofsd`) that could not be built on Darwin.
  - **Second Approach (Failure):** The next attempt involved running the
    `nix build` command inside a temporary `nixos/nix` container. This failed
    due to a nested virtualization issue where the build process required KVM,
    which was unavailable inside the container.
  - **Third Approach (Success):** The final, successful approach abandoned
    building a custom image altogether. Instead, we use a standard `nixos/nix`
    image and install the required tools at runtime. This proved to be far more
    robust and portable.
  - **Networking Debugging:** Solved a series of networking issues, from
    realizing Colima required a `--network-address` flag to expose an IP, to
    correcting the `docker run` port mapping.
  - **Docker Context:** The `DOCKER_HOST` environment variable was not set
    correctly, preventing the `docker` CLI from connecting to the Colima daemon.
    The final solution was to add a `shellHook` to `flake.nix` to export this
    variable automatically.
  - **Shell Interaction:** The agent script was initially unable to capture
    command output because the interactive shell in the container would echo the
    command back, prematurely triggering the end-of-command logic. This was
    resolved by making the container's shell non-interactive.

- **Lessons Learned:**
  - Building Linux Docker images with Nix on macOS is fraught with platform
    compatibility issues. Using a pre-built Linux image and installing packages
    at runtime is a much more reliable pattern.
  - For programmatic control of a shell, a non-interactive shell (`bash -l`) is
    vastly superior to an interactive one (`bash -li`), as it provides a clean
    I/O stream without terminal echo.
  - Automatically configuring the environment (like setting `DOCKER_HOST` in a
    `shellHook`) is critical for creating a smooth and reproducible developer
    experience.
  - The debugging process, while frustrating, was essential for arriving at a
    simple and robust final solution. Each failure revealed a deeper layer of
    the problem and led to a better design.

---