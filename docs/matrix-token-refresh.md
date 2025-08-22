# Matrix Token Auto-Refresh

This document describes the automatic Matrix access token refresh functionality implemented in the Morpheum bot.

## Overview

Matrix access tokens can expire over time, causing the bot to lose connection and fail to send/receive messages. The token auto-refresh feature automatically detects token expiration and refreshes the token using either refresh tokens (preferred) or username/password authentication (fallback), ensuring continuous operation without manual intervention.

## Features

- **Automatic Detection**: Detects Matrix token errors (`M_UNKNOWN_TOKEN`, `M_MISSING_TOKEN`, `M_FORBIDDEN`)
- **Refresh Token Support**: Uses Matrix refresh tokens when available (preferred method)
- **Password Fallback**: Falls back to username/password when refresh tokens are unavailable or invalid
- **Seamless Refresh**: Automatically obtains new tokens with minimal disruption
- **Graceful Reconnection**: Reconnects the Matrix client with the new token
- **Backward Compatibility**: Works with existing `ACCESS_TOKEN` setups
- **Concurrent Protection**: Prevents multiple simultaneous refresh attempts
- **Rate Limiting Support**: Compatible with existing rate limiting handling

## Quick Start Guide

Follow these steps to set up Matrix authentication with automatic token refresh:

### Step 1: Prepare Your Credentials
You'll need:
- Your Matrix homeserver URL (e.g., `https://matrix.org` or `https://matrix.example.com`)
- Your Matrix username (e.g., `@mybot:matrix.org`)
- Your Matrix password

### Step 2: Configure Environment Variables
Set up your environment with username and password authentication:

```bash
export HOMESERVER_URL="https://matrix.example.com"
export USERNAME="mybot"  # Without the @homeserver part
export PASSWORD="your_secure_password"
```

**Important**: Do NOT set `ACCESS_TOKEN` when using refresh tokens. The bot will obtain the initial token automatically.

### Step 3: Start the Bot
```bash
./src/morpheum-bot/index.ts
```

### Step 4: Verify Refresh Token Support
When the bot starts, check the logs for these messages:

```
[Auth] Successfully logged in and obtained tokens
[Auth] Using automatic token refresh
```

If your Matrix server supports refresh tokens, you'll see additional messages like:
```
[TokenManager] Successfully refreshed token using refresh token
```

If refresh tokens aren't supported, you'll see:
```
[TokenManager] Refresh token failed, falling back to password: [error message]
[TokenManager] Using username/password authentication
```

Both scenarios work fine - the bot will automatically use the best method available.

## How to Obtain Refresh Tokens

**Refresh tokens are obtained automatically** - you don't need to manually generate them. Here's how it works:

### Automatic Process
1. **Initial Login**: When you provide `USERNAME` and `PASSWORD`, the bot logs into your Matrix server
2. **Token Request**: During login, the bot requests both an access token and a refresh token
3. **Server Response**: If your Matrix server supports refresh tokens (Synapse 1.38.0+, recent Dendrite), it returns both tokens
4. **Storage**: The bot stores the refresh token in memory and uses it for future token refreshes
5. **Fallback**: If refresh tokens aren't supported or fail, the bot automatically falls back to password authentication

### Server Compatibility
- ✅ **Synapse 1.38.0+**: Full refresh token support
- ✅ **Dendrite (recent versions)**: Supports refresh tokens  
- ⚠️ **Older servers**: Will automatically fall back to password authentication
- ⚠️ **Custom homeservers**: Support varies - fallback handles compatibility

### No Manual Steps Required
You don't need to:
- Generate refresh tokens manually
- Copy/paste tokens from web interfaces  
- Use special CLI tools
- Modify configuration files

Just provide your username and password - the system handles everything else automatically!

## Verification and Troubleshooting

### How to Verify Refresh Tokens are Working

#### Check Startup Logs
When the bot starts successfully with refresh token support:
```
[Auth] Successfully logged in and obtained tokens
[Auth] Using automatic token refresh
[TokenManager] Refresh token available for future use
```

#### Monitor Token Refresh Events
When a token expires and gets refreshed automatically:
```
[TokenManager] Token error detected, attempting refresh...
[TokenManager] Refreshing access token...
[TokenManager] Attempting token refresh using refresh token
[TokenManager] Successfully refreshed token using refresh token
[TokenManager] Access token refreshed successfully
[Auth] Client reconnected with new token
```

