import type { IQueueStorage } from '../queue-storage/types';

export type QueueBuilderObject<T> = {
  queueStorage: IQueueStorage<T>;
};
