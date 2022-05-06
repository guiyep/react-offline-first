import { storage } from '../../storage';
import type { IQueueStorage } from './types';
import type { Storage } from '../../storage/types';

export class QueueStorage<T> implements IQueueStorage<T> {
  storage: Storage<T>;
  storageDlq: Storage<T>;

  constructor(topic: string) {
    this.storage = storage<T>({ name: topic });
    this.storageDlq = storage<T>({
      name: `${topic}-dlq`,
    });
  }
}
