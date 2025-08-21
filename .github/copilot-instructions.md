# Morpheum Development Instructions

**ALWAYS FOLLOW THESE INSTRUCTIONS FIRST** and only fall back to additional search and context gathering if the information in these instructions is incomplete or found to be in error.

Morpheum is a collaborative AI-human development platform using Matrix chat for coordination and AI agents operating in secure jail environments. The system integrates multiple LLM providers (OpenAI, Ollama, GitHub Copilot) with containerized execution environments.

## Core Development Environment

### Prerequisites and Installation
Run these commands in order. **NEVER CANCEL** any command - installation may take 10+ minutes:

```bash
# Install Node.js dependencies - takes ~30 seconds
npm install
# Set timeout to 300+ seconds for npm install

# Install Ollama package dependency 
npm install ollama

# Install Nix package manager (if not available) - takes 5-10 minutes
curl -L https://nixos.org/nix/install | sh -s -- --daemon
# Set timeout to 600+ seconds. If this fails due to network issues, document it as known limitation.

# Source Nix environment
. ~/.nix-profile/etc/profile.d/nix.sh

# Install Docker (if not available - usually pre-installed in most environments)
```

### Build and Test Process

**CRITICAL BUILD TIMING**: Set appropriate timeouts and NEVER cancel builds:

```bash
# Install dependencies - measured at ~18 seconds, NEVER CANCEL
npm install
# Set timeout to 300+ seconds for safety

# Run tests - measured at ~9 seconds, NEVER CANCEL  
npm test
# Set timeout to 120+ seconds
# Expected: All 77 tests pass

# TypeScript compilation attempt - fails in ~3 seconds
npx tsc --build
# Set timeout to 300+ seconds
# NOTE: Currently fails with 207 ES module errors but application runs from existing build/ directory

# Compiled JavaScript files are available in build/ directory:
# - build/src/morpheum-bot/index.js (main bot entry point)
# - build/src/morpheum-bot/bot.js (bot logic)  
# - build/jail/agent.js (jail agent)
```

## Running the Application

### Matrix Bot (Main Application)

The bot requires Matrix credentials and communicates with GitHub APIs:

```bash
# Required environment variables:
export HOMESERVER_URL="https://matrix.example.com"  # Matrix homeserver
export ACCESS_TOKEN="your_matrix_access_token"     # Matrix bot token

# Optional LLM provider configuration:
export OPENAI_API_KEY="your_openai_key"           # For OpenAI integration
export OPENAI_MODEL="gpt-4"                       # Default: gpt-3.5-turbo
export OPENAI_BASE_URL="https://api.openai.com/v1" # Custom API endpoint

export OLLAMA_API_URL="http://localhost:11434"    # Ollama server URL
export OLLAMA_MODEL="morpheum-local"              # Local model name

export GITHUB_TOKEN="ghp_your_github_token"       # For Copilot integration
export COPILOT_REPOSITORY="owner/repo"            # Default repository
export COPILOT_BASE_URL="https://api.github.com"  # GitHub API endpoint
export COPILOT_POLL_INTERVAL="30"                 # Session polling interval

# Run the bot - requires Matrix credentials
node build/src/morpheum-bot/index.js

# Bot will connect to Matrix and respond to:
# - Direct mentions: "@botname: do something"
# - Commands starting with "!": "!help", "!llm status", etc.
```

### Ollama Local Models

Build and manage local Ollama models:

```bash
# Install Ollama server (external dependency - may fail in restricted environments)
curl -fsSL https://ollama.ai/install.sh | sh
# If this fails due to network restrictions, document as limitation

# Build models using Makefile - takes 15-45 minutes per model, NEVER CANCEL
make all
# Set timeout to 3600+ seconds (1 hour)
# Builds models from: morpheum-local.ollama, gpt-oss-*.ollama, etc.

# Build specific model:
make morpheum-local
# Set timeout to 2700+ seconds (45 minutes)

# Start Ollama server (required for local model usage):
ollama serve &

# Test interactive mode (requires model to be built first):
node build/src/ollama/interactive.js --model morpheum-local --url http://localhost:11434
```

