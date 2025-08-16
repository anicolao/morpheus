import { MatrixClient, MatrixError } from "matrix-bot-sdk";

// Exported for testing purposes
export const messageQueue: { roomId: string; content: any }[] & { clear?: () => void } = [];
messageQueue.clear = function() {
  this.length = 0;
}
let isSending = false;
let intervalId: NodeJS.Timeout | null = null;

async function processMessageQueue(client: MatrixClient) {
  if (isSending || messageQueue.length === 0) {
    return;
  }

  isSending = true;

  const message = messageQueue[0];
  if (message.content.format === 'org.matrix.custom.html') {
    const messageToSend = messageQueue.shift()!;
    try {
      await client.sendMessage(messageToSend.roomId, messageToSend.content);
    } catch (e) {
      if (e instanceof MatrixError && e.errcode === "M_LIMIT_EXCEEDED") {
        console.warn(
          `Rate limited. Re-queueing message and waiting ${e.retryAfterMs}ms...`,
        );
        // Add all the messages back to the front of the queue
        messageQueue.unshift(messageToSend);
        await new Promise((resolve) => setTimeout(resolve, e.retryAfterMs || 1000));
      } else {
        console.error("Failed to send message:", e);
      }
    }
  } else {
    let body = '';
    let lastRoomId = '';
    const messagesToSend = [];
    while (messageQueue.length > 0 && messageQueue[0].content.msgtype === 'm.text' && !messageQueue[0].content.format) {
      const currentMessage = messageQueue.shift()!;
      if (lastRoomId && currentMessage.roomId !== lastRoomId) {
        messageQueue.unshift(currentMessage);
        break;
      }
      messagesToSend.push(currentMessage);
      body += currentMessage.content.body;
      lastRoomId = currentMessage.roomId;
    }

    try {
      await client.sendMessage(lastRoomId, {
        msgtype: 'm.text',
        body,
      });
    } catch (e) {
      if (e instanceof MatrixError && e.errcode === "M_LIMIT_EXCEEDED") {
        console.warn(
          `Rate limited. Re-queueing message and waiting ${e.retryAfterMs}ms...`,
        );
        // Add all the messages back to the front of the queue
        messageQueue.unshift(...messagesToSend);
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
  intervalId = setInterval(() => processMessageQueue(client), 1000);
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