#!/usr/bin/env bun

import {
  MatrixClient,
  SimpleFsStorageProvider,
  AutojoinRoomsMixin,
  LogLevel,
  LogService,
} from "matrix-bot-sdk";
import * as fs from "fs";
import { formatMarkdown } from "./format-markdown";
import { startMessageQueue, queueMessage } from "./message-queue";

import { SWEAgent } from "./sweAgent";
import { OllamaClient } from "./ollamaClient";
import { JailClient } from "./jailClient";

// read environment variables
const homeserverUrl = process.env.HOMESERVER_URL;
const accessToken = process.env.ACCESS_TOKEN;
const ollamaApiUrl = process.env.OLLAMA_API_URL || "http://localhost:11434";
const ollamaModel = process.env.OLLAMA_MODEL || "morpheum-local";
const jailHost = process.env.JAIL_HOST || "localhost";
const jailPort = parseInt(process.env.JAIL_PORT || "10001", 10);

if (!homeserverUrl || !accessToken) {
  console.error(
    "HOMESERVER_URL and ACCESS_TOKEN environment variables are required.",
  );
  process.exit(1);
}

const ollamaClient = new OllamaClient(ollamaApiUrl, ollamaModel);
const jailClient = new JailClient(jailHost, jailPort);
const sweAgent = new SWEAgent(ollamaClient, jailClient);


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

// Function to send file content to a room
const sendFileContent = (roomId: string, filePath: string) => {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      queueMessage(roomId, {
        msgtype: "m.text",
        body: `Error reading ${filePath}: ${err.message}`,
      });
      return;
    }

    if (filePath.endsWith(".md")) {
      const html = formatMarkdown(data);
      console.log('Generated HTML:', html);
      queueMessage(roomId, {
        msgtype: "m.text",
        body: data,
        format: "org.matrix.custom.html",
        formatted_body: html,
      });
    } else {
      queueMessage(roomId, {
        msgtype: "m.text",
        body: data,
      });
    }
  });
};

// Now, let's set up a command handler.
client.on("room.event", (roomId, event) => {
  console.log("EVENT", event.type);
});
client.on("room.message", async (roomId, event) => {
  console.log(`MESSAGE from ${event.sender}:`, event.content?.body?.substring(0, 30));
  const userId = await client.getUserId();
  if (event.sender === userId) return;
  const body = event.content?.body;
  if (!body) return;

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
          queueMessage(roomId, {
            msgtype: "m.text",
            body: `Working on: "${task}"...`,
          });
          const result = await sweAgent.run(task);
          queueMessage(roomId, {
            msgtype: "m.text",
            body: result,
          });
          return;
        }
      }
    }
  } catch (e) {
    console.error("Error handling mention:", e);
  }


  if (body.startsWith("!")) {
    if (body.startsWith("!help")) {
      const message =
        "Hello! I am the Morpheum Bot. I am still under development. You can use `!tasks` to see the current tasks, `!devlog` to see the development log, `!add-devlog <entry>` to add a new entry to the development log, and `!update-task <task-number> <status>` to update the status of a task.";
      queueMessage(roomId, {
        msgtype: "m.text",
        body: message,
      });
    } else if (body.startsWith("!tasks")) {
      sendFileContent(roomId, "TASKS.md");
    } else if (body.startsWith("!devlog")) {
      sendFileContent(roomId, "DEVLOG.md");
    } else if (body.startsWith("!add-devlog ")) {
      const entry = body.substring("!add-devlog ".length);
      fs.appendFile("DEVLOG.md", `\n*   ${entry}\n`, (err) => {
        if (err) {
          queueMessage(roomId, {
            msgtype: "m.text",
            body: `Error writing to DEVLOG.md: ${err.message}`,
          });
          return;
        }
        queueMessage(roomId, {
          msgtype: "m.text",
          body: "Successfully added entry to DEVLOG.md",
        });
      });
    } else if (body.startsWith("!update-task ")) {
      const args = body.substring("!update-task ".length).split(" ");
      const taskNumber = parseInt(args[0]);
      const status = args[1];

      fs.readFile("TASKS.md", "utf8", (err, data) => {
        if (err) {
          queueMessage(roomId, {
            msgtype: "m.text",
            body: `Error reading TASKS.md: ${err.message}`,
          });
          return;
        }

        const lines = data.split("\n");
        const taskRegex = new RegExp(
          `^\*\s+\[[\\s\\w]\]\s+\*\*Task ${taskNumber}:`,
        );
        let taskFound = false;
        for (let i = 0; i < lines.length; i++) {
          if (taskRegex.test(lines[i])) {
            lines[i] = lines[i].replace(/\\[[\\s\\w]\\]/, status);
            taskFound = true;
            break;
          }
        }

        if (!taskFound) {
          queueMessage(roomId, {
            msgtype: "m.text",
            body: `Task ${taskNumber} not found.`,
          });
          return;
        }

        fs.writeFile("TASKS.md", lines.join("\n"), (err) => {
          if (err) {
            queueMessage(roomId, {
              msgtype: "m.text",
              body: `Error writing to TASKS.md: ${err.message}`,
            });
            return;
          }
          queueMessage(roomId, {
            msgtype: "m.text",
            body: `Successfully updated task ${taskNumber}`,
          });
        });
      });
    }
  }
});

// And now we can start the client.
startMessageQueue(client);
client.start().then(() => {
  console.log("Morpheum Bot started!");
});
