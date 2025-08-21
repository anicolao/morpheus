import * as sdk from 'matrix-js-sdk';
import { MatrixClient, MatrixError } from 'matrix-bot-sdk';

export interface TokenManagerConfig {
  homeserverUrl: string;
  username: string;
  password: string;
  onTokenRefresh?: (newToken: string) => Promise<void>;
}

export class TokenManager {
  private homeserverUrl: string;
  private username: string;
  private password: string;
  private onTokenRefresh?: (newToken: string) => Promise<void>;
  private refreshInProgress = false;

  constructor(config: TokenManagerConfig) {
    this.homeserverUrl = config.homeserverUrl;
    this.username = config.username;
    this.password = config.password;
    this.onTokenRefresh = config.onTokenRefresh;
  }

  /**
   * Get a new access token using username/password
   */
  async getNewToken(): Promise<string> {
    const client = sdk.createClient({
      baseUrl: this.homeserverUrl,
    });

    try {
      const loginResult = await client.loginWithPassword(this.username, this.password);
      return loginResult.access_token;
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
  async refreshToken(): Promise<string> {
    if (this.refreshInProgress) {
      throw new Error('Token refresh already in progress');
    }

    this.refreshInProgress = true;
    try {
      console.log('[TokenManager] Refreshing access token...');
      const newToken = await this.getNewToken();
      
      if (this.onTokenRefresh) {
        await this.onTokenRefresh(newToken);
      }
      
      console.log('[TokenManager] Access token refreshed successfully');
      return newToken;
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