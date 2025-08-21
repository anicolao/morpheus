# Morpheum Bot API Integration

The Morpheum Bot now supports three LLM providers: OpenAI, Ollama, and GitHub Copilot, allowing you to switch between different AI services based on your needs.

## Configuration

Configure the bot using environment variables:

### OpenAI Configuration
```bash
export OPENAI_API_KEY="your-openai-api-key"
export OPENAI_MODEL="gpt-4"  # Optional, defaults to gpt-3.5-turbo
export OPENAI_BASE_URL="https://api.openai.com/v1"  # Optional, for custom endpoints
```

### Ollama Configuration
```bash
export OLLAMA_API_URL="http://localhost:11434"  # Optional, defaults to localhost:11434
export OLLAMA_MODEL="morpheum-local"  # Optional, defaults to morpheum-local
```

### GitHub Copilot Configuration
```bash
export GITHUB_TOKEN="ghp_your-github-token"  # Required for Copilot integration
export COPILOT_REPOSITORY="owner/repo"  # Optional, default repository for sessions
export COPILOT_BASE_URL="https://api.github.com"  # Optional, for GitHub Enterprise
export COPILOT_POLL_INTERVAL="30"  # Optional, session polling interval in seconds
```

## Usage

The bot automatically selects OpenAI if an API key is provided, otherwise it defaults to Ollama. You can switch to GitHub Copilot mode for issue resolution and automated code generation.

### Bot Commands

#### Help
```
!help
```
Shows all available commands and usage instructions.

#### LLM Management
```
!llm status
```
Shows the current LLM provider and configuration.

```
!llm switch openai [model] [baseUrl]
```
Switches to OpenAI. Optionally specify a custom model and base URL.

```
!llm switch ollama [model] [baseUrl]
```
Switches to Ollama. Optionally specify a custom model and base URL.

```
!llm switch copilot <repository>
```
Switches to GitHub Copilot. Repository parameter is required (format: owner/repo).

#### GitHub Copilot Commands
```
!copilot status [session-id]
```
Shows Copilot integration status or specific session status.

```
!copilot list
```
Lists all active Copilot sessions.

```
!copilot cancel <session-id>
```
Cancels a specific Copilot session.

#### Direct API Calls
```
!openai <prompt>
```
Sends a prompt directly to OpenAI API (requires OPENAI_API_KEY).

```
!ollama <prompt>
```
Sends a prompt directly to Ollama API.

#### File Operations
```
!tasks
```
Displays the contents of TASKS.md.

```
!devlog
```
Displays the contents of DEVLOG.md.

#### Environment Management
```
!create [port]
```
Creates a new development environment container.

### Regular Task Processing

For regular development tasks, simply type your request without a command prefix:

```
Create a simple hello world program in Python
```

The bot will use the currently selected LLM provider to process the task. When using GitHub Copilot, tasks are automatically converted into GitHub issues and Copilot sessions for automated resolution.

## Examples

### Switching Between Providers

```
# Check current status
!llm status

# Switch to OpenAI with GPT-4
!llm switch openai gpt-4

# Switch to Ollama with a custom model
!llm switch ollama llama2:13b

# Switch to GitHub Copilot
!llm switch copilot myorg/myrepo

# Switch to OpenAI with custom endpoint (for local or proxy setups)
!llm switch openai gpt-3.5-turbo http://localhost:8000/v1
```

### GitHub Copilot Workflow

```
# Switch to Copilot mode
!llm switch copilot myorg/myrepo

# Check Copilot status
!copilot status

# Submit a task (creates GitHub issue and Copilot session)
Fix the authentication bug in the login component

# Monitor active sessions
!copilot list

# Cancel a session if needed
!copilot cancel cop_abc123
```

### Direct API Testing

```
# Test OpenAI directly
!openai Explain quantum computing in simple terms

# Test Ollama directly
!ollama Write a Python function to calculate factorial
```

### Development Workflow

```
# Start with checking available tasks
!tasks

# Switch to preferred LLM
!llm switch copilot myorg/myrepo

# Work on a task (creates GitHub issue and automated resolution)
Implement user authentication for the web app

# Monitor the session
!copilot status

# Check development log
!devlog
```

## GitHub Copilot Integration

The GitHub Copilot integration provides automated issue resolution through GitHub's AI service:

### Features
- **Automatic Issue Creation**: Tasks are converted to GitHub issues
- **AI-Powered Resolution**: Copilot analyzes code and generates fixes
- **Real-time Status Updates**: Streaming progress updates via Matrix chat
- **Pull Request Generation**: Automatic PR creation with fixes
- **Session Management**: Track and manage multiple concurrent sessions

### Copilot Session Lifecycle
1. **Task Submission**: User provides a task description
2. **Issue Creation**: Bot creates a GitHub issue from the task
3. **Copilot Session**: Initiates automated analysis and resolution
4. **Status Updates**: Real-time progress through pending → in_progress → completed
5. **Results**: Pull request links, file changes, and confidence metrics

### Example Copilot Session
```
User: Fix the authentication bug in the login component

Bot: 🤖 Creating GitHub issue for: "Fix the authentication bug in the login component"
Bot: ✅ Issue #123 created: https://github.com/owner/repo/issues/123
Bot: 🚀 Starting GitHub Copilot session for issue #123...
Bot: ⏳ Copilot session started (ID: cop_abc123) - Status: pending
Bot: 🔄 Copilot session status: in_progress - Analyzing codebase...
Bot: 🔄 Copilot session status: in_progress - Generating fix...
Bot: ✅ Copilot session completed! 
     📊 Confidence: 87%
     🔧 Files changed: src/auth/login.ts, tests/auth.test.ts
     🔗 Pull Request: https://github.com/owner/repo/pull/124
```

## OpenAI-Compatible APIs

The bot supports any OpenAI-compatible API by configuring the base URL:

```bash
# For local LLM servers like vLLM, llama-cpp-python, etc.
export OPENAI_BASE_URL="http://localhost:8000/v1"

# For proxy services
export OPENAI_BASE_URL="https://your-proxy.com/v1"
```

This allows you to use local models through OpenAI-compatible interfaces while maintaining the same command structure.

## Error Handling

The bot provides clear error messages for common issues:

- Missing OpenAI API key when trying to use OpenAI
- Missing GitHub token when trying to use Copilot
- Invalid repository format for Copilot (must be "owner/repo")
- Invalid model names or endpoints
- Network connection issues
- API authentication failures
- GitHub API rate limits and permissions

## Security Notes

- OpenAI API keys and GitHub tokens are read from environment variables and never logged
- All API calls include request/response logging for debugging (content only, not credentials)
- The bot supports custom base URLs for enterprise or self-hosted deployments
- GitHub operations are scoped to the configured repository
- Copilot sessions require appropriate repository permissions