/* eslint-disable @typescript-eslint/no-floating-promises */
import { v4 as uuidv4 } from 'uuid';
import { queueFifoPoller } from './index';
import { queueBuilder } from '../queue-builder';
import { mockIndexedDb } from '../../mocks/indexeddb';
import { awaitFor } from '../../mocks/await-for';

type Value = {
  test: string;
};

describe('queueFifoPoller', () => {
  beforeEach(() => {
    mockIndexedDb();
  });

  test('to be defined', () => {
    expect(queueFifoPoller).toBeDefined();
  });

  test('to process messages', async () => {
    const queue = queueBuilder<Value>('test');
    const queueHandler = queueFifoPoller(queue, { interval: 20, failTimes: 5, concurrency: 1 });

    queue.queueStorage.storage.set({
      key: 'first',
      value: {
        test: '1',
      },
    });

    queue.queueStorage.storage.set({
      key: 'second',
      value: {
        test: '2',
      },
    });

    queue.queueStorage.storage.set({
      key: 'third',
      value: {
        test: '3',
      },
    });

    const executorMock = jest.fn();

    queueHandler(executorMock);

    await awaitFor(100);

    expect(executorMock).toHaveBeenCalledTimes(3);

    expect(executorMock).toHaveBeenNthCalledWith(1, {
      test: 1,
    });
    expect(executorMock).toHaveBeenNthCalledWith(2, {
      test: 2,
    });
    expect(executorMock).toHaveBeenNthCalledWith(3, {
      test: 3,
    });

    expect(await queue.queueStorage.storage.hasAny()).toBe(false);
  });

  test('to process messages while we add more', async () => {
    const queue = queueBuilder<Value>('test');
    const queueHandler = queueFifoPoller(queue, { interval: 200, failTimes: 5, concurrency: 1 });
    let addIndex = 1;

    const intervalId = setInterval(() => {
      for (let i = 0; i < 20; i++) {
        const key = uuidv4();
        queue.queueStorage.storage.set({
          key,
          value: {
            test: key,
          },
        });
      }
      addIndex += 1;
      if (addIndex === 5) {
        clearInterval(intervalId);
      }
    }, 500);

    const executorMock = jest.fn();

    queueHandler(executorMock);

    await awaitFor(4000);
    expect(executorMock).toHaveBeenCalledTimes(80);
    expect(await queue.queueStorage.storage.hasAny()).toBe(false);
  });
});