#### Test Token Refresh Manually
To test if refresh tokens are working, you can force a token error by temporarily providing an invalid `ACCESS_TOKEN`:

```bash
export HOMESERVER_URL="https://matrix.example.com"
export ACCESS_TOKEN="invalid_token_for_testing"
export USERNAME="mybot"
export PASSWORD="your_password"
./src/morpheum-bot/index.ts
```

The bot should detect the invalid token and automatically refresh it.

### Common Issues and Solutions

#### Issue: "Cannot find username/password"
**Symptoms**: Bot exits with error about missing credentials
**Solution**: Ensure both `USERNAME` and `PASSWORD` are set in environment variables

#### Issue: "Refresh token failed, falling back to password"
**Symptoms**: Logs show fallback to password authentication
**Causes**:
- Your Matrix server doesn't support refresh tokens (older Synapse < 1.38.0)
- Server configuration disables refresh tokens
- Network issues during refresh attempt
**Solution**: This is normal behavior - password fallback ensures the bot continues working

#### Issue: "Token refresh already in progress"
**Symptoms**: Multiple refresh attempts cause this error
**Cause**: Multiple Matrix operations triggered simultaneously when token expired
**Solution**: This is normal - the system prevents duplicate refresh attempts and queues operations

#### Issue: Bot stops working after some time
**Symptoms**: Bot becomes unresponsive, no message responses
**Debugging**:
1. Check if the bot process is still running
2. Look for recent token refresh logs
3. Verify username/password are still valid
4. Check Matrix server status

#### Issue: Frequent token refreshes
**Symptoms**: Token refresh happens very frequently (multiple times per hour)
**Possible Causes**:
- Matrix server has very short token expiration times
- Network connectivity issues
- Server configuration issues
**Solution**: Contact your Matrix server administrator about token expiration policies

### Testing Your Setup

#### Basic Connectivity Test
```bash
# Set your credentials
export HOMESERVER_URL="https://matrix.example.com"
export USERNAME="mybot"
export PASSWORD="your_password"

# Start the bot and watch for successful login
./src/morpheum-bot/index.ts
```

Look for successful startup messages and verify the bot responds in Matrix rooms.

#### Refresh Token Flow Test
To verify the complete refresh flow works:

1. Start the bot normally
2. Wait for it to be active and responding
3. Force a token refresh by sending an invalid API request (or wait for natural expiration)
4. Verify the bot automatically recovers and continues responding

## Refresh Token vs Password Authentication

### Refresh Tokens (Preferred)
- **Security**: More secure as passwords don't need to be stored long-term
- **Server Support**: Requires Matrix homeserver support (Synapse 1.38.0+, Dendrite, others vary)
- **Automatic**: Obtained automatically during initial login when supported
- **Efficiency**: Faster refresh process, doesn't require full authentication flow

### Password Authentication (Fallback)
- **Universal Support**: Works with all Matrix homeservers
- **Reliability**: Always available as long as credentials are valid
- **Compatibility**: Required for servers that don't support refresh tokens

## Environment Variables

The bot supports three authentication scenarios. Choose the one that matches your needs:

### Scenario A: Static Token (No Auto-Refresh)
Use this if you have a long-lived access token and don't need automatic refresh:

```bash
HOMESERVER_URL=https://matrix.example.com
ACCESS_TOKEN=your_static_token_here
```

**When to use**: Development, testing, or when you manage token rotation manually.

### Scenario B: Auto-Refresh with Username/Password (Recommended)
Use this for production bots that should handle token expiration automatically:

```bash
HOMESERVER_URL=https://matrix.example.com
USERNAME=your_username  # Without @homeserver.com suffix
PASSWORD=your_password
```

**When to use**: Production environments where you want automatic token management.
**Result**: Bot will automatically obtain initial tokens and refresh them as needed.

### Scenario C: Initial Token + Auto-Refresh Fallback
Use this if you want to start with a specific token but have automatic refresh as backup:

```bash
HOMESERVER_URL=https://matrix.example.com
ACCESS_TOKEN=your_initial_token
USERNAME=your_username  
PASSWORD=your_password
```

