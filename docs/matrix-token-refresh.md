# Matrix Token Auto-Refresh

This document describes the automatic Matrix access token refresh functionality implemented in the Morpheum bot.

## Overview

Matrix access tokens can expire over time, causing the bot to lose connection and fail to send/receive messages. The token auto-refresh feature automatically detects token expiration and refreshes the token using username/password authentication, ensuring continuous operation without manual intervention.

## Features

- **Automatic Detection**: Detects Matrix token errors (`M_UNKNOWN_TOKEN`, `M_MISSING_TOKEN`, `M_FORBIDDEN`)
- **Seamless Refresh**: Automatically obtains new tokens using username/password
- **Graceful Reconnection**: Reconnects the Matrix client with the new token
- **Backward Compatibility**: Works with existing `ACCESS_TOKEN` setups
- **Concurrent Protection**: Prevents multiple simultaneous refresh attempts
- **Rate Limiting Support**: Compatible with existing rate limiting handling

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
  onTokenRefresh?: (newToken: string) => Promise<void>;
}
```

Key methods:
- `getNewToken()`: Obtains a fresh token using username/password
- `isTokenError(error)`: Detects if an error indicates token expiration
- `refreshToken()`: Performs token refresh and notifies callback
- `withTokenRefresh(fn)`: Wraps functions with automatic retry on token errors

### Bot Integration

The main bot (`src/morpheum-bot/index.ts`) integrates token refresh by:

1. **Authentication Setup**: Chooses appropriate auth method based on env vars
2. **Client Creation**: Creates Matrix client with token refresh callback
3. **Handler Wrapping**: Wraps message handlers with token refresh capability  
4. **Graceful Reconnection**: Stops/recreates/restarts client on token refresh

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
  onTokenRefresh: async (newToken) => {
    console.log('New token received:', newToken);
    // Update your Matrix client here
  }
});

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
2. **Token Lifecycle**: Old tokens are replaced immediately after refresh
3. **Concurrent Safety**: Only one refresh operation can occur at a time
4. **Error Isolation**: Token refresh failures don't crash the bot

## Backwards Compatibility

Existing bots using only `ACCESS_TOKEN` continue to work unchanged. Token auto-refresh is only enabled when both `USERNAME` and `PASSWORD` are provided.

## Future Enhancements

Potential improvements:
- Support for Matrix refresh tokens (when available)
- Proactive token refresh before expiration
- Token refresh metrics and monitoring
- Multiple homeserver support