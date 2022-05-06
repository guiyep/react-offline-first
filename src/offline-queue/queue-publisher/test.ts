import { queuePublisher } from './index';
import { mockIndexedDb } from '../../mocks/indexeddb';
import { queueBuilder } from '../queue-builder';

type Value = {
  test: number;
};

const value: Value = { test: 123 };

describe('queuePublisher', () => {
  beforeEach(() => {
    mockIndexedDb();
  });

  test('to be defined', () => {
    expect(queuePublisher).toBeDefined();
  });

  test('to publish message', async () => {
    const topicQueueStorage = queueBuilder<Value>('test');
    const publishMessage = queuePublisher<Value>(topicQueueStorage);
    await publishMessage(value);
    const first = await topicQueueStorage.queueStorage.storage.getFirst();
    expect(first).toEqual(value);
  });
});
