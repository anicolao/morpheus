---
title: "Create `jail/run.sh` script"
order: 41
status: completed
phase: "Morpheum v0.1: The Matrix Milestone"
category: "Environment Setup"
---

- [x] **Task 5: Create `jail/run.sh` script**

  - Create a shell script that automates the `docker run` command.
  - The script should accept arguments for the container name (e.g., `jail-1`)
    and the port numbers to map, making it easy to launch multiple, distinct
    jails.