### Jail System (Secure Agent Environment)

The jail system provides containerized execution using Docker and Nix:

```bash
# Navigate to jail directory
cd jail/

# Start jail container - takes 2-3 minutes for initial setup, NEVER CANCEL
./run.sh jail-name 12001 12002
# Set timeout to 300+ seconds
# Creates container with agent port 12001 and monitor port 12002

# Test communication with jail (wait 60+ seconds after startup):
sleep 60
echo "echo 'Hello from jail'" | nc localhost 12001

# For programmatic control:
node build/jail/agent.js 12001 "ls -la"

# Monitor jail activity:
docker logs jail-name

# Clean up:
docker stop jail-name
```

## Validation Scenarios

**ALWAYS test these scenarios after making changes:**

### Quick Validation (2 minutes)
```bash
# 1. Verify dependencies and tests - should complete in ~10 seconds
npm test
# Expected: All 77 tests pass

# 2. Check bot startup behavior
node build/src/morpheum-bot/index.js
# Expected: "HOMESERVER_URL and ACCESS_TOKEN environment variables are required."

# 3. Verify interactive script help
node build/src/ollama/interactive.js
# Expected: Usage instructions with model parameter requirement

# 4. Test Makefile behavior without Ollama
make
# Expected: "ollama: No such file or directory" if Ollama not installed
```

### Bot Functionality Test (5 minutes)
```bash
# 1. Test bot initialization with mock environment
export HOMESERVER_URL="http://test.matrix.com"
export ACCESS_TOKEN="mock_token"
export OPENAI_API_KEY="mock_key"

# 2. Start bot in background (will fail to connect but shows initialization)
timeout 10 node build/src/morpheum-bot/index.js &
# Should show Matrix connection attempt

# 3. Test LLM client creation directly in tests
npm test -- src/morpheum-bot/llmClient.test.ts
# Validates LLM provider switching logic
```

### Jail Communication Test (3 minutes)
```bash
# 1. Start jail environment - NEVER CANCEL, takes up to 2 minutes
cd jail/
./run.sh test-jail 12001 12002
# Set timeout to 300+ seconds

# 2. Wait for container initialization - CRITICAL: full 60+ seconds
sleep 60

# 3. Test if container is running
docker ps | grep test-jail
# Should show running container

# 4. Test basic communication (may fail if setup incomplete)
echo "pwd" | nc localhost 12001 || echo "Communication failed - expected if container still initializing"

# 5. Check container logs for setup progress
docker logs test-jail
# Should show Nix tool installation progress

# 6. Cleanup
docker stop test-jail
```

### Full Integration Test (Matrix Required)
```bash
# Prerequisites: Valid Matrix credentials
# 1. Set up complete environment
export HOMESERVER_URL="https://your-matrix-server.com"  
export ACCESS_TOKEN="your_actual_matrix_token"
export OPENAI_API_KEY="your_openai_key"  # Optional

# 2. Start bot - will connect to Matrix and listen for messages
node build/src/morpheum-bot/index.js &
BOT_PID=$!

# 3. In Matrix client, send test message:
# "@botname: !help" - should get command list
# "@botname: !llm status" - should show current LLM provider

# 4. Test task processing:
# "@botname: Create a simple hello world program" 
# Should trigger task processing workflow

# 5. Cleanup
kill $BOT_PID
```

## Common Tasks and Troubleshooting

### Running Tests
```bash
# Full test suite - takes ~10 seconds, NEVER CANCEL
npm test
# Set timeout to 120+ seconds
# All 77 tests should pass

# Run specific test file:
npx vitest src/morpheum-bot/bot.test.ts
```

