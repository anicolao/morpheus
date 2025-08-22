#!/usr/bin/env bun

import {
  MatrixClient,
  SimpleFsStorageProvider,
  AutojoinRoomsMixin,
  LogLevel,
  LogService,
} from "matrix-bot-sdk";
import { startMessageQueue, queueMessage } from "./message-queue";
import { MorpheumBot } from "./bot";
import { TokenManager } from "./token-manager";

// read environment variables
const homeserverUrl = process.env.HOMESERVER_URL;
const accessToken = process.env.ACCESS_TOKEN;
const username = process.env.USERNAME;
const password = process.env.PASSWORD;

if (!homeserverUrl) {
  console.error("HOMESERVER_URL environment variable is required.");
  process.exit(1);
}

// Require either ACCESS_TOKEN or both USERNAME and PASSWORD
if (!accessToken && (!username || !password)) {
  console.error(
    "Either ACCESS_TOKEN or both USERNAME and PASSWORD environment variables are required.",
  );
  process.exit(1);
}

let currentToken = accessToken;
let currentRefreshToken: string | undefined;
let tokenManager: TokenManager | undefined;
let client: MatrixClient;

// Setup token manager based on available credentials
if (username && password) {
  console.log("[Auth] Using username/password authentication with automatic token refresh");
  
  // If no initial token, get one now
  if (!currentToken) {
    console.log("[Auth] No initial access token provided, obtaining one...");
    tokenManager = new TokenManager({
      homeserverUrl,
      username,
      password,
    });
    try {
      const result = await tokenManager.getNewToken();
      currentToken = result.access_token;
      currentRefreshToken = result.refresh_token;
      console.log("[Auth] Initial access token obtained successfully");
      if (result.refresh_token) {
        console.log("[Auth] Refresh token available for future use");
      } else {
        console.log("[Auth] No refresh token provided by server - will use password fallback");
      }
    } catch (error) {
      console.error("[Auth] Failed to obtain initial access token:", error);
      process.exit(1);
    }
  } else {
    console.log("[Auth] Using provided access token with fallback refresh capability");
  }
  
  // Setup token refresh callback
  tokenManager = new TokenManager({
    homeserverUrl,
    username,
    password,
    accessToken: currentToken,
    onTokenRefresh: async (newToken: string, newRefreshToken?: string) => {
      console.log("[Auth] Updating client with new access token");
      currentToken = newToken;
      currentRefreshToken = newRefreshToken;
      // Stop the old client
      await client.stop();
      // Create new client with new token
      client = createMatrixClient(newToken);
      setupClientHandlers(client);
      // Restart the client
      await client.start();
      console.log("[Auth] Client reconnected with new token");
    }
  });
  
  // Set initial refresh token if we have one
  if (currentRefreshToken) {
    tokenManager.setRefreshToken(currentRefreshToken);
  }
} else if (accessToken) {
  console.log("[Auth] Using ACCESS_TOKEN-only mode");
  console.log("[Auth] Note: Automatic token refresh requires USERNAME and PASSWORD");
  console.log("[Auth] To enable refresh tokens, set USERNAME and PASSWORD environment variables");
  console.log("[Auth] Bot will continue with static token but may stop working when token expires");
} else {
  console.log("[Auth] Using static ACCESS_TOKEN (no automatic refresh)");
}

const bot = new MorpheumBot();

function createMatrixClient(token: string): MatrixClient {
  // We'll want to make sure the bot doesn't have to do an initial sync every
  // time it restarts, so we need to prepare a storage provider. Here we use
  // a simple file storage provider.
  const storage = new SimpleFsStorageProvider("bot.json");
  
  // Now we can create the client.
  const matrixClient = new MatrixClient(homeserverUrl, token, storage);
  
  // Setup the autojoin mixin
  AutojoinRoomsMixin.setupOnClient(matrixClient);
  
  return matrixClient;
}

// Create initial client
client = createMatrixClient(currentToken!);

// Before we start the client, let's set up a few things.

// First, let's prepare the logger. We'll be using the simple console logger.
LogService.setLevel(LogLevel.INFO);
LogService.setLogger({
  info: (module, ...args) =>
    console.log(new Date().toISOString(), "[INFO]", module, ...args),
  warn: (module, ...args) =>
    console.warn(new Date().toISOString(), "[WARN]", module, ...args),
  error: (module, ...args) =>
    console.error(new Date().toISOString(), "[ERROR]", module, ...args),
  debug: (module, ...args) =>
    console.debug(new Date().toISOString(), "[DEBUG]", ...args),
  trace: (module, ...args) =>
    console.trace(new Date().toISOString(), "[TRACE]", ...args),
});

function setupClientHandlers(matrixClient: MatrixClient) {
  // Set up a command handler with token refresh capability
  matrixClient.on("room.message", async (roomId, event) => {
    const wrappedHandler = async () => {
      const userId = await matrixClient.getUserId();
      if (event.sender === userId) return;
      const body = event.content?.body;
      if (!body) return;

      const sendMessage = async (message: string, html?: string) => {
        if (html) {
          await queueMessage(roomId, {
            msgtype: "m.text",
            body: message,
            format: "org.matrix.custom.html",
            formatted_body: html,
          });
        } else {
          await queueMessage(roomId, {
            msgtype: "m.text",
            body: message,
          });
        }
      };

      try {
        const members = await matrixClient.getJoinedRoomMembersWithProfiles(roomId);
        const self = members[userId];
        const displayName = self?.display_name;
        const localpart = userId.split(':')[0].substring(1); // from @user:server.com -> user

        const mentionNames = [displayName, localpart, userId].filter(Boolean).map(n => n!.toLowerCase());

        for (const name of mentionNames) {
          if (body.toLowerCase().startsWith(name)) {
            let task = body.substring(name.length).trim();
            if (task.startsWith(':')) {
              task = task.substring(1).trim();
            }
            
            if (task) {
              await bot.processMessage(task, event.sender, sendMessage);
              return;
            }
          }
        }
      } catch (e) {
        console.error("Error handling mention:", e);
      }

      if (body.startsWith("!")) {
        await bot.processMessage(body, event.sender, sendMessage);
      }
    };

    // Wrap the handler with token refresh if available
    if (tokenManager) {
      const wrappedWithRefresh = tokenManager.withTokenRefresh(wrappedHandler);
      try {
        await wrappedWithRefresh();
      } catch (error) {
        console.error("Error in room message handler (after token refresh attempt):", error);
      }
    } else {
      try {
        await wrappedHandler();
      } catch (error) {
        console.error("Error in room message handler:", error);
      }
    }
  });
}

// Setup handlers for initial client
setupClientHandlers(client);

// And now we can start the client.
startMessageQueue(client);
client.start().then(() => {
  console.log("Morpheum Bot started!");
});
