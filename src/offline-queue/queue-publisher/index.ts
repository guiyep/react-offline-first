import { nanoid } from 'nanoid';
import type { QueueBuilderObject } from '../queue-builder/types';

export const queuePublisher =
  <T>(queue: QueueBuilderObject<T>) =>
  (message: T): Promise<unknown> =>
    queue.queueStorage.storage.set({
      // TODO possible collition uuid
      key: nanoid(),
      value: message,
    });
