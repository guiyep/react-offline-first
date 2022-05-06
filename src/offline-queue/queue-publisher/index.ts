import type { QueueBuilderObject } from '../queue-builder/types';
import { v4 as uuidv4 } from 'uuid';

export const queuePublisher =
  <T>(queue: QueueBuilderObject<T>) =>
  (message: T): Promise<unknown> => {
    return queue.queueStorage.storage.set({
      key: uuidv4(),
      value: message,
    });
  };
