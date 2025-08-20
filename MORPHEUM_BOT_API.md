# Morpheum Bot API Integration

The Morpheum Bot now supports both OpenAI and Ollama APIs, allowing you to switch between different LLM providers based on your needs.

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

## Usage

The bot automatically selects OpenAI if an API key is provided, otherwise it defaults to Ollama.

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

The bot will use the currently selected LLM provider to process the task.

## Examples

### Switching Between Providers

```
# Check current status
!llm status

# Switch to OpenAI with GPT-4
!llm switch openai gpt-4

# Switch to Ollama with a custom model
!llm switch ollama llama2:13b

# Switch to OpenAI with custom endpoint (for local or proxy setups)
!llm switch openai gpt-3.5-turbo http://localhost:8000/v1
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
!llm switch openai gpt-4

# Work on a task
Implement user authentication for the web app

# Check development log
!devlog
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
- Invalid model names or endpoints
- Network connection issues
- API authentication failures

## Security Notes

- OpenAI API keys are read from environment variables and never logged
- All API calls include request/response logging for debugging (content only, not credentials)
- The bot supports custom base URLs for enterprise or self-hosted deployments