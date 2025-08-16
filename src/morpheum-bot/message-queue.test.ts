import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { queueMessage, startMessageQueue, stopMessageQueue, messageQueue } from './message-queue';
import { MatrixClient, MatrixError } from 'matrix-bot-sdk';

describe('message-queue', () => {
  let client: MatrixClient;

  beforeEach(() => {
    client = new MatrixClient('http://localhost', 'token');
    vi.spyOn(client, 'sendMessage').mockResolvedValue('');
    messageQueue.clear!();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    stopMessageQueue();
  });

  it('should send a message from the queue', async () => {
    startMessageQueue(client);

    queueMessage('room1', { msgtype: 'm.text', body: 'Hello' });

    await new Promise((resolve) => setTimeout(resolve, 1200));

    expect(client.sendMessage).toHaveBeenCalledWith('room1', { msgtype: 'm.text', body: 'Hello' });
  });

  it('should handle rate-limiting and retry', async () => {
    const error = new MatrixError({ errcode: 'M_LIMIT_EXCEEDED', error: 'Too Many Requests', retry_after_ms: 100 });
    vi.spyOn(client, 'sendMessage')
      .mockRejectedValueOnce(error)
      .mockResolvedValue(undefined);
    startMessageQueue(client);

    queueMessage('room1', { msgtype: 'm.text', body: 'Hello' });

    // First attempt
    await new Promise((resolve) => setTimeout(resolve, 1200));
    expect(client.sendMessage).toHaveBeenCalledTimes(1);

    // Wait for retry
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Second attempt
    expect(client.sendMessage).toHaveBeenCalledTimes(2);
  });

  it('should batch multiple text messages into a single request', async () => {
    startMessageQueue(client);

    queueMessage('room1', { msgtype: 'm.text', body: 'Hello' });
    queueMessage('room1', { msgtype: 'm.text', body: 'World' });

    await new Promise((resolve) => setTimeout(resolve, 1200));

    expect(client.sendMessage).toHaveBeenCalledTimes(1);
    expect(client.sendMessage).toHaveBeenCalledWith('room1', {
      msgtype: 'm.text',
      body: 'HelloWorld',
    });
  });

  it('should not batch html messages', async () => {
    startMessageQueue(client);

    queueMessage('room1', { msgtype: 'm.text', body: 'Hello' });
    queueMessage('room1', { msgtype: 'm.text', body: 'World', format: 'org.matrix.custom.html', formatted_body: '<p>World</p>' });

    await new Promise((resolve) => setTimeout(resolve, 2200));

    expect(client.sendMessage).toHaveBeenCalledTimes(2);
    expect(client.sendMessage).toHaveBeenCalledWith('room1', {
      msgtype: 'm.text',
      body: 'Hello',
    });
    expect(client.sendMessage).toHaveBeenCalledWith('room1', {
      msgtype: 'm.text',
      body: 'World',
      format: 'org.matrix.custom.html',
      formatted_body: '<p>World</p>',
    });
  });
});