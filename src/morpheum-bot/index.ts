#!/usr/bin/env bun

import {
  MatrixClient,
  SimpleFsStorageProvider,
  AutojoinRoomsMixin,
  LogLevel,
  LogService,
} from "matrix-bot-sdk";
import * as fs from "fs";
import { initialize, streamQuery, BotMessage } from "../gemini-cli/packages/cli/src/library.js";
import { Config } from "@google/gemini-cli-core";
import { formatMarkdown } from "./format-markdown";
import { startMessageQueue, queueMessage } from "./message-queue";

// read environment variables
const homeserverUrl = process.env.HOMESERVER_URL;
const accessToken = process.env.ACCESS_TOKEN;

if (!homeserverUrl || !accessToken) {
  console.error(
    "HOMESERVER_URL and ACCESS_TOKEN environment variables are required.",
  );
  process.exit(1);
}

let geminiConfig: Config;

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
  if (event.sender === await client.getUserId()) return;
  const body = event.content?.body;
  if (!body) return;

  const callback = (message: BotMessage) => {
    let body = "";
    switch (message.type) {
      case "content":
        body = message.content;
        break;
      case "thought":
        // Only show thoughts that have text content.
        if (message.thought && message.thought.thought) {
          body = `Thinking: ${message.thought.thought}`;
        }
        break;
      case "tool_call_request":
        body = `Requesting tool: ${message.request.name}`;
        break;
      case "tool_result":
        const toolArgs = message.request.args as { absolute_path?: string, command?: string };
        if (
          message.request.name === "read_file" &&
          typeof toolArgs?.absolute_path === "string" &&
          toolArgs.absolute_path.endsWith(".md")
        ) {
          const html = formatMarkdown(message.result.result as string);
          queueMessage(roomId, {
            msgtype: "m.text",
            body: message.result.result as string,
            format: "org.matrix.custom.html",
            formatted_body: html,
          });
          body = `${message.request.name} succeeded.`;
        } else if (message.request.name === "run_shell_command") {
          const command = toolArgs.command || 'Unknown command';
          const output = message.result.result as string;
          const formattedOutput = `\`$ ${command}\`\n\`\`\`\n${output}\n\`\`\``;
          const html = formatMarkdown(formattedOutput);
          queueMessage(roomId, {
            msgtype: "m.text",
            body: formattedOutput,
            format: "org.matrix.custom.html",
            formatted_body: html,
          });
          // No need to set body here as we've already queued the message
        } else {
          body = `${message.request.name} succeeded.`;
        }
        break;
      case "error":
        body = `Error: ${message.error}`;
        break;
      case "info":
        body = `Info: ${message.message}`;
        break;
      case "finished":
        // Don't show the user the boring STOP reason.
        if (message.reason !== 'STOP') {
          body = `Finished with reason: ${message.reason}`;
        }
        break;
    }
    // Only send a message if there's something to say.
    if (body.trim()) {
      queueMessage(roomId, {
        msgtype: "m.text",
        body: body,
      });
    }
  };

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
          `^\*\s+\[[\\s\\w]\]\s+\**Task ${taskNumber}:`,
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
  } else {
    streamQuery(geminiConfig, body, callback);
  }
});

// And now we can start the client.
initialize().then((config) => {
  geminiConfig = config;
  startMessageQueue(client);
  client.start().then(() => {
    console.log("Morpheum Bot started!");
  });
});