**When to use**: When migrating from static tokens to auto-refresh, or when you have specific token requirements.
**Result**: Bot starts with your provided token, but can refresh it automatically when it expires.

### Important Notes

- **Username Format**: Use just the username part (e.g., `mybot`), not the full Matrix ID (`@mybot:matrix.org`)
- **Security**: Store credentials in secure environment variables, not in code or config files
- **Homeserver URL**: Include the full URL with protocol (`https://` or `http://`)
- **Token Precedence**: If both `ACCESS_TOKEN` and `USERNAME`/`PASSWORD` are provided, the bot starts with `ACCESS_TOKEN` but can refresh using credentials when needed

## Implementation Details

### TokenManager Class

The `TokenManager` class (`src/morpheum-bot/token-manager.ts`) provides:

```typescript
interface TokenManagerConfig {
  homeserverUrl: string;
  username: string;
  password: string;
  onTokenRefresh?: (newToken: string, refreshToken?: string) => Promise<void>;
}

interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  expires_in_ms?: number;
  device_id?: string;
}
```

Key methods:
- `getNewToken()`: Obtains a fresh token using refresh token (preferred) or username/password (fallback)
- `setRefreshToken(token)`: Sets the current refresh token for automatic use
- `isTokenError(error)`: Detects if an error indicates token expiration
- `refreshToken()`: Performs token refresh and notifies callback
- `withTokenRefresh(fn)`: Wraps functions with automatic retry on token errors

### Authentication Flow

1. **Initial Authentication**: Bot starts with provided `ACCESS_TOKEN` or obtains one using username/password
2. **Refresh Token Storage**: If login returns a refresh token, it's stored for future use
3. **Token Expiration Detection**: When Matrix operations fail with token errors, refresh is triggered
4. **Refresh Token Attempt**: If available, refresh token is used to get new access token
5. **Password Fallback**: If refresh token fails or unavailable, username/password is used
6. **Client Reconnection**: Matrix client is restarted with new token

### Bot Integration

The main bot (`src/morpheum-bot/index.ts`) integrates token refresh by:

1. **Authentication Setup**: Chooses appropriate auth method based on env vars
2. **Initial Token Acquisition**: Gets initial token and refresh token when available
3. **Client Creation**: Creates Matrix client with token refresh callback
4. **Refresh Token Management**: Stores and updates refresh tokens automatically
5. **Handler Wrapping**: Wraps message handlers with token refresh capability  
6. **Graceful Reconnection**: Stops/recreates/restarts client on token refresh

### Error Handling

Token errors detected and handled:
- `M_UNKNOWN_TOKEN`: Token is invalid or expired
- `M_MISSING_TOKEN`: No token provided in request
- `M_FORBIDDEN`: Token lacks required permissions

Non-token errors are passed through without refresh attempt:
- `M_LIMIT_EXCEEDED`: Rate limiting (handled separately)
- Network errors, server errors, etc.

## Usage Examples

### Example 1: Setting Up a New Bot with Auto-Refresh

```bash
# Create a new Matrix account for your bot at https://matrix.org or your homeserver
# Then configure the environment:

export HOMESERVER_URL="https://matrix.org"
export USERNAME="morpheum_bot"  # The username you created
export PASSWORD="your_secure_bot_password"

# Start the bot
./src/morpheum-bot/index.ts
```

**Expected output:**
```
[Auth] Attempting login with username/password...
[Auth] Successfully logged in and obtained tokens
[Auth] Using automatic token refresh
[TokenManager] Refresh token available for future use
Matrix client started and ready!
```

### Example 2: Converting from Static Token to Auto-Refresh

If you currently use a static `ACCESS_TOKEN`, you can enable auto-refresh by adding credentials:

```bash
# Your existing setup
export HOMESERVER_URL="https://matrix.example.com"
export ACCESS_TOKEN="your_existing_token"

# Add auto-refresh capability
export USERNAME="your_bot_username"
export PASSWORD="your_bot_password"

# Restart the bot - it will use your existing token but enable auto-refresh
./src/morpheum-bot/index.ts
```

The bot will continue using your existing token until it expires, then automatically refresh it.

### Example 3: Production Environment Setup

For production, use a startup script or systemd service:

```bash
#!/bin/bash
# bot-start.sh

# Load secrets from secure location
source /etc/morpheum-bot/credentials.env

# Verify required variables
if [[ -z "$HOMESERVER_URL" || -z "$USERNAME" || -z "$PASSWORD" ]]; then
    echo "Error: Missing required environment variables"
    exit 1
fi

# Start bot with logging
exec ./src/morpheum-bot/index.ts 2>&1 | tee /var/log/morpheum-bot.log
```

### Example 4: Programmatic Usage in Custom Applications

```typescript
import { TokenManager } from './token-manager';

// Set up token manager
const tokenManager = new TokenManager({
  homeserverUrl: 'https://matrix.example.com',
  username: 'bot_user',
  password: 'bot_password',
  onTokenRefresh: async (newToken, refreshToken) => {
    console.log('Token refreshed! New token starts with:', newToken.substring(0, 10) + '...');
    
    // Update your Matrix client with the new token
    await matrixClient.stop();
    matrixClient.accessToken = newToken;
    await matrixClient.start();
    
    // Optionally save refresh token for persistence across restarts
    if (refreshToken) {
      console.log('New refresh token received');
      // await saveRefreshTokenSecurely(refreshToken);
    }
  }
});

// If you have a saved refresh token from previous session
const savedRefreshToken = await loadRefreshTokenSecurely();
if (savedRefreshToken) {
  tokenManager.setRefreshToken(savedRefreshToken);
}

// Wrap your Matrix API calls for automatic retry on token errors
const sendMessage = tokenManager.withTokenRefresh(async () => {
  await matrixClient.sendMessage(roomId, { 
    msgtype: 'm.text', 
    body: 'Hello from bot with auto-refresh!' 
  });
});

// This will automatically refresh the token if needed
await sendMessage();
```

### Example 5: Docker Container Setup

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
CMD ["./src/morpheum-bot/index.ts"]
```

```bash
# docker-compose.yml or run command
docker run -e HOMESERVER_URL="https://matrix.example.com" \
           -e USERNAME="dockerbot" \
           -e PASSWORD="secure_password" \
           morpheum-bot
```

### Example 6: Development and Testing

For development, create a `.env` file (add to `.gitignore`):

```bash
# .env file (DO NOT COMMIT TO GIT)
HOMESERVER_URL=https://matrix.org
USERNAME=dev_bot_username
PASSWORD=dev_bot_password

# Optional: Enable debug logging
DEBUG=matrix-bot:*
```

Load and run:
```bash
source .env
./src/morpheum-bot/index.ts
```

## Testing

Comprehensive tests are provided:

- **Unit Tests**: `src/morpheum-bot/token-manager.test.ts`
- **Integration Tests**: `src/morpheum-bot/token-manager-integration.test.ts`

Run tests:
```bash
npm test -- src/morpheum-bot/token-manager
```

## Security Considerations

1. **Credential Storage**: Username/password are only read from environment variables
2. **Refresh Token Handling**: Refresh tokens are stored in memory and updated automatically
3. **Token Lifecycle**: Old tokens are replaced immediately after refresh
4. **Concurrent Safety**: Only one refresh operation can occur at a time
5. **Error Isolation**: Token refresh failures don't crash the bot
6. **Fallback Security**: Password authentication available when refresh tokens fail

## Server Compatibility

### Homeservers with Refresh Token Support
- **Synapse 1.38.0+**: Full refresh token support
- **Dendrite**: Supports refresh tokens in recent versions
- **Conduit**: Refresh token support varies by version

### Homeservers without Refresh Token Support
- **Older Synapse versions**: Will fall back to password authentication
- **Custom homeservers**: May or may not support refresh tokens
- **Automatic Fallback**: Bot will automatically use password auth when refresh tokens unavailable

### Server Admin Considerations
- Some servers may disable password authentication in favor of SSO
- Refresh tokens may have different expiration policies
- Rate limiting may apply differently to refresh vs login endpoints

## Backwards Compatibility

Existing bots using only `ACCESS_TOKEN` continue to work unchanged. Token auto-refresh is only enabled when both `USERNAME` and `PASSWORD` are provided.

## Future Enhancements

Potential improvements:
- Proactive token refresh before expiration (when `expires_in_ms` is available)
- Token refresh metrics and monitoring
- Multiple homeserver support
- Integration with external secret management systems
- Support for device-specific refresh token management