### Debugging Build Issues
```bash
# Current known issue: TypeScript build fails with ES module errors
# Workaround: Use existing compiled files in build/ directory

# Check compiled files exist:
ls -la build/src/morpheum-bot/

# If build directory missing, the application won't run
# Solution: Document as build environment requirement
```

### Environment Debugging
```bash
# Check Node.js and npm versions:
node --version  # Should be v20.19.4 or compatible
npm --version   # Should be 10.8.2 or compatible

# Verify dependencies installed:
npm list

# Check Docker availability:
docker --version
docker ps

# Test Matrix connectivity (if configured):
# Verify HOMESERVER_URL and ACCESS_TOKEN are valid
```

## Code Navigation

### Key Directories
- `src/morpheum-bot/` - Main bot implementation
- `src/ollama/` - Local model interaction
- `src/gauntlet/` - Agent testing framework  
- `jail/` - Secure execution environment
- `docs/` - Jekyll documentation site
- `build/` - Compiled JavaScript (may be missing)

### Important Files
- `src/morpheum-bot/bot.ts` - Core bot logic and command handling
- `src/morpheum-bot/index.ts` - Matrix client and message routing
- `src/morpheum-bot/jailClient.ts` - Jail communication client
- `src/morpheum-bot/llmClient.ts` - LLM provider abstraction
- `jail/run.sh` - Jail container startup script
- `package.json` - Dependencies and npm scripts
- `Makefile` - Ollama model building

### Configuration Files
- `.envrc` - Nix development environment
- `flake.nix` - Nix flake configuration  
- `tsconfig.json` - TypeScript configuration
- `vitest.config.ts` - Test framework configuration

## Known Limitations

### Build System
- **TypeScript compilation fails** with 207 ES module errors (verbatimModuleSyntax issues)
- **Application runs from pre-compiled build/ directory** - changes to TypeScript require manual compilation setup
- **Makefile requires Ollama** - `make` commands fail with "ollama: No such file or directory" if Ollama not installed
- Tests pass consistently but build process needs ES module configuration fixes

### Network Dependencies  
- **Ollama installation may fail** in restricted networks (`curl -fsSL https://ollama.ai/install.sh | sh`)
- **Nix installation may fail** without internet access (`curl -L https://nixos.org/nix/install | sh`)
- **Docker image pulls may be blocked** by firewalls (nixos/nix:latest required for jail)
- Matrix and GitHub API connections require appropriate network permissions

### Environment Requirements
- **Docker required** for jail system - containers provide isolated execution
- **Nix recommended** but not strictly required for basic bot functionality  
- **Matrix credentials required** for full bot operation (HOMESERVER_URL, ACCESS_TOKEN)
- **60+ second jail initialization** - containers need time to install Nix tools

### Jail System Limitations
- **Container startup timing** - requires 60+ seconds before ready for commands
- **TCP communication dependencies** - requires netcat/socat for command interface
- **Nix tool installation** - first run installs bash, bun, coreutils inside container
- **Port availability** - requires available TCP ports for agent/monitor communication

## Success Indicators

After following these instructions, you should be able to:

1. **Install dependencies** - `npm install` completes successfully
2. **Run tests** - All 77 tests pass with `npm test`
3. **Start bot** - Application starts and connects to Matrix (with credentials)
4. **Create jails** - Containers start and accept commands via TCP
5. **Process tasks** - Bot responds to Matrix messages and executes agent workflows

If any of these fail, document the specific error and environment constraints.

## Development Workflow

1. **Always run tests first**: `npm test` to verify current state
2. **Make minimal changes**: Focus on specific functionality
3. **Test incrementally**: Run tests after each change
4. **Use jail system**: Test agent code in secure containers
5. **Validate Matrix integration**: Ensure bot responds correctly to commands
6. **Check GitHub operations**: Verify Copilot/API integrations work

**Remember**: NEVER CANCEL long-running operations. Document actual timing and set appropriate timeouts (60+ minutes for builds, 30+ minutes for tests, 10+ minutes for installations).