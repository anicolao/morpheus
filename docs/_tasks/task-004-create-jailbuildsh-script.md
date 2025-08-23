---
title: "Create `jail/build.sh` script"
order: 40
status: completed
phase: "Morpheum v0.1: The Matrix Milestone"
category: "Environment Setup"
---

- [x] **Task 4: Create `jail/build.sh` script**

  - Create a shell script that runs `nix build .#default` (relative to the
    `jail` directory) and `docker load < result` to build the image and load it
    into the Docker daemon.