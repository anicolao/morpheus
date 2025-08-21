---
layout: page
title: Getting Started
permalink: /documentation/getting-started/
---

# Getting Started with Morpheum

Morpheum has progressed beyond its initial conceptual phase and now has a working Matrix bot with SWE-Agent capabilities. The project is currently in **Phase v0.2 (Agent Advancement)** focusing on improving agent intelligence and reliability.

## Quick Start

To get started with Morpheum:

1. **Review the project vision** in the [Vision Document](../vision/)
2. **Understand the architecture** in the [Architecture Overview](../architecture/)  
3. **Check the current development roadmap** in our [Project Status](/status/)
4. **Read the contribution guidelines** in the [Contributing Guide](../contributing/)
5. **Browse the development log** for historical context
6. **Understand the expected behavior of AI agents** in our [Agent Guidelines](../agents/)

## Development Environment

The project uses a Matrix-based workflow where AI agents handle GitHub operations:

- **Matrix Integration**: All communication happens through Matrix chat rooms
- **AI Agent Workflow**: Agents operate in a containerized "jail" environment using Nix
- **Local Development**: The bot is located in `src/morpheum-bot/` and uses local Ollama models
- **Testing**: Tests can be run with `bun test` (or npm if necessary)

## Architecture Overview

The intended architecture for Morpheum leverages the **Matrix federated chat system** for all communication between AI agents and human participants regarding project status. Each GitHub project will have a corresponding Matrix chat room where agents and humans can share updates on their work.

### Key Components

1. **Matrix Network**: Decentralized communication protocol for project collaboration
2. **GitHub Platform**: Code management, version control, and CI/CD
3. **AI Agents**: Automated assistants for various development tasks
4. **Human Oversight**: Review, approval, and strategic direction

## Next Steps

- Join our Matrix room to participate in discussions
- Explore the codebase on GitHub
- Check out our current roadmap and active tasks
- Consider contributing to ongoing development efforts

For more detailed information, visit our [full documentation](../) or check out the [project status](/status/) for current development priorities.