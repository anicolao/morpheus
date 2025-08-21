import * as sdk from 'matrix-js-sdk';
import { MatrixClient, MatrixError } from 'matrix-bot-sdk';

export interface TokenManagerConfig {
  homeserverUrl: string;
  username: string;
  password: string;
  onTokenRefresh?: (newToken: string, refreshToken?: string) => Promise<void>;
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  expires_in_ms?: number;
  device_id?: string;
}

export class TokenManager {
  private homeserverUrl: string;
  private username: string;
  private password: string;
  private onTokenRefresh?: (newToken: string, refreshToken?: string) => Promise<void>;
  private refreshInProgress = false;
  private currentRefreshToken?: string;

  constructor(config: TokenManagerConfig) {
    this.homeserverUrl = config.homeserverUrl;
    this.username = config.username;
    this.password = config.password;
    this.onTokenRefresh = config.onTokenRefresh;
  }

  /**
   * Set the current refresh token for use in token refresh
   */
  setRefreshToken(refreshToken?: string): void {
    this.currentRefreshToken = refreshToken;
  }

  /**
   * Get a new access token using refresh token if available, otherwise username/password
   */
  async getNewToken(): Promise<LoginResponse> {
    const client = sdk.createClient({
      baseUrl: this.homeserverUrl,
    });

    try {
      // Try refresh token first if available
      if (this.currentRefreshToken) {
        console.log('[TokenManager] Attempting token refresh using refresh token');
        try {
          const refreshResult = await client.refreshToken(this.currentRefreshToken);
          console.log('[TokenManager] Successfully refreshed token using refresh token');
          return {
            access_token: refreshResult.access_token,
            refresh_token: refreshResult.refresh_token,
            expires_in_ms: refreshResult.expires_in_ms
          };
        } catch (refreshError: any) {
          console.log('[TokenManager] Refresh token failed, falling back to password:', refreshError.message);
          this.currentRefreshToken = undefined; // Clear invalid refresh token
        }
      }

      // Fall back to username/password authentication
      console.log('[TokenManager] Using username/password authentication');
      const loginResult = await client.loginWithPassword(this.username, this.password);
      
      return {
        access_token: loginResult.access_token,
        refresh_token: loginResult.refresh_token,
        expires_in_ms: loginResult.expires_in_ms,
        device_id: loginResult.device_id
      };
    } catch (error: any) {
      throw new Error(`Failed to get new access token: ${error.message}`);
    }
  }

  /**
   * Check if an error indicates token expiration/invalidity
   */
  isTokenError(error: any): boolean {
    if (error instanceof MatrixError) {
      return error.errcode === 'M_UNKNOWN_TOKEN' || 
             error.errcode === 'M_MISSING_TOKEN' ||
             error.errcode === 'M_FORBIDDEN';
    }
    return false;
  }

  /**
   * Refresh the token and notify the callback
   */
  async refreshToken(): Promise<LoginResponse> {
    if (this.refreshInProgress) {
      throw new Error('Token refresh already in progress');
    }

    this.refreshInProgress = true;
    try {
      console.log('[TokenManager] Refreshing access token...');
      const result = await this.getNewToken();
      
      // Update our refresh token if we got a new one
      if (result.refresh_token) {
        this.currentRefreshToken = result.refresh_token;
      }
      
      if (this.onTokenRefresh) {
        await this.onTokenRefresh(result.access_token, result.refresh_token);
      }
      
      console.log('[TokenManager] Access token refreshed successfully');
      return result;
    } finally {
      this.refreshInProgress = false;
    }
  }

  /**
   * Create a wrapper function that automatically handles token refresh
   */
  withTokenRefresh<T>(fn: () => Promise<T>): () => Promise<T> {
    return async (): Promise<T> => {
      try {
        return await fn();
      } catch (error) {
        if (this.isTokenError(error)) {
          console.log('[TokenManager] Token error detected, attempting refresh...');
          await this.refreshToken();
          // Retry the operation once after token refresh
          return await fn();
        }
        throw error;
      }
    };
  }
}