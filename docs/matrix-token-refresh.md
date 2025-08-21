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

The bot supports three authentication scenarios:

### Scenario A: Static Token (No Auto-Refresh)
```bash
HOMESERVER_URL=https://matrix.example.com
ACCESS_TOKEN=your_static_token_here
```

### Scenario B: Auto-Refresh Only  
```bash
HOMESERVER_URL=https://matrix.example.com
USERNAME=your_username
PASSWORD=your_password
```

### Scenario C: Initial Token + Auto-Refresh Fallback
```bash
HOMESERVER_URL=https://matrix.example.com
ACCESS_TOKEN=your_initial_token
USERNAME=your_username  
PASSWORD=your_password
```

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

### Basic Setup with Auto-Refresh
```bash
export HOMESERVER_URL="https://matrix.example.com"
export USERNAME="morpheum_bot"
export PASSWORD="secure_password"
./src/morpheum-bot/index.ts
```

### Programmatic Usage
```typescript
import { TokenManager } from './token-manager';

const tokenManager = new TokenManager({
  homeserverUrl: 'https://matrix.example.com',
  username: 'bot_user',
  password: 'bot_password',
  onTokenRefresh: async (newToken, refreshToken) => {
    console.log('New token received:', newToken);
    if (refreshToken) {
      console.log('New refresh token received:', refreshToken);
      // Store refresh token securely if needed
    }
    // Update your Matrix client here
  }
});

// Optionally set an existing refresh token
tokenManager.setRefreshToken('existing_refresh_token');

// Wrap Matrix API calls
const sendMessage = tokenManager.withTokenRefresh(async () => {
  await client.sendMessage(roomId, { msgtype: 'm.text', body: 'Hello!' });
});

await sendMessage(); // Automatically retries with new token if needed
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