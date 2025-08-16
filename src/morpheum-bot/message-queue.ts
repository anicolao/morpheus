import { MatrixClient, MatrixError } from "matrix-bot-sdk";

const messageQueue: { roomId: string; content: any }[] = [];
let isSending = false;
let intervalId: NodeJS.Timeout | null = null;

async function processMessageQueue(client: MatrixClient) {
  if (isSending || messageQueue.length === 0) {
    return;
  }

  isSending = true;
  const messagesToProcess = [...messageQueue];
  messageQueue.length = 0;

  const batchedMessages: { [roomId: string]: string[] } = {};

  for (const message of messagesToProcess) {
    if (!batchedMessages[message.roomId]) {
      batchedMessages[message.roomId] = [];
    }
    batchedMessages[message.roomId].push(message.content.body);
  }

  for (const roomId in batchedMessages) {
    const content = {
      msgtype: 'm.text',
      body: batchedMessages[roomId].join('\n'),
    };

    try {
      await client.sendMessage(roomId, content);
    } catch (e) {
      if (e instanceof MatrixError && e.errcode === "M_LIMIT_EXCEEDED") {
        console.warn(
          `Rate limited. Re-queueing message and waiting ${e.retryAfterMs}ms...`,
        );
        // Add all the messages back to the front of the queue
        messageQueue.unshift(...messagesToProcess);
        await new Promise((resolve) => setTimeout(resolve, e.retryAfterMs || 1000));
      } else {
        console.error("Failed to send message:", e);
      }
    }
  }

  isSending = false;
}

export function startMessageQueue(client: MatrixClient) {
  if (intervalId) {
    clearInterval(intervalId);
  }
  intervalId = setInterval(() => processMessageQueue(client), 150);
}

export function stopMessageQueue() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export function queueMessage(roomId: string, content: any) {
  messageQueue.push({ roomId, content });
}
