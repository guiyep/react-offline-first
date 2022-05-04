import { QueueStorage } from "../queue-storage";
import type { QueueBuilderObject } from './types';

export const queueBuilder = <T>(topic: string): QueueBuilderObject<T> => {
  const queueStorage = new QueueStorage<T>(topic)
  return {
    queueStorage,
  }
}