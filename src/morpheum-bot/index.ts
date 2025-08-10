#!/usr/bin/env bun

import {
    MatrixClient,
    SimpleFsStorageProvider,
    AutojoinRoomsMixin,
    LogLevel,
    LogService,
} from "matrix-bot-sdk";
import { exec } from "child_process";

// read environment variables
const homeserverUrl = process.env.HOMESERVER_URL;
const accessToken = process.env.ACCESS_TOKEN;

if (!homeserverUrl || !accessToken) {
    console.error("HOMESERVER_URL and ACCESS_TOKEN environment variables are required.");
    process.exit(1);
}

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
    info: (module, ...args) => console.log(new Date().toISOString(), "[INFO]", module, ...args),
    warn: (module, ...args) => console.warn(new Date().toISOString(), "[WARN]", module, ...args),
    error: (module, ...args) => console.error(new Date().toISOString(), "[ERROR]", module, ...args),
    debug: (module, ...args) => console.debug(new Date().toISOString(), "[DEBUG]", module, ...args),
    trace: (module, ...args) => console.trace(new Date().toISOString(), "[TRACE]", module, ...args),
});

// Now, let's set up a command handler.
client.on("room.message", (roomId, event) => {
    const body = event.content?.body;
    if (!body) return;

    if (body.startsWith("!help")) {
        const message = "Hello! I am the Morpheum Bot. I am still under development. You can use `!gemini <prompt>` to interact with the Gemini CLI.";
        client.sendMessage(roomId, {
            msgtype: "m.text",
            body: message,
        });
    } else if (body.startsWith("!gemini ")) {
        const prompt = body.substring("!gemini ".length);
        client.sendMessage(roomId, {
            msgtype: "m.text",
            body: `Executing Gemini CLI with prompt: "${prompt}"`,
        });

        exec(`bunx @google/gemini-cli -p "${prompt}"`, (error, stdout, stderr) => {
            if (error) {
                client.sendMessage(roomId, {
                    msgtype: "m.text",
                    body: `Error executing Gemini CLI: ${error.message}`,
                });
                return;
            }
            if (stderr) {
                client.sendMessage(roomId, {
                    msgtype: "m.text",
                    body: `Gemini CLI stderr: ${stderr}`,
                });
            }
            client.sendMessage(roomId, {
                msgtype: "m.text",
                body: stdout,
            });
        });
    }
});

// And now we can start the client.
client.start().then(() => {
    console.log("Morpheum Bot started!");
});
