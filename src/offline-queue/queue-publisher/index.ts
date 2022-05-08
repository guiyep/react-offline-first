import { v4 as uuidv4 } from 'uuid';
import type { QueueBuilderObject } from '../queue-builder/types';

export const queuePublisher =
  <T>(queue: QueueBuilderObject<T>) =>
  (message: T): Promise<unknown> =>
    queue.queueStorage.storage.set({
      key: uuidv4(),
      value: message,
    });
