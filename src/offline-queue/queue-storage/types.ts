import type { Storage } from '../../storage/types';

export interface IQueueStorage<T> {
  storage: Storage<T>;
  storageDlq: Storage<T>
}