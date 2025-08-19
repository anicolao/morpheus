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

// read environment variables
const homeserverUrl = process.env.HOMESERVER_URL;
const accessToken = process.env.ACCESS_TOKEN;

if (!homeserverUrl || !accessToken) {
  console.error(
    "HOMESERVER_URL and ACCESS_TOKEN environment variables are required.",
  );
  process.exit(1);
}

const bot = new MorpheumBot();

// We'll want to make sure the bot doesn't have to do an initial sync every
// time it restarts, so we need to prepare a storage provider. Here we use
// a simple file storage provider.
const storage = new SimpleFsStorageProvider("bot.json");

// Now we can create the client.
const client = new MatrixClient(homeserverUrl, accessToken, storage);

// Setup the autojoin mixin
AutojoinRoomsMixin.setupOnClient(client);

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

// Now, let's set up a command handler.
client.on("room.message", async (roomId, event) => {
  const userId = await client.getUserId();
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
    const members = await client.getJoinedRoomMembersWithProfiles(roomId);
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
});

// And now we can start the client.
startMessageQueue(client);
client.start().then(() => {
  console.log("Morpheum Bot started!");
});
