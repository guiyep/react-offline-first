import { queueBuilder } from './index';
import { mockIndexedDb } from '../../mocks/indexeddb';

describe('queueBuilder', () => {
  beforeEach(() => {
    mockIndexedDb();
  });

  test('to be defined', () => {
    expect(queueBuilder).toBeDefined();
  });

  test('to create a queue', () => {
    const queue = queueBuilder('test');
    expect(queue.queueStorage).toBeDefined();
  });
});
