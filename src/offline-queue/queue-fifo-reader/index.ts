import type { QueueBuilderObject } from '../queue-builder/types';
import type { ExecuteMessage, MessagesPollerConfig, MessagesPollerUnregister } from '../messages-poller/types';
import { messagesFifoProcessor } from '../messages-fifo-processor';
import { messagesPoller } from '../messages-poller';

const defaultConfig: MessagesPollerConfig = {
  timeout: 5000,
  failTimes: 5
}

export const queueFifoReader = <T>(queue: QueueBuilderObject<T>, config?: MessagesPollerConfig) => (executeMessage: ExecuteMessage<T>): MessagesPollerUnregister => messagesPoller({
  getMessage: () => queue.queueStorage.storage.getFirst(),
  hasMessages: () => queue.queueStorage.storage.hasAny(),
  executeMessage,
  deleteMessage: () => queue.queueStorage.storage.deleteFirst(),
  moveToDlqMessage: (data) => queue.queueStorage.storageDlq.set({ key: '222', value: data })
}, config || defaultConfig, messagesFifoProcessor)