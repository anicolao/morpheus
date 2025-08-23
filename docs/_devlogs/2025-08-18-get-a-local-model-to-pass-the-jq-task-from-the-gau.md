---
title: "Get a local model to pass the jq task from the gauntlet"
date: 2025-08-18
author: "Development Team"
tags: ["development", "gauntlet"]
---

- **Actions Taken:**

  - wound up manually modifying the code a little, to eventually discover a bug:
    the !create command doesn't get the bot to start sending to the newly
    created container, so no matter what hte model does, it can't successfully
    modify the test container

- **Friction/Success Points:**
  - it took a long time to realize I was hitting the default port.
- **Lessons Learned:**
  - Best to have no docker containers running when testing the gauntlet, so that
    the bot can't connect to an existing one.