import type { QueueBuilderObject } from '../queue-builder/types';
import type { ExecuteMessage, MessagesPollerConfig, MessagesPollerUnregister } from '../messages-poller/types';
import { messagesFifoProcessor } from '../messages-fifo-processor';
import { messagesPoller } from '../messages-poller';
import type { QueueFifoPollerConfig } from './types';

const defaultConfig: MessagesPollerConfig = {
  interval: 5000,
  failTimes: 5,
};

export const queueFifoPoller =
  <T>(queue: QueueBuilderObject<T>, config?: QueueFifoPollerConfig) =>
    (executeMessage: ExecuteMessage<T>): MessagesPollerUnregister =>
      messagesPoller(
        {
          getMessage: () => queue.queueStorage.storage.getFirst(config?.concurrency || 1),
          hasMessages: () => queue.queueStorage.storage.hasAny(),
          executeMessage,
          deleteMessage: () => queue.queueStorage.storage.deleteFirst(config?.concurrency || 1),
          moveToDlqMessage: (data) => queue.queueStorage.storageDlq.set({ key: '222', value: data }),
        },
        { ...defaultConfig, ...(config || {}) },
        messagesFifoProcessor,
      );
